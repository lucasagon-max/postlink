// functions/api/clique-destino.js - Cloudflare Pages Function
// Registra cliques direcionados ao destino final (ex: botão WhatsApp na Mini-Vitrine)

const DEFAULT_SUPABASE_URL = 'https://xiicwkagcphvejzycntx.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaWN3a2FnY3BodmVqenljbnR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMjQwOTksImV4cCI6MjEwNjgwMDA5OX0.RyxiEa0aojXvBaJTdIdtk1Sst35-mFDKXb_CTnt7WiA';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

async function rpc(env, nome, args) {
  const url = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  const r = await fetch(`${url}/rest/v1/rpc/${nome}`, {
    method: 'POST',
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(args),
  });

  if (!r.ok) {
    const errText = await r.text();
    throw new Error(`rpc ${nome}: ${r.status} - ${errText}`);
  }
  return r.status === 204 ? null : r.json();
}

function detectarOrigemEDispositivo(request) {
  const ua = request.headers.get('user-agent') || '';
  const ref = request.headers.get('referer') || '';

  const dispositivo = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    ? 'mobile'
    : 'desktop';

  let origem = 'direto';

  try {
    const url = new URL(request.url);
    const paramSrc = (url.searchParams.get('src') || url.searchParams.get('utm_source') || url.searchParams.get('ref') || '').toLowerCase();
    if (paramSrc) {
      if (paramSrc.includes('wa') || paramSrc.includes('whats')) return { origem: 'whatsapp', dispositivo };
      if (paramSrc.includes('ig') || paramSrc.includes('insta')) return { origem: 'instagram', dispositivo };
      if (paramSrc.includes('fb') || paramSrc.includes('face')) return { origem: 'facebook', dispositivo };
      if (paramSrc.includes('tg') || paramSrc.includes('tele')) return { origem: 'telegram', dispositivo };
      if (paramSrc.includes('tt') || paramSrc.includes('tik')) return { origem: 'tiktok', dispositivo };
      return { origem: paramSrc.slice(0, 30), dispositivo };
    }
  } catch (_) {}

  if (/Instagram/i.test(ua)) return { origem: 'instagram', dispositivo };
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return { origem: 'facebook', dispositivo };
  if (/musical_ly|TikTok|BytedanceWebview/i.test(ua)) return { origem: 'tiktok', dispositivo };
  if (/Telegram/i.test(ua)) return { origem: 'telegram', dispositivo };
  if (/LinkedIn/i.test(ua)) return { origem: 'linkedin', dispositivo };

  if (ref) {
    try {
      const refHost = new URL(ref).host.toLowerCase();
      if (refHost.includes('whatsapp') || refHost.includes('wa.me')) return { origem: 'whatsapp', dispositivo };
      if (refHost.includes('instagram')) return { origem: 'instagram', dispositivo };
      if (refHost.includes('facebook') || refHost.includes('fb.com')) return { origem: 'facebook', dispositivo };
      if (refHost.includes('t.co') || refHost.includes('twitter') || refHost.includes('x.com')) return { origem: 'x_twitter', dispositivo };
      if (refHost.includes('t.me') || refHost.includes('telegram')) return { origem: 'telegram', dispositivo };
      if (refHost.includes('google')) return { origem: 'google', dispositivo };
      if (refHost.includes('youtube')) return { origem: 'youtube', dispositivo };
      return { origem: refHost, dispositivo };
    } catch (_) {}
  }

  if (dispositivo === 'mobile' && !ref) {
    origem = 'whatsapp';
  }

  return { origem, dispositivo };
}

async function processarCliqueDestino(context) {
  const { request, env } = context;
  const urlObj = new URL(request.url);
  let linkId = urlObj.searchParams.get('link');

  if (!linkId && request.method === 'POST') {
    try {
      const clone = request.clone();
      const body = await clone.json();
      linkId = body.link || body.linkId || body.link_id;
    } catch (_) {}
  }

  if (linkId) {
    const { origem, dispositivo } = detectarOrigemEDispositivo(request);
    try {
      // 1. Tenta registrar com p_etapa: 'destino'
      await rpc(env, 'registrar_clique', {
        p_link: linkId,
        p_origem: origem,
        p_dispositivo: dispositivo,
        p_etapa: 'destino',
      });
    } catch (_) {
      try {
        // 2. Fallback caso o banco de dados ainda possua a assinatura legada com 3 parâmetros
        await rpc(env, 'registrar_clique', {
          p_link: linkId,
          p_origem: origem,
          p_dispositivo: dispositivo,
        });
      } catch (errFallback) {
        console.error('Falha ao registrar clique de destino:', errFallback);
      }
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function onRequestGet(context) {
  return processarCliqueDestino(context);
}

export async function onRequestPost(context) {
  return processarCliqueDestino(context);
}

export async function onRequest(context) {
  return processarCliqueDestino(context);
}
