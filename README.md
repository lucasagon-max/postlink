# PostLink 🔗

Gerador de links inteligentes para WhatsApp com cartões Open Graph em alta definição, separação no Edge entre robôs e pessoas, contagem privada de cliques e arquitetura Jamstack multiusuário.

---

## 🛠️ Stack Tecnológica

- **Front-end:** HTML5, Vanilla JavaScript (ES Modules), CSS3 Moderno (Glassmorphism & Mobile-First).
- **Hospedagem & Edge:** Cloudflare Pages com Pages Functions (`functions/[loja]/[slug].js`).
- **Backend-as-a-Service:** Supabase (Postgres 17, Row Level Security, Auth Magic Link, Storage de Imagens).
- **Processamento no Cliente:** Compressão de imagens em Canvas (máx 1200x630 e &le; 300 KB).

---

## 📁 Estrutura do Projeto

```
Postlink/
├── functions/
│   └── [loja]/
│       └── [slug].js         # Rota pública Edge: robô (Open Graph) vs pessoa (transição rápida)
├── public/
│   ├── index.html            # Redirecionamento da raiz / para /painel/
│   ├── painel/
│   │   ├── index.html        # SPA do painel (rotas #/, #/novo, #/editar/:id, #/conta)
│   │   └── app.js            # Lógica Vanilla JS, estado, Supabase Client e CRUD
│   ├── login/
│   │   └── index.html        # Autenticação segura com Magic Link por e-mail
│   ├── termos/
│   │   └── index.html        # Termos de uso e regras anti-abuso
│   ├── privacidade/
│   │   └── index.html        # Política de privacidade em conformidade com a LGPD
│   └── assets/
│       ├── css/
│       │   └── style.css     # Design system, utilitários e simulação visual do WhatsApp
│       └── js/
│           ├── supabase-config.js  # Configuração central e inicialização do cliente Supabase
│           └── compressao.js       # Algoritmo Canvas para redimensionamento e compressão
├── supabase/
│   └── migrations/
│       ├── 0001_schema.sql   # Tabelas: lojas, assinaturas, links, cliques, denuncias
│       ├── 0002_rls.sql      # Políticas de isolamento RLS (auth.uid())
│       ├── 0003_funcoes.sql  # Stored procedures (criar_loja, obter_link_publico, cliques)
│       └── 0004_storage.sql  # Bucket público 'banners' e controle de acesso
├── _routes.json              # Regras de exclusão para Cloudflare Pages Functions
├── .env.example              # Exemplo de variáveis de ambiente
└── README.md
```

---

## 🚀 Como Testar Localmente

### Opção 1: Com o emulador do Cloudflare Pages (Wrangler)
Para testar tanto as páginas estáticas quanto a rota dinâmica no Edge (`/[loja]/[slug]`):
```bash
npx wrangler pages dev public
```
Acesse `http://localhost:8788/painel/` no seu navegador.

### Opção 2: Servidor estático simples (para o painel)
```bash
npx -y serve public
```
Acesse `http://localhost:3000/painel/`.

---

## ☁️ Deploy no Cloudflare Pages

1. Conecte este repositório no dashboard do **Cloudflare Pages**.
2. Configure as opções de Build:
   - **Framework preset:** `None`
   - **Build command:** *(deixe em branco)*
   - **Build output directory:** `public`
3. Em **Settings $\rightarrow$ Environment variables**, configure:
   - `SUPABASE_URL`: `https://xiicwkagcphvejzycntx.supabase.co`
   - `SUPABASE_ANON_KEY`: `eyJhbGciOi...`
4. Clique em **Save and Deploy**. O Cloudflare Pages configurará automaticamente o HTTPS e as Pages Functions.

---

## 🧪 Verificação do Funcionamento (Robô vs Pessoa)

Após o deploy, você pode validar a rota pública com `curl`:

```bash
# 1. Emulando o robô do WhatsApp (deve devolver apenas tags Open Graph):
curl -s -A "WhatsApp/2.23.20.0 A" https://seu-dominio.pages.dev/minha-loja/meu-slug

# 2. Emulando um usuário real no navegador (deve devolver a tela de transição com auto-redirect):
curl -s -A "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)" https://seu-dominio.pages.dev/minha-loja/meu-slug
```
