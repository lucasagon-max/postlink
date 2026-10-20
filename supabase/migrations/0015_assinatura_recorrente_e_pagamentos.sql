-- 0015_assinatura_recorrente_e_pagamentos.sql: Assinatura Mensal Automática e Auditoria de Pagamentos

-- 1. Novos campos na tabela assinaturas para controle de ciclo e recorrência
alter table public.assinaturas
  add column if not exists valido_ate timestamptz,
  add column if not exists ciclo text not null default 'monthly' check (ciclo in ('monthly', 'yearly')),
  add column if not exists tipo_cobranca text not null default 'avulso_pix' check (tipo_cobranca in ('recorrente_cartao', 'avulso_pix', 'manual')),
  add column if not exists mp_preapproval_id text,
  add column if not exists cancelar_ao_fim_do_periodo boolean not null default false,
  add column if not exists proxima_cobranca timestamptz;

-- Atualiza lojas ativas existentes para garantir validade ativa por pelo menos 30 dias
update public.assinaturas
set valido_ate = greatest(coalesce(valido_ate, now()), now() + interval '30 days')
where status = 'ativo' and valido_ate is null;

-- Comentários explicativos
comment on column public.assinaturas.valido_ate is 'Data limite de validade do período pago atual';
comment on column public.assinaturas.ciclo is 'Frequência da assinatura: monthly ou yearly';
comment on column public.assinaturas.tipo_cobranca is 'Modalidade: recorrente_cartao (débito automático Mercado Pago), avulso_pix ou manual';
comment on column public.assinaturas.mp_preapproval_id is 'ID do Preapproval de assinatura recorrente no Mercado Pago';
comment on column public.assinaturas.cancelar_ao_fim_do_periodo is 'Indica se o lojista solicitou cancelamento da renovação automática';

-- 2. Tabela de Pagamentos e Histórico de Transações
create table if not exists public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references public.lojas(id) on delete cascade,
  mp_payment_id text not null unique,
  plano text not null check (plano in ('starter', 'pro', 'agencia')),
  ciclo text not null default 'monthly' check (ciclo in ('monthly', 'yearly')),
  valor numeric(10,2) not null,
  status text not null default 'pending',
  metodo text not null default 'pix',
  detalhes jsonb,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists idx_pagamentos_loja on public.pagamentos(loja_id, criado_em desc);
create index if not exists idx_pagamentos_mp on public.pagamentos(mp_payment_id);

alter table public.pagamentos enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'pagamentos' and policyname = 'lojistas_podem_ver_seus_pagamentos'
  ) then
    create policy "lojistas_podem_ver_seus_pagamentos" on public.pagamentos for select using (loja_id = auth.uid());
  end if;
end $$;

-- 3. Atualizar função de checagem de limites de criação de links
create or replace function public.checar_limites_link() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_status text;
  v_trial_ate timestamptz;
  v_valido_ate timestamptz;
  v_plano text;
  v_ativos int;
  v_hoje int;
  v_max_ativos int := 50;
begin
  select status, trial_ate, valido_ate, coalesce(plano, 'pro')
    into v_status, v_trial_ate, v_valido_ate, v_plano
  from assinaturas where loja_id = new.loja_id;

  if v_status is null then
    raise exception 'assinatura não encontrada';
  elsif v_status = 'trial' and v_trial_ate < now() then
    raise exception 'período de teste gratuito expirado';
  elsif v_status = 'ativo' and v_valido_ate is not null and v_valido_ate < now() then
    raise exception 'assinatura expirada, renove seu plano';
  elsif v_status not in ('trial','ativo') then
    raise exception 'assinatura inativa ou suspensa';
  end if;

  -- Define limite de links ativos conforme plano
  if v_status = 'trial' then
    v_max_ativos := 1;
  elsif v_plano = 'starter' then
    v_max_ativos := 5;
  else
    v_max_ativos := 1000;
  end if;

  select count(*) into v_ativos from links where loja_id = new.loja_id and ativo;
  if v_ativos >= v_max_ativos then
    raise exception 'limite de links ativos atingido para seu plano (máx %)', v_max_ativos;
  end if;

  select count(*) into v_hoje from links
    where loja_id = new.loja_id and criado_em > now() - interval '1 day';
  if v_hoje >= 50 then
    raise exception 'limite diário de criação atingido (máx 50/dia)';
  end if;

  if exists (
    select 1 from destinos_bloqueados d
    where new.destino ~* ('^https://([^/]*\.)?' || replace(d.dominio, '.', '\.') || '(/|$)')
  ) then
    raise exception 'destino bloqueado por segurança';
  end if;

  return new;
