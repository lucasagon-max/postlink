// functions/[loja]/[slug].js - Cloudflare Pages Function (Rota Pública do PostLink)

// Robôs de preview social. NÃO incluir "Instagram" nem "FBAN/FBAV" (navegadores internos in-app de usuários reais).
const ROBOS = /(WhatsApp|facebookexternalhit|Facebot|Twitterbot|TelegramBot|Slackbot|LinkedInBot|Discordbot|Pinterestbot|SkypeUriPreview|Googlebot|bingbot)/i;

const DEFAULT_SUPABASE_URL = 'https://xiicwkagcphvejzycntx.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaWN3a2FnY3BodmVqenljbnR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMjQwOTksImV4cCI6MjEwNjgwMDA5OX0.RyxiEa0aojXvBaJTdIdtk1Sst35-mFDKXb_CTnt7WiA';

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const html = (corpo, status = 200, extra = {}) =>
  new Response(corpo, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'strict-origin-when-cross-origin',
      ...extra,
    },
  });

async function rpc(env, nome, args) {
  const url = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  const r = await fetch(`${url}/rest/v1/rpc/${nome}`, {
    method: 'POST',
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(args),
  });

  if (!r.ok) throw new Error(`rpc ${nome}: ${r.status}`);
  return r.status === 204 ? null : r.json();
}

import * as mpWebhook from '../api/mp-webhook.js';
import * as mpConfig from '../api/mp-config.js';
import * as mpCriarPagamento from '../api/mp-criar-pagamento.js';
import * as mpProcessarCartao from '../api/mp-processar-cartao.js';
import * as mpVerificarPagamento from '../api/mp-verificar-pagamento.js';
import * as fetchMetadata from '../api/fetch-metadata.js';
import * as configSite from '../api/configuracoes-site.js';

