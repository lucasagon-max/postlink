// functions/index.js - Cloudflare Pages Function para a raiz /
export async function onRequest(context) {
  const { request, env } = context;
  if (env.ASSETS) {
    const url = new URL('/index.html', request.url);
    const resp = await env.ASSETS.fetch(url);
    return new Response(resp.body, resp);
  }
  return new Response('PostLink', { status: 200, headers: { 'Content-Type': 'text/html' } });
}
