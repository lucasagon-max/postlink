// functions/admin.js - Cloudflare Pages Function para /admin
export async function onRequest(context) {
  const { request, env } = context;
  if (env.ASSETS) {
    const urls = [
      new URL('/admin/', request.url),
      new URL('/admin/index.html', request.url),
      new URL('/public/admin/index.html', request.url),
    ];
    for (const u of urls) {
      try {
        const resp = await env.ASSETS.fetch(u);
        if (resp && resp.status < 400) return new Response(resp.body, resp);
      } catch (_) {}
    }
  }
  return new Response('Admin', { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