end $$;

-- 4. Atualizar leitura pública do link no Edge com tolerância amigável de carência
create or replace function public.obter_link_publico(p_loja text, p_slug text)
returns table (
  link_id uuid,
  destino text,
  imagem_path text,
  versao int,
  titulo text,
  descricao text,
  loja_nome text,
  expirado boolean
)
language sql security definer set search_path = public stable as $$
  select
    l.id,
    l.destino,
    l.imagem_path,
    l.versao,
    l.titulo,
    l.descricao,
    lj.nome,
    (l.valido_ate is not null and l.valido_ate < now())
  from links l
  join lojas lj on lj.id = l.loja_id
  join assinaturas a on a.loja_id = lj.id
  where lj.slug = p_loja
    and l.slug = p_slug
    and l.ativo
    and (
      (a.status = 'trial' and a.trial_ate >= now()) or
      (a.status = 'ativo' and (a.valido_ate is null or a.valido_ate >= now() - interval '3 days')) or
      a.status = 'atrasado'
    );
$$;

-- 5. Atualizar admin_obter_lojas com suporte aos campos de ciclo e recorrência
create or replace function public.admin_obter_lojas(
  p_termo text default null,
  p_status text default 'todos',
  p_limite int default 50,
  p_offset int default 0
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_res json;
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'Acesso negado: apenas administradores';
  end if;

  select json_agg(t) into v_res from (
    select
      lj.id,
      lj.nome,
      lj.slug,
      u.email,
      lj.responsavel_nome::text as responsavel_nome,
      lj.whatsapp::text as whatsapp,
      lj.cidade::text as cidade,
      lj.estado::text as estado,
      lj.ramo_atividade::text as ramo_atividade,
      lj.expectativa::text as expectativa,
      lj.expectativa_detalhes::text as expectativa_detalhes,
      lj.criado_em,
      case
        when a.status = 'trial' and a.trial_ate < now() then 'expirado'
        when a.status = 'ativo' and a.valido_ate is not null and a.valido_ate < now() then 'expirado'
        else coalesce(a.status, 'trial')
      end::text as status_assinatura,
      coalesce(a.plano, 'pro')::text as plano,
      coalesce(a.ciclo, 'monthly')::text as ciclo,
      coalesce(a.tipo_cobranca, 'avulso_pix')::text as tipo_cobranca,
      coalesce(a.cancelar_ao_fim_do_periodo, false)::boolean as cancelar_ao_fim_do_periodo,
      a.valido_ate,
      a.trial_ate,
      greatest(0, ceil(extract(epoch from (coalesce(a.trial_ate, now()) - now())) / 86400)::int) as dias_trial_restantes,
      coalesce(count(distinct l.id), 0)::bigint as total_links,
      coalesce(count(c.id), 0)::bigint as total_cliques,
      coalesce(max(l.versao), 1)::int as max_versao
    from public.lojas lj
    left join auth.users u on u.id = lj.id
    left join public.assinaturas a on a.loja_id = lj.id
    left join public.links l on l.loja_id = lj.id
    left join public.cliques c on c.link_id = l.id
    where
      (p_termo is null or p_termo = '' or
       lj.nome ilike '%' || p_termo || '%' or
       lj.slug ilike '%' || p_termo || '%' or
       coalesce(lj.responsavel_nome, '') ilike '%' || p_termo || '%' or
       coalesce(lj.whatsapp, '') ilike '%' || p_termo || '%' or
       coalesce(lj.cidade, '') ilike '%' || p_termo || '%' or
       coalesce(lj.ramo_atividade, '') ilike '%' || p_termo || '%' or
       u.email ilike '%' || p_termo || '%')
      and
      (p_status = 'todos' or
       (p_status = 'ativo' and a.status = 'ativo' and (a.valido_ate is null or a.valido_ate >= now())) or
       (p_status = 'trial' and a.status = 'trial' and a.trial_ate >= now()) or
       (p_status = 'expirado' and ((a.status = 'expirado') or (a.status = 'trial' and a.trial_ate < now()) or (a.status = 'ativo' and a.valido_ate < now()))) or
       (p_status = 'cancelado' and a.status in ('cancelado', 'suspenso')))
    group by lj.id, u.email, a.status, a.plano, a.ciclo, a.tipo_cobranca, a.cancelar_ao_fim_do_periodo, a.valido_ate, a.trial_ate
    order by lj.criado_em desc
    limit p_limite offset p_offset
  ) t;

  return coalesce(v_res, '[]'::json);
end;
$$;
