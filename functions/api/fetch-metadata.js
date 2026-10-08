// functions/api/fetch-metadata.js - Cloudflare Pages Function
// Extrai metadados Open Graph e títulos de qualquer URL para pré-visualização instantânea

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

function resolveUrl(relativeOrAbsolute, baseUrl) {
  if (!relativeOrAbsolute) return '';
  try {
    return new URL(relativeOrAbsolute, baseUrl).href;
  } catch {
    return relativeOrAbsolute;
  }
}

function decodeHtmlEntities(str = '') {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));
}

export async function onRequest({ request }) {
  let targetUrl = '';

  if (request.method === 'GET') {
    const url = new URL(request.url);
    targetUrl = url.searchParams.get('url') || '';
  } else if (request.method === 'POST') {
    try {
      const body = await request.json();
      targetUrl = body.url || '';
    } catch {
      targetUrl = '';
    }
  }

  targetUrl = targetUrl.trim();
  if (!targetUrl) {
    return new Response(
      JSON.stringify({ success: false, error: 'Parâmetro url é obrigatório' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }

  // Adicionar protocolo se usuário digitou apenas "site.com.br"
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = 'https://' + targetUrl;
  }

  let parsedTarget;
  try {
    parsedTarget = new URL(targetUrl);
    if (!['http:', 'https:'].includes(parsedTarget.protocol)) {
      throw new Error('Protocolo inválido');
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: 'URL inválida' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

  try {
    const response = await fetch(parsedTarget.href, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (compatible; PostLinkBot/1.0; +https://postlink.com.br)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `O site de destino respondeu com código ${response.status}`,
          url: parsedTarget.href,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      return new Response(
        JSON.stringify({
          success: true,
          title: parsedTarget.hostname,
          description: '',
          image: '',
          siteName: parsedTarget.hostname,
          url: parsedTarget.href,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    // Lê apenas os primeiros 200KB para extrair o cabeçalho <head> com rapidez
    const reader = response.body.getReader();
    let htmlChunk = '';
    const decoder = new TextDecoder('utf-8');

    while (htmlChunk.length < 250000) {
      const { done, value } = await reader.read();
      if (done) break;
      htmlChunk += decoder.decode(value, { stream: true });
      if (htmlChunk.includes('</head>')) break;
    }
    controller.abort(); // Encerra leitura do restante do corpo para poupar CPU/rede

    const extractMeta = (properties) => {
      for (const prop of properties) {
        // Formato: <meta property="..." content="..."> ou <meta name="..." content="...">
        const regex1 = new RegExp(
          `<meta[^>]+(?:property|name)=["'](?:og:)?${prop}["'][^>]+content=["']([^"']*)["']`,
          'i'
        );
        const regex2 = new RegExp(
          `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["'](?:og:)?${prop}["']`,
          'i'
        );
        const match = htmlChunk.match(regex1) || htmlChunk.match(regex2);
        if (match && match[1]) {
          return decodeHtmlEntities(match[1].trim());
        }
      }
      return '';
    };

    // Extração de Título
    let title = extractMeta(['title', 'twitter:title']);
    if (!title) {
      const titleTag = htmlChunk.match(/<title[^>]*>([^<]*)<\/title>/i);
      if (titleTag && titleTag[1]) {
        title = decodeHtmlEntities(titleTag[1].trim());
      }
    }

    // Extração de Descrição
    let description = extractMeta(['description', 'twitter:description']);

    // Extração de Imagem
    let image = extractMeta(['image', 'image:src', 'twitter:image', 'twitter:image:src']);
    if (image) {
      image = resolveUrl(image, parsedTarget.href);
    }

    // Extração do Nome do Site
    let siteName = extractMeta(['site_name', 'application-name']) || parsedTarget.hostname;

    // Fallbacks
    if (!title) title = parsedTarget.hostname;

    return new Response(
      JSON.stringify({
        success: true,
        title,
        description,
        image,
        siteName,
        url: parsedTarget.href,
        hostname: parsedTarget.hostname,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  } catch (err) {
    clearTimeout(timeoutId);
    return new Response(
      JSON.stringify({
        success: false,
        error: err.name === 'AbortError' ? 'Tempo limite esgotado ao acessar o site' : err.message,
        url: parsedTarget.href,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }
}
