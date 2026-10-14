// functions/privacidade/index.js - Cloudflare Pages Function para /privacidade/
export async function onRequest(context) {
  const { request, env } = context;
  if (env.ASSETS) {
    const url = new URL('/privacidade/index.html', request.url);
    const resp = await env.ASSETS.fetch(url);
    return new Response(resp.body, resp);
  }
  return new Response('Privacidade', { status: 200, headers: { 'Content-Type': 'text/html' } });
}
