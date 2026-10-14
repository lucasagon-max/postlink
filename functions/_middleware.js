// functions/_middleware.js - Diagnóstico e roteamento inteligente

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Endpoint de diagnóstico em tempo real
  if (pathname === '/debug-assets') {
    const testPaths = [
      '/',
      '/index.html',
      '/login',
      '/login/',
      '/login/index.html',
      '/planos/',
      '/planos/index.html',
      '/assets/css/style.css'
    ];
    const results = {};
    for (const p of testPaths) {
      try {
        const r = await env.ASSETS.fetch(new URL(p, request.url));
        results[p] = { status: r.status, type: r.headers.get('content-type') };
      } catch (err) {
        results[p] = { error: err.message };
      }
    }
    return new Response(JSON.stringify(results, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 1. Chamadas de API do backend seguem direto para os handlers de /api/*
  if (pathname.startsWith('/api/')) {
    return next();
  }

  // 2. Arquivos estáticos com extensão (CSS, JS, imagens)
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) {
    if (env.ASSETS) {
      const cleanAssetUrl = new URL(pathname, request.url);
      try {
        const resp = await env.ASSETS.fetch(cleanAssetUrl);
        if (resp.status < 400) return resp;
      } catch (_) {}
      return env.ASSETS.fetch(request);
    }
    return next();
  }

  // 3. Mapeamento de páginas estáticas
  const ROTAS_PAGINAS = {
    '/': '/index.html',
    '/login': '/login/index.html',
    '/login/': '/login/index.html',
    '/planos': '/planos/index.html',
    '/planos/': '/planos/index.html',
    '/painel': '/painel/index.html',
    '/painel/': '/painel/index.html',
    '/admin': '/admin/index.html',
    '/admin/': '/admin/index.html',
    '/termos': '/termos/index.html',
    '/termos/': '/termos/index.html',
    '/privacidade': '/privacidade/index.html',
    '/privacidade/': '/privacidade/index.html',
    '/denunciar': '/denunciar/index.html',
    '/denunciar/': '/denunciar/index.html',
  };

  const pathnameNormalizado = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  const arquivoDestino = ROTAS_PAGINAS[pathname] || ROTAS_PAGINAS[pathnameNormalizado];

  if (arquivoDestino && env.ASSETS) {
    try {
      const assetUrl = new URL(arquivoDestino, request.url);
      const resp = await env.ASSETS.fetch(assetUrl);
      if (resp.status < 400) {
        return new Response(resp.body, resp);
      }
    } catch (_) {}
  }

  return next();
}
