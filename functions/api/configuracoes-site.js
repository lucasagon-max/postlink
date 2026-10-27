// functions/api/configuracoes-site.js - Cloudflare Pages Function
// Retorna as configurações públicas do site oficial PostLink (Banner, Título, Descrição, Seções, etc.)

const DEFAULT_SUPABASE_URL = 'https://xiicwkagcphvejzycntx.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaWN3a2FnY3BodmVqenljbnR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMjQwOTksImV4cCI6MjEwNjgwMDA5OX0.RyxiEa0aojXvBaJTdIdtk1Sst35-mFDKXb_CTnt7WiA';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function onRequestGet({ env }) {
  const url = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  try {
    const res = await fetch(`${url}/rest/v1/rpc/obter_configuracoes_site`, {
      method: 'POST',
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      throw new Error(`Supabase RPC retornou status ${res.status}`);
    }

    const data = await res.json();

    return new Response(JSON.stringify(data || {}), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=120, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    // Fallback gracioso com valores padrão estruturados para todas as seções
    const fallback = {
      id: 'oficial',
      titulo: 'Transforme ofertas em cartões em alta definição que abrem sozinhos e vendem no WhatsApp',
      descricao: 'Quase ninguém baixa fotos avulsas no WhatsApp para não lotar a memória do celular — e mesmo quem baixa não vai a lugar nenhum ao clicar na foto. Com o PostLink, seu produto já aparece aberto na conversa, sem ocupar a galeria do cliente e direcionando para o seu atendimento com 1 clique.',
      banner_url: null,
      badge_texto: 'Abre direto no WhatsApp · Zero fotos na galeria do cliente',
      cta_texto: 'Começar Grátis',
      cta_url: '/planos/',
      banner_ativo: true,
      preview_titulo: 'Lançamento Especial · Oferta Exclusiva com 1 Clique',
      preview_descricao: 'Compartilhe ofertas no WhatsApp com um cartão visual em alta definição que abre sozinho! 👇',
      preview_subtitulo: 'postlink.com.br/sua-loja ➔ Redireciona para o destino',
      preview_imagem_url: '/assets/img/banner_postlink_og_1200x630.jpg',
      vitrine_fotos: ['/assets/img/ex02.png', '/assets/img/Ex01.png', '/assets/img/logotipo_postlink.jpg'],
      vitrine_badge_desconto: '-33% OFF',
      vitrine_preco_de: '180,00',
      vitrine_preco_por: '119,90',
      vitrine_condicao: 'Em até 3x sem juros ou 5% de desconto no Pix',
      vitrine_titulo: 'Combo Promocional Especial (Pronto para Envio)',
      vitrine_beneficios: ['Envio imediato em até 24 horas', 'Produto original com garantia e suporte'],
      como_funciona_imagem_url: '/assets/img/ex02.png',
      loja_demonstrativa_nome: 'Aura Closet Oficial',
      loja_demonstrativa_avatar: '/assets/img/ex02.png',
      oficial_og_titulo: 'PostLink · Smart Links em Alta Definição para WhatsApp',
      oficial_og_descricao: 'Transforme fotos e ofertas em cartões em alta definição que abrem sozinhos no WhatsApp e aumentam suas vendas.',
      oficial_og_imagem_url: 'https://www.postlink.com.br/assets/img/banner_postlink_og_1200x630.jpg',
      secoes_conteudo: {
        hero: {
          badge: 'Abre direto no WhatsApp · Zero fotos na galeria do cliente',
          titulo: 'Transforme ofertas em cartões em alta definição que abrem sozinhos e vendem no WhatsApp',
          descricao: 'Crie anúncios magnéticos com o apoio de Inteligência Artificial, compartilhe cartões em alta definição que abrem sozinhos no WhatsApp e direcione clientes para sua própria Página Vitrine com fotos, preço promocional e botão de pedido direto.',
          cta_texto: 'Começar Teste de 7 Dias Grátis',
          cta_url: '/planos/'
        },
        dores: {
          titulo: 'Por que enviar fotos de produtos está fazendo você perder clientes todos os dias?',
          subtitulo: 'Você gasta tempo tirando fotos bonitas e montando catálogos, mas a maioria das pessoas nem chega a ver.',
          barreira1_titulo: 'Quase ninguém clica para baixar fotos de lojas',
          barreira1_texto: 'A maioria dos usuários desativa o download automático no WhatsApp para não estourar a internet móvel e não lotar o celular.',
          barreira2_titulo: 'A foto é o fim da conversa (um beco sem saída)',
          barreira2_texto: 'Mesmo quem baixa a foto não vai para lugar nenhum. Clicar na imagem só abre a tela preta do WhatsApp sem link de compra.'
        },
        comparativo: {
          titulo: 'Foto Comum vs Cartão PostLink HD',
          subtitulo: 'Veja a diferença prática entre mandar uma imagem solta e um link inteligente',
          depois_titulo: 'Promoção de Verão',
          depois_texto: 'Toque para pedir.',
          imagem_url: '/assets/img/ex02.png'
        },
        vitrine: {
          secao_titulo: 'Apresente seu produto com autoridade máxima: Conheça a Página Vitrine',
          secao_subtitulo: 'Transforme seu link em uma página de oferta exclusiva, limpa e pensada para converter cada visitante em pedidos fechados diretamente no seu WhatsApp.',
          titulo_produto: 'Combo Promocional Especial (Pronto para Envio)',
          preco_de: '180,00',
          preco_por: '119,90',
          desconto: '-33% OFF',
          condicao: 'Em até 3x sem juros ou 5% OFF no Pix',
          loja_nome: 'Aura Closet Oficial',
          loja_avatar: '/assets/img/ex02.png',
          fotos: ['/assets/img/ex02.png', '/assets/img/Ex01.png', '/assets/img/logotipo_postlink.jpg'],
          beneficios: ['Envio imediato em até 24 horas', 'Produto original com garantia e suporte']
        },
        passos: {
          titulo: 'Como funciona em 3 passos',
          subtitulo: 'Crie links atraentes em menos de 1 minuto sem precisar de designer ou desenvolvedor',
          passo1_titulo: 'Suba a Foto & Crie com IA',
          passo1_desc: 'Adicione a imagem da oferta para gerar o cartão em alta resolução e use nosso Assistente de IA para sugerir títulos chamativos.',
          passo2_titulo: 'Escolha Direto ou Página Vitrine',
          passo2_desc: 'Você decide a experiência do cliente: encaminhe direto para o seu WhatsApp/site ou encante com uma Página Vitrine exclusiva.',
          passo3_titulo: 'Envie e Meça o Funil Real',
          passo3_desc: 'Cole o link nos grupos e conversas. O cartão abre na hora sem salvar arquivos no celular do cliente e você mede os cliques.'
        },
        cta_final: {
          badge: '7 Dias de Teste Gratuito Completo',
          titulo: 'Pronto para transformar fotos estáticas em vendas reais?',
          subtitulo: 'Pare de mandar fotos pesadas que ninguém baixa. Comece seu teste de 7 dias grátis agora mesmo e crie seus primeiros cartões inteligentes clicáveis.',
          btn_texto: 'Criar Link Grátis Agora',
          btn_url: '/planos/'
        }
      },
      fallback: true,
      erro: err.message,
    };

    return new Response(JSON.stringify(fallback), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  }
}
