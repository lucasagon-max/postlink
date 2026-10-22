-- 0019_ia_postlinks.sql: Controle de Uso Diário e Cotas de Inteligência Artificial
-- Permite limites seguros por plano (Free: 10/dia, Starter: 20/dia, Pro: 40/dia, Agência: 100/dia)
-- e suporte nativo a pacotes de créditos avulsos futuros.

create table if not exists public.ia_uso_diario (
  loja_id uuid not null references public.lojas(id) on delete cascade,
  data date not null default current_date,
  requisicoes int not null default 0,
  creditos_avulsos int not null default 0,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  primary key (loja_id, data)
);

create index if not exists idx_ia_uso_loja_data on public.ia_uso_diario (loja_id, data);

alter table public.ia_uso_diario enable row level security;

-- Política de RLS: Lojistas autenticados podem ver seu próprio consumo
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'ia_uso_diario' and policyname = 'lojistas_podem_ver_seu_uso_ia'
  ) then
    create policy "lojistas_podem_ver_seu_uso_ia" on public.ia_uso_diario for select using (loja_id = auth.uid());
  end if;
end $$;

-- Função auxiliar interna para descobrir o limite diário padrão do lojista
create or replace function public.obter_limite_diario_ia_loja(p_loja_id uuid)
returns int
language plpgsql security definer set search_path = public stable as $$
declare
  v_status text;
  v_plano text;
  v_trial_ate timestamptz;
  v_valido_ate timestamptz;
begin
  select status, coalesce(plano, 'pro'), trial_ate, valido_ate
  into v_status, v_plano, v_trial_ate, v_valido_ate
  from public.assinaturas
  where loja_id = p_loja_id;

  -- Se não encontrar assinatura, assume plano grátis (10/dia)
  if not found then
    return 10;
  end if;

  -- Se for trial ativo, tem cota de 10/dia para testar e se encantar
  if v_status = 'trial' and (v_trial_ate is null or v_trial_ate > now()) then
    return 10;
  end if;

  -- Se for assinatura ativa ou dentro da validade
  if v_status = 'ativo' or (v_valido_ate is not null and v_valido_ate > now()) then
    if v_plano = 'agencia' then
      return 100;
    elsif v_plano = 'pro' then
      return 40; -- Limite seguro estabelecido para o Pro
    elsif v_plano = 'starter' then
      return 20;
    else
      return 40;
    end if;
  end if;

  -- Padrão para conta gratuita / expirada
  return 10;
end;
$$;

-- Função RPC: Consultar status de uso da IA hoje (sem incrementar)
create or replace function public.obter_status_ia(p_loja_id uuid)
returns json
language plpgsql security definer set search_path = public as $$
declare
  v_limite_base int;
  v_requisicoes int := 0;
  v_creditos_avulsos int := 0;
  v_limite_total int;
  v_restantes int;
begin
  v_limite_base := public.obter_limite_diario_ia_loja(p_loja_id);

  select requisicoes, creditos_avulsos
  into v_requisicoes, v_creditos_avulsos
  from public.ia_uso_diario
  where loja_id = p_loja_id and data = current_date;

  v_requisicoes := coalesce(v_requisicoes, 0);
  v_creditos_avulsos := coalesce(v_creditos_avulsos, 0);
  v_limite_total := v_limite_base + v_creditos_avulsos;
  v_restantes := greatest(0, v_limite_total - v_requisicoes);

  return json_build_object(
    'limite_diario', v_limite_base,
    'creditos_avulsos', v_creditos_avulsos,
    'limite_total', v_limite_total,
    'requisicoes_hoje', v_requisicoes,
    'restantes_hoje', v_restantes,
    'atingiu_limite', (v_requisicoes >= v_limite_total)
  );
end;
$$;

-- Função RPC: Verificar e incrementar uso diário da IA atomicamente
create or replace function public.verificar_e_incrementar_ia(p_loja_id uuid)
returns json
language plpgsql security definer set search_path = public as $$
declare
  v_limite_base int;
  v_requisicoes int := 0;
  v_creditos_avulsos int := 0;
  v_limite_total int;
  v_restantes int;
begin
  v_limite_base := public.obter_limite_diario_ia_loja(p_loja_id);

  -- Bloqueia a linha para evitar concorrência ou insere nova para a data atual
  insert into public.ia_uso_diario (loja_id, data, requisicoes, creditos_avulsos)
  values (p_loja_id, current_date, 0, 0)
  on conflict (loja_id, data) do nothing;

  select requisicoes, creditos_avulsos
  into v_requisicoes, v_creditos_avulsos
  from public.ia_uso_diario
  where loja_id = p_loja_id and data = current_date
  for update;

  v_requisicoes := coalesce(v_requisicoes, 0);
  v_creditos_avulsos := coalesce(v_creditos_avulsos, 0);
  v_limite_total := v_limite_base + v_creditos_avulsos;

  if v_requisicoes >= v_limite_total then
    return json_build_object(
      'permitido', false,
      'erro', 'Limite diário de criações com IA atingido para o seu plano.',
      'limite_total', v_limite_total,
      'requisicoes_hoje', v_requisicoes,
      'restantes_hoje', 0
    );
  end if;

  -- Incrementa requisições
  update public.ia_uso_diario
  set requisicoes = requisicoes + 1,
      atualizado_em = now()
  where loja_id = p_loja_id and data = current_date;

  v_requisicoes := v_requisicoes + 1;
  v_restantes := greatest(0, v_limite_total - v_requisicoes);

  return json_build_object(
    'permitido', true,
    'limite_total', v_limite_total,
    'requisicoes_hoje', v_requisicoes,
    'restantes_hoje', v_restantes
  );
end;
$$;

-- Permissões de execução para lojistas autenticados e funções do Edge
grant execute on function public.obter_status_ia(uuid) to authenticated, anon;
grant execute on function public.verificar_e_incrementar_ia(uuid) to authenticated, anon;
