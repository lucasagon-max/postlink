// functions/api/ia-gerar-copy.js - Cloudflare Pages Function
// Assistente de Inteligência Artificial para Copywriting de PostLinks no WhatsApp
// Suporta Google Gemini Flash (Gratuito), Cloudflare Workers AI e Motor Contextual Resiliente.

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

// Limpa pontuações órfãs e palavras cortadas no final da frase do usuário
function limparTermoFinal(str = '') {
  let s = (str || '').trim();
  let anterior = '';
  while (s !== anterior) {
    anterior = s;
    s = s.replace(/[,;:\-–—\.\s]+$/, '');
    s = s.replace(/\s+(sem|com|de|da|do|e|para|por|em|a|o)$/i, '');
  }
  return s.trim();
}

// Configurações de estilo e variações específicas para cada tom de voz
const DEFINICOES_TOM = {
  amigavel: {
    nome: 'Amigável & Acolhedor',
    estilo: 'Linguagem calorosa, humana, simpática, próxima e atenciosa. Transmite carinho, cuidado artesanal e conversa gostosa de WhatsApp, sem afobação.',
    variacoes: [
      'Acolhedor & Conexão Afetuosa',
      'Convite Simpático & Leveza',
      'Atendimento Próximo & Dica Especial',
    ],
  },
  urgencia: {
    nome: 'Urgência & Escassez',
    estilo: 'Gatilho de tempo curto, lote acabando, poucas unidades e ação imediata. Sem ser apelativo ou falso, focando em oportunidade que vai acabar.',
    variacoes: [
      'Últimas Unidades & Estoque Limitado',
      'Oportunidade Relâmpago',
      'Encerramento Iminente de Lote',
    ],
  },
  desconto: {
    nome: 'Desconto & Economia',
    estilo: 'Foco no valor que o cliente economiza, condições especiais de primeira compra, cupons e custo-benefício que faz valer a pena.',
    variacoes: [
      'Economia Direta & Preço Especial',
      'Cupom & Vantagem de Primeira Compra',
      'Melhor Custo-Benefício do Momento',
    ],
  },
  exclusivo: {
    nome: 'Exclusivo & Premium',
    estilo: 'Sofisticação, qualidade superior, atendimento diferenciado e sensação de produto especial selecionado para quem tem bom gosto.',
    variacoes: [
      'Edição Especial & Selecionada',
      'Atendimento VIP Personalizado',
      'Destaque & Alta Qualidade',
    ],
  },
};

