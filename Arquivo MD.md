# PostLink: instruções de desenvolvimento

Versão 1 · 5 de outubro de 2026

Este arquivo reúne o que foi definido na conversa em um guia técnico para construir o MVP. Ele parte do protótipo que você já tem (gerador de links da Morangos Tatuí) e o transforma em um produto multiusuário.

## 0. Premissas (leia primeiro)

- **Modelo de negócio:** pago, com teste curto (duração a definir). Sem plano grátis permanente e sem anúncios.
- **Produto:** imagem mais destino livre. Sem microsite. Quem toca no cartão passa por uma tela de transição rápida (menos de 1 segundo) com botão **Abrir** de reserva.
- **Stack:** Jamstack, JavaScript puro (Vanilla JS), Tailwind CSS e Supabase (Postgres, Auth e Storage).
- **Rota pública no edge do provedor de hospedagem** (sugestão: Cloudflare Pages com Pages Functions; Vercel e Netlify servem igualmente). Motivo: a rota precisa devolver HTML com tags Open Graph, e as Edge Functions do Supabase, no domínio padrão, não servem HTML renderizado. Confira a documentação atual antes de decidir.
- **Nome e domínio ainda não validados.** Há produtos chamados PostLink (veja o documento de definição). Neste arquivo, `{DOMINIO}` é um espaço reservado, e nada no código deve depender do nome da marca.
- **Todos os números** (limites, tamanhos, dias, preços) são pontos de partida para ajustar.
- **Confira limites, preços e comportamento de cada serviço na documentação oficial** antes de depender deles. Este guia não substitui essa checagem.

## 1. Escopo do MVP

**Dentro**

- Cadastro e login do lojista.
- Criar, editar, desativar e listar links (imagem e destino obrigatórios; título, descrição, apelido e validade opcionais).
- Preview ao vivo do cartão do WhatsApp na tela de criação.
- Rota pública que separa robô de pessoa, serve o preview e redireciona.
- Contagem de cliques e lista de links com cliques.
- Validade da oferta ("oferta encerrada").
- Assinatura com teste, cobrança e bloqueio de criação quando a assinatura não estiver ativa.
- Anti-abuso básico, denúncia, termos de uso e política de privacidade.

**Fora do MVP:** QR code, modelos de banner, domínio próprio do lojista, vários usuários por loja, API pública, app nativo.

## 2. Arquitetura

```
Lojista (navegador) --> Painel estático (/painel) --> Supabase Auth / Postgres (RLS) / Storage
                                                         ^
WhatsApp, Instagram (robô) --+                           | RPC com chave anon
Pessoa (toque no link) ------+--> Edge do provedor: /{loja}/{slug}
                                    |- robô   -> HTML mínimo com tags Open Graph
                                    '- pessoa -> registra clique + tela de transição -> destino

Mercado Pago --> webhook (edge) --> tabela assinaturas (chave de serviço, só no servidor)
```

| Componente | Responsabilidade |
|---|---|
| Painel estático | Login, criar e gerenciar links, ver cliques. Fala com o Supabase com a chave pública (anon) e regras de acesso (RLS). |
| Rota pública `/{loja}/{slug}` | Única parte que precisa rodar no servidor. Lê dados públicos por RPC e responde ao robô ou à pessoa. |
| Supabase Postgres | Dados, regras de acesso, limites e funções. |
| Supabase Storage | Imagens dos banners (bucket público para leitura). |
| Webhook de cobrança | Atualiza o status da assinatura. É o único lugar que usa a chave de serviço. |

## 3. Estrutura do repositório

```
postlink/
├─ public/
│  ├─ painel/            index.html, app.js (rotas por hash: #/novo, #/editar/ID)
│  ├─ login/             index.html
│  ├─ termos/            index.html
│  ├─ privacidade/       index.html
│  └─ assets/            css (Tailwind compilado), ícones
├─ functions/
│  ├─ [loja]/[slug].js   rota pública (robô x pessoa)
│  └─ api/mp-webhook.js  webhook de cobrança
├─ supabase/
│  └─ migrations/        0001_schema.sql, 0002_rls.sql, 0003_funcoes.sql, 0004_storage.sql
├─ _routes.json          quais caminhos invocam as Functions
└─ README.md
```

