// functions/api/mp-config.js - Cloudflare Pages Function
// Retorna a Public Key do Mercado Pago para inicialização do SDK no Frontend

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function onRequestGet({ env }) {
  // Retorna a chave pública configurada no Cloudflare Pages
  const publicKey = env.MP_PUBLIC_KEY || '';

  return new Response(
    JSON.stringify({
      publicKey,
      configurado: Boolean(publicKey),
    }),
    {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    }
  );
}
