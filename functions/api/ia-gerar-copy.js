// functions/api/ia-gerar-copy.js - Cloudflare Pages Function
// Assistente de Inteligência Artificial para Copywriting de PostLinks no WhatsApp
// Suporta Google Gemini 1.5 Flash (Gratuito), Cloudflare Workers AI e Fallback Contextual Resiliente.

const DEFAULT_SUPABASE_URL = 'https://xiicwkagcphvejzycntx.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaWN3a2FnY3BodmVqenljbnR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMjQwOTksImV4cCI6MjEwNjgwMDA5OX0.RyxiEa0aojXvBaJTdIdtk1Sst35-mFDKXb_CTnt7WiA';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return onRequestOptions(context);
  if (context.request.method === 'POST') return onRequestPost(context);
  return onRequestGet(context);
}

// Limpa e normaliza slug gerado
function limparSlug(v = '') {
  return v
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30);
}

// Corta texto com elipse se exceder o limite
function truncar(str = '', max = 80) {
  const s = (str || '').trim().replace(/\s+/g, ' ');
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trim() + '…';
}

// Gerador contextual inteligente de fallback para casos sem chave configurada ou falha temporária
function gerarSugestoesFallback(contexto = '', url = '', tomDesejado = 'urgencia') {
  const limpo = (contexto || url || 'Oferta Especial').trim();
  const primeiroNome = limpo.split(/\s+/).slice(0, 5).join(' ');
  const slugBase = limparSlug(primeiroNome) || 'oferta-especial';

  return [
    {
      tom: 'Urgência & Escassez',
      titulo: truncar(`⚡ Últimas Unidades: ${primeiroNome}`, 80),
      descricao: truncar(`Poucas peças em estoque com envio rápido. Toque para garantir antes que encerre o lote! 👇`, 200),
      mensagem_whatsapp: `Olá! Vi o anúncio de ${primeiroNome} no link e quero garantir meu pedido antes que esgote!`,
      slug: truncar(`${slugBase}-urgente`, 30),
    },
    {
      tom: 'Desconto & Preço Baixo',
      titulo: truncar(`🔥 Oferta Imperdível: ${primeiroNome}`, 80),
      descricao: truncar(`Condições especiais por tempo limitado para pedidos direto no WhatsApp. Confira e aproveite! 👇`, 200),
      mensagem_whatsapp: `Olá! Vi a promoção especial de ${primeiroNome} e quero aproveitar o desconto {cupom}.`,
      slug: truncar(`${slugBase}-desconto`, 30),
    },
    {
      tom: 'Exclusivo & Destaque',
      titulo: truncar(`💎 Destaque da Semana: ${primeiroNome}`, 80),
      descricao: truncar(`Qualidade garantida, atendimento ágil e pronta entrega. Peça o seu direto pelo WhatsApp!`, 200),
      mensagem_whatsapp: `Olá! Gostei muito de ${primeiroNome} e gostaria de ver mais fotos e formas de pagamento.`,
      slug: truncar(`${slugBase}-vip`, 30),
    },
  ];
}

// Chamada à API do Google Gemini (Plano 100% Gratuito - Google AI Studio)
async function gerarComGemini(apiKey, promptSistema, promptUsuario) {
  const modelos = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite'];
  let ultimoErro = null;

  for (const modelo of modelos) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000); // 9s timeout

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: `${promptSistema}\n\nEntrada do Lojista:\n${promptUsuario}` },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
            responseMimeType: 'application/json',
          },
        }),
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const erroTexto = await res.text().catch(() => '');
        throw new Error(`Gemini (${modelo}) respondeu com status ${res.status}: ${erroTexto.slice(0, 150)}`);
      }

      const data = await res.json();
      const textoGerado = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textoGerado) {
        throw new Error(`Nenhum texto retornado pelo modelo ${modelo}`);
      }

      const parsed = JSON.parse(textoGerado);
      return Array.isArray(parsed) ? parsed : (parsed.opcoes || parsed.sugestoes || [parsed]);
    } catch (err) {
      clearTimeout(timeoutId);
      ultimoErro = err;
      console.warn(`Tentativa com ${modelo} falhou:`, err.message);
    }
  }

  throw ultimoErro || new Error('Todos os modelos Gemini falharam');
}

