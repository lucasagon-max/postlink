// functions/api/mp-webhook.js - Cloudflare Pages Function
// Receptor de Webhooks / Notificações IPN do Mercado Pago

const DEFAULT_SUPABASE_URL = 'https://xiicwkagcphvejzycntx.supabase.co';

async function atualizarAssinaturaSupabase(env, lojaId, planoEscolhido, paymentId) {
  const supabaseUrl = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    console.warn('Webhook: SUPABASE_SERVICE_ROLE_KEY não configurada.');
    return false;
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/assinaturas?loja_id=eq.${lojaId}`, {
      method: 'PATCH',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'ativo',
        plano: planoEscolhido,
        mp_assinatura_id: String(paymentId),
        atualizado_em: new Date().toISOString(),
      }),
    });

    return res.ok;
  } catch (err) {
    console.error('Webhook: Erro ao atualizar assinatura:', err);
    return false;
  }
}

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return new Response('Apenas POST é permitido', { status: 405 });
  }

  try {
    const url = new URL(request.url);
    let paymentId = url.searchParams.get('data.id') || url.searchParams.get('id');

    let body = {};
    try {
      body = await request.json();
      if (!paymentId && body.data?.id) {
        paymentId = body.data.id;
      }
    } catch {}

    const action = body.action || url.searchParams.get('topic');

    // Se não tiver ID de pagamento (ex: webhook de teste de URL do painel MP)
    if (!paymentId) {
      return new Response(JSON.stringify({ status: 'ok', msg: 'Webhook recebido sem payment_id' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const mpAccessToken = env.MP_ACCESS_TOKEN;
    if (!mpAccessToken) {
      console.warn('Webhook: MP_ACCESS_TOKEN ausente nas variáveis de ambiente.');
      return new Response(JSON.stringify({ status: 'ignored', motivo: 'Sem token configurado' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Consulta os detalhes reais do pagamento no Mercado Pago
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`,
      },
    });

    if (!mpRes.ok) {
      return new Response(JSON.stringify({ erro: 'Não foi possível consultar pagamento' }), {
        status: 200, // Retornamos 200 para evitar retentativas agressivas do MP
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const mpData = await mpRes.json();

    if (mpData.status === 'approved' && mpData.external_reference) {
      try {
        const ref = JSON.parse(mpData.external_reference);
        if (ref.loja_id && ref.plano) {
          await atualizarAssinaturaSupabase(env, ref.loja_id, ref.plano, paymentId);
          console.log(`Webhook: Loja ${ref.loja_id} ativada no plano ${ref.plano}!`);
        }
      } catch (e) {
        console.error('Webhook: Erro ao interpretar external_reference:', e);
      }
    }

    return new Response(JSON.stringify({ status: 'success', payment_status: mpData.status }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Webhook: Erro inesperado:', err);
    return new Response(JSON.stringify({ status: 'error', mensagem: err.message }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
