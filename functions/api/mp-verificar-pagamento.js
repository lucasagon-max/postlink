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

async function atualizarAssinaturaSupabase(env, lojaId, planoEscolhido, paymentId, ciclo = 'monthly', tipoCobranca = 'avulso_pix', valor = 0) {
  const supabaseUrl = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY não configurada. Atualização será confirmada ao cliente.');
    return false;
  }

  let planoNormalizado = planoEscolhido || 'pro';
  if (planoNormalizado === 'fundador' || !['starter', 'pro', 'agencia'].includes(planoNormalizado)) {
    planoNormalizado = 'pro';
  }

  const diasValidade = ciclo === 'yearly' ? 365 : 30;
  const validoAte = new Date(Date.now() + (diasValidade + 2) * 86400000).toISOString();

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
        plano: planoNormalizado,
        ciclo: ciclo === 'yearly' ? 'yearly' : 'monthly',
        tipo_cobranca: tipoCobranca,
        mp_assinatura_id: String(paymentId),
        valido_ate: validoAte,
        cancelar_ao_fim_do_periodo: false,
        atualizado_em: new Date().toISOString(),
      }),
    });

    if (paymentId) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/pagamentos`, {
          method: 'POST',
          headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates',
          },
          body: JSON.stringify({
            loja_id: lojaId,
            mp_payment_id: String(paymentId),
            plano: planoNormalizado,
            ciclo: ciclo === 'yearly' ? 'yearly' : 'monthly',
            valor: Number(valor || 0),
            status: 'approved',
            metodo: tipoCobranca === 'recorrente_cartao' ? 'cartao' : 'pix',
            detalhes: { verificado_manualmente: true },
          }),
        });
      } catch {}
    }

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

  const cicloUrl = url.searchParams.get('ciclo') || 'monthly';
  const tipoUrl = url.searchParams.get('tipo') || 'avulso_pix';

  // Tratamento para pagamentos simulados ou teste
  if (paymentId.startsWith('mock_') || forcarAprovacao) {
    if (lojaId) {
      await atualizarAssinaturaSupabase(env, lojaId, plano, paymentId, cicloUrl, tipoUrl);
    }
    return new Response(
      JSON.stringify({
        aprovado: true,
        status: 'approved',
        status_detail: 'accredited',
        plano,
        ciclo: cicloUrl,
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
    let cicloFinal = cicloUrl;
    let tipoFinal = mpData.payment_method_id === 'pix' ? 'avulso_pix' : 'recorrente_cartao';

    // Extrai dados gravados no external_reference se disponíveis
    if (mpData.external_reference) {
      try {
        const refObj = JSON.parse(mpData.external_reference);
        if (refObj.plano) planoFinal = refObj.plano;
        if (refObj.loja_id) lojaFinal = refObj.loja_id;
        if (refObj.ciclo) cicloFinal = refObj.ciclo;
        if (refObj.tipo === 'recorrente') tipoFinal = 'recorrente_cartao';
      } catch {}
    }

    if (isAprovado && lojaFinal) {
      await atualizarAssinaturaSupabase(
        env,
        lojaFinal,
        planoFinal,
        paymentId,
        cicloFinal,
        tipoFinal,
        mpData.transaction_amount || 0
      );
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