// Gerador contextual inteligente de contingência (respeita 100% o tom escolhido e limpa termos órfãos)
function gerarSugestoesFallback(contexto = '', url = '', tomDesejado = 'urgencia') {
  const limpo = limparTermoFinal(contexto || url || 'Oferta Especial');
  const palavras = limpo.split(/\s+/);
  const primeiroNome = palavras.slice(0, 6).join(' ');
  const slugBase = limparSlug(primeiroNome) || 'oferta-especial';

  if (tomDesejado === 'amigavel') {
    return [
      {
        tom: 'Acolhedor & Conexão Afetuosa',
        titulo: truncar(`🍓 ${primeiroNome} Feito com Amor e Dedicação`, 80),
        descricao: truncar(`Sinta o sabor e o afeto em cada detalhe de ${primeiroNome}. Toque para bater um papo no WhatsApp!`, 200),
        mensagem_whatsapp: `Olá! Fiquei muito interessado em ${primeiroNome}. Como posso fazer meu pedido?`,
        mensagem_compartilhamento: `🍓 *Novidade Especial Feita com Amor!* ✨\n\nOi, tudo bem? Acabamos de preparar uma seleção maravilhosa de *${primeiroNome}*, feita artesanalmente com todo o carinho e cuidado.\n\nFicou com vontade ou quer saber mais detalhes? É só tocar no link abaixo e conversar com a gente direto no WhatsApp:\n👉 {link}\n\nEstamos te esperando com muito carinho! ❤️`,
        slug: truncar(`${slugBase}-afeto`, 30),
      },
      {
        tom: 'Convite Simpático & Leveza',
        titulo: truncar(`✨ Que Tal Provar o Melhor de ${primeiroNome}?`, 80),
        descricao: truncar(`Uma receita pensada pra deixar seu dia mais doce e leve. Conversa com a gente no WhatsApp!`, 200),
        mensagem_whatsapp: `Oii! Vi o anúncio de ${primeiroNome} e achei incrível. Me ajuda a escolher?`,
        mensagem_compartilhamento: `✨ *Momento Doce & Especial para Você!* ☕\n\nOlá! Passando para te contar que nosso(a) *${primeiroNome}* está imperdível hoje! Uma escolha pensada para alegrar o seu dia com toda a leveza.\n\nVeja as opções e garanta o seu aqui:\n👉 {link}\n\nQualquer dúvida, é só nos chamar no WhatsApp! 😊`,
        slug: truncar(`${slugBase}-especial`, 30),
      },
      {
        tom: 'Atendimento Próximo & Dica Especial',
        titulo: truncar(`☕ ${primeiroNome} Perfeito para Você`, 80),
        descricao: truncar(`Qualidade artesanal, carinho e atendimento rápido direto pelo WhatsApp. Garanta já o seu!`, 200),
        mensagem_whatsapp: `Oie, tudo bem? Quero mais detalhes sobre ${primeiroNome}!`,
        mensagem_compartilhamento: `❤️ *Dica Especial do Dia!* 🌟\n\nOie! Se você ama novidades selecionadas, vai adorar o nosso(a) *${primeiroNome}*. Cuidado artesanal em cada pedaço e atendimento com todo amor!\n\nToque no link para conferir agora:\n👉 {link}\n\nPeça direto pelo WhatsApp!`,
        slug: truncar(`${slugBase}-artesanal`, 30),
      },
    ];
  }

  if (tomDesejado === 'desconto') {
    return [
      {
        tom: 'Economia Direta & Preço Especial',
        titulo: truncar(`🔥 Oferta Especial: ${primeiroNome}`, 80),
        descricao: truncar(`Condições imperdíveis por tempo limitado para pedidos direto no WhatsApp. Confira e aproveite! 👇`, 200),
        mensagem_whatsapp: `Olá! Vi a promoção de ${primeiroNome} e quero garantir com o melhor preço.`,
        mensagem_compartilhamento: `🔥 *OFERTA ESPECIAL POR TEMPO LIMITADO!* 🏷️\n\nOi! Conseguimos uma condição imperdível para *${primeiroNome}*! Preço especial reduzido para pedidos confirmados hoje direto pelo WhatsApp.\n\nAproveite antes que o lote promocional encerre:\n👉 {link}\n\nToque no link e garanta o seu desconto agora mesmo!`,
        slug: truncar(`${slugBase}-oferta`, 30),
      },
      {
        tom: 'Cupom & Vantagem de Primeira Compra',
        titulo: truncar(`🏷️ Desconto Exclusivo em ${primeiroNome}`, 80),
        descricao: truncar(`Aproveite nosso cupom especial para economizar no seu pedido de ${primeiroNome}. Peça agora!`, 200),
        mensagem_whatsapp: `Olá! Vi a oferta de ${primeiroNome} e gostaria de aplicar meu cupom de desconto.`,
        mensagem_compartilhamento: `💰 *Vantagem Exclusiva Liberada!* ✨\n\nOlá! Preparamos uma condição com desconto imperdível na sua compra de *${primeiroNome}*. Economia real com atendimento rápido e entrega facilitada!\n\nGaranta sua condição especial agora:\n👉 {link}\n\nCorre para aproveitar enquanto ainda temos vagas no lote!`,
        slug: truncar(`${slugBase}-cupom`, 30),
      },
      {
        tom: 'Melhor Custo-Benefício do Momento',
        titulo: truncar(`💰 O Melhor Preço em ${primeiroNome}`, 80),
        descricao: truncar(`Qualidade superior pelo melhor valor da região com entrega rápida. Peça já pelo WhatsApp!`, 200),
        mensagem_whatsapp: `Olá! Quero aproveitar a condição especial de ${primeiroNome}.`,
        mensagem_compartilhamento: `⚡ *O Melhor Custo-Benefício da Semana!* 🎯\n\nOi, tudo bem? Você não vai querer perder essa promoção especial de *${primeiroNome}*. Qualidade diferenciada pelo melhor valor!\n\nClique no link e faça seu pedido direto pelo WhatsApp:\n👉 {link}`,
        slug: truncar(`${slugBase}-economia`, 30),
      },
    ];
  }

  if (tomDesejado === 'exclusivo') {
    return [
      {
        tom: 'Edição Especial & Selecionada',
        titulo: truncar(`💎 Destaque Selecionado: ${primeiroNome}`, 80),
        descricao: truncar(`Produção selecionada com padrão superior de qualidade e acabamento. Descubra agora!`, 200),
        mensagem_whatsapp: `Olá! Vi o destaque de ${primeiroNome} e gostaria de conhecer as opções disponíveis.`,
        mensagem_compartilhamento: `💎 *Edição Selecionada & Especial!* ✨\n\nOlá! Apresentamos com orgulho o(a) *${primeiroNome}*. Uma linha pensada para quem valoriza qualidade superior, sofisticação e padrão impecável em cada detalhe.\n\nConheça e faça sua reserva exclusiva aqui:\n👉 {link}\n\nAtendimento prioritário e personalizado no WhatsApp.`,
        slug: truncar(`${slugBase}-vip`, 30),
      },
      {
        tom: 'Atendimento VIP Personalizado',
        titulo: truncar(`👑 Atendimento Exclusivo para ${primeiroNome}`, 80),
        descricao: truncar(`Tire todas as suas dúvidas com nosso time especialista no WhatsApp e receba suporte premium.`, 200),
        mensagem_whatsapp: `Olá! Gostaria de um atendimento personalizado sobre ${primeiroNome}.`,
        mensagem_compartilhamento: `👑 *Experiência VIP & Destaque Especial!* 🌟\n\nOlá! Convidamos você a conhecer o diferencial de *${primeiroNome}*. Produção diferenciada com padrão artesanal incomparável.\n\nToque no link abaixo para conhecer em detalhes:\n👉 {link}\n\nAtendimento consultivo direto pelo WhatsApp.`,
        slug: truncar(`${slugBase}-premium`, 30),
      },
      {
        tom: 'Destaque & Alta Qualidade',
        titulo: truncar(`🌟 O Mais Pedido: ${primeiroNome}`, 80),
        descricao: truncar(`A preferência de quem busca autenticidade e sabor inigualável. Peça direto no WhatsApp!`, 200),
        mensagem_whatsapp: `Olá! Quero conhecer mais sobre a linha exclusiva de ${primeiroNome}.`,
        mensagem_compartilhamento: `🌟 *A Linha Mais Pedida da Nossa Loja!* 💎\n\nOlá! Descubra por que *${primeiroNome}* é a escolha favorita dos nossos clientes mais exigentes.\n\nReserve o seu pelo link oficial:\n👉 {link}\n\nEsperamos seu contato!`,
        slug: truncar(`${slugBase}-destaque`, 30),
      },
    ];
  }

  // Padrão: Urgência
  return [
    {
      tom: 'Últimas Unidades & Estoque Limitado',
      titulo: truncar(`⚡ Últimas Unidades: ${primeiroNome}`, 80),
      descricao: truncar(`Poucas peças em estoque com envio rápido. Toque para garantir antes que encerre o lote! 👇`, 200),
      mensagem_whatsapp: `Olá! Vi o anúncio de ${primeiroNome} e quero garantir antes que esgote o lote!`,
      mensagem_compartilhamento: `⚡ *ÚLTIMAS UNIDADES EM ESTOQUE!* 🚨\n\nOi! O nosso lote de *${primeiroNome}* está se esgotando rapidamente e restam pouquíssimas unidades com envio prioritário hoje!\n\nNão fique sem. Toque no link abaixo e garanta o seu antes que encerre o estoque:\n👉 {link}\n\nAtendimento imediato pelo WhatsApp!`,
      slug: truncar(`${slugBase}-urgente`, 30),
    },
    {
      tom: 'Oportunidade Relâmpago',
      titulo: truncar(`⏰ Oferta Relâmpago de ${primeiroNome}`, 80),
      descricao: truncar(`Condições ativas somente enquanto durar o lote atual. Não fique de fora, peça agora!`, 200),
      mensagem_whatsapp: `Olá! Quero aproveitar a oportunidade relâmpago de ${primeiroNome}.`,
      mensagem_compartilhamento: `⏰ *Oportunidade Relâmpago Ativa!* 🔥\n\nOlá! Condições especiais para *${primeiroNome}* válidas somente enquanto durarem as unidades disponíveis deste lote.\n\nClique no link agora para não perder:\n👉 {link}\n\nGaranta o seu direto pelo WhatsApp!`,
      slug: truncar(`${slugBase}-relampago`, 30),
    },
    {
      tom: 'Encerramento Iminente de Lote',
      titulo: truncar(`🚨 Quase Esgotado: ${primeiroNome}`, 80),
      descricao: truncar(`Lote promocional encerrando hoje. Toque no link e garanta o seu com prioridade no envio.`, 200),
      mensagem_whatsapp: `Olá! Vi que o lote de ${primeiroNome} está acabando e quero fechar o meu pedido.`,
      mensagem_compartilhamento: `🚨 *Lote Quase Esgotado!* ⚠️\n\nOi! Atenção: restam poucos pedidos para encerrarmos o lote especial de *${primeiroNome}*.\n\nGaranta sua unidade com envio prioritário pelo link:\n👉 {link}\n\nChame no WhatsApp agora antes que acabe!`,
      slug: truncar(`${slugBase}-final`, 30),
    },
  ];
}

