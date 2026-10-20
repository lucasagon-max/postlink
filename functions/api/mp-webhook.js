// functions/api/mp-webhook.js - Cloudflare Pages Function
// Receptor Oficial de Webhooks e Notificações IPN do Mercado Pago em Produção

const DEFAULT_SUPABASE_URL = 'https://xiicwkagcphvejzycntx.supabase.co';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-signature, x-request-id',
};

/**
 * Validação criptográfica de integridade de Webhook do Mercado Pago (HMAC-SHA256)
 * Baseado na documentação oficial: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
 */
async function validarAssinaturaMercadoPago(request, secret, dataId) {
  if (!secret) return { valido: true, motivo: 'secret_nao_configurado' };

  const xSignature = request.headers.get('x-signature');
  const xRequestId = request.headers.get('x-request-id');

  if (!xSignature) {
    return { valido: false, motivo: 'cabecalho_x_signature_ausente' };
  }

  // Extrai ts e v1 de "ts=1700000000,v1=abcdef..."
  const partes = {};
  xSignature.split(',').forEach(p => {
    const [k, v] = p.split('=');
    if (k && v) partes[k.trim()] = v.trim();
  });

  const ts = partes['ts'];
  const hashRecebido = partes['v1'];

  if (!ts || !hashRecebido) {
    return { valido: false, motivo: 'formato_x_signature_invalido' };
  }

  try {
    // Template oficial de manifesto: id:[data.id];request-id:[x-request-id];ts:[ts];
    const manifest = `id:${dataId || ''};request-id:${xRequestId || ''};ts:${ts};`;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(manifest));
    const hashCalculado = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const valido = hashCalculado === hashRecebido;
    return { valido, hashCalculado, hashRecebido, motivo: valido ? 'ok' : 'divergencia_hash' };
  } catch (err) {
    return { valido: false, motivo: 'erro_criptografia', erro: err.message };
  }
}

/**
 * Atualiza ou insere o status da assinatura no Supabase com garantia de persistência e validade de ciclo
 */
async function atualizarAssinaturaSupabase(env, lojaId, planoEscolhido, paymentId, novoStatus = 'ativo', opts = {}) {
  const supabaseUrl = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    console.warn('Webhook MP: SUPABASE_SERVICE_ROLE_KEY não configurada.');
    return { sucesso: false, motivo: 'chave_servico_ausente' };
  }

  // Normalização do plano: se for "fundador", salva como "pro" para respeitar a constraint do banco
  let planoNormalizado = planoEscolhido || 'pro';
  if (planoNormalizado === 'fundador' || !['starter', 'pro', 'agencia'].includes(planoNormalizado)) {
    planoNormalizado = 'pro';
  }

  const ciclo = opts.ciclo === 'yearly' ? 'yearly' : 'monthly';
  const tipoCobranca = opts.tipoCobranca || 'avulso_pix';
  const preapprovalId = opts.preapprovalId ? String(opts.preapprovalId) : null;
  const proximaCobranca = opts.proximaCobranca || null;

  let validoAte = opts.validoAte;
  if (!validoAte && novoStatus === 'ativo') {
    const diasValidade = ciclo === 'yearly' ? 365 : 30;
    validoAte = new Date(Date.now() + (diasValidade + 2) * 86400000).toISOString();
  }

  const payloadAssinatura = {
    status: novoStatus,
    plano: planoNormalizado,
    ciclo: ciclo,
    tipo_cobranca: tipoCobranca,
    atualizado_em: new Date().toISOString(),
  };

  if (paymentId) payloadAssinatura.mp_assinatura_id = String(paymentId);
  if (preapprovalId) payloadAssinatura.mp_preapproval_id = preapprovalId;
  if (validoAte) payloadAssinatura.valido_ate = validoAte;
  if (proximaCobranca) payloadAssinatura.proxima_cobranca = proximaCobranca;
  if (opts.cancelarAoFimDoPeriodo !== undefined) {
    payloadAssinatura.cancelar_ao_fim_do_periodo = Boolean(opts.cancelarAoFimDoPeriodo);
  }

  try {
    // 1. Tenta atualizar a linha existente da loja
    const patchRes = await fetch(`${supabaseUrl}/rest/v1/assinaturas?loja_id=eq.${lojaId}`, {
      method: 'PATCH',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(payloadAssinatura),
    });

    let registroAssinatura = null;
    if (patchRes.ok) {
      const data = await patchRes.json();
      if (Array.isArray(data) && data.length > 0) {
        registroAssinatura = data[0];
      }
    }

    // 2. Se a linha ainda não existia, faz Upsert com merge-duplicates
    if (!registroAssinatura) {
      const upsertRes = await fetch(`${supabaseUrl}/rest/v1/assinaturas`, {
        method: 'POST',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify({
          loja_id: lojaId,
          ...payloadAssinatura,
        }),
      });

      if (upsertRes.ok) {
        const data = await upsertRes.json();
        registroAssinatura = data[0] || null;
      }
    }

    // 3. Registra auditoria na tabela de pagamentos
    if (paymentId && opts.valor !== undefined) {
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
            ciclo: ciclo,
            valor: Number(opts.valor || 0),
            status: novoStatus === 'ativo' ? 'approved' : novoStatus,
            metodo: opts.metodo || 'pix',
            detalhes: opts.detalhes || null,
          }),
        });
      } catch (errAudit) {
        console.warn('Webhook MP: Falha ao inserir auditoria de pagamentos:', errAudit);
      }
    }

    return { sucesso: true, data: registroAssinatura };
  } catch (err) {
    console.error('Webhook MP: Exceção ao atualizar assinatura:', err);
    return { sucesso: false, motivo: 'excecao', erro: err.message };
  }
}

