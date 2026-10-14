// functions/denunciar.js - Cloudflare Pages Function para /denunciar
export async function onRequest(context) {
  const { request, env } = context;
  if (env.ASSETS) {
    const url = new URL('/denunciar/index.html', request.url);
    const resp = await env.ASSETS.fetch(url);
    return new Response(resp.body, resp);
  }
  return new Response('Denunciar', { status: 200, headers: { 'Content-Type': 'text/html' } });
}
