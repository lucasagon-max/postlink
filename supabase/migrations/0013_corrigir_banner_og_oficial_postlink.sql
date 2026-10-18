-- 0013_corrigir_banner_og_oficial_postlink.sql
-- Atualiza o fallback e o registro oficial do PostLink para o banner HD 1200x630 com domínio www

-- 1. Atualiza o registro oficial na tabela public.configuracoes_site
update public.configuracoes_site
set
  oficial_og_imagem_url = 'https://www.postlink.com.br/assets/img/banner_postlink_og_1200x630.jpg',
  atualizado_em = now(),
  atualizado_por = 'sistema:correcao_og_whatsapp'
where id = 'oficial';

-- 2. Atualiza a RPC de leitura pública public.obter_configuracoes_site() com os fallbacks canônicos
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
    'preview_imagem_url', coalesce(preview_imagem_url, banner_url, '/assets/img/banner_postlink_og_1200x630.jpg'),
    'preview_titulo', coalesce(preview_titulo, 'Lançamento Especial · Oferta Exclusiva com 1 Clique'),
    'preview_descricao', coalesce(preview_descricao, 'Compartilhe ofertas no WhatsApp com um cartão visual em alta definição que abre sozinho! 👇'),
    'preview_subtitulo', coalesce(preview_subtitulo, 'postlink.com.br/sua-loja ➔ Redireciona para o destino'),
    -- Campos de Compartilhamento Oficial do Domínio postlink.com.br (Open Graph / WhatsApp)
    'oficial_og_titulo', coalesce(oficial_og_titulo, 'PostLink · Smart Links em Alta Definição para WhatsApp'),
    'oficial_og_descricao', coalesce(oficial_og_descricao, 'Transforme fotos e ofertas em cartões em alta definição que abrem sozinhos no WhatsApp e aumentam suas vendas.'),
    'oficial_og_imagem_url', coalesce(oficial_og_imagem_url, banner_url, 'https://www.postlink.com.br/assets/img/banner_postlink_og_1200x630.jpg'),
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
