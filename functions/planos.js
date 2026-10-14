// functions/planos.js - Cloudflare Pages Function para /planos
export async function onRequest(context) {
  const { request, env } = context;
  if (env.ASSETS) {
    const url = new URL('/planos/', request.url);
    const resp = await env.ASSETS.fetch(url);
    return new Response(resp.body, resp);
  }
  return new Response('Página de Planos', { status: 200, headers: { 'Content-Type': 'text/html' } });
}
