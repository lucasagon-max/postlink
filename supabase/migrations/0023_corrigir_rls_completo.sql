-- 0023_corrigir_rls_completo.sql
-- Solução unificada e definitiva para políticas RLS de Links e Storage Banners no PostLink

-- ==============================================================================
-- 1. TABELA LINKS: Habilitação de RLS, Grants e Políticas Granulares
-- ==============================================================================
alter table public.links enable row level security;
grant select, insert, update, delete on public.links to authenticated;

-- Limpeza de políticas prévias ou concorrentes
drop policy if exists "links_dono" on public.links;
drop policy if exists links_dono on public.links;
drop policy if exists "lojistas_podem_gerenciar_seus_links" on public.links;
drop policy if exists "lojista_gerencia_seus_links_select" on public.links;
drop policy if exists "lojista_gerencia_seus_links_insert" on public.links;
drop policy if exists "lojista_gerencia_seus_links_update" on public.links;
drop policy if exists "lojista_gerencia_seus_links_delete" on public.links;

-- Políticas explícitas para cada operação DML
create policy "lojista_gerencia_seus_links_select" on public.links
  for select to authenticated
  using (loja_id = (select auth.uid()));

create policy "lojista_gerencia_seus_links_insert" on public.links
  for insert to authenticated
  with check (loja_id = (select auth.uid()));

create policy "lojista_gerencia_seus_links_update" on public.links
  for update to authenticated
  using (loja_id = (select auth.uid()))
  with check (loja_id = (select auth.uid()));

create policy "lojista_gerencia_seus_links_delete" on public.links
  for delete to authenticated
  using (loja_id = (select auth.uid()));


-- ==============================================================================
-- 2. STORAGE (BUCKET 'banners'): Bucket Público e Políticas INSERT/SELECT/UPDATE/DELETE
-- ==============================================================================
-- Assegura a criação do bucket com limite de 5MB e permissão pública
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('banners', 'banners', true, 5242880, array['image/jpeg','image/webp','image/png'])
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/webp','image/png'];

-- Limpeza de políticas de storage anteriores
drop policy if exists "banners_enviar" on storage.objects;
drop policy if exists banners_enviar on storage.objects;
drop policy if exists "banners_atualizar" on storage.objects;
drop policy if exists banners_atualizar on storage.objects;
drop policy if exists "banners_apagar" on storage.objects;
drop policy if exists banners_apagar on storage.objects;
drop policy if exists "banners_ler" on storage.objects;
drop policy if exists banners_ler on storage.objects;
drop policy if exists "banners_publico_ler" on storage.objects;
drop policy if exists banners_publico_ler on storage.objects;
drop policy if exists "banners_admin_gerenciar" on storage.objects;
drop policy if exists banners_admin_gerenciar on storage.objects;

-- Leitura pública: permite que qualquer usuário acesse a URL pública das imagens
create policy "banners_publico_ler" on storage.objects
  for select to public
  using (bucket_id = 'banners');

-- Upload (INSERT): lojista autenticado só grava dentro da sua própria pasta
create policy "banners_enviar" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'banners'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (
        (storage.foldername(name))[1] = 'lojistas'
        and (storage.foldername(name))[2] = (select auth.uid())::text
      )
    )
  );

-- Atualização (UPDATE): lojista autenticado pode atualizar seus próprios arquivos (necessário para upsert)
create policy "banners_atualizar" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'banners'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (
        (storage.foldername(name))[1] = 'lojistas'
        and (storage.foldername(name))[2] = (select auth.uid())::text
      )
    )
  )
  with check (
    bucket_id = 'banners'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (
        (storage.foldername(name))[1] = 'lojistas'
        and (storage.foldername(name))[2] = (select auth.uid())::text
      )
    )
  );

-- Exclusão (DELETE): lojista autenticado pode excluir apenas seus próprios arquivos
create policy "banners_apagar" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'banners'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (
        (storage.foldername(name))[1] = 'lojistas'
        and (storage.foldername(name))[2] = (select auth.uid())::text
      )
    )
  );


-- ==============================================================================
-- 3. TABELAS AUXILIARES: Concessão explícita de permissões em lojas e assinaturas
-- ==============================================================================
alter table public.lojas enable row level security;
grant select, update on public.lojas to authenticated;

alter table public.assinaturas enable row level security;
grant select on public.assinaturas to authenticated;