Use rotas por hash no painel (`#/novo`) para não depender de regras de reescrita no servidor.

**Palavras reservadas:** `painel`, `login`, `api`, `assets`, `admin`, `termos`, `privacidade`, `c`, `static`. Nenhuma loja pode usar esses apelidos, e eles devem ficar fora da rota dinâmica (veja `_routes.json` na seção 10).

## 4. Banco de dados

Rode em migrações separadas e versionadas.

### 4.1 Tabelas

```sql
create extension if not exists pgcrypto;

create table public.lojas (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null check (char_length(nome) between 2 and 60),
  slug text not null unique
    check (slug ~ '^[a-z0-9][a-z0-9-]{1,29}$')
    check (slug not in ('painel','login','api','assets','admin','termos','privacidade','c','static')),
  criado_em timestamptz not null default now()
);

-- Status e teste ficam em tabela própria: o lojista só pode ler, nunca alterar.
create table public.assinaturas (
  loja_id uuid primary key references public.lojas(id) on delete cascade,
  status text not null default 'trial'
    check (status in ('trial','ativo','atrasado','expirado','cancelado','suspenso')),
  trial_ate timestamptz not null default now() + interval '7 days', -- duração a definir
  mp_assinatura_id text,
  atualizado_em timestamptz not null default now()
);

create table public.links (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references public.lojas(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9][a-z0-9-]{2,39}$'),
  destino text not null check (destino ~* '^https://[^\s]+\.[^\s]+$'),
  imagem_path text not null,
  versao int not null default 1,
  titulo text check (char_length(titulo) <= 80),
  descricao text check (char_length(descricao) <= 200),
  valido_ate timestamptz,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (loja_id, slug)
);
create index on public.links (loja_id, criado_em desc);

create table public.cliques (
  id bigint generated always as identity primary key,
  link_id uuid not null references public.links(id) on delete cascade,
  criado_em timestamptz not null default now(),
  origem text,        -- só o host do referer, quando existir
  dispositivo text    -- 'mobile' ou 'desktop'
);
create index on public.cliques (link_id, criado_em);

create table public.denuncias (
  id bigint generated always as identity primary key,
  link_id uuid not null references public.links(id) on delete cascade,
  motivo text check (char_length(motivo) <= 300),
  criado_em timestamptz not null default now()
);

create table public.destinos_bloqueados (
  dominio text primary key
);
```

**Privacidade (LGPD):** não guarde IP nem identificadores do visitante. A tabela `cliques` só tem link, momento, host de origem e tipo de dispositivo. Defina um prazo de retenção (por exemplo, 12 meses) e apague o que passar dele.

### 4.2 Regras de acesso (RLS)

```sql
alter table public.lojas enable row level security;
alter table public.assinaturas enable row level security;
alter table public.links enable row level security;
alter table public.cliques enable row level security;
alter table public.denuncias enable row level security;
alter table public.destinos_bloqueados enable row level security;

-- Lojas: o dono lê e edita; a criação é só pela função criar_loja().
create policy lojas_ler    on public.lojas for select using (id = auth.uid());
create policy lojas_editar on public.lojas for update
  using (id = auth.uid()) with check (id = auth.uid());

-- Assinaturas: o dono só lê. Quem escreve é o webhook (chave de serviço).
create policy assinaturas_ler on public.assinaturas for select using (loja_id = auth.uid());

-- Links: o dono faz tudo nos próprios links.
create policy links_dono on public.links for all
  using (loja_id = auth.uid()) with check (loja_id = auth.uid());

-- cliques, denuncias e destinos_bloqueados: sem política = sem acesso direto.
-- O acesso acontece só pelas funções da seção 4.3.
```

### 4.3 Funções

