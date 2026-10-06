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

export async function onRequestGet({ request, params, env, waitUntil }) {
  const ua = request.headers.get('user-agent') || '';
  const loja = params.loja;
  const slug = params.slug;

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

  return html(paginaTransicao(link.destino, link.loja_nome || 'Loja'), 200, {
    'cache-control': 'no-store',
  });
}

async function registrarClique(env, linkId, request) {
  try {
    let origem = null;
    const ref = request.headers.get('referer');
    if (ref) {
      try {
        origem = new URL(ref).host;
      } catch {}
    }
    const ua = request.headers.get('user-agent') || '';
    const dispositivo = /Mobi|Android|iPhone|iPad/i.test(ua) ? 'mobile' : 'desktop';
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

function paginaTransicao(destino, lojaNome) {
  const d = esc(destino);
  const js = JSON.stringify(destino).replace(/</g, '\\u003c');
  const nome = esc(lojaNome);

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <meta http-equiv="refresh" content="2;url=${d}">
  <title>Abrindo ${nome}…</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      min-height: 100vh;
      align-items: center;
      justify-content: center;
      background: #f9f9f7;
      color: #141413;
      padding: 24px;
    }
    .card {
      background: #ffffff;
      border: 0.5px solid rgba(31, 30, 29, 0.12);
      border-radius: 16px;
      padding: 32px 24px;
      text-align: center;
      max-width: 380px;
      width: 100%;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
    }
    .spinner {
      width: 32px;
      height: 32px;
      margin: 0 auto 16px;
      border: 2px solid rgba(31, 30, 29, 0.12);
      border-top-color: #141413;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    h1 {
      font-size: 16px;
      font-weight: 600;
      color: #141413;
      margin-bottom: 6px;
    }
    p {
      font-size: 13px;
      color: #5f5e5a;
      margin-bottom: 20px;
    }
    .btn {
      display: inline-block;
      width: 100%;
      padding: 10px 16px;
      border-radius: 8px;
      background: #141413;
      color: #ffffff;
      font-weight: 500;
      font-size: 14px;
      text-decoration: none;
      transition: background 0.15s ease;
    }
    .btn:hover {
      background: #2c2c2a;
    }
  </style>
</head>
<body>
  <main class="card">
    <div class="spinner" aria-hidden="true"></div>
    <h1>Abrindo a oferta…</h1>
    <p>Você será redirecionado para ${nome} em instantes.</p>
    <a href="${d}" rel="noopener" class="btn">Abrir agora</a>
  </main>
  <script>
    setTimeout(function() {
      try {
        location.replace(${js});
      } catch(e) {
        location.href = ${js};
      }
    }, 250);
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
  <title>${t}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      min-height: 100vh;
      align-items: center;
      justify-content: center;
      background: #f9f9f7;
      color: #141413;
      padding: 24px;
    }
    .card {
      background: #ffffff;
      border: 0.5px solid rgba(31, 30, 29, 0.12);
      border-radius: 16px;
      padding: 36px 24px;
      text-align: center;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
    }
    h1 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #141413;
    }
    p {
      font-size: 13px;
      color: #5f5e5a;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <main class="card">
    <h1>${t}</h1>
    ${d ? `<p>${d}</p>` : ''}
  </main>
</body>
</html>`;
}
