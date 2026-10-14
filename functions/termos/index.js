// functions/termos/index.js - Cloudflare Pages Function para /termos/
export async function onRequest(context) {
  const { request, env } = context;
  if (env.ASSETS) {
    const url = new URL('/termos/index.html', request.url);
    const resp = await env.ASSETS.fetch(url);
    return new Response(resp.body, resp);
  }
  return new Response('Termos', { status: 200, headers: { 'Content-Type': 'text/html' } });
}
