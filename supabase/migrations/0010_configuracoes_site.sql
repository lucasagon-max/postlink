-- 0010_configuracoes_site.sql: Gerenciamento de Banner, Título e Descrição do Site Oficial PostLink

create table if not exists public.configuracoes_site (
  id text primary key default 'oficial',
  titulo text not null default 'Transforme ofertas em cartões em alta definição que abrem sozinhos e vendem no WhatsApp',
  descricao text not null default 'Quase ninguém baixa fotos avulsas no WhatsApp para não lotar a memória do celular — e mesmo quem baixa não vai a lugar nenhum ao clicar na foto. Com o PostLink, seu produto já aparece aberto na conversa, sem ocupar a galeria do cliente e direcionando para o seu atendimento com 1 clique.',
  banner_url text,
  badge_texto text not null default 'Abre direto no WhatsApp · Zero fotos na galeria do cliente',
  cta_texto text not null default 'Começar Grátis',
  cta_url text not null default '/planos/',
  banner_ativo boolean not null default true,
  atualizado_em timestamptz not null default now(),
  atualizado_por text default 'sistema'
);

-- Insere o registro inicial padrão caso ainda não exista
insert into public.configuracoes_site (
  id,
  titulo,
  descricao,
  banner_url,
  badge_texto,
  cta_texto,
  cta_url,
  banner_ativo,
  atualizado_por
) values (
  'oficial',
  'Transforme ofertas em cartões em alta definição que abrem sozinhos e vendem no WhatsApp',
  'Quase ninguém baixa fotos avulsas no WhatsApp para não lotar a memória do celular — e mesmo quem baixa não vai a lugar nenhum ao clicar na foto. Com o PostLink, seu produto já aparece aberto na conversa, sem ocupar a galeria do cliente e direcionando para o seu atendimento com 1 clique.',
  null,
  'Abre direto no WhatsApp · Zero fotos na galeria do cliente',
  'Começar Grátis',
  '/planos/',
  true,
  'sistema'
) on conflict (id) do nothing;

-- RLS para configuracoes_site
alter table public.configuracoes_site enable row level security;

drop policy if exists configuracoes_site_leitura_publica on public.configuracoes_site;
create policy configuracoes_site_leitura_publica
  on public.configuracoes_site
  for select
  to anon, authenticated
  using (true);

drop policy if exists configuracoes_site_escrita_admin on public.configuracoes_site;
create policy configuracoes_site_escrita_admin
  on public.configuracoes_site
  for update
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists configuracoes_site_insert_admin on public.configuracoes_site;
create policy configuracoes_site_insert_admin
  on public.configuracoes_site
  for insert
  to authenticated
  with check (public.is_super_admin());

-- Storage: Permitir atualização (upsert) e gestão completa para Super Admin
drop policy if exists banners_atualizar on storage.objects;
create policy banners_atualizar on storage.objects
  for update to authenticated
  using (bucket_id = 'banners' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'banners' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists banners_admin_gerenciar on storage.objects;
create policy banners_admin_gerenciar on storage.objects
  for all to authenticated
  using (bucket_id = 'banners' and public.is_super_admin())
  with check (bucket_id = 'banners' and public.is_super_admin());

-- RPC de Leitura Pública
create or replace function public.obter_configuracoes_site()
returns json
language plpgsql security definer set search_path = public stable as $$
declare
  v_res json;
begin
  select json_build_object(
    'id', id,
    'titulo', titulo,
    'descricao', descricao,
    'banner_url', banner_url,
    'badge_texto', badge_texto,
    'cta_texto', cta_texto,
    'cta_url', cta_url,
    'banner_ativo', banner_ativo,
    'atualizado_em', atualizado_em,
    'atualizado_por', atualizado_por
  )
  into v_res
  from public.configuracoes_site
  where id = 'oficial'
  limit 1;

  return v_res;
end;
$$;

-- RPC de Atualização Administrativa
create or replace function public.admin_salvar_configuracoes_site(
  p_titulo text,
  p_descricao text,
  p_banner_url text default null,
  p_badge_texto text default null,
  p_cta_texto text default null,
  p_cta_url text default null,
  p_banner_ativo boolean default true
)
returns json
language plpgsql security definer
set search_path = public
set row_security = off as $$
declare
  v_res json;
  v_email text;
begin
  if not public.is_super_admin() then
    raise exception 'Acesso negado: privilégios de administrador necessários';
  end if;

  v_email := coalesce(auth.jwt() ->> 'email', 'admin');

  insert into public.configuracoes_site (
    id,
    titulo,
    descricao,
    banner_url,
    badge_texto,
    cta_texto,
    cta_url,
    banner_ativo,
    atualizado_em,
    atualizado_por
  )
  values (
    'oficial',
    coalesce(trim(p_titulo), 'PostLink'),
    coalesce(trim(p_descricao), ''),
    p_banner_url,
    coalesce(trim(p_badge_texto), 'PostLink Smart Links'),
    coalesce(trim(p_cta_texto), 'Começar Grátis'),
    coalesce(trim(p_cta_url), '/planos/'),
    coalesce(p_banner_ativo, true),
    now(),
    v_email
  )
  on conflict (id) do update set
    titulo = excluded.titulo,
    descricao = excluded.descricao,
    banner_url = excluded.banner_url,
    badge_texto = excluded.badge_texto,
    cta_texto = excluded.cta_texto,
    cta_url = excluded.cta_url,
    banner_ativo = excluded.banner_ativo,
    atualizado_em = now(),
    atualizado_por = v_email;

  select json_build_object(
    'sucesso', true,
    'mensagem', 'Configurações do site oficial atualizadas com sucesso!',
    'dados', (select public.obter_configuracoes_site())
  ) into v_res;

  return v_res;
end;
$$;
