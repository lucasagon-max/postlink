-- 0025_corrigir_contador_cliques_e_funil.sql
-- Corrige a tabela de cliques, colunas ausentes e funções RPC do contador de cliques

-- 1. Adiciona coluna de logotipo da loja caso ainda não exista
alter table public.lojas
  add column if not exists logo_url text;

comment on column public.lojas.logo_url is 'URL ou caminho da imagem do logotipo da loja/comerciante (opcional)';

-- 2. Adiciona a coluna etapa na tabela public.cliques para métricas de funil
alter table public.cliques
  add column if not exists etapa text not null default 'acesso' check (etapa in ('acesso', 'destino'));

comment on column public.cliques.etapa is 'Etapa do clique: acesso (visualizou tela intermediária) ou destino (clicou no botão para ir ao destino final)';

create index if not exists idx_cliques_link_etapa_criado on public.cliques (link_id, etapa, criado_em);

-- 3. Remove assinaturas anteriores para evitar erro de ambiguidade/sobrecarga no Postgres/PostgREST
drop function if exists public.registrar_clique(uuid, text, text);
drop function if exists public.registrar_clique(uuid, text, text, text);

-- 4. Cria a função atualizada de registro de cliques suportando etapa ('acesso' ou 'destino')
create or replace function public.registrar_clique(
  p_link uuid,
  p_origem text,
  p_dispositivo text,
  p_etapa text default 'acesso'
)
returns void language sql security definer set search_path = public as $$
  insert into cliques(link_id, origem, dispositivo, etapa)
  values (
    p_link,
    left(p_origem, 100),
    case when p_dispositivo in ('mobile','desktop') then p_dispositivo end,
    case when p_etapa in ('acesso', 'destino') then p_etapa else 'acesso' end
  );
$$;

revoke all on function public.registrar_clique(uuid, text, text, text) from public;
grant execute on function public.registrar_clique(uuid, text, text, text) to anon, authenticated;

-- 5. Atualiza estatisticas_links com métricas de funil
drop function if exists public.estatisticas_links(int);

create or replace function public.estatisticas_links(p_dias int default 30)
returns table (
  link_id uuid,
  total bigint,
  recentes bigint,
  mobile bigint,
  desktop bigint,
  whatsapp bigint,
  instagram bigint,
  acessos_vitrine bigint,
  cliques_destino bigint
)
language sql security definer set search_path = public stable as $$
  select
    l.id,
    count(c.id) filter (where c.etapa = 'acesso' or c.etapa is null) as total,
    count(c.id) filter (where (c.etapa = 'acesso' or c.etapa is null) and c.criado_em > now() - make_interval(days => p_dias)) as recentes,
    count(c.id) filter (where c.dispositivo = 'mobile' and (c.etapa = 'acesso' or c.etapa is null)) as mobile,
    count(c.id) filter (where c.dispositivo = 'desktop' and (c.etapa = 'acesso' or c.etapa is null)) as desktop,
    count(c.id) filter (where c.origem ilike '%whatsapp%' and (c.etapa = 'acesso' or c.etapa is null)) as whatsapp,
    count(c.id) filter (where c.origem ilike '%instagram%' and (c.etapa = 'acesso' or c.etapa is null)) as instagram,
    count(c.id) filter (where c.etapa = 'acesso' or c.etapa is null) as acessos_vitrine,
    count(c.id) filter (where c.etapa = 'destino') as cliques_destino
  from links l
  left join cliques c on c.link_id = l.id
  where l.loja_id = auth.uid()
  group by l.id;
$$;

revoke all on function public.estatisticas_links(int) from public;
grant execute on function public.estatisticas_links(int) to authenticated;

-- 6. Atualiza estatisticas_detalhadas_links com métricas de funil
drop function if exists public.estatisticas_detalhadas_links(int);

create or replace function public.estatisticas_detalhadas_links(p_dias int default 30)
returns table (
  link_id uuid,
  total bigint,
  recentes bigint,
  mobile bigint,
  desktop bigint,
  whatsapp bigint,
  instagram bigint,
  facebook bigint,
  outros bigint,
  acessos_vitrine bigint,
  cliques_destino bigint
)
language sql security definer set search_path = public stable as $$
  select
    l.id as link_id,
    count(c.id) filter (where c.etapa = 'acesso' or c.etapa is null) as total,
    count(c.id) filter (where (c.etapa = 'acesso' or c.etapa is null) and c.criado_em > now() - make_interval(days => p_dias)) as recentes,
    count(c.id) filter (where c.dispositivo = 'mobile' and (c.etapa = 'acesso' or c.etapa is null)) as mobile,
    count(c.id) filter (where c.dispositivo = 'desktop' and (c.etapa = 'acesso' or c.etapa is null)) as desktop,
    count(c.id) filter (where (c.etapa = 'acesso' or c.etapa is null) and lower(coalesce(c.origem, '')) in ('whatsapp', 'wa', 'web.whatsapp.com', 'whatsapp.com')) as whatsapp,
    count(c.id) filter (where (c.etapa = 'acesso' or c.etapa is null) and lower(coalesce(c.origem, '')) in ('instagram', 'ig', 'l.instagram.com', 'instagram.com')) as instagram,
    count(c.id) filter (where (c.etapa = 'acesso' or c.etapa is null) and lower(coalesce(c.origem, '')) in ('facebook', 'fb', 'l.facebook.com', 'facebook.com')) as facebook,
    count(c.id) filter (where (c.etapa = 'acesso' or c.etapa is null) and lower(coalesce(c.origem, '')) not in ('whatsapp', 'wa', 'web.whatsapp.com', 'whatsapp.com', 'instagram', 'ig', 'l.instagram.com', 'instagram.com', 'facebook', 'fb', 'l.facebook.com', 'facebook.com')) as outros,
    count(c.id) filter (where c.etapa = 'acesso' or c.etapa is null) as acessos_vitrine,
    count(c.id) filter (where c.etapa = 'destino') as cliques_destino
  from links l
  left join cliques c on c.link_id = l.id
  where l.loja_id = auth.uid()
  group by l.id;
$$;

revoke all on function public.estatisticas_detalhadas_links(int) from public;
grant execute on function public.estatisticas_detalhadas_links(int) to authenticated;
