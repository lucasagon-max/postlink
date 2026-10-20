-- 0016_cortesia_e_faturamento_real.sql: Suporte a assinaturas de cortesia/teste e métricas de faturamento real

-- 1. Adiciona coluna is_cortesia em assinaturas
alter table public.assinaturas
  add column if not exists is_cortesia boolean not null default false;

comment on column public.assinaturas.is_cortesia is 'Indica se a assinatura é uma cortesia/teste administrativo sem faturamento';

-- 2. Marca as contas de teste e administração atuais como cortesia
update public.assinaturas a
set is_cortesia = true,
    atualizado_em = now()
from public.lojas lj
left join auth.users u on u.id = lj.id
where a.loja_id = lj.id
  and (
    lower(coalesce(u.email, '')) in ('lucas.a.gon@gmail.com', 'carmen.cattel@gmail.com', 'morangostatui@gmail.com', 'morangostatui2@gmail.com')
    or lj.slug in ('postlink', 'morangos-tatui', 'cattel-turismo', 'morangos-tatui-delivery', 'morangos-tatui2')
  );

-- 3. Atualiza admin_obter_dashboard para faturamento real e métricas financeiras precisas
create or replace function public.admin_obter_dashboard()
returns json
language plpgsql security definer set search_path = public, auth stable as $$
declare
  v_res json;
begin
  if not public.is_super_admin() then
    raise exception 'Acesso negado: privilégios de administrador necessários';
  end if;

  select json_build_object(
    'metricas', (
      select json_build_object(
        'total_lojas', count(distinct lj.id),
        'lojas_trial', count(distinct lj.id) filter (where a.status = 'trial' and a.trial_ate >= now()),
        'lojas_ativas', count(distinct lj.id) filter (where a.status = 'ativo' and not coalesce(a.is_cortesia, false)),
        'lojas_cortesia', count(distinct lj.id) filter (where a.status = 'ativo' and coalesce(a.is_cortesia, false)),
        'lojas_expiradas', count(distinct lj.id) filter (where (a.status = 'expirado') or (a.status = 'trial' and a.trial_ate < now())),
        'lojas_canceladas', count(distinct lj.id) filter (where a.status in ('cancelado', 'suspenso')),
        'mrr_estimado', coalesce(sum(
          case
            when a.status = 'ativo' and not coalesce(a.is_cortesia, false) then
              case
                when a.plano = 'starter' and a.ciclo = 'yearly' then 9.90
                when a.plano = 'starter' then 14.90
                when a.plano = 'agencia' and a.ciclo = 'yearly' then 49.90
                when a.plano = 'agencia' then 69.90
                when a.plano = 'pro' and a.ciclo = 'yearly' then 21.90
                else 29.90
              end
            else 0
          end
        ), 0),
        'projecao_anual', (coalesce(sum(
          case
            when a.status = 'ativo' and not coalesce(a.is_cortesia, false) then
              case
                when a.plano = 'starter' and a.ciclo = 'yearly' then 9.90
                when a.plano = 'starter' then 14.90
                when a.plano = 'agencia' and a.ciclo = 'yearly' then 49.90
                when a.plano = 'agencia' then 69.90
                when a.plano = 'pro' and a.ciclo = 'yearly' then 21.90
                else 29.90
              end
            else 0
          end
        ), 0) * 12),
        'faturamento_real_coletado', (
          select coalesce(sum(p.valor), 0)
          from public.pagamentos p
          join public.assinaturas ass on ass.loja_id = p.loja_id
          where p.status = 'approved' and not coalesce(ass.is_cortesia, false)
        ),
        'faturamento_mes_atual', (
          select coalesce(sum(p.valor), 0)
          from public.pagamentos p
          join public.assinaturas ass on ass.loja_id = p.loja_id
          where p.status = 'approved'
            and not coalesce(ass.is_cortesia, false)
            and p.criado_em >= date_trunc('month', now())
        ),
        'total_links', (select count(*) from public.links),
        'total_links_ativos', (select count(*) from public.links where ativo),
        'total_cliques', (select count(*) from public.cliques),
        'cliques_mobile', (select count(*) from public.cliques where dispositivo = 'mobile'),
        'cliques_desktop', (select count(*) from public.cliques where dispositivo = 'desktop'),
        'cliques_ultimos_30d', (select count(*) from public.cliques where criado_em > now() - interval '30 days')
      )
      from public.lojas lj
      left join public.assinaturas a on a.loja_id = lj.id
    ),
    'funil', (
      select json_build_object(
        'etapa_cadastros', (select count(*) from public.lojas),
        'etapa_criou_link', (select count(distinct loja_id) from public.links),
        'etapa_fez_alteracoes', (select count(distinct loja_id) from public.links where versao > 1),
        'etapa_limite_edicoes', (select count(distinct loja_id) from public.links where versao >= 6),
        'etapa_assinou_pro', (select count(*) from public.assinaturas where status = 'ativo' and not coalesce(is_cortesia, false))
      )
    )
  ) into v_res;

  return v_res;
