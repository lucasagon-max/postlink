// functions/_middleware.js - Interceptor global do Cloudflare Pages
// Garante resolução perfeita de páginas com parâmetros de busca (query strings),
// rotas com ou sem trailing slash e assets estáticos, evitando falsos erros 404.

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 1. Chamadas de API do backend seguem direto para os handlers de /api/*
  if (pathname.startsWith('/api/')) {
    return next();
  }

  // 2. Arquivos de ativos estáticos com extensão (CSS, JS, imagens, fontes, favicon)
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) {
    if (env.ASSETS) {
      // Normaliza para o caminho estático limpo sem interferência de query string
      const cleanAssetUrl = new URL(pathname, request.url);
      try {
        const resp = await env.ASSETS.fetch(cleanAssetUrl);
        if (resp.status < 400) return resp;
      } catch (_) {}
      return env.ASSETS.fetch(request);
    }
    return next();
  }

  // 3. Mapeamento de rotas de páginas estáticas conhecidas
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

  // 4. Se for qualquer outra rota, deixa o Pages despachar para as funções dinâmicas (ex: /[loja]/[slug])
  return next();
}
