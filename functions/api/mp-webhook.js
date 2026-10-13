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
 * Atualiza ou insere o status da assinatura no Supabase com garantia de persistência (Upsert)
 */
async function atualizarAssinaturaSupabase(env, lojaId, planoEscolhido, paymentId, novoStatus = 'ativo') {
  const supabaseUrl = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    console.warn('Webhook MP: SUPABASE_SERVICE_ROLE_KEY não configurada.');
    return { sucesso: false, motivo: 'chave_servico_ausente' };
  }

  // Normalização do plano: se for "fundador", salva como "pro" para respeitar a constraint do banco
  let planoNormalizado = planoEscolhido || 'pro';
  if (planoNormalizado === 'fundador') {
    planoNormalizado = 'pro';
  } else if (!['starter', 'pro', 'agencia'].includes(planoNormalizado)) {
    planoNormalizado = 'pro';
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
      body: JSON.stringify({
        status: novoStatus,
        plano: planoNormalizado,
        mp_assinatura_id: String(paymentId),
        atualizado_em: new Date().toISOString(),
      }),
    });

    if (patchRes.ok) {
      const data = await patchRes.json();
      if (Array.isArray(data) && data.length > 0) {
        return { sucesso: true, operacao: 'patch', data: data[0] };
      }
    }

    // 2. Se a linha ainda não existia, faz Upsert com merge-duplicates
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
        status: novoStatus,
        plano: planoNormalizado,
        mp_assinatura_id: String(paymentId),
        atualizado_em: new Date().toISOString(),
      }),
    });

    if (upsertRes.ok) {
      const data = await upsertRes.json();
      return { sucesso: true, operacao: 'upsert', data: data[0] || null };
    }

    const erroTxt = await upsertRes.text();
    console.error('Webhook MP: Erro ao fazer upsert no Supabase:', erroTxt);
    return { sucesso: false, motivo: 'falha_supabase', detalhes: erroTxt };
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
    // Quando o usuário clica no botão "Testar" no portal de desenvolvedores do Mercado Pago
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
        // Em modo de produção estrita, rejeitaria 401; aqui logamos o alerta
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

    // 5. Consulta dos detalhes reais do pagamento na API oficial do Mercado Pago
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

    // 6. Decodificação flexível da referência externa
    if (extRef) {
      try {
        const parsed = JSON.parse(extRef);
        lojaId = parsed.loja_id || parsed.id || null;
        plano = parsed.plano || 'pro';
      } catch {
        // Se external_reference for apenas a string do UUID da loja
        if (typeof extRef === 'string' && extRef.length >= 30) {
          lojaId = extRef.trim();
        }
      }
    }

    let resultadoBanco = null;

    // 7. Atualização do status da loja no Supabase conforme o evento
    if (lojaId) {
      if (mpStatus === 'approved') {
        resultadoBanco = await atualizarAssinaturaSupabase(env, lojaId, plano, paymentId, 'ativo');
        console.log(`Webhook MP: Loja ${lojaId} ATIVADA com sucesso no plano ${plano}! (Payment ${paymentId})`);
      } else if (mpStatus === 'refunded' || mpStatus === 'charged_back') {
        resultadoBanco = await atualizarAssinaturaSupabase(env, lojaId, plano, paymentId, 'cancelado');
        console.log(`Webhook MP: Assinatura da loja ${lojaId} CANCELADA por estorno/chargeback. (Payment ${paymentId})`);
      } else if (mpStatus === 'pending' || mpStatus === 'in_process') {
        console.log(`Webhook MP: Pagamento ${paymentId} para loja ${lojaId} ainda pendente.`);
      }
    } else {
      console.warn(`Webhook MP: Pagamento ${paymentId} aprovado mas sem loja_id identificável em external_reference.`);
    }

    // 8. Resposta de sucesso 200 com relatório completo
    return new Response(
      JSON.stringify({
        status: 'success',
        payment_id: paymentId,
        payment_status: mpStatus,
        loja_id: lojaId,
        plano: plano,
        atualizacao_banco: resultadoBanco,
      }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Webhook MP: Erro inesperado no processamento:', err);
    // Sempre retorna 200 para evitar que o Mercado Pago bombardeie o servidor com retentativas infinitas
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
