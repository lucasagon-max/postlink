-- 0005_admin.sql: Estrutura e Funções RPC para o Painel Administrativo do PostLink

-- 1. Tabela de Administradores
create table if not exists public.administradores (
  email text primary key,
  criado_em timestamptz not null default now()
);

-- Insere o Super Admin inicial
insert into public.administradores (email)
values ('lucas.a.gon@gmail.com')
on conflict (email) do nothing;

-- 2. Função de Verificação de Super Admin
create or replace function public.is_super_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.administradores
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  ) or lower(coalesce(auth.jwt() ->> 'email', '')) = 'lucas.a.gon@gmail.com';
$$;

-- 3. RPC: Métricas Consolidadas do Dashboard
create or replace function public.admin_obter_dashboard()
returns json
language plpgsql security definer set search_path = public stable as $$
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
        'lojas_ativas', count(distinct lj.id) filter (where a.status = 'ativo'),
        'lojas_expiradas', count(distinct lj.id) filter (where (a.status = 'expirado') or (a.status = 'trial' and a.trial_ate < now())),
        'lojas_canceladas', count(distinct lj.id) filter (where a.status in ('cancelado', 'suspenso')),
        'mrr_estimado', (count(distinct lj.id) filter (where a.status = 'ativo') * 29.90),
        'projecao_anual', (count(distinct lj.id) filter (where a.status = 'ativo') * 29.90 * 12),
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
        'etapa_assinou_pro', (select count(*) from public.assinaturas where status = 'ativo')
      )
    )
  ) into v_res;

  return v_res;
end;
$$;

-- 4. RPC: Listar Usuários/Lojistas com Filtros e Busca
create or replace function public.admin_listar_lojas(
  p_termo text default null,
  p_status text default 'todos',
  p_limite int default 50,
  p_offset int default 0
)
returns table (
  loja_id uuid,
  email text,
  nome text,
  slug text,
  criado_em timestamptz,
  status_assinatura text,
  trial_ate timestamptz,
  dias_trial_restantes int,
  total_links bigint,
  total_cliques bigint,
  max_versao int
)
language plpgsql security definer set search_path = public stable as $$
begin
  if not public.is_super_admin() then
    raise exception 'Acesso negado: privilégios de administrador necessários';
  end if;

  return query
  select
    lj.id as loja_id,
    coalesce(u.email, 'sem-email') as email,
    lj.nome,
    lj.slug,
    lj.criado_em,
    case
      when a.status = 'trial' and a.trial_ate < now() then 'expirado'
      else coalesce(a.status, 'trial')
    end as status_assinatura,
    a.trial_ate,
    greatest(0, ceil(extract(epoch from (a.trial_ate - now())) / 86400)::int) as dias_trial_restantes,
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
     u.email ilike '%' || p_termo || '%')
    and (
      p_status = 'todos' or
      (p_status = 'trial' and a.status = 'trial' and a.trial_ate >= now()) or
      (p_status = 'ativo' and a.status = 'ativo') or
      (p_status = 'expirado' and (a.status = 'expirado' or (a.status = 'trial' and a.trial_ate < now())))
    )
  group by lj.id, u.email, lj.nome, lj.slug, lj.criado_em, a.status, a.trial_ate
  order by lj.criado_em desc
  limit p_limite offset p_offset;
end;
$$;

-- 5. RPC: Ações Administrativas na Loja (Estender trial, ativar Pro, pausar links)
create or replace function public.admin_atualizar_loja(
  p_loja_id uuid,
  p_acao text,
  p_dias_adicionais int default 7
)
returns json
language plpgsql security definer set search_path = public as $$
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

-- 6. RPC: Top Links Mais Clicados da Plataforma
create or replace function public.admin_listar_top_links(p_limite int default 10)
returns table (
  link_id uuid,
  loja_nome text,
  loja_slug text,
  slug text,
  titulo text,
  destino text,
  versao int,
  ativo boolean,
  total_cliques bigint,
  cliques_30d bigint,
  criado_em timestamptz
)
language plpgsql security definer set search_path = public stable as $$
begin
  if not public.is_super_admin() then
    raise exception 'Acesso negado: privilégios de administrador necessários';
  end if;

  return query
  select
    l.id as link_id,
    lj.nome as loja_nome,
    lj.slug as loja_slug,
    l.slug,
    coalesce(l.titulo, lj.nome) as titulo,
    l.destino,
    l.versao,
    l.ativo,
    count(c.id)::bigint as total_cliques,
    count(c.id) filter (where c.criado_em > now() - interval '30 days')::bigint as cliques_30d,
    l.criado_em
  from public.links l
  join public.lojas lj on lj.id = l.loja_id
  left join public.cliques c on c.link_id = l.id
  group by l.id, lj.nome, lj.slug, l.slug, l.titulo, l.destino, l.versao, l.ativo, l.criado_em
  order by total_cliques desc, l.criado_em desc
  limit p_limite;
end;
$$;

-- 7. Concessão de Permissões
revoke all on function public.is_super_admin() from public;
revoke all on function public.admin_obter_dashboard() from public;
revoke all on function public.admin_listar_lojas(text, text, int, int) from public;
revoke all on function public.admin_atualizar_loja(uuid, text, int) from public;
revoke all on function public.admin_listar_top_links(int) from public;

grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.admin_obter_dashboard() to authenticated;
grant execute on function public.admin_listar_lojas(text, text, int, int) to authenticated;
grant execute on function public.admin_atualizar_loja(uuid, text, int) to authenticated;
grant execute on function public.admin_listar_top_links(int) to authenticated;