```sql
-- Mantém atualizado_em
create or replace function public.tocar_atualizado() returns trigger
language plpgsql as $$
begin new.atualizado_em = now(); return new; end $$;

create trigger trg_links_atualizado before update on public.links
for each row execute function public.tocar_atualizado();

-- Cadastro da loja + início do teste, num passo só
create or replace function public.criar_loja(p_nome text, p_slug text) returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into lojas(id, nome, slug) values (auth.uid(), p_nome, p_slug);
  insert into assinaturas(loja_id) values (auth.uid());
end $$;

-- Limites e bloqueios na criação de links (valores de exemplo)
create or replace function public.checar_limites_link() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_status text; v_ativos int; v_hoje int;
begin
  select status into v_status from assinaturas where loja_id = new.loja_id;
  if v_status is null or v_status not in ('trial','ativo') then
    raise exception 'assinatura inativa';
  end if;
  select count(*) into v_ativos from links where loja_id = new.loja_id and ativo;
  if v_ativos >= 50 then raise exception 'limite de links ativos'; end if;
  select count(*) into v_hoje from links
    where loja_id = new.loja_id and criado_em > now() - interval '1 day';
  if v_hoje >= 30 then raise exception 'limite diário de criação'; end if;
  if exists (
    select 1 from destinos_bloqueados d
    where new.destino ~* ('^https://([^/]*\.)?' || replace(d.dominio, '.', '\.') || '(/|$)')
  ) then raise exception 'destino bloqueado'; end if;
  return new;
end $$;

create trigger trg_checar_limites before insert on public.links
for each row execute function public.checar_limites_link();

-- Leitura pública, só dos campos necessários
create or replace function public.obter_link_publico(p_loja text, p_slug text)
returns table (link_id uuid, destino text, imagem_path text, versao int,
               titulo text, descricao text, loja_nome text, expirado boolean)
language sql security definer set search_path = public stable as $$
  select l.id, l.destino, l.imagem_path, l.versao, l.titulo, l.descricao, lj.nome,
         (l.valido_ate is not null and l.valido_ate < now())
  from links l
  join lojas lj on lj.id = l.loja_id
  join assinaturas a on a.loja_id = lj.id
  where lj.slug = p_loja and l.slug = p_slug and l.ativo
    and a.status in ('trial','ativo','atrasado');   -- regra a confirmar (seção 14)
$$;

create or replace function public.registrar_clique(p_link uuid, p_origem text, p_dispositivo text)
returns void language sql security definer set search_path = public as $$
  insert into cliques(link_id, origem, dispositivo)
  values (p_link, left(p_origem, 100),
          case when p_dispositivo in ('mobile','desktop') then p_dispositivo end);
$$;

create or replace function public.denunciar_link(p_loja text, p_slug text, p_motivo text)
returns void language sql security definer set search_path = public as $$
  insert into denuncias(link_id, motivo)
  select l.id, left(p_motivo, 300)
  from links l join lojas lj on lj.id = l.loja_id
  where lj.slug = p_loja and l.slug = p_slug;
$$;

-- Estatísticas do dono
create or replace function public.estatisticas_links(p_dias int default 30)
returns table (link_id uuid, total bigint, recentes bigint)
language sql security definer set search_path = public stable as $$
  select l.id, count(c.id),
         count(c.id) filter (where c.criado_em > now() - make_interval(days => p_dias))
  from links l left join cliques c on c.link_id = l.id
  where l.loja_id = auth.uid()
  group by l.id;
$$;

-- Permissões: por padrão toda função fica executável por todos. Feche e abra só o necessário.
revoke all on function public.criar_loja(text, text)                    from public;
revoke all on function public.obter_link_publico(text, text)           from public;
revoke all on function public.registrar_clique(uuid, text, text)       from public;
revoke all on function public.denunciar_link(text, text, text)         from public;
revoke all on function public.estatisticas_links(int)                  from public;

grant execute on function public.criar_loja(text, text)                to authenticated;
grant execute on function public.estatisticas_links(int)               to authenticated;
grant execute on function public.obter_link_publico(text, text)        to anon;
grant execute on function public.registrar_clique(uuid, text, text)    to anon;
grant execute on function public.denunciar_link(text, text, text)      to anon;
```

**Limitação conhecida:** `registrar_clique` aceita chamadas anônimas, então alguém que conheça o `id` de um link poderia inflar os cliques. No MVP, aceite isso e limite por IP no edge; se virar problema, assine o clique com um token curto gerado na rota pública.

