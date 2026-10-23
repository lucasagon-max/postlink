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
import * as mpCancelarAssinatura from '../api/mp-cancelar-assinatura.js';
import * as fetchMetadata from '../api/fetch-metadata.js';
import * as configSite from '../api/configuracoes-site.js';
import * as iaGerarCopy from '../api/ia-gerar-copy.js';
import * as uploadImagem from '../api/upload-imagem.js';

async function registrarCliqueDestinoApi(context) {
  const { request, env } = context;
  const urlObj = new URL(request.url);
  const linkId = urlObj.searchParams.get('link');
  if (linkId) {
    const { origem, dispositivo } = detectarOrigemEDispositivo(request);
    try {
      await rpc(env, 'registrar_clique', {
        p_link: linkId,
        p_origem: origem,
        p_dispositivo: dispositivo,
        p_etapa: 'destino',
      });
    } catch (_) {}
  }
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    },
  });
}

async function dispatchApi(context) {
  const slug = context.params?.slug;
  if (slug === 'mp-webhook') return mpWebhook.onRequest(context);
  if (slug === 'mp-config') return mpConfig.onRequestGet(context);
  if (slug === 'mp-criar-pagamento') return mpCriarPagamento.onRequestPost(context);
  if (slug === 'mp-processar-cartao') return mpProcessarCartao.onRequestPost(context);
  if (slug === 'mp-verificar-pagamento') return mpVerificarPagamento.onRequest(context);
  if (slug === 'mp-cancelar-assinatura') return mpCancelarAssinatura.onRequestPost(context);
  if (slug === 'fetch-metadata') return fetchMetadata.onRequest(context);
  if (slug === 'configuracoes-site') return configSite.onRequestGet(context);
  if (slug === 'ia-gerar-copy') return iaGerarCopy.onRequest(context);
  if (slug === 'upload-imagem') return uploadImagem.onRequest(context);
  if (slug === 'clique-destino') return registrarCliqueDestinoApi(context);

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

  const RESERVADAS = ['painel', 'login', 'admin', 'assets', 'termos', 'privacidade', 'planos', 'denunciar', 'imagens', 'favicon.ico'];
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
  const reqUrl = new URL(request.url);
  const versaoQueryParam = reqUrl.searchParams.get('v');
  const versaoEfetiva = versaoQueryParam || (link.versao && Number(link.versao) > 1 ? link.versao : null);
  const sufixoVersao = versaoEfetiva ? `?v=${versaoEfetiva}` : '';
  const url = `${reqUrl.origin}/${encodeURIComponent(loja)}/${encodeURIComponent(slug)}${sufixoVersao}`;

  // Resolução da URL da imagem com cache global e entrega otimizada
  let imagem = null;
  if (link.imagem_path) {
    if (link.imagem_path.startsWith('http://') || link.imagem_path.startsWith('https://')) {
      imagem = link.imagem_path;
    } else if (link.imagem_path.startsWith('/imagens/')) {
      imagem = `${reqUrl.origin}${link.imagem_path}`;
    } else if (link.imagem_path.startsWith('lojistas/')) {
      imagem = `${reqUrl.origin}/imagens/${link.imagem_path}`;
    } else {
      imagem = `${supabaseUrl}/storage/v1/object/public/banners/${link.imagem_path}?v=${link.versao || 1}`;
    }
  }

  // Resolução de fotos adicionais da galeria
  let fotosGaleria = [];
  try {
    const rawFotos = Array.isArray(link.fotos_galeria) ? link.fotos_galeria : JSON.parse(link.fotos_galeria || '[]');
    fotosGaleria = (rawFotos || []).map((f) => {
      if (f.startsWith('http://') || f.startsWith('https://')) return f;
      if (f.startsWith('/imagens/')) return `${reqUrl.origin}${f}`;
      if (f.startsWith('lojistas/')) return `${reqUrl.origin}/imagens/${f}`;
      return `${supabaseUrl}/storage/v1/object/public/banners/${f}`;
    });
  } catch (_) {
    fotosGaleria = [];
  }

  // Resolução de tópicos de benefícios
  let beneficios = [];
  try {
    beneficios = Array.isArray(link.beneficios) ? link.beneficios : JSON.parse(link.beneficios || '[]');
  } catch (_) {
    beneficios = [];
  }

  // Resolução do logotipo da loja
  let lojaLogo = null;
  if (link.loja_logo) {
    if (link.loja_logo.startsWith('http://') || link.loja_logo.startsWith('https://')) {
      lojaLogo = link.loja_logo;
    } else if (link.loja_logo.startsWith('/imagens/')) {
      lojaLogo = `${reqUrl.origin}${link.loja_logo}`;
    } else if (link.loja_logo.startsWith('lojistas/')) {
      lojaLogo = `${reqUrl.origin}/imagens/${link.loja_logo}`;
    } else {
      lojaLogo = `${supabaseUrl}/storage/v1/object/public/banners/${link.loja_logo}`;
    }
  }

  // Se o visitante clicou diretamente para ir ao destino final (?go=1)
  if (reqUrl.searchParams.get('go') === '1') {
    if (typeof waitUntil === 'function') {
      waitUntil(registrarClique(env, link.link_id, request, 'destino'));
    } else {
      registrarClique(env, link.link_id, request, 'destino').catch(() => {});
    }
    return Response.redirect(link.destino, 302);
  }

  // Se for robô (crawler do WhatsApp, Meta, Telegram, etc.): devolve apenas meta tags Open Graph
  if (ROBOS.test(ua)) {
    return html(paginaOG({ link, url, imagem }), 200, {
      'cache-control': 'public, max-age=300',
    });
  }

  // Se for pessoa real: registra clique de acesso à tela
  if (typeof waitUntil === 'function') {
    waitUntil(registrarClique(env, link.link_id, request, 'acesso'));
  } else {
    registrarClique(env, link.link_id, request, 'acesso').catch(() => {});
  }

  // Modo 1: Página de Oferta / Mini-Vitrine (apresenta detalhes, fotos e preço antes da ação)
  if (link.tipo_link === 'vitrine') {
    return html(paginaVitrine({
      link,
      url,
      imagem,
      fotosGaleria,
      beneficios,
      lojaNome: link.loja_nome || 'Loja Oficial',
      lojaLogo,
      destino: link.destino,
    }), 200, {
      'cache-control': 'no-store',
    });
  }

  // Modo 2: Redirecionamento Rápido (transição com ação de contingência e auto-redirecionamento)
  if (typeof waitUntil === 'function') {
    waitUntil(registrarClique(env, link.link_id, request, 'destino'));
  } else {
    registrarClique(env, link.link_id, request, 'destino').catch(() => {});
  }

  return html(paginaTransicao({
    destino: link.destino,
    lojaNome: link.loja_nome || 'Loja',
    titulo: link.titulo || 'Oferta Exclusiva',
    imagem: imagem,
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

async function registrarClique(env, linkId, request, etapa = 'acesso') {
  try {
    const { origem, dispositivo } = detectarOrigemEDispositivo(request);
    await rpc(env, 'registrar_clique', {
      p_link: linkId,
      p_origem: origem,
      p_dispositivo: dispositivo,
      p_etapa: etapa,
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
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
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
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
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
      <img src="/favicon-32x32.png" alt="PostLink" style="width:24px; height:24px; border-radius:6px; object-fit:contain; display:inline-block;">
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
    <a href="https://postlink.com.br?utm_source=transicao&utm_medium=footer" target="_blank" rel="noopener" style="text-decoration:none; display:inline-block;">
      <div style="display:inline-flex; align-items:center; gap:6px; background:#ffffff; border:1px solid #e2e8f0; padding:6px 12px; border-radius:999px; font-size:11px; color:#475569; box-shadow:0 1px 3px rgba(0,0,0,0.04);">
        <img src="/favicon-32x32.png" alt="PostLink" style="width:14px; height:14px; border-radius:3px;">
        <span>Conexão Segura por <strong style="color:#003e80; font-weight:700;">PostLink</strong></span>
      </div>
    </a>
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

function formatarMoeda(val) {
  if (val === null || val === undefined || val === '') return '';
  const n = Number(val);
  if (isNaN(n)) return String(val);
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function paginaVitrine({ link, url, imagem, fotosGaleria = [], beneficios = [], lojaNome, lojaLogo = null, destino }) {
  const d = esc(destino);
  const nome = esc(lojaNome);
  const lojaLogoEsc = lojaLogo ? esc(lojaLogo) : '';
  const tit = esc(link.titulo || 'Oferta Especial');
  const desc = esc(link.descricao || '');
  const cta = esc(link.cta_label || 'Pedir pelo WhatsApp');
  const condicao = esc(link.condicao_pagamento || '');

  const temPrecoDe = link.preco_de !== null && link.preco_de !== undefined && Number(link.preco_de) > 0;
  const temPrecoPor = link.preco_por !== null && link.preco_por !== undefined && Number(link.preco_por) > 0;
  const precoDeFormatado = temPrecoDe ? formatarMoeda(link.preco_de) : '';
  const precoPorFormatado = temPrecoPor ? formatarMoeda(link.preco_por) : '';

  let percentualDesconto = 0;
  if (temPrecoDe && temPrecoPor && Number(link.preco_de) > Number(link.preco_por)) {
    percentualDesconto = Math.round(((Number(link.preco_de) - Number(link.preco_por)) / Number(link.preco_de)) * 100);
  }

  const todasFotos = [];
  if (imagem) todasFotos.push(imagem);
  for (const f of fotosGaleria) {
    if (f && !todasFotos.includes(f)) todasFotos.push(f);
  }

  const galeriaHtml = todasFotos.length > 0
    ? `
      <div class="gallery-container">
        <div class="hero-image-wrapper">
          <img id="main-product-img" src="${esc(todasFotos[0])}" alt="${tit}" class="hero-image">
          ${percentualDesconto > 0 ? `<span class="badge-discount">-${percentualDesconto}%</span>` : ''}
        </div>
        ${todasFotos.length > 1 ? `
          <div class="thumbnails-track">
            ${todasFotos.map((f, i) => `
              <button type="button" class="thumb-btn ${i === 0 ? 'active' : ''}" onclick="selecionarFoto('${esc(f)}', this)" aria-label="Ver foto ${i + 1}">
                <img src="${esc(f)}" alt="${tit} - Foto ${i + 1}">
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `
    : '';

  const precoHtml = (temPrecoDe || temPrecoPor)
    ? `
      <div class="price-box">
        <div class="price-values">
          ${temPrecoDe ? `<span class="price-old">De ${precoDeFormatado}</span>` : ''}
          ${temPrecoPor ? `<span class="price-current">Por <strong>${precoPorFormatado}</strong></span>` : ''}
        </div>
        ${condicao ? `<div class="price-condition">${condicao}</div>` : ''}
      </div>
    `
    : '';

  const beneficiosHtml = beneficios.length > 0
    ? `
      <div class="benefits-card">
        <h3 class="benefits-title">Destaques da Oferta</h3>
        <ul class="benefits-list">
          ${beneficios.map(b => `
            <li>
              <span class="check-icon">✓</span>
              <span>${esc(b)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `
    : '';

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>${tit} · ${nome}</title>
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      min-height: 100vh;
      background: #faf8ff;
      color: #131b2e;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 12px;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 440px;
      margin: 0 auto;
      width: 100%;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 4px 14px;
    }
    .store-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      padding: 5px 12px;
      border-radius: 999px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }
    .store-logo-img {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      object-fit: contain;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      display: inline-block;
    }
    .store-avatar {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #003e80;
      color: #ffffff;
      font-weight: 800;
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .store-name {
      font-size: 12px;
      font-weight: 700;
      color: #131b2e;
    }
    .verified-dot {
      width: 7px;
      height: 7px;
      background: #22c55e;
      border-radius: 50%;
      display: inline-block;
    }
    .brand-tag {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      text-decoration: none;
      font-size: 11px;
      font-weight: 700;
      color: #003e80;
      letter-spacing: -0.3px;
      padding: 5px 9px;
      border-radius: 999px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      transition: all 0.15s ease;
    }
    .brand-tag:hover {
      border-color: #003e80;
      transform: translateY(-1px);
    }
    .brand-icon {
      width: 14px;
      height: 14px;
      border-radius: 3px;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 18px;
      box-shadow: 0 10px 30px -5px rgba(0, 62, 128, 0.07);
    }
    .gallery-container {
      margin-bottom: 16px;
    }
    .hero-image-wrapper {
      position: relative;
      width: 100%;
      max-height: 480px;
      border-radius: 14px;
      overflow: hidden;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hero-image {
      width: 100%;
      height: auto;
      max-height: 480px;
      object-fit: contain;
      display: block;
      transition: opacity 0.2s ease;
      border-radius: 14px;
    }
    .badge-discount {
      position: absolute;
      top: 10px;
      left: 10px;
      background: #ba1a1a;
      color: #ffffff;
      font-weight: 800;
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 6px;
      box-shadow: 0 2px 6px rgba(186, 26, 26, 0.35);
      z-index: 2;
    }
    .thumbnails-track {
      display: flex;
      gap: 8px;
      margin-top: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
    }
    .thumb-btn {
      width: 54px;
      height: 48px;
      border-radius: 8px;
      overflow: hidden;
      border: 2px solid #e2e8f0;
      background: #f8fafc;
      padding: 0;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .thumb-btn.active {
      border-color: #003e80;
      box-shadow: 0 0 0 2px rgba(0, 62, 128, 0.2);
    }
    .thumb-btn img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .product-title {
      font-size: 18px;
      font-weight: 800;
      color: #131b2e;
      line-height: 1.3;
      margin-bottom: 8px;
      letter-spacing: -0.3px;
    }
    .product-desc {
      font-size: 13.5px;
      color: #424751;
      line-height: 1.55;
      margin-bottom: 16px;
      white-space: pre-line;
    }
    .price-box {
      background: #f2f3ff;
      border: 1px solid #d6e3ff;
      border-radius: 12px;
      padding: 12px 14px;
      margin-bottom: 16px;
    }
    .price-values {
      display: flex;
      align-items: baseline;
      gap: 8px;
      flex-wrap: wrap;
    }
    .price-old {
      font-size: 12.5px;
      color: #737782;
      text-decoration: line-through;
    }
    .price-current {
      font-size: 18px;
      color: #003e80;
      font-weight: 600;
    }
    .price-current strong {
      font-size: 22px;
      font-weight: 800;
      color: #006e2f;
    }
    .price-condition {
      font-size: 11.5px;
      color: #003e80;
      font-weight: 600;
      margin-top: 3px;
    }
    .benefits-card {
      background: #fcfcfd;
      border: 1px solid #eaedff;
      border-radius: 12px;
      padding: 12px 14px;
      margin-bottom: 18px;
    }
    .benefits-title {
      font-size: 12px;
      font-weight: 700;
      color: #003e80;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .benefits-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .benefits-list li {
      display: flex;
      align-items: flex-start;
      gap: 7px;
      font-size: 13px;
      color: #131b2e;
      line-height: 1.4;
    }
    .check-icon {
      color: #007432;
      background: #dcfce7;
      width: 17px;
      height: 17px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 900;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .btn-cta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 15px 20px;
      border-radius: 14px;
      background: #22c55e;
      color: #ffffff;
      font-weight: 700;
      font-size: 15px;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(34, 197, 94, 0.35);
      transition: background 0.15s ease, transform 0.1s ease;
      cursor: pointer;
    }
    .btn-cta:hover {
      background: #006e2f;
    }
    .btn-cta:active {
      transform: scale(0.97);
    }
    .cta-icon {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }
    footer {
      text-align: center;
      padding: 16px 0 8px;
    }
    .footer-platform-link {
      text-decoration: none;
      display: inline-block;
    }
    .footer-platform-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 11px;
      color: #475569;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      transition: all 0.2s ease;
    }
    .footer-platform-pill:hover {
      border-color: #003e80;
      color: #003e80;
      transform: translateY(-1px);
      box-shadow: 0 4px 10px rgba(0, 62, 128, 0.08);
    }
    .footer-platform-icon {
      width: 14px;
      height: 14px;
      border-radius: 3px;
    }
    .footer-platform-pill strong {
      color: #003e80;
      font-weight: 700;
    }
    .footer-arrow {
      width: 14px;
      height: 14px;
      color: #94a3b8;
      transition: transform 0.2s ease;
    }
    .footer-platform-pill:hover .footer-arrow {
      color: #003e80;
      transform: translateX(1px);
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <header>
      <div class="store-badge">
        ${lojaLogoEsc ? `
          <img src="${lojaLogoEsc}" alt="${nome}" class="store-logo-img">
        ` : `
          <div class="store-avatar">${nome.charAt(0).toUpperCase()}</div>
        `}
        <span class="store-name">${nome}</span>
        <span class="verified-dot" title="Loja Ativa"></span>
      </div>
      <a href="https://postlink.com.br?utm_source=vitrine&utm_medium=header" target="_blank" rel="noopener" class="brand-tag" title="Criado com PostLink">
        <img src="/favicon-32x32.png" alt="PostLink" class="brand-icon">
        <span>PostLink</span>
      </a>
    </header>

    <main class="card">
      ${galeriaHtml}
      <h1 class="product-title">${tit}</h1>
      ${desc ? `<p class="product-desc">${desc}</p>` : ''}
      ${precoHtml}
      ${beneficiosHtml}

      <a href="${d}" class="btn-cta" id="btn-cta-destino" rel="noopener" onclick="irParaDestino(event, '${d}', '${link.link_id}')">
        <svg class="cta-icon" viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 17.65c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.1 8.1 0 0 1-1.24-4.28c0-4.5 3.66-8.16 8.17-8.16 2.18 0 4.23.85 5.77 2.39a8.1 8.1 0 0 1 2.39 5.77c.01 4.5-3.65 8.14-8.1 8.14zm4.47-6.1c-.25-.12-1.46-.72-1.68-.8-.23-.08-.39-.12-.56.12-.17.25-.64.8-.79.97-.14.17-.29.19-.53.07-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.53.6.19 1.14.16 1.57.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z"/></svg>
        <span>${cta}</span>
      </a>
    </main>
  </div>

  <footer>
    <a href="https://postlink.com.br?utm_source=vitrine&utm_medium=footer" target="_blank" rel="noopener" class="footer-platform-link" title="Crie páginas de ofertas e links inteligentes como esta">
      <div class="footer-platform-pill">
        <img src="/favicon-32x32.png" alt="PostLink" class="footer-platform-icon">
        <span>Criado com <strong>PostLink</strong> · Crie o seu</span>
        <svg class="footer-arrow" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
        </svg>
      </div>
    </a>
  </footer>

  <script>
    function selecionarFoto(url, btn) {
      var img = document.getElementById('main-product-img');
      if (img) img.src = url;
      var buttons = document.querySelectorAll('.thumb-btn');
      buttons.forEach(function(b) { b.classList.remove('active'); });
      if (btn) btn.classList.add('active');
    }

    function irParaDestino(e, urlDestino, linkId) {
      try {
        var beaconUrl = '/api/clique-destino?link=' + encodeURIComponent(linkId);
        if (navigator.sendBeacon) {
          navigator.sendBeacon(beaconUrl);
        } else {
          fetch(beaconUrl, { keepalive: true, method: 'POST' }).catch(function(){});
        }
      } catch (_) {}
    }
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
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
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