async function dispatchApi(context) {
  const slug = context.params?.slug;
  if (slug === 'mp-webhook') return mpWebhook.onRequest(context);
  if (slug === 'mp-config') return mpConfig.onRequestGet(context);
  if (slug === 'mp-criar-pagamento') return mpCriarPagamento.onRequestPost(context);
  if (slug === 'mp-processar-cartao') return mpProcessarCartao.onRequestPost(context);
  if (slug === 'mp-verificar-pagamento') return mpVerificarPagamento.onRequest(context);
  if (slug === 'fetch-metadata') return fetchMetadata.onRequest(context);
  if (slug === 'configuracoes-site') return configSite.onRequestGet(context);

  return new Response(JSON.stringify({ erro: 'Endpoint não encontrado em /api/' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost(context) {
  if (context.params?.loja === 'api') {
    return dispatchApi(context);
  }
  return new Response('Método não permitido', { status: 405 });
}

export async function onRequestOptions(context) {
  if (context.params?.loja === 'api') {
    return dispatchApi(context);
  }
  return new Response(null, { status: 204 });
}

export async function onRequest(context) {
  if (context.params?.loja === 'api') {
    return dispatchApi(context);
  }
  return onRequestGet(context);
}

export async function onRequestGet(context) {
  const { request, params, env, waitUntil } = context;
  const loja = params.loja;
  const slug = params.slug;

  if (loja === 'api') {
    return dispatchApi(context);
  }

  const RESERVADAS = ['painel', 'login', 'admin', 'assets', 'termos', 'privacidade', 'planos', 'denunciar', 'favicon.ico'];
  if (RESERVADAS.includes(loja) && env.ASSETS) {
    const rawPath = new URL(request.url).pathname;
    const tentativas = [rawPath];
    if (!rawPath.endsWith('/index.html') && !rawPath.includes('.')) {
      tentativas.push(rawPath.replace(/\/$/, '') + '/index.html');
    }
    if (!rawPath.startsWith('/public/')) {
      tentativas.push('/public' + rawPath);
      if (!rawPath.endsWith('/index.html') && !rawPath.includes('.')) {
        tentativas.push('/public' + rawPath.replace(/\/$/, '') + '/index.html');
      }
    }

    for (const p of tentativas) {
      try {
        const resp = await env.ASSETS.fetch(new URL(p, request.url));
        if (resp && resp.status < 400) return resp;
      } catch (_) {}
    }
    return env.ASSETS.fetch(request);
  }

  const ua = request.headers.get('user-agent') || '';

  let link;
  try {
    const data = await rpc(env, 'obter_link_publico', { p_loja: loja, p_slug: slug });
    link = Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch (e) {
    return html(paginaMensagem('Tente novamente em instantes', 'Serviço temporariamente indisponível.'), 503);
  }

  if (!link) {
    return html(paginaMensagem('Link não encontrado', 'Esta oferta ou link não existe mais ou foi desativado.'), 404);
  }

  if (link.expirado) {
    return html(paginaMensagem('Oferta encerrada', 'O período de validade desta oferta foi concluído.'), 200);
  }

  if (!link.destino || !link.destino.startsWith('https://')) {
    return html(paginaMensagem('Link indisponível', 'O destino configurado para este link é inválido.'), 404);
  }

  const supabaseUrl = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const origem = new URL(request.url).origin;
  const url = `${origem}/${encodeURIComponent(loja)}/${encodeURIComponent(slug)}`;
  const imagem = `${supabaseUrl}/storage/v1/object/public/banners/${link.imagem_path}?v=${link.versao || 1}`;

  // Se for robô (crawler do WhatsApp, Meta, Telegram, etc.): devolve apenas meta tags Open Graph
  if (ROBOS.test(ua)) {
    return html(paginaOG({ link, url, imagem }), 200, {
      'cache-control': 'public, max-age=300',
    });
  }

  // Se for pessoa real: registra clique assincronamente e apresenta a tela de transição instantânea
  if (typeof waitUntil === 'function') {
    waitUntil(registrarClique(env, link.link_id, request));
  } else {
    registrarClique(env, link.link_id, request).catch(() => {});
  }

  return html(paginaTransicao({
    destino: link.destino,
    lojaNome: link.loja_nome || 'Loja',
    titulo: link.titulo || 'Oferta Exclusiva',
    imagem: link.imagem_path ? imagem : null,
  }), 200, {
    'cache-control': 'no-store',
  });
}

function detectarOrigemEDispositivo(request) {
  const ua = request.headers.get('user-agent') || '';
  const ref = request.headers.get('referer') || '';

  // 1. Detecção de Dispositivo (Mobile vs Desktop)
  const dispositivo = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    ? 'mobile'
    : 'desktop';

  // 2. Detecção de Origem
  let origem = 'direto';

  // A. Prioridade 1: Parâmetros explícitos de URL (?src=..., ?utm_source=..., ?ref=...)
  try {
    const url = new URL(request.url);
    const paramSrc = (url.searchParams.get('src') || url.searchParams.get('utm_source') || url.searchParams.get('ref') || '').toLowerCase();
    if (paramSrc) {
      if (paramSrc.includes('wa') || paramSrc.includes('whats')) {
        return { origem: 'whatsapp', dispositivo };
      }
      if (paramSrc.includes('ig') || paramSrc.includes('insta')) {
        return { origem: 'instagram', dispositivo };
      }
      if (paramSrc.includes('fb') || paramSrc.includes('face')) {
        return { origem: 'facebook', dispositivo };
      }
      if (paramSrc.includes('tg') || paramSrc.includes('tele')) {
        return { origem: 'telegram', dispositivo };
      }
      if (paramSrc.includes('tt') || paramSrc.includes('tik')) {
        return { origem: 'tiktok', dispositivo };
      }
      return { origem: paramSrc.slice(0, 30), dispositivo };
    }
  } catch (_) {}

  // B. Prioridade 2: In-App Browsers via User-Agent (Instagram, Facebook, etc.)
  if (/Instagram/i.test(ua)) {
    return { origem: 'instagram', dispositivo };
  }
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) {
    return { origem: 'facebook', dispositivo };
  }
  if (/musical_ly|TikTok|BytedanceWebview/i.test(ua)) {
    return { origem: 'tiktok', dispositivo };
  }
  if (/Telegram/i.test(ua)) {
    return { origem: 'telegram', dispositivo };
  }
  if (/LinkedIn/i.test(ua)) {
    return { origem: 'linkedin', dispositivo };
  }

  // C. Prioridade 3: Cabeçalho Referer
  if (ref) {
    try {
      const refHost = new URL(ref).host.toLowerCase();
      if (refHost.includes('whatsapp') || refHost.includes('wa.me')) {
        return { origem: 'whatsapp', dispositivo };
      }
      if (refHost.includes('instagram')) {
        return { origem: 'instagram', dispositivo };
      }
      if (refHost.includes('facebook') || refHost.includes('fb.com')) {
        return { origem: 'facebook', dispositivo };
      }
      if (refHost.includes('t.co') || refHost.includes('twitter') || refHost.includes('x.com')) {
        return { origem: 'x_twitter', dispositivo };
      }
      if (refHost.includes('t.me') || refHost.includes('telegram')) {
        return { origem: 'telegram', dispositivo };
      }
      if (refHost.includes('google')) {
        return { origem: 'google', dispositivo };
      }
      if (refHost.includes('youtube')) {
        return { origem: 'youtube', dispositivo };
      }
      return { origem: refHost, dispositivo };
    } catch (_) {}
  }

  // D. Prioridade 4: Heurística do WhatsApp Mobile
  // No WhatsApp mobile nativo, o toque no link abre o navegador padrão sem passar Referer.
  // Em acessos mobile diretos sem referer, categoriza como canal nativo do WhatsApp.
  if (dispositivo === 'mobile' && !ref) {
    origem = 'whatsapp';
  }

  return { origem, dispositivo };
}

async function registrarClique(env, linkId, request) {
  try {
    const { origem, dispositivo } = detectarOrigemEDispositivo(request);
    await rpc(env, 'registrar_clique', {
      p_link: linkId,
      p_origem: origem,
      p_dispositivo: dispositivo,
    });
  } catch (err) {
    // Falha silenciosa de clique para nunca travar a navegação do usuário
  }
}

function paginaOG({ link, url, imagem }) {
  const t = esc(link.titulo || link.loja_nome || 'PostLink');
  const d = link.descricao
    ? `<meta property="og:description" content="${esc(link.descricao)}">\n<meta name="description" content="${esc(link.descricao)}">`
    : '';

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex">
  <title>${t}</title>
  <meta property="og:type" content="website">
  <meta property="og:title" content="${t}">
  ${d}
  <meta property="og:image" content="${esc(imagem)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${esc(url)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${t}">
  <meta name="twitter:image" content="${esc(imagem)}">
</head>
<body></body>
</html>`;
}

function paginaTransicao({ destino, lojaNome, titulo, imagem }) {
  const d = esc(destino);
  const js = JSON.stringify(destino).replace(/</g, '\\u003c');
  const nome = esc(lojaNome);
  const tit = esc(titulo);
  const imgTag = imagem ? `<img src="${esc(imagem)}" alt="${tit}" style="width:100%; height:130px; object-fit:cover; border-radius:10px; margin-bottom:14px; border:1px solid #e2e8f0;">` : '';

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <meta http-equiv="refresh" content="2;url=${d}">
  <title>Redirecionando · ${nome}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #faf8ff;
      color: #131b2e;
      padding: 16px;
    }
    header {
      max-width: 440px;
      margin: 12px auto;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand {
      font-weight: 800;
      font-size: 18px;
      color: #003e80;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .shield-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #f2f3ff;
      border: 1px solid #c2c6d3;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      color: #003e80;
    }
    main {
      max-width: 440px;
      margin: auto;
      width: 100%;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 24px 20px;
      box-shadow: 0 10px 30px -5px rgba(0, 62, 128, 0.08);
      text-align: center;
    }
    .status-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 12px;
    }
    .status-pill {
      background: #eaedff;
      color: #003e80;
      padding: 3px 8px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 11px;
    }
    .pulse-dot {
      display: inline-block;
      width: 7px;
      height: 7px;
      background: #22c55e;
      border-radius: 50%;
      margin-right: 5px;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }
    .meter {
      height: 6px;
      border-radius: 999px;
      background: #eaedff;
      overflow: hidden;
      margin-bottom: 18px;
    }
    .meter-fill {
      height: 100%;
      width: 100%;
      background: #22c55e;
      background-image: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.25) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.25) 50%,
        rgba(255, 255, 255, 0.25) 75%,
        transparent 75%,
        transparent
      );
      background-size: 1rem 1rem;
      animation: progress 1s linear infinite;
    }
    @keyframes progress {
      0% { background-position: 0 0; }
      100% { background-position: 1rem 1rem; }
    }
    h1 {
      font-size: 17px;
      font-weight: 700;
      color: #131b2e;
      margin-bottom: 4px;
    }
    p {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 18px;
      line-height: 1.4;
    }
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 12px;
      border-radius: 10px;
      background: #1e56a0;
      color: #ffffff;
      font-weight: 600;
      font-size: 14px;
      text-decoration: none;
      transition: background 0.15s ease, transform 0.1s ease;
      box-shadow: 0 4px 12px rgba(30, 86, 160, 0.25);
    }
    .btn:hover {
      background: #003e80;
    }
    .btn:active {
      transform: scale(0.98);
    }
    footer {
      text-align: center;
      font-size: 11px;
      color: #737782;
      margin: 12px auto;
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <span>postlink</span>
    </div>
    <div class="shield-badge">
      <span>⚡ Redirecionando...</span>
    </div>
  </header>

  <main>
    <div class="card">
      <div class="status-bar">
        <span style="color:#424751; font-weight:600;">
          <span class="pulse-dot"></span>Conectando ao servidor...
        </span>
        <span class="status-pill">Aguarde</span>
      </div>

      <div class="meter">
        <div class="meter-fill"></div>
      </div>

      ${imgTag}

      <h1>Redirecionando para ${nome}</h1>
      <p>Transferindo em instantes para o link de destino.</p>

      <a href="${d}" rel="noopener" class="btn">Abrir agora &rarr;</a>
    </div>
  </main>

  <footer>
    <span>Redirecionamento técnico provido por PostLink</span>
  </footer> gerado via PostLink</span>
  </footer>

  <script>
    setTimeout(function() {
      try {
        location.replace(${js});
      } catch(e) {
        location.href = ${js};
      }
    }, 280);
  </script>
</body>
</html>`;
}

function paginaMensagem(titulo, detalhe = '') {
  const t = esc(titulo);
  const d = esc(detalhe);

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>${t} · PostLink</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #faf8ff;
      color: #131b2e;
      padding: 20px;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 36px 24px;
      text-align: center;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 10px 30px -5px rgba(0, 62, 128, 0.08);
    }
    h1 {
      font-size: 18px;
      font-weight: 700;
      color: #003e80;
      margin-bottom: 8px;
    }
    p {
      font-size: 13.5px;
      color: #64748b;
      line-height: 1.5;
    }
    .btn {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      border-radius: 8px;
      background: #1e56a0;
      color: #ffffff;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <main class="card">
    <h1>${t}</h1>
    ${d ? `<p>${d}</p>` : ''}
    <a href="/" class="btn">Ir para o PostLink</a>
  </main>
</body>
</html>`;
}
