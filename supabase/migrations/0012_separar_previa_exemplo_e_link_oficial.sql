-- 0012_separar_previa_exemplo_e_link_oficial.sql
-- Separa a edição da prévia de exemplo na Landing Page e a prévia de compartilhamento oficial do Postlink (https://www.postlink.com.br/)

-- 1. Adiciona as colunas à tabela public.configuracoes_site se não existirem
alter table public.configuracoes_site
  add column if not exists preview_imagem_url text,
  add column if not exists oficial_og_titulo text default 'PostLink · Smart Links em Alta Definição para WhatsApp',
  add column if not exists oficial_og_descricao text default 'Transforme fotos e ofertas em cartões em alta definição que abrem sozinhos no WhatsApp e aumentam suas vendas.',
  add column if not exists oficial_og_imagem_url text;

-- Inicializa valores para o registro oficial caso estejam nulos
update public.configuracoes_site
set
  preview_imagem_url = coalesce(preview_imagem_url, banner_url, '/assets/img/logotipo_postlink.jpg'),
  oficial_og_imagem_url = coalesce(oficial_og_imagem_url, banner_url, 'https://postlink.com.br/assets/img/logotipo_postlink_1x1.jpg'),
  oficial_og_titulo = coalesce(oficial_og_titulo, 'PostLink · Smart Links em Alta Definição para WhatsApp'),
  oficial_og_descricao = coalesce(oficial_og_descricao, 'Transforme fotos e ofertas em cartões em alta definição que abrem sozinhos no WhatsApp e aumentam suas vendas.')
where id = 'oficial';

-- 2. Atualiza a RPC de leitura pública public.obter_configuracoes_site()
create or replace function public.obter_configuracoes_site()
returns json
language plpgsql security definer set search_path = public, auth stable as $$
declare
  v_res json;
begin
  select json_build_object(
    'id', id,
    'titulo', titulo,
    'descricao', descricao,
    'badge_texto', badge_texto,
    'cta_texto', cta_texto,
    'cta_url', cta_url,
    'banner_ativo', banner_ativo,
    'banner_url', banner_url,
    -- Campos da Vitrine de Demonstração da Landing Page (Lado Direito da Hero)
    'preview_imagem_url', coalesce(preview_imagem_url, banner_url, '/assets/img/logotipo_postlink.jpg'),
    'preview_titulo', coalesce(preview_titulo, 'Lançamento Especial · Oferta Exclusiva com 1 Clique'),
    'preview_descricao', coalesce(preview_descricao, 'Compartilhe ofertas no WhatsApp com um cartão visual em alta definição que abre sozinho! 👇'),
    'preview_subtitulo', coalesce(preview_subtitulo, 'postlink.com.br/sua-loja ➔ Redireciona para o destino'),
    -- Campos de Compartilhamento Oficial do Domínio postlink.com.br (Open Graph / WhatsApp)
    'oficial_og_titulo', coalesce(oficial_og_titulo, 'PostLink · Smart Links em Alta Definição para WhatsApp'),
    'oficial_og_descricao', coalesce(oficial_og_descricao, 'Transforme fotos e ofertas em cartões em alta definição que abrem sozinhos no WhatsApp e aumentam suas vendas.'),
    'oficial_og_imagem_url', coalesce(oficial_og_imagem_url, banner_url, 'https://postlink.com.br/assets/img/logotipo_postlink_1x1.jpg'),
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

-- 3. Renomeia assinatura anterior de 10 parâmetros para evitar ambiguidade (Could not choose the best candidate function)
do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on p.pronamespace = n.oid
    where n.nspname = 'public' 
      and p.proname = 'admin_salvar_configuracoes_site' 
      and p.pronargs = 10
  ) then
    execute 'alter function public.admin_salvar_configuracoes_site(text, text, text, text, text, text, boolean, text, text, text) rename to admin_salvar_configuracoes_site_v10';
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
  p_preview_subtitulo text default null,
  p_preview_imagem_url text default null,
  p_oficial_og_titulo text default null,
  p_oficial_og_descricao text default null,
  p_oficial_og_imagem_url text default null
)
returns json
language plpgsql security definer
set search_path = public, auth
set row_security = off as $$
declare
  v_res json;
  v_email text;
  v_preview_img text;
  v_oficial_img text;
begin
  if not public.is_super_admin() then
    raise exception 'Acesso negado: privilégios de administrador necessários';
  end if;

  -- Resolução resiliente do e-mail do autor da alteração
  v_email := lower(coalesce(auth.jwt() ->> 'email', ''));
  if (v_email = '' or v_email is null) and auth.uid() is not null then
    select lower(email) into v_email from auth.users where id = auth.uid();
  end if;
  v_email := coalesce(nullif(v_email, ''), 'admin');

  v_preview_img := coalesce(p_preview_imagem_url, p_banner_url);
  v_oficial_img := coalesce(p_oficial_og_imagem_url, p_banner_url);

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
    preview_imagem_url,
    oficial_og_titulo,
    oficial_og_descricao,
    oficial_og_imagem_url,
    atualizado_em,
    atualizado_por
  )
  values (
    'oficial',
    coalesce(trim(p_titulo), 'PostLink'),
    coalesce(trim(p_descricao), ''),
    coalesce(v_preview_img, v_oficial_img),
    coalesce(trim(p_badge_texto), 'PostLink Smart Links'),
    coalesce(trim(p_cta_texto), 'Começar Grátis'),
    coalesce(trim(p_cta_url), '/planos/'),
    coalesce(p_banner_ativo, true),
    coalesce(trim(p_preview_titulo), 'Lançamento Especial · Oferta Exclusiva com 1 Clique'),
    coalesce(trim(p_preview_descricao), 'Compartilhe ofertas no WhatsApp com um cartão visual em alta definição que abre sozinho! 👇'),
    coalesce(trim(p_preview_subtitulo), 'postlink.com.br/sua-loja ➔ Redireciona para o destino'),
    v_preview_img,
    coalesce(trim(p_oficial_og_titulo), 'PostLink · Smart Links em Alta Definição para WhatsApp'),
    coalesce(trim(p_oficial_og_descricao), 'Transforme fotos e ofertas em cartões em alta definição que abrem sozinhos no WhatsApp e aumentam suas vendas.'),
    v_oficial_img,
    now(),
    v_email
  )
  on conflict (id) do update set
    titulo = excluded.titulo,
    descricao = excluded.descricao,
    banner_url = coalesce(excluded.preview_imagem_url, excluded.oficial_og_imagem_url, excluded.banner_url),
    badge_texto = excluded.badge_texto,
    cta_texto = excluded.cta_texto,
    cta_url = excluded.cta_url,
    banner_ativo = excluded.banner_ativo,
    preview_titulo = excluded.preview_titulo,
    preview_descricao = excluded.preview_descricao,
    preview_subtitulo = excluded.preview_subtitulo,
    preview_imagem_url = excluded.preview_imagem_url,
    oficial_og_titulo = excluded.oficial_og_titulo,
    oficial_og_descricao = excluded.oficial_og_descricao,
    oficial_og_imagem_url = excluded.oficial_og_imagem_url,
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

-- 5. Concede permissões para authenticated
grant execute on function public.admin_salvar_configuracoes_site(text, text, text, text, text, text, boolean, text, text, text, text, text, text, text) to authenticated;
grant execute on function public.obter_configuracoes_site() to anon, authenticated;
