-- 0011_galeria_fotos.sql: Políticas de leitura e gerenciamento da Galeria de Fotos pelo Lojista

-- Permitir que o lojista autenticado liste seus arquivos no bucket 'banners'
drop policy if exists banners_ler on storage.objects;
create policy banners_ler on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'banners'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_super_admin()
    )
  );

-- Permitir leitura pública dos objetos do bucket público banners
drop policy if exists banners_publico_ler on storage.objects;
create policy banners_publico_ler on storage.objects
  for select
  to public
  using (bucket_id = 'banners');