## 5. Storage das imagens

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('banners', 'banners', true, 512000, array['image/jpeg','image/webp','image/png'])
on conflict (id) do nothing;

create policy banners_enviar on storage.objects for insert to authenticated
  with check (bucket_id = 'banners' and (storage.foldername(name))[1] = auth.uid()::text);

create policy banners_apagar on storage.objects for delete to authenticated
  using (bucket_id = 'banners' and (storage.foldername(name))[1] = auth.uid()::text);
```

Convenções:

- **Caminho:** `banners/{loja_id}/{link_id}-v{versao}.jpg`. Cada troca de imagem gera um caminho novo e incrementa `versao`, o que contorna o cache do WhatsApp para links novos.
- **Tamanho:** compressão no navegador para algo em torno de 300 KB (teto de 500 KB no bucket).
- **Proporção recomendada:** 1200 × 630 (1,91:1), que costuma gerar o cartão grande. Outras proporções podem aparecer diferentes (por exemplo, miniatura ao lado do texto). Teste no WhatsApp real antes de fixar a regra.
- **Leitura pública:** o robô precisa de URL absoluta e pública para a imagem.

## 6. Rota pública: robô x pessoa

Arquivo `functions/[loja]/[slug].js` (formato Cloudflare Pages Functions; adapte a assinatura para Vercel ou Netlify se escolher outro provedor).

```js
// Robôs de preview. NÃO inclua "Instagram" nem "FBAN/FBAV":
// esses termos aparecem no navegador interno do app (pessoas reais).
// O robô de preview do Instagram e do Facebook se identifica como facebookexternalhit.
const ROBOS = /(WhatsApp|facebookexternalhit|Facebot|Twitterbot|TelegramBot|Slackbot|LinkedInBot|Discordbot|Pinterestbot|SkypeUriPreview|Googlebot|bingbot)/i;

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const html = (corpo, status = 200, extra = {}) =>
  new Response(corpo, { status, headers: { 'content-type': 'text/html; charset=utf-8', ...extra } });

async function rpc(env, nome, args) {
  const r = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/${nome}`, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(args),
  });
  if (!r.ok) throw new Error(`rpc ${nome}: ${r.status}`);
  return r.status === 204 ? null : r.json();
}

export async function onRequestGet({ request, params, env, waitUntil }) {
  const ua = request.headers.get('user-agent') || '';

  let link;
  try {
    [link] = await rpc(env, 'obter_link_publico', { p_loja: params.loja, p_slug: params.slug });
  } catch (e) {
    return html(paginaMensagem('Tente novamente em instantes'), 503);
  }
  if (!link) return html(paginaMensagem('Link não encontrado'), 404);
  if (link.expirado) return html(paginaMensagem('Oferta encerrada'), 200);
  if (!link.destino.startsWith('https://')) return html(paginaMensagem('Link indisponível'), 404);

  const origem = new URL(request.url).origin;
  const url = `${origem}/${encodeURIComponent(params.loja)}/${encodeURIComponent(params.slug)}`;
  const imagem = `${env.SUPABASE_URL}/storage/v1/object/public/banners/${link.imagem_path}?v=${link.versao}`;

  if (ROBOS.test(ua)) {
    // Robô: só as tags Open Graph. Sem redirecionar e sem JavaScript.
    return html(paginaOG({ link, url, imagem }), 200, { 'cache-control': 'public, max-age=300' });
  }

  // Pessoa: conta o clique sem atrasar a resposta e mostra a transição.
  waitUntil(registrarClique(env, link.link_id, request));
  return html(paginaTransicao(link.destino), 200, { 'cache-control': 'no-store' });
}

async function registrarClique(env, linkId, request) {
  try {
    let origem = null;
    const ref = request.headers.get('referer');
    if (ref) { try { origem = new URL(ref).host; } catch {} }
    const ua = request.headers.get('user-agent') || '';
    const dispositivo = /Mobi|Android|iPhone|iPad/i.test(ua) ? 'mobile' : 'desktop';
    await rpc(env, 'registrar_clique', { p_link: linkId, p_origem: origem, p_dispositivo: dispositivo });
  } catch {}
}

function paginaOG({ link, url, imagem }) {
  const t = esc(link.titulo || link.loja_nome);
  const d = link.descricao ? `<meta property="og:description" content="${esc(link.descricao)}">` : '';
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="robots" content="noindex">
<title>${t}</title>
<meta property="og:type" content="website">
<meta property="og:title" content="${t}">
${d}
<meta property="og:image" content="${esc(imagem)}">
<meta property="og:url" content="${esc(url)}">
<meta name="twitter:card" content="summary_large_image">
</head><body></body></html>`;
}

