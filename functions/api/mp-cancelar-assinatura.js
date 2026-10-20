// functions/api/mp-cancelar-assinatura.js - Cloudflare Pages Function
// Cancelamento de renovação automática de assinatura pelo lojista

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const DEFAULT_SUPABASE_URL = 'https://xiicwkagcphvejzycntx.supabase.co';

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function onRequestPost({ request, env }) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ erro: 'JSON inválido' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const { loja_id, preapproval_id } = body;

    if (!loja_id) {
      return new Response(JSON.stringify({ erro: 'ID da loja obrigatório' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const mpAccessToken = env.MP_ACCESS_TOKEN;
    const supabaseUrl = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

    let mpCancelado = false;
    let mpDetalhes = null;

    // Se houver preapproval_id real do Mercado Pago, cancela a recorrência no gateway
    if (preapproval_id && mpAccessToken && !String(preapproval_id).startsWith('mock_')) {
      try {
        const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${preapproval_id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${mpAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'cancelled' }),
        });
        mpCancelado = mpRes.ok;
        try {
          mpDetalhes = await mpRes.json();
        } catch {}
      } catch (err) {
        console.warn('Erro ao chamar cancelamento no Mercado Pago:', err);
      }
    }

    // Atualiza status no Supabase mantendo o plano ativo até valido_ate
    if (serviceKey) {
      const patchRes = await fetch(`${supabaseUrl}/rest/v1/assinaturas?loja_id=eq.${loja_id}`, {
        method: 'PATCH',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          cancelar_ao_fim_do_periodo: true,
          atualizado_em: new Date().toISOString(),
        }),
      });

      if (!patchRes.ok) {
        const errTxt = await patchRes.text();
        console.error('Erro ao atualizar cancelamento no Supabase:', errTxt);
      }
    }

    return new Response(
      JSON.stringify({
        sucesso: true,
        mensagem: 'Renovação automática cancelada com sucesso. Seus links e recursos continuam liberados até o final do período já pago!',
        mp_cancelado: mpCancelado,
        detalhes: mpDetalhes,
      }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ erro: 'Erro interno ao cancelar assinatura', mensagem: err.message }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }
}
