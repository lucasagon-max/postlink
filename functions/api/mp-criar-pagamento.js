// functions/api/mp-criar-pagamento.js - Cloudflare Pages Function
// Criação de pagamento (PIX ou Cartão) no Mercado Pago com ativação instantânea

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const TABELA_PRECOS = {
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

    const { loja_id, email, nome, plano = 'pro', ciclo = 'monthly', metodo = 'pix' } = body;

    if (!loja_id) {
      return new Response(JSON.stringify({ erro: 'ID da loja obrigatório' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const planoConfig = TABELA_PRECOS[plano] || TABELA_PRECOS.pro;
    const valor = ciclo === 'yearly' ? planoConfig.yearly : planoConfig.monthly;
    const mpAccessToken = env.MP_ACCESS_TOKEN;

    // Se o token do Mercado Pago não estiver configurado nas variáveis de ambiente,
    // retornamos um payload simulado funcional para teste imediato de UI
    if (!mpAccessToken) {
      const mockId = 'mock_pix_' + Date.now();
      const mockQrCode = '00020126580014br.gov.bcb.pix0136mock-postlink-chave-pix-teste520400005303986540' + valor.toFixed(2) + '5802BR5916PostLink Pagamento6009Sao Paulo62070503***6304MOCK';
      
      // QR Code SVG simples em data URI para visualização instantânea
      const mockQrBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      return new Response(
        JSON.stringify({
          sucesso: true,
          simulado: true,
          aviso: 'Variável MP_ACCESS_TOKEN não configurada no Cloudflare Pages. Modo de simulação ativado.',
          payment_id: mockId,
          plano,
          ciclo,
          valor,
          qr_code: mockQrCode,
          qr_code_base64: mockQrBase64,
          expira_em: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        }),
        {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      );
    }

    // Integração Real com a API do Mercado Pago
    if (metodo === 'pix') {
      const expirationDate = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mpAccessToken}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': `postlink_${loja_id}_${plano}_${Date.now()}`,
        },
        body: JSON.stringify({
          transaction_amount: valor,
          description: `PostLink - Plano ${planoConfig.nome} (${ciclo === 'yearly' ? 'Anual' : 'Mensal'})`,
          payment_method_id: 'pix',
          payer: {
            email: email || 'cliente@postlink.app',
            first_name: nome || 'Lojista',
          },
          external_reference: JSON.stringify({
            loja_id,
            plano,
            ciclo,
          }),
          date_of_expiration: expirationDate,
        }),
      });

      const mpData = await mpResponse.json();

      if (!mpResponse.ok) {
        return new Response(
          JSON.stringify({
            erro: 'Falha ao gerar PIX no Mercado Pago',
            detalhes: mpData.message || mpData,
          }),
          {
            status: mpResponse.status,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          }
        );
      }

      const txData = mpData.point_of_interaction?.transaction_data || {};

      return new Response(
        JSON.stringify({
          sucesso: true,
          simulado: false,
          payment_id: String(mpData.id),
          status: mpData.status,
          plano,
          ciclo,
          valor,
          qr_code: txData.qr_code || '',
          qr_code_base64: txData.qr_code_base64 || '',
          ticket_url: txData.ticket_url || '',
          expira_em: mpData.date_of_expiration,
        }),
        {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      );
    } else {
      // Criação de Preferência para Cartão de Crédito / Checkout Transparente
      const preferenceResponse = await fetch('https://api.mercadopago.com/checkout/v1/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mpAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              title: `PostLink - Plano ${planoConfig.nome} (${ciclo === 'yearly' ? 'Anual' : 'Mensal'})`,
              quantity: 1,
              currency_id: 'BRL',
              unit_price: valor,
            },
          ],
          payer: {
            email: email || 'cliente@postlink.app',
            name: nome || 'Lojista',
          },
          external_reference: JSON.stringify({
            loja_id,
            plano,
            ciclo,
          }),
          back_urls: {
            success: `${new URL(request.url).origin}/painel/#/conta?pagamento=sucesso`,
            pending: `${new URL(request.url).origin}/painel/#/conta?pagamento=pendente`,
            failure: `${new URL(request.url).origin}/painel/#/plano?pagamento=erro`,
          },
          auto_return: 'approved',
        }),
      });

      const prefData = await preferenceResponse.json();

      if (!preferenceResponse.ok) {
        return new Response(
          JSON.stringify({
            erro: 'Falha ao criar preferência de cartão no Mercado Pago',
            detalhes: prefData.message || prefData,
          }),
          {
            status: preferenceResponse.status,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          sucesso: true,
          simulado: false,
          metodo: 'cartao',
          preference_id: prefData.id,
          init_point: prefData.init_point,
          sandbox_init_point: prefData.sandbox_init_point,
        }),
        {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ erro: 'Erro interno ao processar pagamento', mensagem: err.message }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }
}
