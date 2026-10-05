-- 0002_rls.sql: Políticas de Row Level Security (RLS)
alter table public.lojas enable row level security;
alter table public.assinaturas enable row level security;
alter table public.links enable row level security;
alter table public.cliques enable row level security;
alter table public.denuncias enable row level security;
alter table public.destinos_bloqueados enable row level security;

-- Lojas: o dono lê e edita; a criação é feita exclusivamente pela procedure criar_loja().
drop policy if exists lojas_ler on public.lojas;
create policy lojas_ler on public.lojas for select using (id = auth.uid());

drop policy if exists lojas_editar on public.lojas;
create policy lojas_editar on public.lojas for update
  using (id = auth.uid()) with check (id = auth.uid());

-- Assinaturas: o dono apenas lê. Quem atualiza é o webhook com service_role key.
drop policy if exists assinaturas_ler on public.assinaturas;
create policy assinaturas_ler on public.assinaturas for select using (loja_id = auth.uid());

-- Links: o lojista autenticado gerencia apenas os seus próprios links.
drop policy if exists links_dono on public.links;
create policy links_dono on public.links for all
  using (loja_id = auth.uid()) with check (loja_id = auth.uid());

-- cliques, denuncias e destinos_bloqueados: sem política pública = acesso direto negado via PostgREST.
-- O acesso ocorre exclusivamente pelas funções RPC controladas (security definer).
