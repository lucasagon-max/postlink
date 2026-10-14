// functions/admin.js - Cloudflare Pages Function para /admin
export async function onRequest(context) {
  const { request, env } = context;
  if (env.ASSETS) {
    const url = new URL('/admin/index.html', request.url);
    const resp = await env.ASSETS.fetch(url);
    return new Response(resp.body, resp);
  }
  return new Response('Admin', { status: 200, headers: { 'Content-Type': 'text/html' } });
}
