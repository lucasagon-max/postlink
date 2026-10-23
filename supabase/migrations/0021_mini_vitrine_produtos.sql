-- 0021_mini_vitrine_produtos.sql
-- Adiciona suporte a Página de Oferta (Mini-Vitrine), logotipo da loja e métricas detalhadas (acesso vs destino final)

-- 1. Novos campos na tabela public.links
alter table public.links
  add column if not exists tipo_link text default 'direto' check (tipo_link in ('direto', 'vitrine')),
  add column if not exists preco_de numeric(10,2),
  add column if not exists preco_por numeric(10,2),
  add column if not exists condicao_pagamento text check (char_length(condicao_pagamento) <= 80),
  add column if not exists beneficios jsonb default '[]'::jsonb,
  add column if not exists fotos_galeria jsonb default '[]'::jsonb,
  add column if not exists cta_label text check (char_length(cta_label) <= 40);

comment on column public.links.tipo_link is 'Modo do link: direto (redirecionamento rápido) ou vitrine (página de oferta com detalhes)';
comment on column public.links.preco_de is 'Preço original de referência (De) para exibição de desconto';
comment on column public.links.preco_por is 'Preço promocional ou final do produto/serviço (Por)';
comment on column public.links.condicao_pagamento is 'Condição de pagamento ou facilidade (ex: 3x sem juros, desconto no Pix)';
comment on column public.links.beneficios is 'Lista de tópicos/diferenciais do produto ou serviço (array JSON)';
comment on column public.links.fotos_galeria is 'Caminhos de fotos adicionais para o carrossel da oferta (array JSON)';
comment on column public.links.cta_label is 'Texto do botão principal de ação (ex: Pedir pelo WhatsApp, Comprar Agora)';

-- 2. Logotipo opcional na tabela public.lojas
alter table public.lojas
  add column if not exists logo_url text;

comment on column public.lojas.logo_url is 'URL ou caminho da imagem do logotipo da loja/comerciante (opcional)';

-- 3. Métrica de funil (acesso à página intermediária vs clique no destino final)
alter table public.cliques
  add column if not exists etapa text not null default 'acesso' check (etapa in ('acesso', 'destino'));

comment on column public.cliques.etapa is 'Etapa do clique: acesso (visualizou tela intermediária) ou destino (clicou no botão para ir ao destino final)';

create index if not exists idx_cliques_link_etapa_criado on public.cliques (link_id, etapa, criado_em);

-- 4. Atualizar registrar_clique para suportar a etapa ('acesso' ou 'destino')
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

-- 5. Atualizar a RPC pública obter_link_publico para retornar os dados completos + logotipo
drop function if exists public.obter_link_publico(text, text);

create or replace function public.obter_link_publico(p_loja text, p_slug text)
returns table (
  link_id uuid,
  destino text,
  imagem_path text,
  versao int,
  titulo text,
  descricao text,
  loja_nome text,
  loja_logo text,
  expirado boolean,
  tipo_link text,
  preco_de numeric,
  preco_por numeric,
  condicao_pagamento text,
  beneficios jsonb,
  fotos_galeria jsonb,
  cta_label text
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
    lj.logo_url,
    (l.valido_ate is not null and l.valido_ate < now()),
    coalesce(l.tipo_link, 'direto'),
    l.preco_de,
    l.preco_por,
    l.condicao_pagamento,
    coalesce(l.beneficios, '[]'::jsonb),
    coalesce(l.fotos_galeria, '[]'::jsonb),
    coalesce(l.cta_label, 'Pedir pelo WhatsApp')
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

revoke all on function public.obter_link_publico(text, text) from public;
grant execute on function public.obter_link_publico(text, text) to anon, authenticated;

-- 6. Atualizar estatisticas_links com métricas de funil (acessos vitrine e cliques destino)
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

-- 7. Atualizar estatisticas_detalhadas_links com métricas de funil
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
