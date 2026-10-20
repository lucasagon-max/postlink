// functions/api/mp-processar-cartao.js - Cloudflare Pages Function
// Processamento transparente de Cartão de Crédito com o SDK do Mercado Pago

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const TABELA_PRECOS = {
  fundador: {
    monthly: 19.90,
    yearly: 199.00,
    nome: 'Fundador VIP (Pré-Venda)',
  },
  starter: {
    monthly: 14.90,
    yearly: 118.80,
    nome: 'Básico (Starter)',
  },
  pro: {
    monthly: 29.90,
    yearly: 262.80,
    nome: 'Pro (Negócio)',
  },
  agencia: {
    monthly: 69.90,
    yearly: 598.80,
    nome: 'Agência (Escala)',
  },
};

const DEFAULT_SUPABASE_URL = 'https://xiicwkagcphvejzycntx.supabase.co';

async function atualizarAssinaturaSupabase(env, lojaId, planoEscolhido, paymentId, preapprovalId = null, ciclo = 'monthly', tipoCobranca = 'recorrente_cartao', valor = 0) {
  const supabaseUrl = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY não configurada. Atualização será confirmada ao cliente.');
    return false;
  }

  // Normaliza plano
  let planoNormalizado = planoEscolhido || 'pro';
  if (planoNormalizado === 'fundador' || !['starter', 'pro', 'agencia'].includes(planoNormalizado)) {
    planoNormalizado = 'pro';
  }

  const diasValidade = ciclo === 'yearly' ? 365 : 30;
  const validoAte = new Date(Date.now() + (diasValidade + 2) * 86400000).toISOString();

  try {
    const payloadAssinatura = {
      status: 'ativo',
      plano: planoNormalizado,
      ciclo: ciclo === 'yearly' ? 'yearly' : 'monthly',
      tipo_cobranca: tipoCobranca,
      mp_assinatura_id: String(paymentId),
      valido_ate: validoAte,
      cancelar_ao_fim_do_periodo: false,
      atualizado_em: new Date().toISOString(),
    };

    if (preapprovalId) {
      payloadAssinatura.mp_preapproval_id = String(preapprovalId);
    }

    const res = await fetch(`${supabaseUrl}/rest/v1/assinaturas?loja_id=eq.${lojaId}`, {
      method: 'PATCH',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadAssinatura),
    });

    // Inserção do histórico de auditoria em pagamentos
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
            metodo: 'cartao',
            detalhes: {
              tipo_cobranca: tipoCobranca,
              preapproval_id: preapprovalId,
            },
          }),
        });
      } catch (errPag) {
        console.warn('Erro ao inserir auditoria em pagamentos:', errPag);
      }
    }

    return res.ok;
  } catch (err) {
    console.error('Erro ao atualizar assinatura no Supabase:', err);
    return false;
  }
}

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

    const {
      token,
      issuer_id,
      payment_method_id,
      installments = 1,
      payer = {},
      loja_id,
      plano = 'pro',
      ciclo = 'monthly',
    } = body;

    if (!token) {
      return new Response(JSON.stringify({ erro: 'Token do cartão não fornecido' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    if (!loja_id) {
      return new Response(JSON.stringify({ erro: 'ID da loja obrigatório' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const planoConfig = TABELA_PRECOS[plano] || TABELA_PRECOS.pro;
    const valor = ciclo === 'yearly' ? planoConfig.yearly : planoConfig.monthly;
    const mpAccessToken = env.MP_ACCESS_TOKEN;

    if (!mpAccessToken) {
      return new Response(
        JSON.stringify({ erro: 'MP_ACCESS_TOKEN não configurado no Cloudflare Pages' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Tenta criar Assinatura Recorrente Direta com o Token do Cartão (Preapproval)
    try {
      const preapprovalRes = await fetch('https://api.mercadopago.com/preapproval', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mpAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payer_email: payer.email || 'cliente@postlink.app',
          card_token_id: token,
          reason: `PostLink - Assinatura ${planoConfig.nome} (${ciclo === 'yearly' ? 'Anual' : 'Mensal'})`,
          external_reference: JSON.stringify({
            loja_id,
            plano,
            ciclo,
            tipo: 'recorrente',
          }),
          auto_recurring: {
            frequency: 1,
            frequency_type: ciclo === 'yearly' ? 'years' : 'months',
            transaction_amount: Number(valor),
            currency_id: 'BRL',
          },
          status: 'authorized',
        }),
      });

      const preData = await preapprovalRes.json();

      if (preapprovalRes.ok && preData.id && preData.status === 'authorized') {
        await atualizarAssinaturaSupabase(
          env,
          loja_id,
          plano,
          preData.id,
          preData.id,
          ciclo,
          'recorrente_cartao',
          valor
        );

        return new Response(
          JSON.stringify({
            sucesso: true,
            aprovado: true,
            status: 'approved',
            status_detail: 'accredited',
            tipo: 'recorrente',
            preapproval_id: String(preData.id),
            plano,
            ciclo,
            mensagem: 'Assinatura mensal automática ativada com sucesso!',
          }),
          {
            status: 200,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          }
        );
      }
      console.warn('Preapproval com card_token_id não aprovado diretamente, acionando /v1/payments:', preData);
    } catch (errPre) {
      console.warn('Erro ao tentar preapproval via token:', errPre);
    }

    // 2. Cobrança de Ativação via API oficial de pagamentos do Mercado Pago com o token do cartão
    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `card_${loja_id}_${plano}_${Date.now()}`,
      },
      body: JSON.stringify({
        token,
        issuer_id,
        payment_method_id,
        transaction_amount: Number(valor),
        installments: Number(installments),
        description: `PostLink - Assinatura ${planoConfig.nome} (${ciclo === 'yearly' ? 'Anual' : 'Mensal'})`,
        payer: {
          email: payer.email || 'cliente@postlink.app',
          identification: payer.identification || undefined,
        },
        external_reference: JSON.stringify({
          loja_id,
          plano,
          ciclo,
          tipo: 'recorrente',
        }),
        notification_url: `${new URL(request.url).origin}/api/mp-webhook`,
      }),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      return new Response(
        JSON.stringify({
          erro: 'Falha ao processar cartão no Mercado Pago',
          detalhes: mpData.message || mpData,
          status_http: mpResponse.status,
        }),
        {
          status: mpResponse.status,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      );
    }

    const isAprovado = mpData.status === 'approved';

    if (isAprovado && loja_id) {
      await atualizarAssinaturaSupabase(
        env,
        loja_id,
        plano,
        mpData.id,
        null,
        ciclo,
        'recorrente_cartao',
        valor
      );
    }

    return new Response(
      JSON.stringify({
        sucesso: true,
        aprovado: isAprovado,
        status: mpData.status,
        status_detail: mpData.status_detail,
        payment_id: String(mpData.id),
        plano,
        ciclo,
      }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ erro: 'Erro interno ao processar cartão', mensagem: err.message }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }
}