// Chamada à API do Google Gemini com cascata estável de modelos
async function gerarComGemini(apiKey, promptSistema, promptUsuario) {
  // Cascata prioritária com modelos de alta disponibilidade e baixa taxa de 503
  const modelos = [
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.6-flash',
    'gemini-3.8-flash',
  ];
  let ultimoErro = null;

  for (const modelo of modelos) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout por modelo para agilidade

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
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
          },
        }),
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const erroTexto = await res.text().catch(() => '');
        throw new Error(`Gemini (${modelo}) status ${res.status}: ${erroTexto.slice(0, 100)}`);
      }

      const data = await res.json();
      const textoGerado = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textoGerado) {
        throw new Error(`Nenhum texto retornado pelo modelo ${modelo}`);
      }

      let textoLimpo = (textoGerado || '').trim();
      if (textoLimpo.startsWith('```')) {
        textoLimpo = textoLimpo.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(textoLimpo);
      const lista = Array.isArray(parsed) ? parsed : (parsed.opcoes || parsed.sugestoes || [parsed]);
      if (Array.isArray(lista) && lista.length > 0) {
        return { opcoes: lista, modelo };
      }
      throw new Error(`Estrutura JSON inválida recebida de ${modelo}`);
    } catch (err) {
      clearTimeout(timeoutId);
      ultimoErro = err;
      console.warn(`[PostLink IA] Modelo ${modelo} não respondeu: ${err.message}`);
    }
  }

  throw ultimoErro || new Error('Nenhum modelo da cascata Gemini pôde responder no momento');
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
      tipo_acao = 'sugestoes_completas',
      tom = 'amigavel',
    } = body;

    const textoBase = limparTermoFinal(contexto || url_destino || '');
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
        console.warn('[PostLink IA] Falha silenciosa ao checar cota no Supabase:', errSupabase);
      }
    }

    // 2. Construção do Prompt Especializado com o Tom de Voz Escolhido
    const configTom = DEFINICOES_TOM[tom] || DEFINICOES_TOM.amigavel;

    const promptSistema = `Você é o redator de elite do PostLink, o gerador de links inteligentes em alta definição para WhatsApp e redes sociais mais eficiente do Brasil.
Sua missão é criar 3 opções irresistíveis de copywriting para cartões de pré-visualização (Open Graph) no WhatsApp que maximizam cliques e vendas para lojistas e empreendedores brasileiros.

O LOJISTA ESCOLHEU O TOM DE VOZ: "${configTom.nome}".
DIRETRIZ DE ESTILO: ${configTom.estilo}

REGRAS RÍGIDAS DE FORMATAÇÃO E COPYWRITING:
1. TÍTULO DO CARTÃO (Máximo 80 caracteres):
   - NUNCA copie a frase crua fornecida pelo lojista.
   - NUNCA deixe frases truncadas ou pontuações soltas no final (como vírgulas ou palavras incompletas).
   - Transforme o produto em um título comercial altamente atrativo, natural e polido, perfeito para visualização no WhatsApp.
   - Use no máximo 1 emoji no início se for relevante.

2. DESCRIÇÃO DO CARTÃO (Máximo 200 caracteres):
   - Persuasiva, fluida e com gatilhos de engajamento no tom "${configTom.nome}".
   - Instigue o leitor a clicar para continuar a conversa no WhatsApp.
   - Máximo de 1 a 2 emojis de forma equilibrada.

3. MENSAGEM WHATSAPP INICIAL (Máximo 140 caracteres):
   - A mensagem pronta que o cliente enviará ao abrir a conversa no WhatsApp da loja.
   - Deve soar natural, espontânea e já iniciar o atendimento com simpatia.
   - Pode conter a tag opcional {cupom} se for relevante.

4. MENSAGEM DE COMPARTILHAMENTO / DIVULGAÇÃO (Máximo 1.000 caracteres, recomendado entre 180 e 450 caracteres):
   - É o texto de anúncio persuasivo e completo que o lojista vai disparar ou colar no WhatsApp, grupos, status ou redes sociais convidando as pessoas a acessarem o link.
   - Estruture com parágrafos bem espaçados, emojis elegantes e chamada para ação (CTA) envolvente.
   - OBRIGATÓRIO incluir a tag {link} onde a URL do PostLink deve ser inserida (ex: "👉 Confira aqui: {link}").
   - Escreva no tom "${configTom.nome}".

5. SLUG AMIGÁVEL (Entre 4 e 25 caracteres):
   - Apenas letras minúsculas, números e hífens (ex: geleia-morango-artesanal).

6. RETORNE 3 VARIAÇÕES DISTINTAS DENTRO DO TOM "${configTom.nome}":
   - Opção 1: "${configTom.variacoes[0]}"
   - Opção 2: "${configTom.variacoes[1]}"
   - Opção 3: "${configTom.variacoes[2]}"

Retorne EXCLUSIVAMENTE um objeto JSON no formato:
{
  "opcoes": [
    {
      "tom": "${configTom.variacoes[0]}",
      "titulo": "...",
      "descricao": "...",
      "mensagem_whatsapp": "...",
      "mensagem_compartilhamento": "...",
      "slug": "..."
    },
    {
      "tom": "${configTom.variacoes[1]}",
      "titulo": "...",
      "descricao": "...",
      "mensagem_whatsapp": "...",
      "mensagem_compartilhamento": "...",
      "slug": "..."
    },
    {
      "tom": "${configTom.variacoes[2]}",
      "titulo": "...",
      "descricao": "...",
      "mensagem_whatsapp": "...",
      "mensagem_compartilhamento": "...",
      "slug": "..."
    }
  ]
}`;

    const promptUsuario = `Produto / Oferta divulgada: "${textoBase}"
Tom solicitado pelo lojista: "${configTom.nome}"
Ação solicitada: "${tipo_acao}"`;

    let sugestoes = null;
    let provedorUtilizado = 'fallback';

    // 3. Tentativa 1: Google Gemini (com chave do Cloudflare Pages env)
    const geminiKey = env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const resultadoGemini = await gerarComGemini(geminiKey, promptSistema, promptUsuario);
        if (resultadoGemini && Array.isArray(resultadoGemini.opcoes) && resultadoGemini.opcoes.length > 0) {
          sugestoes = resultadoGemini.opcoes;
          provedorUtilizado = resultadoGemini.modelo;
        }
      } catch (errGemini) {
        console.warn('[PostLink IA] Falha em todos os modelos Gemini:', errGemini.message);
      }
    }

    // 4. Tentativa 2: Cloudflare Workers AI (se presente)
    if (!sugestoes && env.AI) {
      try {
        const rawWorkersAI = await gerarComWorkersAI(env.AI, promptSistema, promptUsuario);
        if (Array.isArray(rawWorkersAI) && rawWorkersAI.length > 0) {
          sugestoes = rawWorkersAI;
          provedorUtilizado = 'cloudflare-workers-ai';
        }
      } catch (errWorkers) {
        console.warn('[PostLink IA] Workers AI falhou:', errWorkers.message);
      }
    }

    // 5. Tentativa 3: Motor Contextual Resiliente (Especializado no tom escolhido)
    if (!sugestoes || sugestoes.length === 0) {
      sugestoes = gerarSugestoesFallback(contexto, url_destino, tom);
      provedorUtilizado = 'motor-contextual-postlink';
    }

    // Sanitiza e valida comprimentos de caracteres finais para garantir integridade
    const sugestoesSanitizadas = sugestoes.slice(0, 3).map((item, idx) => {
      let msgComp = (item.mensagem_compartilhamento || item.mensagem_divulgacao || '').trim();
      if (!msgComp) {
        msgComp = `${item.titulo || textoBase}\n\n${item.descricao || 'Toque no link abaixo para conferir os detalhes completos e pedir direto no WhatsApp:'}\n👉 {link}`;
      }
      if (msgComp.length > 1000) {
        msgComp = msgComp.slice(0, 999).trim();
      }

      return {
        id: idx + 1,
        tom: item.tom || configTom.variacoes[idx] || `Opção ${idx + 1}`,
        titulo: truncar(item.titulo || item.title || textoBase, 80),
        descricao: truncar(item.descricao || item.description || 'Toque para conferir a oferta completa no WhatsApp!', 200),
        mensagem_whatsapp: (item.mensagem_whatsapp || item.whatsapp_message || `Olá! Quero mais informações sobre ${textoBase}.`).slice(0, 150),
        mensagem_compartilhamento: msgComp,
        slug: limparSlug(item.slug || `oferta-${idx + 1}`),
      };
    });

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
