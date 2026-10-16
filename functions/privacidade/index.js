// functions/privacidade/index.js - Cloudflare Pages Function para /privacidade/
export async function onRequest(context) {
  const { request, env } = context;
  if (env.ASSETS) {
    const urls = [
      new URL('/privacidade/', request.url),
      new URL('/privacidade/index.html', request.url),
      new URL('/public/privacidade/index.html', request.url),
    ];
    for (const u of urls) {
      try {
        const resp = await env.ASSETS.fetch(u);
        if (resp && resp.status < 400) return new Response(resp.body, resp);
      } catch (_) {}
    }
  }
  return new Response('Política de Privacidade', { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
