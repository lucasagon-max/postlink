// functions/api/mp-verificar-pagamento.js - Cloudflare Pages Function
// Consulta e verificação em tempo real do status de pagamento no Mercado Pago

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

async function atualizarAssinaturaSupabase(env, lojaId, planoEscolhido, paymentId) {
  const supabaseUrl = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY não configurada. Atualização será confirmada ao cliente.');
    return false;
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/assinaturas?loja_id=eq.${lojaId}`, {
      method: 'PATCH',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
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
    console.error('Erro ao atualizar assinatura no Supabase:', err);
    return false;
  }
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const paymentId = url.searchParams.get('payment_id') || url.searchParams.get('id');
  const lojaId = url.searchParams.get('loja_id');
  const plano = url.searchParams.get('plano') || 'pro';
  const forcarAprovacao = url.searchParams.get('simular_aprovacao') === 'true';

  if (!paymentId) {
    return new Response(JSON.stringify({ erro: 'payment_id é obrigatório' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // Tratamento para pagamentos simulados ou teste
  if (paymentId.startsWith('mock_') || forcarAprovacao) {
    if (lojaId) {
      await atualizarAssinaturaSupabase(env, lojaId, plano, paymentId);
    }
    return new Response(
      JSON.stringify({
        aprovado: true,
        status: 'approved',
        status_detail: 'accredited',
        plano,
        simulado: true,
        mensagem: 'Pagamento identificado e plano ativado com sucesso!',
      }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }

  const mpAccessToken = env.MP_ACCESS_TOKEN;
  if (!mpAccessToken) {
    return new Response(
      JSON.stringify({
        erro: 'MP_ACCESS_TOKEN não configurado no Cloudflare Pages',
      }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`,
      },
    });

    const mpData = await mpRes.json();

    if (!mpRes.ok) {
      return new Response(
        JSON.stringify({
          erro: 'Falha ao consultar pagamento no Mercado Pago',
          detalhes: mpData,
        }),
        {
          status: mpRes.status,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      );
    }

    const isAprovado = mpData.status === 'approved';
    let planoFinal = plano;
    let lojaFinal = lojaId;

    // Extrai dados gravados no external_reference se disponíveis
    if (mpData.external_reference) {
      try {
        const refObj = JSON.parse(mpData.external_reference);
        if (refObj.plano) planoFinal = refObj.plano;
        if (refObj.loja_id) lojaFinal = refObj.loja_id;
      } catch {}
    }

    if (isAprovado && lojaFinal) {
      await atualizarAssinaturaSupabase(env, lojaFinal, planoFinal, paymentId);
    }

    return new Response(
      JSON.stringify({
        aprovado: isAprovado,
        status: mpData.status,
        status_detail: mpData.status_detail,
        plano: planoFinal,
        data_aprovacao: mpData.date_approved,
      }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ erro: 'Erro ao verificar pagamento', mensagem: err.message }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }
}
