// functions/_middleware.js - Interceptor global do Cloudflare Pages
// Garante resolução perfeita de páginas com parâmetros de busca (query strings),
// rotas com ou sem trailing slash e assets estáticos, evitando erros 404.

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 1. Chamadas de API do backend seguem direto para os handlers de /api/*
  if (pathname.startsWith('/api/')) {
    return next();
  }

  // 2. Arquivos de ativos estáticos com extensão física (CSS, JS, imagens, fontes, favicon)
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) {
    if (env.ASSETS) {
      // Normaliza sem query params para buscar o asset estático físico
      const cleanAssetUrl = new URL(pathname, request.url);
      try {
        const resp = await env.ASSETS.fetch(cleanAssetUrl);
        if (resp.status < 400) return resp;
      } catch (_) {}
      return env.ASSETS.fetch(request);
    }
    return next();
  }

  // 3. Mapeamento de rotas de páginas conhecidas no Cloudflare Pages (usa diretórios com barra)
  const ROTAS_PAGINAS = {
    '/': '/',
    '/index.html': '/',
    '/login': '/login/',
    '/login/': '/login/',
    '/login/index.html': '/login/',
    '/planos': '/planos/',
    '/planos/': '/planos/',
    '/planos/index.html': '/planos/',
    '/painel': '/painel/',
    '/painel/': '/painel/',
    '/painel/index.html': '/painel/',
    '/admin': '/admin/',
    '/admin/': '/admin/',
    '/admin/index.html': '/admin/',
    '/termos': '/termos/',
    '/termos/': '/termos/',
    '/termos/index.html': '/termos/',
    '/privacidade': '/privacidade/',
    '/privacidade/': '/privacidade/',
    '/privacidade/index.html': '/privacidade/',
    '/denunciar': '/denunciar/',
    '/denunciar/': '/denunciar/',
    '/denunciar/index.html': '/denunciar/',
  };

  const pathnameNormalizado = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  const caminhoCanônico = ROTAS_PAGINAS[pathname] || ROTAS_PAGINAS[pathnameNormalizado];

  if (caminhoCanônico && env.ASSETS) {
    try {
      const assetUrl = new URL(caminhoCanônico, request.url);
      const resp = await env.ASSETS.fetch(assetUrl);
      if (resp.status < 400) {
        return new Response(resp.body, resp);
      }
    } catch (_) {}
  }

  // 4. Se for qualquer outra rota, deixa o Pages despachar para as funções dinâmicas (ex: /[loja]/[slug])
  return next();
}
