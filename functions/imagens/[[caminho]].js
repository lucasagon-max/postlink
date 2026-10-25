// functions/imagens/[[caminho]].js - Servidor de Mídia Otimizada com Cache Global da CDN
// Entrega imagens armazenadas com latência ultrabaixa e cabeçalhos de alta eficiência.

const DEFAULT_SUPABASE_URL = 'https://xiicwkagcphvejzycntx.supabase.co';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Extrai o caminho completo da imagem (ex: lojistas/user_id/foto.webp)
  const caminho = decodeURIComponent(url.pathname.replace(/^\/imagens\/?/, '').trim());

  if (!caminho) {
    return new Response('Imagem não especificada', { status: 400 });
  }

  const bucketR2 = env.R2_BANNERS || env.R2_STORAGE || env.BUCKET_BANNERS || env.R2;

  // Sanitiza e gera candidatos de caminhos (com e sem prefixo lojistas/)
  const limpo = caminho.replace(/^\/+/, '').replace(/^imagens\//, '');
  const semLojistas = limpo.replace(/^lojistas\//, '');
  const comLojistas = limpo.startsWith('lojistas/') ? limpo : `lojistas/${limpo}`;
  const candidatos = Array.from(new Set([limpo, semLojistas, comLojistas])).filter(Boolean);

  // 1. Busca no armazenamento de alta performance testando os caminhos candidatos
  if (bucketR2) {
    for (const cand of candidatos) {
      try {
        const objeto = await bucketR2.get(cand);

        if (objeto) {
          // Validação de ETag para economia de transferência (304 Not Modified)
          const ifNoneMatch = request.headers.get('if-none-match');
          if (ifNoneMatch && ifNoneMatch === objeto.httpEtag) {
            return new Response(null, { status: 304 });
          }

          const headers = new Headers();
          objeto.writeHttpMetadata(headers);
          headers.set('etag', objeto.httpEtag);
          headers.set('cache-control', 'public, max-age=31536000, immutable');
          headers.set('x-content-type-options', 'nosniff');

          // Se o tipo MIME não estiver gravado nos metadados, detecta pela extensão
          if (!headers.get('content-type')) {
            if (cand.endsWith('.webp')) headers.set('content-type', 'image/webp');
            else if (cand.endsWith('.png')) headers.set('content-type', 'image/png');
            else headers.set('content-type', 'image/jpeg');
          }

          return new Response(objeto.body, { headers });
        }
      } catch (_) {}
    }
  }

  // 2. Fallback transparente para o armazenamento de transição testando os caminhos candidatos
  const sbUrl = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;

  for (const cand of candidatos) {
    try {
      const urlFallback = `${sbUrl}/storage/v1/object/public/banners/${cand}`;
      const respFallback = await fetch(urlFallback, {
        headers: {
          'accept': request.headers.get('accept') || 'image/*',
        },
      });

      if (respFallback.ok) {
        const headers = new Headers(respFallback.headers);
        headers.set('cache-control', 'public, max-age=31536000, immutable');
        headers.set('x-content-type-options', 'nosniff');
        headers.set('access-control-allow-origin', '*');

        const ct = headers.get('content-type') || '';
        if (!ct || ct.includes('text/html')) {
          if (cand.endsWith('.webp')) headers.set('content-type', 'image/webp');
          else if (cand.endsWith('.png')) headers.set('content-type', 'image/png');
          else headers.set('content-type', 'image/jpeg');
        }

        return new Response(respFallback.body, {
          status: respFallback.status,
          headers,
        });
      }
    } catch (_) {}
  }

  return new Response('Imagem não encontrada', {
    status: 404,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}

export async function onRequest(context) {
  if (context.request.method === 'GET' || context.request.method === 'HEAD') {
    return onRequestGet(context);
  }
  return new Response('Método não permitido', { status: 405 });
}
