-- Migration 0007: Tabela de pagamentos e auditoria Mercado Pago

create table if not exists public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references public.lojas(id) on delete cascade,
  mp_payment_id text not null unique,
  plano text not null check (plano in ('starter', 'pro', 'agencia')),
  ciclo text not null check (ciclo in ('monthly', 'yearly')),
  valor numeric(10,2) not null,
  status text not null default 'pending',
  metodo text not null default 'pix',
  detalhes jsonb,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists idx_pagamentos_loja on public.pagamentos(loja_id);
create index if not exists idx_pagamentos_mp on public.pagamentos(mp_payment_id);

alter table public.pagamentos enable row level security;

-- Política de visualização: lojista pode ver seus próprios pagamentos
drop policy if exists "lojistas_podem_ver_seus_pagamentos" on public.pagamentos;
create policy "lojistas_podem_ver_seus_pagamentos"
  on public.pagamentos for select
  using (loja_id = auth.uid());
