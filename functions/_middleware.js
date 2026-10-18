// functions/_middleware.js - Interceptor global do Cloudflare Pages
// Garante resolução perfeita de páginas estáticas e assets, funcionando perfeitamente
// tanto se o Build Output Directory do Pages for 'public' quanto se for a raiz '/'.

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
  
  // Imagem prioritária oficial ou banner padrão 1200x630 com DNS válido
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
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

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
  const { request, env, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;
  const ua = request.headers.get('user-agent') || '';

  // 1. Chamadas de API do backend seguem direto para os handlers de /api/*
  if (pathname.startsWith('/api/')) {
    return next();
  }

  // Endpoint de verificação e diagnóstico de saúde das rotas
  if (pathname === '/api-health') {
    return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 1.1 Interceptor para robôs de preview social (WhatsApp, Facebook, Twitter, Telegram, etc.) na raiz
  if ((pathname === '/' || pathname === '/index.html') && ROBOS.test(ua)) {
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

  // Helper para buscar asset no env.ASSETS testando múltiplos caminhos
  // PRIORIZA o prefixo /public para evitar que o fallback SPA do Pages devolva a raiz /index.html
  async function fetchAssetWithFallback(assetPath) {
    if (!env.ASSETS) return null;

    const tentativas = [];
    if (!assetPath.startsWith('/public/')) {
      tentativas.push('/public' + (assetPath.startsWith('/') ? assetPath : '/' + assetPath));
    }
    tentativas.push(assetPath);

    for (const p of tentativas) {
      try {
        const resp = await env.ASSETS.fetch(new URL(p, request.url));
        if (resp && resp.status < 400) {
          return resp;
        }
      } catch (_) {}
    }

    return null;
  }

  // 2. Arquivos de ativos estáticos com extensão física (CSS, JS, imagens, fontes, favicon, mapas)
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) {
    const assetResp = await fetchAssetWithFallback(pathname);
    if (assetResp) {
      const ext = pathname.split('.').pop().toLowerCase();
      const mimeTypes = {
        ico: 'image/x-icon',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        webp: 'image/webp',
        svg: 'image/svg+xml',
        gif: 'image/gif',
        css: 'text/css; charset=utf-8',
        js: 'application/javascript; charset=utf-8',
        json: 'application/json; charset=utf-8',
        woff2: 'font/woff2',
        woff: 'font/woff',
        map: 'application/json; charset=utf-8'
      };
      const newHeaders = new Headers(assetResp.headers);
      if (mimeTypes[ext]) {
        newHeaders.set('content-type', mimeTypes[ext]);
      }
      return new Response(assetResp.body, {
        status: assetResp.status,
        headers: newHeaders
      });
    }
    return next();
  }

  // 3. Mapeamento de rotas de páginas conhecidas do PostLink
  const ROTAS_PAGINAS = {
    '/': ['/index.html', '/'],
    '/index.html': ['/index.html', '/'],
    '/login': ['/login/index.html', '/login/'],
    '/login/': ['/login/index.html', '/login/'],
    '/login/index.html': ['/login/index.html', '/login/'],
    '/planos': ['/planos/index.html', '/planos/'],
    '/planos/': ['/planos/index.html', '/planos/'],
    '/planos/index.html': ['/planos/index.html', '/planos/'],
    '/painel': ['/painel/index.html', '/painel/'],
    '/painel/': ['/painel/index.html', '/painel/'],
    '/painel/index.html': ['/painel/index.html', '/painel/'],
    '/admin': ['/admin/index.html', '/admin/'],
    '/admin/': ['/admin/index.html', '/admin/'],
    '/admin/index.html': ['/admin/index.html', '/admin/'],
    '/termos': ['/termos/index.html', '/termos/'],
    '/termos/': ['/termos/index.html', '/termos/'],
    '/termos/index.html': ['/termos/index.html', '/termos/'],
    '/privacidade': ['/privacidade/index.html', '/privacidade/'],
    '/privacidade/': ['/privacidade/index.html', '/privacidade/'],
    '/privacidade/index.html': ['/privacidade/index.html', '/privacidade/'],
    '/denunciar': ['/denunciar/index.html', '/denunciar/'],
    '/denunciar/': ['/denunciar/index.html', '/denunciar/'],
    '/denunciar/index.html': ['/denunciar/index.html', '/denunciar/'],
  };

  const pathnameNormalizado = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  const caminhosCandidatos = ROTAS_PAGINAS[pathname] || ROTAS_PAGINAS[pathnameNormalizado];

  if (caminhosCandidatos && env.ASSETS) {
    for (const cand of caminhosCandidatos) {
      const resp = await fetchAssetWithFallback(cand);
      if (resp && resp.status < 400) {
        return new Response(resp.body, resp);
      }
    }
  }

  // 4. Se for qualquer outra rota, deixa o Pages despachar para as funções dinâmicas (ex: /[loja]/[slug])
  return next();
}
