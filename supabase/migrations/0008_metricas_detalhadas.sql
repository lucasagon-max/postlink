-- 0008_metricas_detalhadas.sql: Índices e função de métricas detalhadas (dispositivos e origens)

-- Índices para otimizar agregações na tabela cliques
create index if not exists idx_cliques_link_dispositivo on public.cliques (link_id, dispositivo);
create index if not exists idx_cliques_link_origem on public.cliques (link_id, origem);

-- Função de estatísticas detalhadas por link
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
  outros bigint
)
language sql security definer set search_path = public stable as $$
  select
    l.id as link_id,
    count(c.id) as total,
    count(c.id) filter (where c.criado_em > now() - make_interval(days => p_dias)) as recentes,
    count(c.id) filter (where c.dispositivo = 'mobile') as mobile,
    count(c.id) filter (where c.dispositivo = 'desktop') as desktop,
    count(c.id) filter (where lower(coalesce(c.origem, '')) in ('whatsapp', 'wa', 'web.whatsapp.com', 'whatsapp.com')) as whatsapp,
    count(c.id) filter (where lower(coalesce(c.origem, '')) in ('instagram', 'ig', 'l.instagram.com', 'instagram.com')) as instagram,
    count(c.id) filter (where lower(coalesce(c.origem, '')) in ('facebook', 'fb', 'l.facebook.com', 'facebook.com')) as facebook,
    count(c.id) filter (where lower(coalesce(c.origem, '')) not in ('whatsapp', 'wa', 'web.whatsapp.com', 'whatsapp.com', 'instagram', 'ig', 'l.instagram.com', 'instagram.com', 'facebook', 'fb', 'l.facebook.com', 'facebook.com')) as outros
  from links l
  left join cliques c on c.link_id = l.id
  where l.loja_id = auth.uid()
  group by l.id;
$$;

revoke all on function public.estatisticas_detalhadas_links(int) from public;
grant execute on function public.estatisticas_detalhadas_links(int) to authenticated;
