-- 0011_adicionar_campos_previa.sql
-- Adiciona suporte a customização do card de pré-visualização do link compartilhado (imagem, título e descrição)

-- 1. Adiciona as colunas à tabela public.configuracoes_site se não existirem
alter table public.configuracoes_site
  add column if not exists preview_titulo text default 'Lançamento Especial · Oferta Exclusiva com 1 Clique',
  add column if not exists preview_descricao text default 'Compartilhe ofertas no WhatsApp com um cartão visual em alta definição que abre sozinho! 👇',
  add column if not exists preview_subtitulo text default 'postlink.com.br/sua-loja ➔ Redireciona para o destino';

-- Atualiza o registro existente caso os campos estejam nulos
update public.configuracoes_site
set
  preview_titulo = coalesce(preview_titulo, 'Lançamento Especial · Oferta Exclusiva com 1 Clique'),
  preview_descricao = coalesce(preview_descricao, 'Compartilhe ofertas no WhatsApp com um cartão visual em alta definição que abre sozinho! 👇'),
  preview_subtitulo = coalesce(preview_subtitulo, 'postlink.com.br/sua-loja ➔ Redireciona para o destino')
where id = 'oficial';

-- 2. Atualiza a RPC de leitura pública public.obter_configuracoes_site()
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
    'preview_titulo', coalesce(preview_titulo, 'Lançamento Especial · Oferta Exclusiva com 1 Clique'),
    'preview_descricao', coalesce(preview_descricao, 'Compartilhe ofertas no WhatsApp com um cartão visual em alta definição que abre sozinho! 👇'),
    'preview_subtitulo', coalesce(preview_subtitulo, 'postlink.com.br/sua-loja ➔ Redireciona para o destino'),
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

-- 3. Renomeia assinatura legada de 7 parâmetros para evitar ambiguidade (Could not choose the best candidate function)
do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on p.pronamespace = n.oid
    where n.nspname = 'public' 
      and p.proname = 'admin_salvar_configuracoes_site' 
      and p.pronargs = 7
  ) then
    execute 'alter function public.admin_salvar_configuracoes_site(text, text, text, text, text, text, boolean) rename to admin_salvar_configuracoes_site_legada';
  end if;
end;
$$;

-- 4. Atualiza a RPC de salvamento administrativo public.admin_salvar_configuracoes_site(...)
create or replace function public.admin_salvar_configuracoes_site(
  p_titulo text,
  p_descricao text,
  p_banner_url text default null,
  p_badge_texto text default null,
  p_cta_texto text default null,
  p_cta_url text default null,
  p_banner_ativo boolean default true,
  p_preview_titulo text default null,
  p_preview_descricao text default null,
  p_preview_subtitulo text default null
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
    preview_titulo,
    preview_descricao,
    preview_subtitulo,
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
    coalesce(trim(p_preview_titulo), 'Lançamento Especial · Oferta Exclusiva com 1 Clique'),
    coalesce(trim(p_preview_descricao), 'Compartilhe ofertas no WhatsApp com um cartão visual em alta definição que abre sozinho! 👇'),
    coalesce(trim(p_preview_subtitulo), 'postlink.com.br/sua-loja ➔ Redireciona para o destino'),
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
    preview_titulo = excluded.preview_titulo,
    preview_descricao = excluded.preview_descricao,
    preview_subtitulo = excluded.preview_subtitulo,
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

-- 5. Atualiza a função is_super_admin para validação resiliente (por auth.uid e por auth.jwt)
create or replace function public.is_super_admin()
returns boolean
language plpgsql
security definer
set search_path = public, auth
stable
as $$
declare
  v_uid uuid;
  v_email text;
begin
  v_uid := auth.uid();
  v_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  if (v_email = '' or v_email is null) and v_uid is not null then
    select lower(email) into v_email
    from auth.users
    where id = v_uid;
  end if;

  if v_email = '' or v_email is null then
    return false;
  end if;

  return (
    v_email in ('lucas.a.gon@gmail.com', 'carmen.cattel@gmail.com', 'morangostatui@gmail.com')
    or exists (
      select 1 from public.administradores
      where lower(email) = v_email
    )
  );
end;
$$;

-- 6. Assegura permissões de execução para authenticated
grant execute on function public.admin_salvar_configuracoes_site(text, text, text, text, text, text, boolean, text, text, text) to authenticated;
grant execute on function public.is_super_admin() to authenticated;

