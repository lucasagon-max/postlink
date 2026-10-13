# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- Lojistas, comércios locais, empreendedores e infoprodutores que divulgam ofertas e produtos diretamente no WhatsApp e redes sociais.
- Necessidade principal: Gerar links inteligentes cujas prévias exibam cartões em alta definição (Open Graph 1200x630) no WhatsApp em vez de links azuis simples ou prévias distorcidas, garantindo maior taxa de cliques (CTR) e conversão.

## Product Purpose
- Transformar links de destino (lojas virtuais, catálogos digitais, cardápios, páginas de checkout e links diretos) em cartões visuais ricos e de alta resolução no WhatsApp.
- O sucesso significa cliques rápidos, apresentação impecável da oferta no mensageiro e redirecionamento quase instantâneo do visitante para a página final sem atrito.

## Positioning
- Focado na experiência nativa do WhatsApp com separação de requisições no Edge: entrega tags Open Graph completas e otimizadas para crawlers/robôs de redes sociais, enquanto humanos reais passam por uma transição imperceptível (<1s) com botão "Abrir" de contingência.
- Alternativa leve, direta e sem fricção a encurtadores genéricos ou criadores de microsites pesados.

## Operating Context
- O lojista cria e gerencia seus links através de um painel web mobile-friendly e desktop.
- O visitante recebe o link em conversas, grupos ou status do WhatsApp, visualiza a miniatura/banner de alta qualidade gerada pelo Open Graph e, ao tocar, é encaminhado imediatamente ao destino desejado.
- Infraestrutura Jamstack hospedada no Cloudflare Pages com Cloudflare Pages Functions e Supabase (PostgreSQL, Auth e Storage).

## Capabilities and Constraints
- Criação e edição de links com upload e compressão de imagem no cliente (Canvas: máx 1200x630, <= 300 KB).
- Rota pública dinâmica no Edge (`/{loja}/{slug}`) que identifica user-agent (robô vs humano) e processa redirecionamento.
- Contagem anônima e privada de cliques em estrita conformidade com a LGPD (sem armazenamento de IPs ou dados de rastreamento invasivo).
- Modelo SaaS: cobrança por assinatura com período de teste (trial), sem plano gratuito perpétuo e sem exibição de anúncios de terceiros.
- Governança legal e segurança: Termos de Uso blindados (Marco Civil Art. 19 / CDC), Política de Privacidade (LGPD com Privacy by Design), canal público de denúncias (`/denunciar`) e moderação ativa no `/admin` com suspensão/banimento imediato de links fraudulentos.
- Validade temporal de links/ofertas ("oferta encerrada").
- Fora do MVP: múltiplos usuários por loja, domínio personalizado do lojista e aplicativo nativo.

## Brand Commitments
- Nome: PostLink (identificador reservado e desacoplado internamente para permitir eventuais ajustes de naming).
- Identidade visual moderna e profissional, com estética Glassmorphism, mobile-first, cores harmoniosas e simulação fidedigna da interface do WhatsApp na prévia.

## Evidence on Hand
- Base de código funcional implementada em HTML5, Vanilla JS e CSS3/Tailwind.
- Especificação técnica e regras de negócio documentadas em `README.md` e `Arquivo MD.md`.
- Landing page de conversão em `public/index.html`.
- Painel de controle do lojista em `public/painel/index.html` e `public/painel/app.js`.
- Rota de Edge no Cloudflare Pages em `functions/[loja]/[slug].js`.
- Migrações do banco de dados e controle de acesso (RLS) configuradas em `supabase/migrations/`.

## Product Principles
1. **Velocidade e leveza primeiro**: Nenhuma espera desnecessária para o visitante; transição para o destino final em menos de 1 segundo.
2. **Impacto visual fidedigno**: O cartão exibido no WhatsApp deve corresponder perfeitamente à prévia configurada pelo lojista, sem distorção ou corte indevido.
3. **Privacidade por padrão (LGPD)**: Métricas úteis de cliques sem vigilância de dados pessoais, sem cookies invasivos e sem retenção de endereço IP.
4. **Foco e simplicidade operacional**: Interface intuitiva para lojistas criarem um link com banner em poucos passos, sem a complexidade de construtores de sites.

## Accessibility & Inclusion
- Semântica HTML clara e contraste de cores adequado em textos e botões interativos no painel e na tela de transição.
- Botão "Abrir" de contingência na tela de redirecionamento para garantir acessibilidade a usuários com leitores de tela ou navegadores com redirecionamento automático desativado.
