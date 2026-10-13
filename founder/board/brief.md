# Briefing do Conselho: PostLink

## 1. Resumo da Ideia (Base)

- **O que é:** Gerador de links inteligentes para WhatsApp e redes sociais que transforma URLs comuns em cartões visuais interativos em alta definição (Open Graph 1200x630) com redirecionamento ultra-rápido (<1s) e métricas privadas de cliques.
- **Para quem é:** Lojistas virtuais, comerciantes locais, empreendedores individuais, infoprodutores e afiliados que utilizam o WhatsApp e grupos de redes sociais como canal primário de divulgação e fechamento de vendas.
- **O que vende e a que preço:** Assinatura de software (SaaS) com teste gratuito de 7 dias e sem plano gratuito perpétuo.
  - **Plano Starter:** R$ 14,90/mês (ou R$ 11,90/mês faturado anualmente) — até 5 links ativos.
  - **Plano Pro (Mais Popular):** R$ 29,90/mês (ou R$ 23,90/mês faturado anualmente) — links ilimitados, histórico completo, rastreamento de origem (WhatsApp, Instagram, direto) e dispositivo (mobile vs desktop).
  - **Plano Agência:** R$ 69,90/mês (ou R$ 55,90/mês faturado anualmente) — até 5 lojas/marcas, links ilimitados, relatórios CSV/PDF e parâmetros UTM.
- **Onde e como:** 100% online no Brasil. Aquisição via prospecção direta, indicação, grupos de classificados/comunidades e anúncios. Entrega via aplicação web (Jamstack com Cloudflare Pages + Pages Functions e Supabase).
- **Orçamento e restrições:** Desenvolvedor solo; infraestrutura enxuta e de baixo custo inicial (Cloudflare Pages + Supabase Postgres/Auth/Storage + Mercado Pago); conflito de marca registrado ("PostLink" tem homônimos no INPI e internet); forte dependência externa da estabilidade do crawler e cache do WhatsApp/Meta.

---

## 2. O Problema e o Contexto de Mercado

- **O problema do lojista:** Ao compartilhar ofertas e links (catálogos, cardápios, checkouts da Shopee/Mercado Livre/Nuvemshop/Hotmart) no WhatsApp, a maioria dos links vira um texto azul genérico ou uma miniatura pequena, borrada ou cortada. Para compensar, lojistas enviam 2 ou 3 mensagens separadas (foto avulsa + texto explicativo + link solto), o que polui grupos de classificados, dispersa a atenção e reduz a taxa de cliques (CTR).
- **A dor operacional:** Quando uma promoção acaba ou o preço muda, a mensagem já enviada no WhatsApp fica obsoleta, gerando atrito de clientes perguntando "ainda tem?" ou exigindo reenvios cansativos.
- **A promessa do PostLink:** Em um único link, entrega a foto em banner 1.91:1 nítida, título, preço e chamada para ação diretamente na bolha de mensagem do WhatsApp. Se o preço mudar ou a oferta expirar, o lojista edita no painel e o redirecionamento ou a tela de "oferta encerrada" atualiza em tempo real sem precisar reenviar mensagens.

---

## 3. Arquitetura Técnica e Diferenciação Operacional

- **Separação no Edge (Robô vs Humano):** A rota pública `/{loja}/{slug}` roda no Cloudflare Pages Functions. Quando um robô/crawler da Meta bate no link, a função devolve em milissegundos um HTML enxuto com tags `og:image`, `og:title`, `og:description` e `og:image:width/height`. Quando um humano clica, a função registra o clique assincronamente (`waitUntil`) e redireciona em menos de 1 segundo para o destino final (com botão "Abrir" de contingência).
- **Compressão no Cliente:** Redimensionamento e compressão via Canvas no navegador do lojista antes do upload (máx 1200x630, <= 300 KB), mantendo os custos de armazenamento e tráfego no Supabase e Cloudflare próximos de zero.
- **Privacidade por Padrão (LGPD):** Não armazena endereços IP nem dados pessoais de quem clica; coleta apenas data/hora, host de origem e se é mobile ou desktop.
- **Governança:** Termos de Uso blindados contra fraudes/phishing, rota de denúncia pública (`/denunciar`) e bloqueio de destinos suspeitos.

---

## 4. Estado Atual do Projeto

- A base de código está funcional: landing page (`public/index.html`), página de planos (`public/planos/index.html`), painel SPA do lojista (`public/painel/index.html` e `app.js`) com preview interativo em tempo real do balão do WhatsApp, rotas de Edge em `functions/[loja]/[slug].js` e schema relacional no Supabase.
- A ferramenta nasceu de um caso de uso real de um negócio local ("Morangos Tatuí") e agora busca se posicionar como um SaaS comercial generalizável.
- Não há clientes pagantes ativos formalizados ainda; o produto está pronto para piloto e validação comercial.

---

## 5. Dúvidas e Vulnerabilidades Conhecidas

1. **Dependência de terceiros (Risco de Plataforma):** O valor central depende inteiramente de a Meta continuar gerando prévias Open Graph para domínios de redirecionamento no WhatsApp sem penalizar ou bloquear o domínio compartilhado.
2. **Disposição a pagar (Ticket Baixo):** Planos de R$ 14,90 a R$ 29,90 por mês exigem volume para cobrir custos e gerar lucro sustentável. Se o lojista achar que mandar "foto + texto" de graça resolve, haverá churn alto.
3. **Marca e Naming:** O nome "PostLink" possui outros produtos homônimos no mercado de TI e no registro de marcas do Brasil (INPI).
4. **Distribuição e CAC:** O produto planeja não ter plano gratuito permanente. Qual o custo de atrair e converter lojistas para uma assinatura recorrente de R$ 15-30/mês?
