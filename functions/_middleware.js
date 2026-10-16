// functions/_middleware.js - Interceptor global do Cloudflare Pages
// Garante resolução perfeita de páginas estáticas e assets, funcionando perfeitamente
// tanto se o Build Output Directory do Pages for 'public' quanto se for a raiz '/'.

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

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

  // Helper para buscar asset no env.ASSETS testando múltiplos caminhos com fallback /public
  async function fetchAssetWithFallback(assetPath) {
    if (!env.ASSETS) return null;

    const tentativas = [assetPath];
    if (!assetPath.startsWith('/public/')) {
      tentativas.push('/public' + (assetPath.startsWith('/') ? assetPath : '/' + assetPath));
    }

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
      return new Response(assetResp.body, assetResp);
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