function paginaTransicao(destino) {
  const d = esc(destino);
  const js = JSON.stringify(destino).replace(/</g, '\\u003c');
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="2;url=${d}">
<title>Abrindo…</title>
<style>
body{font-family:system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;background:#fafafa;color:#222}
a{display:inline-block;margin-top:12px;padding:12px 20px;border-radius:10px;background:#111;color:#fff;text-decoration:none}
</style></head>
<body><main style="text-align:center"><p>Abrindo a oferta…</p>
<a href="${d}" rel="noopener">Abrir</a></main>
<script>setTimeout(function(){location.replace(${js})},250)</script>
</body></html>`;
}

function paginaMensagem(texto) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(texto)}</title></head>
<body style="font-family:system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0">
<p>${esc(texto)}</p></body></html>`;
}
```

**Regras que o código segue (mantenha):**

- Em dúvida, trate como pessoa. Servir a tela de transição a um robô estraga o preview; redirecionar uma pessoa por engano não quebra nada.
- Robôs não entram na contagem de cliques.
- A gravação do clique roda em segundo plano (`waitUntil`) e nunca atrasa a resposta.
- Todo texto vindo do banco passa por `esc()` antes de entrar no HTML, e o destino é validado de novo (`https://`) na saída.
- A resposta da pessoa usa `no-store`, para que mudanças de destino valham na hora.
- Se quiser reduzir chamadas ao banco, é possível guardar a resposta de `obter_link_publico` em cache no edge por cerca de 60 segundos. O custo é uma edição demorar até esse tempo para valer.
- Adicione também os cabeçalhos de segurança do provedor (por exemplo, `X-Content-Type-Options: nosniff` e `Referrer-Policy`).

## 7. Painel do lojista

### 7.1 Telas

| Tela | O que faz |
|---|---|
| `/login` | Entrada com link mágico por e-mail e, opcionalmente, Google. |
| Onboarding | Escolhe o nome da loja e o apelido (`criar_loja`). Mostra o início do teste. |
| `#/` Lista | Links da loja com cliques (`estatisticas_links`), copiar, compartilhar, editar, desativar. |
| `#/novo` | Criação: imagem e destino na frente, "Personalizar" recolhido, preview ao vivo do cartão (mockup aprovado na conversa). |
| `#/editar/ID` | Mesmos campos. Trocar a imagem gera nova versão e avisa que links já enviados podem manter o preview antigo. |
| `#/conta` | Estado da assinatura, pagamento, exclusão da conta. |

### 7.2 Criação de link: regras

- **Obrigatórios:** imagem e destino. **Opcionais:** título (padrão: nome da loja), descrição (vazia = não aparece), apelido (padrão: 5 caracteres automáticos) e validade.
- **Atalho do WhatsApp:** se o destino for só um número de telefone, monte `https://wa.me/55NÚMERO` automaticamente.
- **Destino:** só `https://`. Rejeite outros esquemas (`javascript:`, `data:`, `http:`) e encurtadores de link.
- **Depois de criar:** mostre o link pronto com botões para copiar e para compartilhar no WhatsApp (`https://wa.me/?text=` + link codificado).

### 7.3 Funções do navegador

```js
// Compressão da imagem antes do envio
export async function comprimirImagem(arquivo, { larguraMax = 1200, alvoKB = 300 } = {}) {
  const bmp = await createImageBitmap(arquivo);
  const escala = Math.min(1, larguraMax / bmp.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * escala);
  canvas.height = Math.round(bmp.height * escala);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';                       // PNG com transparência não vira fundo preto
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);

  let q = 0.85, blob;
  do {
    blob = await new Promise((ok) => canvas.toBlob(ok, 'image/jpeg', q));
    q -= 0.1;
  } while (blob.size > alvoKB * 1024 && q > 0.4);

  if (blob.size > 500 * 1024) throw new Error('Imagem muito pesada. Escolha outra.');
  return blob;
}

// Destino: aceita https:// ou um número de WhatsApp
export function normalizarDestino(v) {
  v = v.trim();
  if (/^\+?[\d\s().-]{10,}$/.test(v)) {
    let n = v.replace(/\D/g, '');
    if (n.length <= 11) n = '55' + n;
    return `https://wa.me/${n}`;
  }
  return /^https:\/\/[^\s]+\.[^\s]+$/.test(v) ? v : null;
}

