-- 0001_schema.sql: Estrutura inicial de tabelas do PostLink
create extension if not exists pgcrypto;

create table public.lojas (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null check (char_length(nome) between 2 and 60),
  slug text not null unique
    check (slug ~ '^[a-z0-9][a-z0-9-]{1,29}$')
    check (slug not in ('painel','login','api','assets','admin','termos','privacidade','c','static')),
  criado_em timestamptz not null default now()
);

-- Status e teste ficam em tabela própria: o lojista só pode ler, nunca alterar.
create table public.assinaturas (
  loja_id uuid primary key references public.lojas(id) on delete cascade,
  status text not null default 'trial'
    check (status in ('trial','ativo','atrasado','expirado','cancelado','suspenso')),
  trial_ate timestamptz not null default now() + interval '7 days',
  mp_assinatura_id text,
  atualizado_em timestamptz not null default now()
);

create table public.links (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references public.lojas(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9][a-z0-9-]{2,39}$'),
  destino text not null check (destino ~* '^https://[^\s]+\.[^\s]+$'),
  imagem_path text not null,
  versao int not null default 1,
  titulo text check (char_length(titulo) <= 80),
  descricao text check (char_length(descricao) <= 200),
  valido_ate timestamptz,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (loja_id, slug)
);
create index if not exists idx_links_loja_criado on public.links (loja_id, criado_em desc);

create table public.cliques (
  id bigint generated always as identity primary key,
  link_id uuid not null references public.links(id) on delete cascade,
  criado_em timestamptz not null default now(),
  origem text,        -- só o host do referer, quando existir
  dispositivo text    -- 'mobile' ou 'desktop'
);
create index if not exists idx_cliques_link_criado on public.cliques (link_id, criado_em);

create table public.denuncias (
  id bigint generated always as identity primary key,
  link_id uuid not null references public.links(id) on delete cascade,
  motivo text check (char_length(motivo) <= 300),
  criado_em timestamptz not null default now()
);

create table public.destinos_bloqueados (
  dominio text primary key
);
