-- 0021_mini_vitrine_produtos.sql
-- Adiciona suporte a Página de Oferta (Mini-Vitrine) com múltiplos detalhes de produto/serviço

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

-- 2. Atualizar a RPC pública obter_link_publico para retornar os dados completos
-- Nota: Drop da versão anterior necessário devido à alteração das colunas de retorno
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
