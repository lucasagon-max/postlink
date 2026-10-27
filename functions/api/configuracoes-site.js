// functions/api/configuracoes-site.js - Cloudflare Pages Function
// Retorna as configurações públicas do site oficial PostLink (Banner, Título, Descrição, etc.)

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
    // Fallback gracioso com valores padrão
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
      como_funciona_imagem_url: null,
      loja_demonstrativa_nome: 'Sua Loja Oficial',
      loja_demonstrativa_avatar: '/apple-touch-icon.png',
      oficial_og_titulo: 'PostLink · Smart Links em Alta Definição para WhatsApp',
      oficial_og_descricao: 'Transforme fotos e ofertas em cartões em alta definição que abrem sozinhos no WhatsApp e aumentam suas vendas.',
      oficial_og_imagem_url: 'https://www.postlink.com.br/assets/img/banner_postlink_og_1200x630.jpg',
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
