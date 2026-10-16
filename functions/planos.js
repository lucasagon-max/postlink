// functions/planos.js - Cloudflare Pages Function para /planos
export async function onRequest(context) {
  const { request, env } = context;
  if (env.ASSETS) {
    const urls = [
      new URL('/planos/', request.url),
      new URL('/planos/index.html', request.url),
      new URL('/public/planos/index.html', request.url),
    ];
    for (const u of urls) {
      try {
        const resp = await env.ASSETS.fetch(u);
        if (resp && resp.status < 400) return new Response(resp.body, resp);
      } catch (_) {}
    }
  }
  return new Response('Planos PostLink', { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
