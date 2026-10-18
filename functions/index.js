// functions/index.js - Cloudflare Pages Function para a raiz /

const ROBOS = /(WhatsApp|facebookexternalhit|Facebot|Twitterbot|TelegramBot|Slackbot|LinkedInBot|Discordbot|Pinterestbot|SkypeUriPreview|Googlebot|bingbot)/i;

const DEFAULT_SUPABASE_URL = 'https://xiicwkagcphvejzycntx.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaWN3a2FnY3BodmVqenljbnR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMjQwOTksImV4cCI6MjEwNjgwMDA5OX0.RyxiEa0aojXvBaJTdIdtk1Sst35-mFDKXb_CTnt7WiA';

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let cachedSiteConfig = null;
let cachedSiteConfigTime = 0;

async function obterConfiguracoesSite(env) {
  const agora = Date.now();
  if (cachedSiteConfig && (agora - cachedSiteConfigTime < 60000)) {
    return cachedSiteConfig;
  }

  const url = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  try {
    const res = await fetch(`${url}/rest/v1/rpc/obter_configuracoes_site`, {
      method: 'POST',
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        cachedSiteConfig = data;
        cachedSiteConfigTime = agora;
        return data;
      }
    }
  } catch (_) {}

  return cachedSiteConfig || {};
}

function gerarHtmlOpenGraphOficial(config = {}) {
  const canonicalUrl = 'https://www.postlink.com.br/';
  const titulo = esc(config.oficial_og_titulo || config.titulo || 'PostLink - Transforme links comuns em cartões em alta definição para WhatsApp');
  const descricao = esc(config.oficial_og_descricao || config.descricao || 'Gere links inteligentes para WhatsApp com cartões visuais em alta definição, carregamento instantâneo em qualquer aparelho e contagem real de cliques.');
  
  let imagem = config.oficial_og_imagem_url || config.banner_url || 'https://www.postlink.com.br/assets/img/banner_postlink_og_1200x630.jpg';
  if (imagem.startsWith('/')) {
    imagem = 'https://www.postlink.com.br' + imagem;
  } else if (imagem.startsWith('https://postlink.com.br/')) {
    imagem = imagem.replace('https://postlink.com.br/', 'https://www.postlink.com.br/');
  }

  const imagemEsc = esc(imagem);

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>${titulo}</title>
  <meta name="description" content="${descricao}">
  <meta name="robots" content="index, follow">

  <!-- Open Graph / WhatsApp Preview Meta Tags -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="PostLink">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${titulo}">
  <meta property="og:description" content="${descricao}">
  <meta property="og:image" content="${imagemEsc}">
  <meta property="og:image:secure_url" content="${imagemEsc}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${titulo}">

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${titulo}">
  <meta name="twitter:description" content="${descricao}">
  <meta name="twitter:image" content="${imagemEsc}">
</head>
<body>
  <h1>PostLink</h1>
  <p>${descricao}</p>
  <a href="${canonicalUrl}">Acessar PostLink</a>
</body>
</html>`;
}

export async function onRequest(context) {
  const { request, env } = context;
  const ua = request.headers.get('user-agent') || '';

  // Interceptor para robôs de preview social (WhatsApp, Facebook, Twitter, Telegram, etc.)
  if (ROBOS.test(ua)) {
    const config = await obterConfiguracoesSite(env);
    const corpoHtml = gerarHtmlOpenGraphOficial(config);
    return new Response(corpoHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=600',
        'X-Robots-Tag': 'all',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  if (env.ASSETS) {
    const urls = [
      new URL('/', request.url),
      new URL('/index.html', request.url),
      new URL('/public/index.html', request.url),
    ];
    for (const u of urls) {
      try {
        const resp = await env.ASSETS.fetch(u);
        if (resp && resp.status < 400) return new Response(resp.body, resp);
      } catch (_) {}
    }
  }

  return new Response('PostLink', { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