/**
 * Handler genérico de compatibilidade para Cloudflare Pages
 */
export async function onRequest(context) {
  const method = context.request.method.toUpperCase();
  if (method === 'OPTIONS') return onRequestOptions(context);
  if (method === 'GET') return onRequestGet(context);
  if (method === 'POST') return onRequestPost(context);
  return new Response('Método não permitido', { status: 405, headers: CORS_HEADERS });
}

/**
 * OPTIONS para suporte a preflight CORS
 */
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * GET para checagem diagnóstica e testes de liveness da rota de webhook
 */
export async function onRequestGet({ env }) {
  return new Response(
    JSON.stringify({
      status: 'online',
      servico: 'PostLink Mercado Pago Webhook Receptor',
      timestamp: new Date().toISOString(),
      diagnostico_ambiente: {
        MP_ACCESS_TOKEN_configurado: Boolean(env.MP_ACCESS_TOKEN),
        MP_WEBHOOK_SECRET_configurado: Boolean(env.MP_WEBHOOK_SECRET),
        SUPABASE_SERVICE_ROLE_KEY_configurada: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
        SUPABASE_URL_configurada: Boolean(env.SUPABASE_URL || DEFAULT_SUPABASE_URL),
      },
      instrucoes: 'Envie notificações POST do Mercado Pago para esta URL.',
    }),
    {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    }
  );
}

/**
 * POST oficial do Webhook / IPN
 */
