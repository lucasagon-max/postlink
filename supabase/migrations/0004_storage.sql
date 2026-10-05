-- 0004_storage.sql: Bucket público para banners e políticas de upload/exclusão
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('banners', 'banners', true, 512000, array['image/jpeg','image/webp','image/png'])
on conflict (id) do nothing;

-- Lojista autenticado pode enviar imagens exclusivamente para a pasta com seu auth.uid()
drop policy if exists banners_enviar on storage.objects;
create policy banners_enviar on storage.objects for insert to authenticated
  with check (bucket_id = 'banners' and (storage.foldername(name))[1] = auth.uid()::text);

-- Lojista autenticado pode apagar apenas as imagens pertencentes à sua pasta
drop policy if exists banners_apagar on storage.objects;
create policy banners_apagar on storage.objects for delete to authenticated
  using (bucket_id = 'banners' and (storage.foldername(name))[1] = auth.uid()::text);