// Apelido automático, sem caracteres ambíguos (0/o, 1/l/i)
const ALFABETO = 'abcdefghjkmnpqrstuvwxyz23456789';
export function slugAleatorio(n = 5) {
  const bytes = crypto.getRandomValues(new Uint8Array(n));
  return [...bytes].map((b) => ALFABETO[b % ALFABETO.length]).join('');
}

// Criação do link: envia a imagem, grava o registro e desfaz o envio se falhar
export async function criarLink(sb, { arquivo, destinoBruto, titulo, descricao, validoAte, slug }) {
  const destino = normalizarDestino(destinoBruto);
  if (!destino) throw new Error('Cole um link que comece com https:// ou um número de WhatsApp');

  const { data: { user } } = await sb.auth.getUser();
  const blob = await comprimirImagem(arquivo);
  const id = crypto.randomUUID();
  const caminho = `${user.id}/${id}-v1.jpg`;

  const envio = await sb.storage.from('banners').upload(caminho, blob, { contentType: 'image/jpeg' });
  if (envio.error) throw envio.error;

  for (let i = 0; i < 5; i++) {
    const { error } = await sb.from('links').insert({
      id, loja_id: user.id, slug: slug || slugAleatorio(), destino, imagem_path: caminho,
      titulo: titulo || null, descricao: descricao || null, valido_ate: validoAte || null,
    });
    if (!error) return id;
    if (error.code === '23505' && !slug) continue;   // colisão do apelido automático: tenta outro
    await sb.storage.from('banners').remove([caminho]);
    throw error;
  }
  await sb.storage.from('banners').remove([caminho]);
  throw new Error('Não foi possível gerar um apelido livre. Tente de novo.');
}
```

Carregue o `supabase-js` com versão fixa (CDN com a versão no endereço, ou copie o arquivo para `/assets`) para a página não mudar sozinha.

## 8. Segurança e anti-abuso

Um serviço que hospeda imagem e redireciona para qualquer endereço atrai golpe e spam. Se o domínio for marcado como spam, o preview deixa de aparecer no WhatsApp e o produto perde o sentido. Trate isso como requisito do MVP, não como melhoria.

- **Login obrigatório** para criar links e **assinatura ativa ou em teste** (trigger `checar_limites_link`).
- **Limites por loja:** links ativos e criação por dia (valores de exemplo na seção 4.3).
- **Destinos bloqueados:** tabela `destinos_bloqueados`, mais bloqueio de encurtadores. Opcional: checar o destino na API Safe Browsing do Google na criação.
- **Verificação de telefone no teste** (opcional): reduz contas descartáveis, mas tem custo de SMS. Decisão em aberto.
- **Denúncia:** link "Denunciar" nas páginas de mensagem e no rodapé da transição, chamando `denunciar_link`. Defina quem revisa e em quanto tempo.
- **Desativar na hora:** você precisa de um jeito rápido de pôr `ativo = false` ou a assinatura em `suspenso` quando houver abuso. No começo pode ser pelo painel do Supabase.
- **Nunca** exponha a chave de serviço (`service_role`) no navegador. Ela vive só como segredo do webhook.
- **Teste as regras de acesso** com duas contas: a conta A não pode ler, alterar ou apagar nada da conta B, inclusive no Storage.
- **XSS:** título e descrição aparecem em HTML. O `esc()` da seção 6 é obrigatório em todo lugar.
- **Termos de uso e privacidade** publicados antes do piloto: o que é proibido, o que acontece com links após o cancelamento, quais dados são guardados (LGPD), e a declaração de que os dados de clique não são usados para outros negócios seus.
- **Exclusão de conta** apaga loja, links, cliques e imagens (o `on delete cascade` cuida do banco; apague os arquivos do bucket na mesma rotina).

## 9. Cobrança

**Estados da assinatura** (tabela `assinaturas.status`):

| Estado | Quando | Links funcionam? | Pode criar link? |
|---|---|---|---|
| `trial` | Cadastro, até `trial_ate` | Sim | Sim |
| `ativo` | Pagamento em dia | Sim | Sim |
| `atrasado` | Pagamento falhou (carência de N dias) | Sim | Não |
| `expirado` | Teste acabou sem assinar | A definir | Não |
| `cancelado` | Cliente cancelou | A definir | Não |
| `suspenso` | Violação dos termos | Não | Não |

**Implementação**

- **Provedor:** Mercado Pago (você já tem experiência com a integração). Confirme na documentação atual quais meios de pagamento valem para assinatura recorrente (cartão, Pix).
- **Webhook** (`functions/api/mp-webhook.js`): valide a assinatura da notificação conforme a documentação, use o identificador do evento para não processar duas vezes e atualize `assinaturas` com a chave de serviço, guardada como segredo do ambiente.
- **Expiração do teste:** rotina diária (`pg_cron` ou agendador do provedor) que muda `trial` com `trial_ate` vencido para `expirado`.
- **Nota fiscal:** converse com um contador sobre CNPJ, enquadramento e emissão de nota para assinatura de software antes de cobrar o primeiro cliente.
- **Preço:** não definido. Os valores discutidos (de R$ 19 a R$ 29 por mês) eram só exemplo.

## 10. Métricas

Registre desde o começo o que permite decidir se o produto funciona:

- **Ativação:** tempo entre o cadastro e o primeiro link criado.
- **Uso:** links criados e cliques por loja ativa, por semana.
- **Conversão:** de teste para pagante.
- **Retenção:** cancelamentos nos primeiros três meses.
- **Aquisição:** de onde vieram os cadastros (indicação, venda direta, grupo).

```sql
-- Ativação: horas até o primeiro link
select lj.slug,
       extract(epoch from (min(l.criado_em) - lj.criado_em)) / 3600 as horas_ate_primeiro_link
