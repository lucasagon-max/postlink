-- 0024_personalizar_carrossel_e_vitrine_site.sql
-- Personalização administrativa das novas imagens, carrosséis de fotos da vitrine, oferta e mockups da Home

-- 1. Novos campos na tabela public.configuracoes_site
alter table public.configuracoes_site
  add column if not exists vitrine_fotos jsonb default '["/assets/img/ex02.png", "/assets/img/Ex01.png", "/assets/img/logotipo_postlink.jpg"]'::jsonb,
  add column if not exists vitrine_badge_desconto text default '-33% OFF',
  add column if not exists vitrine_preco_de text default '180,00',
  add column if not exists vitrine_preco_por text default '119,90',
  add column if not exists vitrine_condicao text default 'Em até 3x sem juros ou 5% de desconto no Pix',
  add column if not exists vitrine_titulo text default 'Combo Promocional Especial (Pronto para Envio)',
  add column if not exists vitrine_beneficios jsonb default '["Envio imediato em até 24 horas", "Produto original com garantia e suporte"]'::jsonb,
  add column if not exists como_funciona_imagem_url text default null,
  add column if not exists loja_demonstrativa_nome text default 'Sua Loja Oficial',
  add column if not exists loja_demonstrativa_avatar text default '/apple-touch-icon.png';

-- 2. Inicializa valores para o registro oficial caso estejam nulos
update public.configuracoes_site
set
  vitrine_fotos = coalesce(vitrine_fotos, '["/assets/img/ex02.png", "/assets/img/Ex01.png", "/assets/img/logotipo_postlink.jpg"]'::jsonb),
  vitrine_badge_desconto = coalesce(vitrine_badge_desconto, '-33% OFF'),
  vitrine_preco_de = coalesce(vitrine_preco_de, '180,00'),
  vitrine_preco_por = coalesce(vitrine_preco_por, '119,90'),
  vitrine_condicao = coalesce(vitrine_condicao, 'Em até 3x sem juros ou 5% de desconto no Pix'),
  vitrine_titulo = coalesce(vitrine_titulo, 'Combo Promocional Especial (Pronto para Envio)'),
  vitrine_beneficios = coalesce(vitrine_beneficios, '["Envio imediato em até 24 horas", "Produto original com garantia e suporte"]'::jsonb),
  loja_demonstrativa_nome = coalesce(loja_demonstrativa_nome, 'Sua Loja Oficial'),
  loja_demonstrativa_avatar = coalesce(loja_demonstrativa_avatar, '/apple-touch-icon.png')
where id = 'oficial';

-- 3. Atualiza a RPC de leitura pública public.obter_configuracoes_site()
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
    -- Campos da Vitrine de Demonstração da Landing Page (Lado Direito da Hero e Mockup da Página Vitrine)
    'preview_imagem_url', coalesce(preview_imagem_url, banner_url, '/assets/img/logotipo_postlink.jpg'),
    'preview_titulo', coalesce(preview_titulo, 'Lançamento Especial · Oferta Exclusiva com 1 Clique'),
    'preview_descricao', coalesce(preview_descricao, 'Compartilhe ofertas no WhatsApp com um cartão visual em alta definição que abre sozinho! 👇'),
    'preview_subtitulo', coalesce(preview_subtitulo, 'postlink.com.br/sua-loja ➔ Redireciona para o destino'),
    'vitrine_fotos', coalesce(vitrine_fotos, '["/assets/img/ex02.png", "/assets/img/Ex01.png", "/assets/img/logotipo_postlink.jpg"]'::jsonb),
    'vitrine_badge_desconto', coalesce(vitrine_badge_desconto, '-33% OFF'),
    'vitrine_preco_de', coalesce(vitrine_preco_de, '180,00'),
    'vitrine_preco_por', coalesce(vitrine_preco_por, '119,90'),
    'vitrine_condicao', coalesce(vitrine_condicao, 'Em até 3x sem juros ou 5% de desconto no Pix'),
    'vitrine_titulo', coalesce(vitrine_titulo, 'Combo Promocional Especial (Pronto para Envio)'),
    'vitrine_beneficios', coalesce(vitrine_beneficios, '["Envio imediato em até 24 horas", "Produto original com garantia e suporte"]'::jsonb),
    'como_funciona_imagem_url', como_funciona_imagem_url,
    'loja_demonstrativa_nome', coalesce(loja_demonstrativa_nome, 'Sua Loja Oficial'),
    'loja_demonstrativa_avatar', coalesce(loja_demonstrativa_avatar, '/apple-touch-icon.png'),
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

