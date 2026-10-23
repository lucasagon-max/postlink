// functions/api/upload-imagem.js - Gerenciador de Armazenamento de Imagens do PostLink
// Suporta armazenamento de alta performance com entrega via CDN e compatibilidade retroativa.

const DEFAULT_SUPABASE_URL = 'https://xiicwkagcphvejzycntx.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaWN3a2FnY3BodmVqenljbnR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMjQwOTksImV4cCI6MjEwNjgwMDA5OX0.RyxiEa0aojXvBaJTdIdtk1Sst35-mFDKXb_CTnt7WiA';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-File-Name, X-File-Path',
};

function resposta(dados, status = 200) {
  return new Response(JSON.stringify(dados), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// Valida o token JWT do usuário no Supabase
async function autenticarUsuario(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  const sbUrl = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const sbKey = env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  try {
    const res = await fetch(`${sbUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: sbKey,
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function obterBucketR2(env) {
  return env.R2_BANNERS || env.R2_STORAGE || env.BUCKET_BANNERS || env.R2 || null;
}

// POST /api/upload-imagem
export async function onRequestPost(context) {
  const { request, env } = context;

  // 1. Autenticação obrigatória
  const usuario = await autenticarUsuario(request, env);
  if (!usuario || !usuario.id) {
    return resposta({ sucesso: false, erro: 'Acesso não autorizado' }, 401);
  }

  const contentType = request.headers.get('Content-Type') || 'image/jpeg';
  const urlObj = new URL(request.url);
  const caminhoCustom = request.headers.get('X-File-Path') || urlObj.searchParams.get('caminho');
  const nomeOriginal = request.headers.get('X-File-Name') || urlObj.searchParams.get('nome') || 'imagem.webp';

  // Sanitização e isolamento seguro por usuário
  const extensao = contentType.includes('webp') ? 'webp' : contentType.includes('png') ? 'png' : 'jpg';
  const timestamp = Date.now();
  const sufixoAleatorio = Math.random().toString(36).slice(2, 8);
  const nomeArquivo = `${timestamp}_${sufixoAleatorio}.${extensao}`;

  let caminhoFinal;
  if (caminhoCustom) {
    // Garante que o caminho pertença à pasta do próprio usuário autenticado
    const caminhoLimpo = caminhoCustom.replace(/^\/+/, '');
    if (caminhoLimpo.startsWith(`${usuario.id}/`) || caminhoLimpo.startsWith(`lojistas/${usuario.id}/`)) {
      caminhoFinal = caminhoLimpo;
    } else {
      caminhoFinal = `lojistas/${usuario.id}/${nomeArquivo}`;
    }
  } else {
    caminhoFinal = `lojistas/${usuario.id}/${nomeArquivo}`;
  }

  const corpoArrayBuffer = await request.arrayBuffer();
  if (!corpoArrayBuffer || corpoArrayBuffer.byteLength === 0) {
    return resposta({ sucesso: false, erro: 'Arquivo vazio ou inválido' }, 400);
  }

  const bucketR2 = obterBucketR2(env);

  // 2. Gravação de alta performance se o bucket estiver configurado
  if (bucketR2) {
    try {
      await bucketR2.put(caminhoFinal, corpoArrayBuffer, {
        httpMetadata: {
          contentType,
          cacheControl: 'public, max-age=31536000, immutable',
        },
        customMetadata: {
          usuario_id: usuario.id,
          nome_original: nomeOriginal,
          enviado_em: new Date().toISOString(),
        },
      });

      return resposta({
        sucesso: true,
        caminho: caminhoFinal,
        url: `/imagens/${caminhoFinal}`,
      });
    } catch (err) {
      // Se falhar no armazenamento primário, prossegue para o fallback seguro
    }
  }

  // 3. Fallback seguro caso o armazenamento primário ainda não tenha sido conectado no painel
  try {
    const sbUrl = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const sbKey = env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
    const authHeader = request.headers.get('Authorization') || `Bearer ${sbKey}`;

    const resSb = await fetch(`${sbUrl}/storage/v1/object/banners/${caminhoFinal}`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        apikey: sbKey,
        'Content-Type': contentType,
        'x-upsert': 'true',
      },
      body: corpoArrayBuffer,
    });

    if (!resSb.ok) {
      const errTexto = await resSb.text();
      return resposta({ sucesso: false, erro: 'Falha no processamento da imagem', detalhe: errTexto }, resSb.status);
    }

    return resposta({
      sucesso: true,
      caminho: caminhoFinal,
      url: `${sbUrl}/storage/v1/object/public/banners/${caminhoFinal}`,
    });
  } catch (e) {
    return resposta({ sucesso: false, erro: 'Erro interno ao salvar arquivo' }, 500);
  }
}

// DELETE /api/upload-imagem?caminho=...
export async function onRequestDelete(context) {
  const { request, env } = context;

  const usuario = await autenticarUsuario(request, env);
  if (!usuario || !usuario.id) {
    return resposta({ sucesso: false, erro: 'Acesso não autorizado' }, 401);
  }

  const urlObj = new URL(request.url);
  const caminho = urlObj.searchParams.get('caminho');
  if (!caminho) {
    return resposta({ sucesso: false, erro: 'Caminho do arquivo não fornecido' }, 400);
  }

  const caminhoLimpo = caminho.replace(/^\/+/, '');

  // Validação estrita: lojista só pode apagar imagens dentro da sua própria pasta
  const pertenceAoUsuario =
    caminhoLimpo.startsWith(`${usuario.id}/`) ||
    caminhoLimpo.startsWith(`lojistas/${usuario.id}/`);

  if (!pertenceAoUsuario) {
    return resposta({ sucesso: false, erro: 'Permissão negada para excluir este arquivo' }, 403);
  }

  const bucketR2 = obterBucketR2(env);
  if (bucketR2) {
    try {
      await bucketR2.delete(caminhoLimpo);
    } catch (_) {}
  }

  // Tenta remover também do armazenamento legado
  try {
    const sbUrl = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const sbKey = env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
    const authHeader = request.headers.get('Authorization') || `Bearer ${sbKey}`;

    await fetch(`${sbUrl}/storage/v1/object/banners`, {
      method: 'DELETE',
      headers: {
        Authorization: authHeader,
        apikey: sbKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prefixes: [caminhoLimpo] }),
    });
  } catch (_) {}

  return resposta({ sucesso: true, mensagem: 'Imagem removida com sucesso' });
}

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return onRequestOptions(context);
  if (context.request.method === 'POST') return onRequestPost(context);
  if (context.request.method === 'DELETE') return onRequestDelete(context);
  return resposta({ erro: 'Método não permitido' }, 405);
}