export async function onRequestPost({ request, env }) {
  try {
    const url = new URL(request.url);

    // 1. Extração do Payment ID ou Resource
    let paymentId = url.searchParams.get('data.id') || url.searchParams.get('id');
    let topic = url.searchParams.get('topic') || url.searchParams.get('type');

    let body = {};
    try {
      body = await request.json();
      if (!paymentId && body.data?.id) paymentId = String(body.data.id);
      if (!paymentId && body.id) paymentId = String(body.id);
      if (!topic && (body.type || body.action)) topic = body.type || body.action;
    } catch {
      // Body vazio ou não-JSON (alguns IPNs antigos do MP enviam form-encoded)
    }

    // 2. Validação de URL de Teste do Mercado Pago
    if (!paymentId || paymentId === '123456' || topic === 'test.created') {
      console.log('Webhook MP: Teste de conectividade recebido com sucesso do painel do Mercado Pago.');
      return new Response(
        JSON.stringify({
          status: 'success',
          mensagem: 'Conexão validada com sucesso pelo PostLink. Webhook operacional.',
          recebido: { paymentId, topic },
        }),
        {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      );
    }

    // 3. Validação de Assinatura se Segredo estiver configurado
    const secret = env.MP_WEBHOOK_SECRET;
    if (secret) {
      const checagemAssinatura = await validarAssinaturaMercadoPago(request, secret, paymentId);
      if (!checagemAssinatura.valido) {
        console.warn('Webhook MP: Assinatura inválida detectada:', checagemAssinatura.motivo);
      }
    }

    // 4. Checagem do Token do Mercado Pago
    const mpAccessToken = env.MP_ACCESS_TOKEN;
    if (!mpAccessToken) {
      console.warn('Webhook MP: MP_ACCESS_TOKEN ausente. Retornando 200 para não enfileirar retentativas.');
      return new Response(
        JSON.stringify({
          status: 'ignored',
          motivo: 'MP_ACCESS_TOKEN_nao_configurado',
          payment_id: paymentId,
        }),
        {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      );
    }

    // 5. Tratamento de Assinaturas Recorrentes (Subscription Preapproval)
    const isPreapprovalTopic = topic && (
      topic.includes('subscription_preapproval') ||
      topic.includes('preapproval') ||
      topic === 'subscription_authorized'
    );

    if (isPreapprovalTopic) {
      const preRes = await fetch(`https://api.mercadopago.com/preapproval/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${mpAccessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (preRes.ok) {
        const preData = await preRes.json();
        let lojaId = null;
        let plano = 'pro';
        let ciclo = 'monthly';

        if (preData.external_reference) {
          try {
            const parsed = JSON.parse(preData.external_reference);
            lojaId = parsed.loja_id || parsed.id || null;
            plano = parsed.plano || 'pro';
            ciclo = parsed.ciclo || 'monthly';
          } catch {
            if (typeof preData.external_reference === 'string' && preData.external_reference.length >= 30) {
              lojaId = preData.external_reference.trim();
            }
          }
        }

        if (lojaId) {
          let resultado = null;
          if (preData.status === 'authorized') {
            resultado = await atualizarAssinaturaSupabase(env, lojaId, plano, paymentId, 'ativo', {
              ciclo,
              tipoCobranca: 'recorrente_cartao',
              preapprovalId: paymentId,
              validoAte: preData.next_payment_date || null,
              proximaCobranca: preData.next_payment_date || null,
              cancelarAoFimDoPeriodo: false,
              valor: preData.auto_recurring?.transaction_amount || 0,
              metodo: 'cartao',
            });
            console.log(`Webhook MP: Assinatura recorrente ${paymentId} autorizada com sucesso para loja ${lojaId}!`);
          } else if (preData.status === 'cancelled') {
            resultado = await atualizarAssinaturaSupabase(env, lojaId, plano, paymentId, 'ativo', {
              cancelarAoFimDoPeriodo: true,
            });
            console.log(`Webhook MP: Assinatura recorrente ${paymentId} cancelada no gateway para loja ${lojaId}.`);
          } else if (preData.status === 'paused') {
            resultado = await atualizarAssinaturaSupabase(env, lojaId, plano, paymentId, 'atrasado', {
              ciclo,
              tipoCobranca: 'recorrente_cartao',
            });
          }

          return new Response(
            JSON.stringify({
              status: 'success',
              tipo: 'preapproval',
              preapproval_id: paymentId,
              preapproval_status: preData.status,
              loja_id: lojaId,
              atualizacao_banco: resultado,
            }),
            {
              status: 200,
              headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            }
          );
        }
      }
    }

    // 6. Consulta dos detalhes reais do pagamento (PIX ou fatura de cartão) na API oficial do Mercado Pago
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!mpRes.ok) {
      const errDetail = await mpRes.text();
      console.warn(`Webhook MP: Pagamento ${paymentId} não pôde ser consultado na API do MP:`, errDetail);
      return new Response(
        JSON.stringify({
          status: 'ok',
          aviso: 'Pagamento não localizado na API do Mercado Pago',
          detalhes_http: mpRes.status,
        }),
        {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      );
    }

    const mpData = await mpRes.json();
    const mpStatus = mpData.status; // 'approved', 'pending', 'in_process', 'rejected', 'refunded', 'charged_back'
    const extRef = mpData.external_reference;

    let lojaId = null;
    let plano = 'pro';
    let ciclo = 'monthly';
    let tipoCobranca = mpData.payment_method_id === 'pix' ? 'avulso_pix' : 'recorrente_cartao';

    // 7. Decodificação flexível da referência externa
    if (extRef) {
      try {
        const parsed = JSON.parse(extRef);
        lojaId = parsed.loja_id || parsed.id || null;
        plano = parsed.plano || 'pro';
        ciclo = parsed.ciclo || 'monthly';
        if (parsed.tipo === 'recorrente') tipoCobranca = 'recorrente_cartao';
      } catch {
        if (typeof extRef === 'string' && extRef.length >= 30) {
          lojaId = extRef.trim();
        }
      }
    }

    let resultadoBanco = null;

    // 8. Atualização do status da loja no Supabase conforme o evento
    if (lojaId) {
      if (mpStatus === 'approved') {
        resultadoBanco = await atualizarAssinaturaSupabase(env, lojaId, plano, paymentId, 'ativo', {
          ciclo,
          tipoCobranca,
          valor: mpData.transaction_amount || 0,
          metodo: mpData.payment_method_id === 'pix' ? 'pix' : 'cartao',
          detalhes: {
            status_detail: mpData.status_detail,
            payment_type_id: mpData.payment_type_id,
          },
        });
        console.log(`Webhook MP: Loja ${lojaId} ATIVADA com sucesso no plano ${plano} (${ciclo})! (Payment ${paymentId})`);
      } else if (mpStatus === 'refunded' || mpStatus === 'charged_back') {
        resultadoBanco = await atualizarAssinaturaSupabase(env, lojaId, plano, paymentId, 'cancelado', {
          ciclo,
          tipoCobranca,
        });
        console.log(`Webhook MP: Assinatura da loja ${lojaId} CANCELADA por estorno/chargeback. (Payment ${paymentId})`);
      } else if (mpStatus === 'pending' || mpStatus === 'in_process') {
        console.log(`Webhook MP: Pagamento ${paymentId} para loja ${lojaId} ainda pendente.`);
      }
    } else {
      console.warn(`Webhook MP: Pagamento ${paymentId} aprovado mas sem loja_id identificável em external_reference.`);
    }

    // 9. Resposta de sucesso 200 com relatório completo
    return new Response(
      JSON.stringify({
        status: 'success',
        payment_id: paymentId,
        payment_status: mpStatus,
        loja_id: lojaId,
        plano: plano,
        ciclo: ciclo,
        atualizacao_banco: resultadoBanco,
      }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Webhook MP: Erro inesperado no processamento:', err);
    return new Response(
      JSON.stringify({
        status: 'error_handled',
        mensagem: err.message,
      }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }
}