from lojas lj left join links l on l.loja_id = lj.id
group by lj.id, lj.slug, lj.criado_em;
```

Cliques por dia por link podem alimentar o gráfico da lista (Chart.js, que você já usa no painel de vendas).

## 11. Deploy e ambiente

**Variáveis (segredos do provedor, nunca no repositório):**

| Variável | Onde é usada |
|---|---|
| `SUPABASE_URL` | Painel e rota pública |
| `SUPABASE_ANON_KEY` | Painel e rota pública (chave pública; segura só com as regras de acesso da seção 4.2) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Apenas** webhook de cobrança |
| `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET` | Webhook de cobrança |

**Passos**

1. Criar dois projetos Supabase (teste e produção) e aplicar as migrações em ordem.
2. Configurar o Auth (URL do site, e-mail de login, provedores).
3. Criar o projeto de hospedagem ligado ao repositório, com as variáveis acima.
4. Apontar o domínio (HTTPS automático) quando o nome estiver validado.
5. Restringir quais caminhos chamam as Functions para a rota dinâmica não capturar o painel:

```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/painel/*", "/login/*", "/assets/*", "/termos/*", "/privacidade/*"]
}
```

Confira na documentação do provedor como o roteamento trata arquivos estáticos e rotas dinâmicas, e mantenha as palavras reservadas da seção 3 para evitar colisão.

6. Monitorar erros 5xx da rota pública, uso de armazenamento e de tráfego, e ter um alerta de indisponibilidade.

## 12. Testes

**Robô x pessoa** (rode contra a rota pública):

```bash
# Robô do WhatsApp: deve devolver só as tags Open Graph
curl -s -A "WhatsApp/2.23.20.0 A" https://{DOMINIO}/minha-loja/abc12

# Robô do Instagram/Facebook
curl -s -A "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uiqurl.php)" https://{DOMINIO}/minha-loja/abc12

# Pessoa no navegador interno do Instagram: deve devolver a tela de transição, não as tags
curl -s -A "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148 Instagram 300.0" https://{DOMINIO}/minha-loja/abc12
```

**Lista de conferência**

- [ ] O cartão aparece no WhatsApp real (Android e iPhone), colando o link numa conversa nova.
- [ ] Trocar a imagem de um link já compartilhado: confirme o comportamento do cache e a mensagem no painel.
- [ ] Para forçar nova leitura de preview do lado da Meta, use o depurador de compartilhamento do Facebook. No WhatsApp, o jeito prático é gerar um link novo ou acrescentar um parâmetro (`?v=2`).
- [ ] A pessoa chega ao destino em menos de 1 segundo com a rede limitada a 4G lento (ferramentas de desenvolvedor do Chrome ou Lighthouse).
- [ ] Navegadores internos do Instagram, Facebook e WhatsApp abrem o destino ou mostram o botão Abrir.
- [ ] Link expirado mostra "oferta encerrada"; link inexistente mostra 404; erro do banco mostra 503.
- [ ] Título com `"><script>alert(1)</script>` não executa nada.
- [ ] Destino `javascript:alert(1)` e `http://` são recusados.
- [ ] Conta A não acessa dados da conta B (banco e Storage).
- [ ] Imagem acima do limite é recusada com mensagem clara.
- [ ] Cliques de robôs não aparecem na contagem.
- [ ] Assinatura em estado `expirado` ou `cancelado` impede criar link.

## 13. Marcos de implementação

| Marco | Entrega | Pronto quando |
|---|---|---|
| M1. Fundação | Migrações, RLS, Storage, Auth, `criar_loja` | Uma conta nova cria a loja e não enxerga nada de outra |
| M2. Painel de links | Criar, editar, listar e desativar, com compressão e preview ao vivo | Dá para criar um link do celular em menos de 30 segundos |
| M3. Rota pública | Função robô x pessoa, contagem de cliques | O cartão aparece no WhatsApp real e a pessoa chega ao destino em menos de 1 segundo |
| M4. Anti-abuso e termos | Limites, bloqueios, denúncia, termos, privacidade | Destino bloqueado e limite diário são recusados; denúncia chega a você |
| M5. Cobrança | Assinatura, webhook, estados, bloqueio de criação | Um pagamento real muda o estado, e falha de pagamento também |
| M6. Métricas e piloto | Cliques na lista, consultas de ativação e retenção | 10 a 20 lojistas usando por 30 dias, com números de uso e conversão |

## 14. O que reaproveitar do protótipo

**Reaproveite:** a compressão de imagem no upload, o preview do balão do WhatsApp, a validação e a checagem de unicidade do apelido, o contador de cliques (movendo a contagem para o servidor), e as ações de copiar, compartilhar, editar e excluir.

**Mude:**

- Formulário de cinco campos obrigatórios para dois (imagem e destino).
- Painel de dono único para multiusuário com regras de acesso por usuário.
- Contagem de cliques feita no front-end para registro no servidor, só de pessoas.
- Preview servido a partir da rota pública no edge, não do painel.

## 15. Decisões em aberto

- **Nome e domínio:** PostLink tem conflito com produtos existentes. Validar no Registro.br, no INPI (classes 35 e 42, e 9 se virar app) e nas redes; ter reservas (Giro, Girou, Fechou, Balcão).
- **Provedor de hospedagem da rota pública** (Cloudflare Pages, Vercel ou Netlify).
- **Estrutura da URL:** `{DOMINIO}/{loja}/{slug}` (proposta atual) ou um formato curto com prefixo fixo.
- **Duração do teste, preço e plano único ou mais de um.**
- **Verificação de telefone** no cadastro do teste.
- **Links após `expirado`, `cancelado` ou `atrasado`:** continuam funcionando por quanto tempo? Mostram qual mensagem?
- **Marca "Feito com..." no rodapé da transição** durante o teste ou em todos os planos.
- **Imagem:** proporção oficial recomendada, depois de testar no WhatsApp real.
- **Moderação:** quem revisa as denúncias e em que prazo.
- **Estratégia de aquisição** sem plano grátis: venda direta, indicação e grupos de classificados.