end;
$$;

grant execute on function public.admin_obter_dashboard() to authenticated;

-- 4. Atualiza admin_obter_lojas para retornar is_cortesia e suportar filtro de cortesia
create or replace function public.admin_obter_lojas(
  p_termo text default null,
  p_status text default 'todos',
  p_limite int default 50,
  p_offset int default 0
)
returns json
language plpgsql
security definer
set search_path = public, auth
stable
as $$
declare
  v_res json;
begin
  if not public.is_super_admin() then
    raise exception 'Acesso negado: privilégios de administrador necessários';
  end if;

  select json_agg(t) into v_res from (
    select
      lj.id as loja_id,
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
      coalesce(a.is_cortesia, false)::boolean as is_cortesia,
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
       (p_status = 'ativo' and a.status = 'ativo' and (a.valido_ate is null or a.valido_ate >= now()) and not coalesce(a.is_cortesia, false)) or
       (p_status = 'cortesia' and a.status = 'ativo' and coalesce(a.is_cortesia, false)) or
       (p_status = 'trial' and a.status = 'trial' and a.trial_ate >= now()) or
       (p_status = 'expirado' and ((a.status = 'expirado') or (a.status = 'trial' and a.trial_ate < now()) or (a.status = 'ativo' and a.valido_ate < now()))) or
       (p_status = 'cancelado' and a.status in ('cancelado', 'suspenso')))
    group by lj.id, u.email, a.status, a.is_cortesia, a.plano, a.ciclo, a.tipo_cobranca, a.cancelar_ao_fim_do_periodo, a.valido_ate, a.trial_ate
    order by lj.criado_em desc
    limit p_limite offset p_offset
  ) t;

  return coalesce(v_res, '[]'::json);
end;
$$;

grant execute on function public.admin_obter_lojas(text, text, int, int) to authenticated;

-- 5. Atualiza admin_atualizar_loja com suporte a cortesia
create or replace function public.admin_atualizar_loja(
  p_loja_id uuid,
  p_acao text,
  p_dias_adicionais int default 7
)
returns json
language plpgsql security definer set search_path = public, auth as $$
declare
  v_res json;
begin
  if not public.is_super_admin() then
    raise exception 'Acesso negado: privilégios de administrador necessários';
  end if;

  if p_acao = 'estender_trial' then
    update public.assinaturas
    set status = 'trial',
        trial_ate = greatest(now(), trial_ate) + make_interval(days => p_dias_adicionais),
        atualizado_em = now()
    where loja_id = p_loja_id;
  elsif p_acao = 'ativar_pro' then
    update public.assinaturas
    set status = 'ativo',
        is_cortesia = false,
        valido_ate = greatest(coalesce(valido_ate, now()), now() + interval '30 days'),
        atualizado_em = now()
    where loja_id = p_loja_id;
  elsif p_acao = 'conceder_cortesia' then
    update public.assinaturas
    set status = 'ativo',
        is_cortesia = true,
        valido_ate = greatest(coalesce(valido_ate, now()), now() + interval '365 days'),
        atualizado_em = now()
    where loja_id = p_loja_id;
  elsif p_acao = 'alternar_cortesia' then
    update public.assinaturas
    set is_cortesia = not coalesce(is_cortesia, false),
        status = 'ativo',
        atualizado_em = now()
    where loja_id = p_loja_id;
  elsif p_acao = 'expirar_trial' then
    update public.assinaturas
    set status = 'expirado',
        trial_ate = now() - interval '1 second',
        atualizado_em = now()
    where loja_id = p_loja_id;
  elsif p_acao = 'pausar_links' then
    update public.links
    set ativo = false,
        atualizado_em = now()
    where loja_id = p_loja_id;
  elsif p_acao = 'reativar_links' then
    update public.links
    set ativo = true,
        atualizado_em = now()
    where loja_id = p_loja_id;
  else
    raise exception 'Ação inválida: %', p_acao;
  end if;

  select json_build_object(
    'sucesso', true,
    'acao', p_acao,
    'loja_id', p_loja_id
  ) into v_res;

  return v_res;
end;
$$;

grant execute on function public.admin_atualizar_loja(uuid, text, int) to authenticated;