// Chamada alternativa ao Cloudflare Workers AI (se binding env.AI estiver presente)
async function gerarComWorkersAI(aiBinding, promptSistema, promptUsuario) {
  if (!aiBinding || typeof aiBinding.run !== 'function') return null;

  const messages = [
    { role: 'system', content: promptSistema },
    { role: 'user', content: promptUsuario },
  ];

  const resultado = await aiBinding.run('@cf/meta/llama-3-8b-instruct', {
    messages,
    max_tokens: 800,
    temperature: 0.7,
  });

  if (resultado && resultado.response) {
    try {
      const match = resultado.response.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        return Array.isArray(parsed) ? parsed : (parsed.opcoes || parsed.sugestoes || [parsed]);
      }
    } catch {
      // Ignora falha de parse no fallback
    }
  }
  return null;
}

export async function onRequestPost({ request, env }) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ sucesso: false, erro: 'Corpo da requisição deve ser JSON válido' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const {
      loja_id,
      contexto = '',
      url_destino = '',
      tipo_acao = 'sugestoes_completas', // 'sugestoes_completas' | 'melhorar_titulo' | 'melhorar_descricao' | 'melhorar_mensagem'
      tom = 'urgencia',
    } = body;

    const textoBase = (contexto || url_destino || '').trim();
    if (!textoBase) {
      return new Response(JSON.stringify({ sucesso: false, erro: 'Informe o que você está divulgando ou o link de destino' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // 1. Verificação e Incremento de Cotas no Supabase (se loja_id for fornecido)
    const sbUrl = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const sbKey = env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
    let quotaInfo = { permitido: true, restantes_hoje: 40, limite_total: 40 };

    if (loja_id) {
      try {
        const resRpc = await fetch(`${sbUrl}/rest/v1/rpc/verificar_e_incrementar_ia`, {
          method: 'POST',
          headers: {
            apikey: sbKey,
            authorization: `Bearer ${sbKey}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({ p_loja_id: loja_id }),
        });

        if (resRpc.ok) {
          const rpcData = await resRpc.json();
          if (rpcData && rpcData.permitido === false) {
            return new Response(JSON.stringify({
              sucesso: false,
              limite_atingido: true,
              erro: rpcData.erro || 'Você atingiu o limite diário de uso de Inteligência Artificial para o seu plano.',
              restantes_hoje: 0,
              limite_diario: rpcData.limite_total || 40,
            }), {
              status: 429,
              headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            });
          }
          if (rpcData) {
            quotaInfo = {
              permitido: true,
              restantes_hoje: rpcData.restantes_hoje,
              limite_total: rpcData.limite_total,
            };
          }
        }
      } catch (errSupabase) {
        console.warn('Falha silenciosa ao checar cota no Supabase:', errSupabase);
      }
    }

    // 2. Construção do Prompt Especializado em Copywriting de WhatsApp
    const promptSistema = `Você é o redator de elite do PostLink, o gerador de links inteligentes em alta definição para WhatsApp e redes sociais mais eficiente do Brasil.
Sua missão é criar copies de alta conversão para cartões de pré-visualização (Open Graph) no WhatsApp que maximizam cliques e vendas para lojistas e empreendedores brasileiros.

REGRAS RÍGIDAS DE FORMATAÇÃO:
1. TÍTULO: Deve ter NO MÁXIMO 80 caracteres. Direto, claro, com benefício ou gatilho irresistível (escassez, desconto, exclusividade).
2. DESCRIÇÃO: Deve ter NO MÁXIMO 200 caracteres. Persuasiva, gerando curiosidade e convidando o visitante para tocar/abrir. Use 1 ou 2 emojis no máximo de maneira elegante.
3. MENSAGEM WHATSAPP: A mensagem pronta e natural que o cliente envia ao tocar no link (pode usar tags opcionais como {cupom} ou {origem}).
4. SLUG: Entre 4 e 25 caracteres, apenas letras minúsculas sem acento, números e hífens.
5. RETORNE EXCLUSIVAMENTE um objeto JSON no formato:
{
  "opcoes": [
    {
      "tom": "Urgência & Escassez",
      "titulo": "...",
      "descricao": "...",
      "mensagem_whatsapp": "...",
      "slug": "..."
    },
    {
      "tom": "Desconto & Oferta",
      "titulo": "...",
      "descricao": "...",
      "mensagem_whatsapp": "...",
      "slug": "..."
    },
    {
      "tom": "Exclusivo & Destaque",
      "titulo": "...",
      "descricao": "...",
      "mensagem_whatsapp": "...",
      "slug": "..."
    }
  ]
}`;

    const promptUsuario = `Produto / Oferta divulgada: "${textoBase}"
Tom prioritário solicitado pelo lojista: "${tom}"
Tipo de ação: "${tipo_acao}"`;

    let sugestoes = null;
    let provedorUtilizado = 'fallback';

    // 3. Tentativa 1: Google Gemini 1.5 Flash (Gratuito e de Altíssima Fluência em PT-BR)
    const geminiKey = env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const rawGemini = await gerarComGemini(geminiKey, promptSistema, promptUsuario);
        if (Array.isArray(rawGemini) && rawGemini.length > 0) {
          sugestoes = rawGemini;
          provedorUtilizado = 'gemini-1.5-flash';
        }
      } catch (errGemini) {
        console.warn('Gemini falhou, tentando fallback:', errGemini.message);
      }
    }

    // 4. Tentativa 2: Cloudflare Workers AI (se configurado na Cloudflare)
    if (!sugestoes && env.AI) {
      try {
        const rawWorkersAI = await gerarComWorkersAI(env.AI, promptSistema, promptUsuario);
        if (Array.isArray(rawWorkersAI) && rawWorkersAI.length > 0) {
          sugestoes = rawWorkersAI;
          provedorUtilizado = 'cloudflare-workers-ai';
        }
      } catch (errWorkers) {
        console.warn('Workers AI falhou:', errWorkers.message);
      }
    }

    // 5. Tentativa 3: Motor Contextual Resiliente (Garante entrega imediata mesmo sem API configurada)
    if (!sugestoes || sugestoes.length === 0) {
      sugestoes = gerarSugestoesFallback(contexto, url_destino, tom);
      provedorUtilizado = 'motor-contextual-postlink';
    }

    // Sanitiza e valida comprimentos de caracteres finais para garantir que nenhum exceda a régua
    const sugestoesSanitizadas = sugestoes.slice(0, 3).map((item, idx) => ({
      id: idx + 1,
      tom: item.tom || (idx === 0 ? 'Urgência & Escassez' : idx === 1 ? 'Desconto & Oferta' : 'Exclusivo & Destaque'),
      titulo: truncar(item.titulo || item.title || textoBase, 80),
      descricao: truncar(item.descricao || item.description || 'Toque para conferir a oferta completa no WhatsApp!', 200),
      mensagem_whatsapp: (item.mensagem_whatsapp || item.whatsapp_message || `Olá! Quero mais informações sobre ${textoBase}.`).slice(0, 150),
      slug: limparSlug(item.slug || `oferta-${idx + 1}`),
    }));

    return new Response(JSON.stringify({
      sucesso: true,
      provedor: provedorUtilizado,
      sugestoes: sugestoesSanitizadas,
      restantes_hoje: quotaInfo.restantes_hoje,
      limite_diario: quotaInfo.limite_total,
    }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (erroGeral) {
    return new Response(JSON.stringify({
      sucesso: false,
      erro: erroGeral.message || 'Erro inesperado ao gerar sugestões com IA',
    }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestGet(context) {
  // Rota GET para consultar saldo de cota do lojista
  const url = new URL(context.request.url);
  const lojaId = url.searchParams.get('loja_id');

  if (!lojaId) {
    return new Response(JSON.stringify({ sucesso: false, erro: 'loja_id é obrigatório' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const sbUrl = context.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const sbKey = context.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  try {
    const resRpc = await fetch(`${sbUrl}/rest/v1/rpc/obter_status_ia`, {
      method: 'POST',
      headers: {
        apikey: sbKey,
        authorization: `Bearer ${sbKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ p_loja_id: lojaId }),
    });

    const data = await resRpc.json();
    return new Response(JSON.stringify({ sucesso: true, ...data }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({
      sucesso: true,
      limite_diario: 40,
      requisicoes_hoje: 0,
      restantes_hoje: 40,
      fallback: true,
    }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
}
