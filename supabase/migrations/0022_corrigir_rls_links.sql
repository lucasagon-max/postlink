-- 0022_corrigir_rls_links.sql: Aprimoramento e consolidação das políticas RLS da tabela links
-- Garante que o lojista autenticado possa inserir, consultar, atualizar e excluir seus próprios links.

-- 1. Garante que RLS está habilitado na tabela links
alter table public.links enable row level security;

-- 2. Limpeza de políticas legadas ou redundantes
drop policy if exists links_dono on public.links;
drop policy if exists "links_dono" on public.links;
drop policy if exists "lojistas_podem_gerenciar_seus_links" on public.links;
drop policy if exists "lojista_gerencia_seus_links_select" on public.links;
drop policy if exists "lojista_gerencia_seus_links_insert" on public.links;
drop policy if exists "lojista_gerencia_seus_links_update" on public.links;
drop policy if exists "lojista_gerencia_seus_links_delete" on public.links;

-- 3. Política de SELECT: O lojista autenticado lê seus próprios links
create policy "lojista_gerencia_seus_links_select" on public.links
  for select
  to authenticated
  using (loja_id = (select auth.uid()));

-- 4. Política de INSERT: O lojista autenticado insere links onde loja_id é o seu próprio auth.uid()
create policy "lojista_gerencia_seus_links_insert" on public.links
  for insert
  to authenticated
  with check (loja_id = (select auth.uid()));

-- 5. Política de UPDATE: O lojista autenticado edita links da sua loja mantendo loja_id próprio
create policy "lojista_gerencia_seus_links_update" on public.links
  for update
  to authenticated
  using (loja_id = (select auth.uid()))
  with check (loja_id = (select auth.uid()));

-- 6. Política de DELETE: O lojista autenticado pode excluir links de sua loja
create policy "lojista_gerencia_seus_links_delete" on public.links
  for delete
  to authenticated
  using (loja_id = (select auth.uid()));

-- 7. Garante concessão explícita de permissões DML para o papel authenticated
grant select, insert, update, delete on public.links to authenticated;