-- 4. Renomeia assinatura anterior de 14 parâmetros para evitar ambiguidade
do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on p.pronamespace = n.oid
    where n.nspname = 'public' 
      and p.proname = 'admin_salvar_configuracoes_site' 
      and p.pronargs = 14
  ) then
    execute 'alter function public.admin_salvar_configuracoes_site(text, text, text, text, text, text, boolean, text, text, text, text, text, text, text) rename to admin_salvar_configuracoes_site_v14';
  end if;
end;
$$;

-- 5. Atualiza a RPC de salvamento administrativo public.admin_salvar_configuracoes_site(...)
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
  p_oficial_og_imagem_url text default null,
  p_vitrine_fotos jsonb default null,
  p_vitrine_badge_desconto text default null,
  p_vitrine_preco_de text default null,
  p_vitrine_preco_por text default null,
  p_vitrine_condicao text default null,
  p_vitrine_titulo text default null,
  p_vitrine_beneficios jsonb default null,
  p_como_funciona_imagem_url text default null,
  p_loja_demonstrativa_nome text default null,
  p_loja_demonstrativa_avatar text default null
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
  v_vitrine_fotos jsonb;
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

  -- Se fotos da vitrine não forem informadas ou estiverem vazias, preserva ou define o padrão
  v_vitrine_fotos := case 
    when p_vitrine_fotos is not null and jsonb_array_length(p_vitrine_fotos) > 0 then p_vitrine_fotos
    else '["/assets/img/ex02.png", "/assets/img/Ex01.png", "/assets/img/logotipo_postlink.jpg"]'::jsonb
  end;

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
    vitrine_fotos,
    vitrine_badge_desconto,
    vitrine_preco_de,
    vitrine_preco_por,
    vitrine_condicao,
    vitrine_titulo,
    vitrine_beneficios,
    como_funciona_imagem_url,
    loja_demonstrativa_nome,
    loja_demonstrativa_avatar,
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
    v_vitrine_fotos,
    coalesce(trim(p_vitrine_badge_desconto), '-33% OFF'),
    coalesce(trim(p_vitrine_preco_de), '180,00'),
    coalesce(trim(p_vitrine_preco_por), '119,90'),
    coalesce(trim(p_vitrine_condicao), 'Em até 3x sem juros ou 5% de desconto no Pix'),
    coalesce(trim(p_vitrine_titulo), 'Combo Promocional Especial (Pronto para Envio)'),
    coalesce(p_vitrine_beneficios, '["Envio imediato em até 24 horas", "Produto original com garantia e suporte"]'::jsonb),
    p_como_funciona_imagem_url,
    coalesce(trim(p_loja_demonstrativa_nome), 'Sua Loja Oficial'),
    coalesce(trim(p_loja_demonstrativa_avatar), '/apple-touch-icon.png'),
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
    vitrine_fotos = excluded.vitrine_fotos,
    vitrine_badge_desconto = excluded.vitrine_badge_desconto,
    vitrine_preco_de = excluded.vitrine_preco_de,
    vitrine_preco_por = excluded.vitrine_preco_por,
    vitrine_condicao = excluded.vitrine_condicao,
    vitrine_titulo = excluded.vitrine_titulo,
    vitrine_beneficios = excluded.vitrine_beneficios,
    como_funciona_imagem_url = excluded.como_funciona_imagem_url,
    loja_demonstrativa_nome = excluded.loja_demonstrativa_nome,
    loja_demonstrativa_avatar = excluded.loja_demonstrativa_avatar,
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

-- 6. Concede permissões para authenticated e anon
grant execute on function public.admin_salvar_configuracoes_site(text, text, text, text, text, text, boolean, text, text, text, text, text, text, text, jsonb, text, text, text, text, text, jsonb, text, text, text) to authenticated;
grant execute on function public.obter_configuracoes_site() to anon, authenticated;
