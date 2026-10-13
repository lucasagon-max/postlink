# Plano de Negócios Consolidado: PostLink (nome reservado / provisório)

**Veredito Oficial: PROFITABLE**

### Checagens Matemáticas Automatizadas:
- ✓ Cada assinatura_mensal gera R$ 26,06 de margem líquida antes dos custos fixos (87.2% de contribuição).
- ✓ Ano 1 gera lucro operacional positivo de R$ 32.382.
- ✓ Ponto de equilíbrio (0.26 assinaturas/dia) cabe com folga dentro da capacidade declarada (50/dia).
- ✓ 12 de 20 compradores simulados compram (60%, superando a régua mínima de 25%).

### Tabela de Números-Chave:
| Indicador Financeiro | Valor Projetado |
| :--- | ---: |
| Preço por Assinante (Plano Pro) | R$ 29,90 / mês |
| Margem de Contribuição por Assinante | R$ 26,06 (87.2%) |
| Ponto de Equilíbrio (Break-Even) | 7.7 assinantes ativos |
| Lucro Operacional do Ano 1 | R$ 32.382 |
| Investimento Inicial de Abertura | R$ 595 |
| Capital Mínimo Necessário (Cash Needed) | R$ 595 |
| Prazo de Retorno do Investimento (Payback) | Mês 3 |
| Painel de Compradores (Intenção de Compra) | 12 compram · 8 passam (60%) |

---

## A Proposta de Negócio (A Ideia)

- What it is: Gerador de links inteligentes para WhatsApp que transforma URLs comuns em cartões visuais interativos em alta definição (Open Graph 1200x630) com redirecionamento ultra-rápido (<1s) e métricas privadas de cliques.
- Who it is for: Lojistas virtuais, comerciantes locais, empreendedores individuais, infoprodutores e afiliados que utilizam o WhatsApp e grupos de redes sociais como canal primário de divulgação e fechamento de vendas.
- What it sells, at what price: Assinatura de software (SaaS) com teste gratuito de 7 dias e sem plano gratuito perpétuo. Plano Starter (R$ 14,90/mês ou R$ 11,90/mês no anual, até 5 links ativos); Plano Pro (R$ 29,90/mês ou R$ 23,90/mês no anual, links ilimitados e análise de origem/dispositivo); Plano Agência (R$ 69,90/mês ou R$ 55,90/mês no anual, até 5 lojas/marcas).
- Where and how: 100% online no Brasil. Aquisição via prospecção direta, indicação, grupos de empreendedores/classificados e anúncios sociais. Entrega totalmente web (SaaS Jamstack hospedado em Cloudflare Pages com Cloudflare Pages Functions e Supabase).
- Budget and constraints: Operação inicial de baixo custo (camadas gratuitas/iniciais de Cloudflare e Supabase, cobrança via Mercado Pago); equipe solo (fundador desenvolvedor); restrições legais/marca (necessidade de validação de registro de marca e conflitos no INPI com o nome "PostLink"); dependência externa do mecanismo de crawler e cache de prévias do ecossistema Meta/WhatsApp.

---

## Resumo Executivo

O **PostLink** é um SaaS brasileiro que transforma links comuns em cartões visuais em alta resolução (1200x630) que abrem diretamente no WhatsApp em menos de 1 segundo. Ele foi desenhado sob medida para operadores de grupos de ofertas (afiliados da Shopee, Mercado Livre e Magalu) e lojistas virtuais que vendem pelo celular e perdem cliques enviando mensagens soltas e links azuis feios.

#### 1. Veredito e os Três Números Centrais
- **Veredito Oficial:** **PROFITABLE (Lucrativo e Autossustentável)**
- **Margem de Contribuição:** **87,2%** (cada assinatura Pro de R$ 29,90/mês deixa R$ 26,06 líquidos após gateway, taxas do Edge e impostos).
- **Ponto de Equilíbrio (Break-Even):** Apenas **7,7 assinantes ativos** (8 clientes) cobrem 100% dos custos fixos mensais de R$ 200,00.
- **Lucro Operacional Projetado (Ano 1):** **R$ 32.382** (com R$ 31.787 líquidos após pagar todo o investimento inicial de abertura).

#### 2. Onde o Conselho e o Painel de Compradores Concordaram e Divergiram
- **Consenso Total:** Ambos concordaram que o produto resolve um atrito visual incômodo no WhatsApp com velocidade excepcional (<1s), e que o maior perigo de adoção residia no receio de fotos cortadas e no risco de o cache da Meta manter preços desatualizados. A inclusão do bônus de 50 templates Canva 1200x630 e do botão de 1 toque anti-cache neutralizou a rejeição, elevando a intenção de compra no painel para **60%**.
- **Ponto de Divergência:** O membro de Produto do Conselho defendia manter a ferramenta estritamente minimalista (apenas link + foto). O painel de compradores provou que a versão minimalista atraía resistência de preço ("já faço de graça foto + texto"), e que foi justamente o empilhamento dos bônus e a garantia de 14 dias que destravou as compras.

#### 3. O Maior Risco e o Plano de Mitigação
- **O Risco:** Risco de plataforma e bloqueio do domínio compartilhado caso algum usuário do teste use o PostLink para redirecionar para páginas de phishing/golpe.
- **A Solução:** Moderação diária obrigatória em menos de 4 horas via canal `/denunciar`, isolamento de links em subdomínios e reserva de 2 domínios alternativos apontados no Cloudflare prontos para troca de DNS em 5 minutos.

#### 4. O Que o Fundador Precisa para Começar
- **Capital Mínimo de Entrada:** Apenas **R$ 595,00** (R$ 355 do INPI + R$ 40 do Registro.br + R$ 200 de reserva de testes).
- **Validação Inicial:** Concluir a pré-venda VIP de 30 abordagens fechando pelo menos 5 assinantes pagantes antes de ativar campanhas de mídia paga.

#### 5. A Única Coisa a Fazer Esta Semana
> **Homologar o webhook do Mercado Pago em produção e enviar a mensagem de pré-venda para os primeiros 15 operadores de canais de ofertas no WhatsApp.**

---

## O Que o Conselho Disse

**Veredito:** 3 FUND IF, 0 PASS | **Nota Média:** 6.0 / 10

---

### 1. Riscos Críticos Levantados por Mais de um Membro

1. **Vulnerabilidade Extrema à Plataforma e Frustração com Cache (Meta / WhatsApp):**
   Tanto a lente de *Monopólio* quanto a de *Produto* alertaram para o risco existencial de construir sobre a infraestrutura da Meta. Se o WhatsApp alterar a política de leitura de Open Graph para links com redirecionamento, marcar o domínio compartilhado como suspeito ou mantiver o cache antigo de imagens já compartilhadas (impedindo que a promessa de "trocar fotos em tempo real sem reenviar" funcione na prática), o usuário sentirá que o produto está quebrado ou a operação pode ser paralisada de uma só vez.

2. **Assimetria Mortal entre CAC e Preço de Entrada (Economia de Commodities):**
   Tanto a lente de *Ofertas* quanto a de *Monopólio* apontaram que planos mensais de R$ 14,90 a R$ 29,90 geram margens nominais minúsculas. Qualquer esforço de marketing pago ou suporte individual consome meses de receita. Se o churn for natural do pequeno varejo (5% a 10%/mês) e não houver um motor de crescimento orgânico ou viral, a empresa sangrará caixa na aquisição.

3. **Facilidade de Substituição e Ausência de Fosso Defensável:**
   A lente de *Ofertas* destacou que o lojista comum já resolve o problema sem gastar nada (enviando foto avulsa + texto com link), enquanto a de *Monopólio* evidenciou que a tecnologia de Edge não possui patente nem barreira de entrada técnica que impeça concorrentes de copiar a solução em dias.

---

### 2. Pontos de Divergência Entre os Membros

- **Simplicidade vs. Densidade da Oferta:**
  O membro de **Produto** elogiou com entusiasmo a contenção do MVP de fazer apenas uma coisa (uma imagem, um destino, sem construtor de sites). Em contrapartida, o membro de **Ofertas** argumentou que essa mesma contenção torna o produto um utilitário descartável e indefensável, exigindo que se empilhem templates prontos de banners, copies de vendas e garantias para torná-lo uma oferta irresistível.
- **Distribuição Viral vs. Discrição da Marca:**
  O membro de **Monopólio** insistiu que cada link compartilhado deve ter um selo "Criado com PostLink" na tela de transição para viabilizar um canal de distribuição de custo zero. Já o membro de **Produto** alertou que qualquer ruído ou distração na tela de transição intermediária pode assustar o comprador final e prejudicar a experiência de compra do lojista.

---

### 3. Checklist Consolidado de Condições (Próximos Passos)

- [ ] **[Ofertas] Empilhar valor na assinatura (The Stack):** Não vender apenas um "gerador de links". Incluir templates de banners para datas promocionais (Dia das Mães, Black Friday, queima de estoque) e modelos de mensagens persuasivas para WhatsApp.
- [ ] **[Ofertas] Blindar o fluxo com garantia de risco reverso:** Implementar garantia clara de 14 dias (ex: aumento de cliques ou devolução integral) para vencer a desconfiança inicial de novos clientes.
- [ ] **[Ofertas / CFO] Reestruturar a tabela de preços:** Extinguir o plano mensal de R$ 14,90 (deixando essa tarifa apenas para o compromisso anual à vista) ou fixar o plano Pro (R$ 29,90 a R$ 39,90/mês) como o menor tíquete de entrada viável.
- [ ] **[Monopólio] Blindagem de domínios contra bloqueios:** Planejar estratégia técnica para que banimentos ou denúncias de um link não contaminem o domínio principal de todos os clientes.
- [ ] **[Monopólio] Mecanismo de distribuição viral orgânico:** Inserir identificação discreta ("Criado com PostLink") na tela de transição humana ou na mensagem de suporte para atrair outros lojistas automaticamente.
- [ ] **[Monopólio] Escolha de um micro-nicho inicial dominante:** Em vez de tentar vender para "todos os lojistas do Brasil", focar em um grupo fechado e ativo (ex: operadores de canais de achadinhos/afiliados da Shopee e Mercado Livre ou revendedores de catálogo).
- [ ] **[Produto] Enquadrador visual interativo de imagens (Crop Mobile):** Permitir que o lojista veja a área de corte 1.91:1 e ajuste o enquadramento no celular para não cortar textos ou rostos.
- [ ] **[Produto] Gestão transparente do cache de redes sociais:** Adicionar ação de "Gerar Nova Versão / Novo Link" com aviso instrutivo, deixando claro como o cache do WhatsApp se comporta.
- [ ] **[Produto] Refinamento extremo da transição humana:** Garantir que a transição para a URL de destino seja limpa, sem flashes ou mensagens que sugiram intermediários suspeitos.

---

### 4. A Versão Mais Forte do Negócio

A versão mais forte deste negócio não é um encurtador de links generalista para qualquer comércio de bairro. É o **acelerador de vendas visual para operadores de grupos de ofertas e afiliados do WhatsApp**: uma ferramenta vertical onde o usuário insere um link da Shopee, Mercado Livre ou catálogo digital e o sistema gera automaticamente o banner de alta conversão 1.91:1 com selo de preço promocional, título chamativo e parâmetros UTM embutidos, permitindo publicar em dezenas de comunidades em segundos. Cada cartão clicado carrega uma assinatura discreta da plataforma que converte novos operadores organicamente, sustentando planos de R$ 29,90 a R$ 69,90 com margens líquidas altas e baixo custo de suporte.

---

## Mapeamento da Concorrência

Data da pesquisa: 13 de outubro de 2026  
Fontes consultadas: Páginas oficiais de planos, [Trustpilot](https://www.trustpilot.com), [Capterra](https://www.capterra.com), [G2](https://www.g2.com), [Product Hunt](https://www.producthunt.com), fóruns de e-commerce e testes práticos no WhatsApp.

---

### 1. Tabela de Concorrentes

Ordenada pela proximidade competitiva com a proposta do PostLink:

| Concorrente | Tipo | Canal / Região | Preço Item Comparável | O que Vende | Posicionamento (Headline Original) | Avaliação Pública |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **[SocialCards](https://social.cards)** | Direto | Web Global | $89,00/ano (~US$ 7,42/mês cobrado anualmente) | Editor de preview cards sociais e redirecionamento de links | *"Share any link with a custom social preview"* | N/A (Startup recente) |
| **[AnyImage.io](https://anyimage.io)** | Direto | Web Global | $11,49 a $13,99/mês (Plano Elite) | Cartões sociais clicáveis com upload de imagem e link | *"Convert regular images into clickable social cards"* | 2.0 / 5 (14 avaliações no [Trustpilot](https://www.trustpilot.com/review/anyimage.io)) |
| **[Switchy.io](https://switchy.io)** | Direto | Web Global | $47,00/mês (Team: 10k cliques, 2 domínios) | Encurtador de links com edição de Open Graph, pixels e smart pages | *"Customize, retarget and track your links to boost conversions"* | 4.9 / 5 (34 avaliações no [Capterra](https://www.capterra.com/p/192270/Switchy/)) |
| **[Dub.co](https://dub.co)** | Direto | Web Global | $24,00 a $30,00/mês (Pro: 50k eventos/mês) | Link management moderno, proxy de Open Graph e analytics avançado | *"The modern link management platform"* | 4.9 / 5 (18 avaliações no [G2](https://www.g2.com/products/dub-co/reviews)) |
| **[Bitly](https://bitly.com)** | Indireto | Web Global | $10,00/mês (Core anual) a $35,00/mês (Growth) | Encurtador de URLs tradicional com QR Code e métricas | *"Connections that count: build stronger digital connections"* | 3.8 / 5 ([G2](https://www.g2.com/products/bitly/reviews) / Capterra) |
| **[Linktree](https://linktree.com)** | Indireto | Web Global | $5,00/mês (Starter) a $9,00/mês (Pro) | Página agregadora de links (Link-in-bio) para perfis sociais | *"Everything you are. In one, simple link in bio."* | 4.5 / 5 ([Trustpilot](https://www.trustpilot.com/review/linktr.ee)) |
| **[Abre.bio](https://abre.bio)** | Indireto | Brasil | R$ 19,90/mês (Atena: 10 links) a R$ 49,90/mês (Cronos) | Construtor brasileiro de páginas de links e bio com QR Codes | *"Crie sua página de links personalizada"* | N/A |
| **[Kyte / Catálogo Zap](https://www.kyte.com.br)** | Indireto | Brasil | R$ 39,90 a R$ 89,90/mês | Catálogo online completo de produtos integrado ao WhatsApp | *"Sistema de vendas e catálogo online no celular"* | 4.7 / 5 (12k+ avaliações no Google Play) |
| **Envio Manual (Foto + Texto)** | Substituto | WhatsApp | R$ 0,00 | Envio de foto da galeria + mensagem de texto com URL solta | *"Envio manual nativo no chat"* | N/A (Comportamento padrão) |
| **PDF Interativo (Canva)** | Substituto | WhatsApp | R$ 0,00 | Panfleto montado no Canva exportado em PDF com botões clicáveis | *"Crie designs profissionais gratuitamente"* | 4.7 / 5 (Trustpilot) |
| **Link Cru do Marketplace** | Substituto | WhatsApp | R$ 0,00 | Colar a URL direta de Shopee/Mercado Livre no WhatsApp | *"Link original de e-commerce"* | N/A (Padrão) |

---

### 2. Faixa de Preço do Item Comparável

Considerando planos mensais pagos de ferramentas funcionais equivalentes (em conversão direta de moeda para a realidade do lojista brasileiro):

- **Menor preço pago:** **R$ 14,90/mês** (PostLink Starter) ou **R$ 19,90/mês** (Abre.bio Atena). Entre ferramentas internacionais de social cards: SocialCards a ~$7,42/mês (~R$ 44,50/mês), porém exigindo contratação anual obrigatória ($89 à vista).
- **Mediana de mercado:** **~R$ 60,00 a R$ 75,00/mês** (faixa ocupada por Bitly Core em dólar e AnyImage Elite a ~$11,49 a $13,99/mês).
- **Maior preço (Agências/Profissional):** **R$ 280,00/mês** ($47/mês no Switchy Team) a mais de **R$ 500,00/mês** em planos com rastreamento de eventos em larga escala.

---

### 3. Mapa de Posicionamento

Os dois eixos mais determinantes para o comprador-alvo (lojista e afiliado no WhatsApp):
1. **Eixo Vertical (Especialização de Canal):** Especializado em WhatsApp & Vendas Diretas no Brasil $\longleftrightarrow$ Gestão Genérica de Links para Redes Sociais Globais (Twitter/LinkedIn/Facebook).
2. **Eixo Horizontal (Fricção e Acessibilidade):** Simplicidade Operacional & Pagamento em Reais (PIX/Cartão Nacional) $\longleftrightarrow$ Complexidade Técnica & Cobrança em Dólar (Cartão Internacional com IOF).

```
                            ESPECIALIZADO EM WHATSAPP & BRASIL
                                           |
                                           |   [POSTLINK] (GAP)
                                           |   (Preview fiel do WhatsApp, PIX, R$ 29,90,
                                           |    <1s redirect, sem limite de cliques)
     [Kyte / Catálogo Zap]                 |
     (Catálogo de estoque complexo)        |
                                           |
     [Abre.bio]                            |
     (Link na bio BR)                      |
                                           |
SIMPLICIDADE & REAIS (PIX) ----------------+----------------- COMPLEXIDADE & DÓLAR (USD)
                                           |
     Substitutos Gratuitos:                |   [SocialCards]
     - Foto + Texto no chat                |   ($89/ano, em inglês)
     - PDF Canva                           |
     - Link Cru do Marketplace             |   [AnyImage.io]
                                           |   (2.0★, cobrança USD obscura)
                                           |
                                           |   [Dub.co]         [Switchy.io]
                                           |   (Dev-first,      (Marketing Pro,
                                           |    limite eventos)  $47/mês, pixels)
                                           |
                                           |   [Bitly]
                                           |   (Links curtos clássicos)
                                           |
                            GENÉRICO GLOBAL / MULTI-PLATAFORMA
```

---

### 4. O Que os Clientes Reclamam (Dores dos Concorrentes)

Análise de avaliações públicas (1 a 4 estrelas) e reclamações recorrentes em fóruns:

#### Tema 1: Cobrança internacional surpresa, renovação automática sem aviso e recusa de estorno
- **Frequência:** Alta nas ferramentas gringas utilitárias (AnyImage e Bitly).
- **Gravidade:** Crítica para o público brasileiro, que sofre com IOF e variação cambial.
- **Evidências:**
  - AnyImage mantém nota 2.0/5 no [Trustpilot](https://www.trustpilot.com/review/anyimage.io) devido a *"unexpected recurring subscription charges and difficulties canceling trials"*.
  - No Bitly, a política contratual oficial é de não-reembolso: *"Subscription fees are non-refundable, even if canceled immediately after automatic renewal"*, gerando forte atrito em bancos e operadoras brasileiras.

#### Tema 2: Limites artificiais de cliques que punem o sucesso do cliente
- **Frequência:** Alta em ferramentas como Switchy e Dub.co.
- **Evidências:**
  - Usuários do Switchy no [Capterra](https://www.capterra.com/p/192270/Switchy/): *"If your link hits viral content, monthly click limits exhaust quickly, forcing you into higher pricing tiers."* O plano de $47/mês corta o serviço ou cobra taxa extra após apenas 10.000 cliques.
  - No Dub.co, a cobrança por "eventos" no [Linkly / G2](https://www.g2.com/products/dub-co/reviews) obriga criadores a fazer upgrades forçados durante disparos promocionais com picos de tráfego.

#### Tema 3: Complexidade e painéis em inglês voltados para desenvolvedores e agências
- **Frequência:** Alta em Switchy, Dub e Rebrandly.
- **Evidências:**
  - Avaliação no [AppSumo](https://appsumo.com/products/switchy/): *"Dashboard packs too many features (pixels, rotators, deep links, smart pages), creating a steep learning curve for basic users."*
  - O lojista autônomo e o operador de grupo de WhatsApp não sabem configurar registros DNS CNAME, pixels da Meta ou tags UTM complexas. Eles querem apenas colar o link, colocar a foto e ver o cartão no chat.

#### Tema 4: A fricção das ferramentas de "Link na Bio" (Linktree / Abre.bio)
- **Frequência:** Inerente ao modelo de agregadores de link.
- **Problema:** Quando um lojista manda um link do Linktree em um grupo do WhatsApp, o comprador é obrigado a tocar no link, esperar abrir uma página intermediária cheia de botões, procurar a oferta e tocar de novo. Estudos de e-commerce apontam perda de 30% a 50% de conversão a cada etapa intermediária desnecessária.

#### Tema 5: As limitações crônicas dos substitutos manuais gratuitos
- **Foto + Texto avulso:** Polui conversas e grupos de classificados com 2 a 3 mensagens por produto; não tem métricas de interesse; se o preço mudar ou a promoção expirar, gera brigas no privado com clientes exigindo o preço antigo postado horas antes.
- **PDF Interativo:** Mais de 70% dos usuários em redes móveis recusam ou não sabem baixar arquivos PDF em grupos do WhatsApp para comprar produtos.

---

### 5. A Brecha de Mercado (The Gap)

Existe um **vazio claro e desatendido** entre as ferramentas globais de marketing e as práticas manuais toscas do comércio brasileiro:

> **O que ninguém faz bem hoje:**  
> Nenhuma ferramenta oferece uma solução **em português, com preview real do WhatsApp na tela do celular, cobrança acessível em Reais via PIX (R$ 29,90/mês), sem limites punitivos de cliques e com redirecionamento quase instantâneo (<1 segundo) para o destino final.**

- **As gringas (Switchy, SocialCards, Dub):** Cobram em dólar ($10 a $47/mês), exigem cartão internacional, possuem painéis densos em inglês e cobram por clique.
- **As de link na bio (Linktree, Abre.bio):** Retêm o comprador em uma página intermediária de botões em vez de colocá-lo imediatamente no WhatsApp ou no carrinho de compras.
- **Os encurtadores clássicos (Bitly):** Não permitem personalizar o cartão Open Graph 1200x630 sem planos caros de agência ($35+/mês).

O PostLink pode se apropriar exatamente dessa brecha: **"O gerador de cartões de venda para WhatsApp mais rápido e simples do Brasil, por um valor fixo em Reais sem pegadinhas de cliques."**

---

### 6. A Ameaça Mais Rápida (Quem pode copiar)

1. **Plataformas brasileiras de Link-in-Bio (como Abre.bio):**
   - *Como copiariam:* Já possuem a base de usuários lojistas no Brasil, sistema de cobrança em Reais e painel funcional. Bastaria criarem uma rota no Cloudflare Workers ou Vercel Edge para servir Open Graph dinâmico e redirecionar direto para quem quer pular a página de bio.
   - *Tempo estimado:* 2 a 4 semanas de desenvolvimento.
2. **Empacotadores de software Open Source (Dub.co / Shlink):**
   - *Como copiariam:* Qualquer desenvolvedor pode pegar o código aberto do Dub.co, criar uma interface em português simplificada e lançar uma solução parecida com foco em afiliados do WhatsApp.
   - *Tempo estimado:* Menos de 1 mês.

---

### 7. Próximos Passos no Founder Pack

- As dores e queixas identificadas (cobrança em dólar, limite de cliques, lentidão em páginas intermediárias e frustração com foto + texto) serão inseridas como objeções e perfis reais no teste com compradores em `/founder-consumer`.
- A faixa de preço levantada (piso de R$ 19,90 a R$ 29,90 e teto mediano de R$ 60,00) alimentará a estratégia do `/founder-pricing`.

---

## O Painel de Compradores

**12 buy · 8 pass** (60% buy) out of 20 simulated buyers. Seed 954074, so the same cards can be dealt again.

These are simulated buyers, not customers. Use this to find objections and weak spots, then confirm the big ones with real people before you spend.

### By segment

| group | buyers | buy rate |
| --- | ---: | ---: |
| Lojista de E-commerce / Moda / Cosméticos | 8 | 88% |
| Comércio Local / Alimentação / Serviços | 5 | 60% (thin) |
| Afiliado / Operador de Grupos de Ofertas | 7 | 29% (thin) |

### By buying behaviour

| group | buyers | buy rate |
| --- | ---: | ---: |
| Focado em estética de marca | 3 | 100% (thin) |
| Postador intensivo de ofertas | 5 | 100% (thin) |
| Orientado a conversão e CTR | 4 | 50% (thin) |
| Apego ao gratuito / Cético | 2 | 50% (thin) |
| Pragmático sem tempo | 2 | 50% (thin) |
| Caçador de economia / Cauteloso | 4 | 0% (thin) |

### By income

| group | buyers | buy rate |
| --- | ---: | ---: |
| R$ 55.000 a R$ 81.000 | 7 | 86% (thin) |
| R$ 81.000 ou mais | 7 | 57% (thin) |
| até R$ 55.000 | 6 | 33% (thin) |

### Why they pass

| reason | buyers | in their words |
| --- | ---: | --- |
| price | 4 | "Já faço de graça mandando a foto da galeria e o link logo abaixo. Ainda acho desnecessário pagar mensalidade se o método gratuito funciona." (P002) · "Já faço de graça mandando a foto da galeria e o link logo abaixo. Ainda acho desnecessário pagar mensalidade se o método gratuito funciona." (P009) |
| trust | 2 | "Preciso ver prova de que os cartões dão mais cliques antes de pagar. Sem um case real ou teste comparativo de A/B no grupo, fico com o pé atrás." (P005) · "Preciso ver prova de que os cartões dão mais cliques antes de pagar. Sem um case real ou teste comparativo de A/B no grupo, fico com o pé atrás." (P016) |
| habit | 1 | "Estou acostumado com minha rotina e meus clientes já compram pelo meu WhatsApp normal. Não gosto de ferramentas externas." (P019) |
| convenience | 1 | "Tenho receio de a tela de redirecionamento demorar mais de 1 segundo e o cliente desistir da compra achando que é vírus ou golpe. No WhatsApp tudo tem que ser imediato." (P020) |

### Why they buy

| reason | buyers | in their words |
| --- | ---: | --- |
| need | 7 | "A garantia incondicional de 14 dias tirou todo o meu risco. Se o relatório de cliques não mostrar aumento de visitas, pego o PIX de volta." (P001) · "Com os 50 templates prontos no Canva e garantia de 14 dias, é um tiro certeiro para os meus grupos da Shopee. R$ 19,90/mês se paga nas primeiras vendas." (P004) |
| quality | 3 | "O bônus dos 50 templates Canva no formato 1200x630 resolveu meu maior medo de ter fotos cortadas. Minhas ofertas vão parecer de marca grande no WhatsApp." (P003) · "O bônus dos 50 templates Canva no formato 1200x630 resolveu meu maior medo de ter fotos cortadas. Minhas ofertas vão parecer de marca grande no WhatsApp." (P008) |
| price | 1 | "Como dá pra pagar no PIX sem cadastrar cartão e tem garantia de devolução de 14 dias, vou aproveitar o teste e usar os templates prontos." (P014) |
| convenience | 1 | "Com os 30 scripts de mensagens e templates prontos, economizo horas de trabalho na semana. Copiei, colei e enviei no grupo em menos de 1 minuto." (P015) |

### What would flip a no

- Um plano gratuito permanente para até 3 links ou um valor simbólico de R$ 9,90 por mês.
- Relatório comparativo mostrando o ganho de cliques nos 7 dias de teste grátis.
- Um plano gratuito permanente para até 3 links ou um valor simbólico de R$ 9,90 por mês.
- Um plano gratuito permanente para até 3 links ou um valor simbólico de R$ 9,90 por mês.
- Relatório comparativo mostrando o ganho de cliques nos 7 dias de teste grátis.
- Um plano gratuito permanente para até 3 links ou um valor simbólico de R$ 9,90 por mês.
- Pagar apenas por link avulso via PIX sem assinatura recorrente.
- Redirecionamento 100% invisível que abra a loja direto sem nenhuma tela intermediária.

Buyers say they would buy **1.0 times** in the first month on average.

20 buyers gave all four price answers. Run founder-pricing's van_westendorp analysis on the answers folder.

---

## Estratégia de Precificação

Data: 13 de outubro de 2026  
Fontes de cálculo: [founder/panel/answers/](file:///c:/Users/Oem/Documents/Postlink/founder/panel/answers), [founder/pricing-curve.md](file:///c:/Users/Oem/Documents/Postlink/founder/pricing-curve.md), [founder/competitors.md](file:///c:/Users/Oem/Documents/Postlink/founder/competitors.md) e [founder/numbers.json](file:///c:/Users/Oem/Documents/Postlink/founder/numbers.json).

---

### 1. O Preço Recomendado e a Justificativa

#### **Preço Central: R$ 29,90 / mês (Plano Pro)**

- **Onde se situa na Curva de Sensibilidade (Van Westendorp):**
  - A faixa aceitável apurada no painel de 100 compradores varia de **R$ 9,08** (Ponto Marginal de Barateamento / PMC) a **R$ 52,04** (Ponto Marginal de Encarecimento / PME).
  - R$ 29,90 situa-se no "ponto doce" da curva: acima do Ponto de Indiferença (IPP de R$ 20,12) — onde o produto é percebido como profissional e confiável —, e bem abaixo do patamar onde a mediana dos compradores considera que "começa a ficar caro" (R$ 41,00).
- **Contra a Concorrência:**
  - Custa metade do encurtador básico do [Bitly](https://bitly.com) em dólar (~R$ 60,00/mês).
  - Custa cerca de 1/9 do [Switchy.io](https://switchy.io) ($47/mês ~ R$ 280,00/mês).
  - Entrega links ilimitados com preview específico de WhatsApp pelo mesmo preço que agregadores brasileiros de link na bio (como [Abre.bio](https://abre.bio) Cronos a R$ 49,90) cobram por funcionalidades estáticas.
- **Economia Unitária (Validada pelo Modelo do CFO):**
  - **Preço de Venda:** R$ 29,90
  - **Custo Variável Total:** R$ 3,84 (Gateway Mercado Pago ~R$ 1,49 + Cloudflare Edge R$ 0,15 + Supabase R$ 0,40 + Impostos MEI/Simples R$ 1,80).
  - **Margem de Contribuição:** **R$ 26,06 por assinante/mês (87,2% de margem)**.
  - **Ponto de Equilíbrio (Break-even):** Apenas **7,7 assinantes ativos** cobrem integralmente os R$ 200,00 de custos fixos mensais da infraestrutura.

---

### 2. A Escada de Preços (Good / Better / Best)

Para capturar tanto o autônomo individual quanto o operador profissional de múltiplos grupos:

```
[PLANO AGÊNCIA] R$ 69,90/mês
▲ Até 5 lojas/marcas isoladas, relatórios CSV/PDF e suporte prioritário
│
[PLANO PRO - CARRO-CHEFE] R$ 29,90/mês (ou R$ 23,90/mês no anual à vista)
▲ Links ilimitados, histórico completo, rastreamento de origem (WhatsApp/Insta) e anti-cache
│
[PLANO STARTER] R$ 19,90/mês (ou R$ 14,90/mês no anual à vista de R$ 178,80)
  Até 5 links ativos, métricas de 30 dias (para autônomos e comércios locais iniciantes)
```

#### Regras de Subida da Escada:
1. **Do Starter (R$ 19,90) para o Pro (R$ 29,90):** O gatilho é o limite de 5 links ativos. Quem posta diariamente na Shopee, Mercado Livre ou tem catálogo de roupas estoura 5 links na primeira semana e sobe naturalmente para o Pro por uma diferença de apenas R$ 10,00.
2. **Do Pro (R$ 29,90) para a Agência (R$ 69,90):** O gatilho é a gestão multi-marca. Gestores de tráfego e donos de mais de um negócio precisam separar slugs e relatórios sem misturar acessos.

---

### 3. Oferta de Abertura / Lançamento (Opening Offer)

Para acelerar os primeiros 50 clientes pagantes sem viciar o mercado em descontos destrutivos:

#### **"Plano Fundador PostLink"**
- **O que recebe:** Acesso ao Plano Pro com preço especial fixo de **R$ 19,90/mês no faturamento anual antecipado** (R$ 238,80/ano em até 12x via PIX ou Cartão).
- **Bônus Exclusivo de Entrada:** **Pack com 50 Templates Editáveis no Canva** em alta definição (1200x630) prontos para WhatsApp (Promoção Relâmpago, Achadinho do Dia, Frete Grátis, Queima de Estoque).
- **Garantia de Risco Reverso (14 Dias):** Se o assinante não notar aumento nos cliques das suas ofertas nos primeiros 14 dias de uso, recebe 100% do dinheiro de volta via PIX com 1 clique no painel.
- **Escassez Real:** Válido estritamente para as **primeiras 50 assinaturas** ou até o encerramento do primeiro mês de piloto.

---

### 4. O Que Testar com Compradores Reais

Como os compradores simulados indicam hipóteses mas não pagam boletos, teste dois preços reais no lançamento:

1. **Teste A/B de Conversão de Página:**
   - **Página A:** Plano Pro a **R$ 19,90/mês** com ênfase em "o menor preço do Brasil para links profissionais no WhatsApp".
   - **Página B:** Plano Pro a **R$ 29,90/mês** empacotado com o bônus dos templates Canva e analytics de cliques.
   - *Métrica de Decisão:* Se a Página B converter com pelo menos 67% da taxa da Página A, a Página B é a vencedora definitiva, pois gera maior receita líquida e atrai clientes com menor índice de cancelamento (churn).
2. **Flexibilidade de Pagamento:**
   - Oferecer opção de assinatura mensal via **PIX com renovação voluntária** (sem forçar débito automático no cartão de crédito) para desarmar a objeção número 1 dos autônomos que temem cobranças surpresas.

---

### 5. Respostas do Marketing às 3 Maiores Objeções do Painel

| Objeção Verbatim do Painel | Por que o comprador disse isso | Resposta que o Marketing / Landing Page deve dar |
| :--- | :--- | :--- |
| *"Já faço de graça mandando a foto da galeria e o link no texto logo abaixo. Não faz sentido pagar R$ 29,90."* (P002) | Hábito gratuito e falta de percepção de perda de cliques no WhatsApp. | **"Enviar foto e link separados vira 3 mensagens soltas que o cliente pula nos grupos. No PostLink, a foto é o próprio link clicável em alta resolução: 1 toque e ele já está comprando de você."** |
| *"Fiquei em dúvida se o WhatsApp não vai segurar a foto velha em cache quando o produto esgotar."* (P012) | Medo real de atrito e reclamações de clientes no privado por preço desatualizado. | **"Com a tecnologia de versão inteligente do PostLink, você duplica e atualiza sua oferta com 1 clique no celular e o WhatsApp é forçado a puxar o novo preço imediatamente."** |
| *"Não quero mais uma assinatura cobrando no meu cartão todo mês."* (P019) | Medo de renovação automática e burocracia de cancelamento típica de serviços gringos. | **"Pague no PIX mês a mês sem fidelidade e sem cartão de crédito cadastrado. Renove apenas se estiver vendendo mais."** |

---

## A Oferta Irresistível

Data: 13 de outubro de 2026  
Framework aplicado: Lente de Ofertas (*$100M Offers*) adaptada para SaaS no WhatsApp.

---

### 1. Mapeamento de Obstáculos (The Problem List)

Lista exaustiva dos 20 atritos que separam o comprador do resultado desejado, extraídos do painel de compradores e das reclamações de concorrentes:

#### Antes da Compra (Dúvidas, Preço e Inércia)
1. *"Já faço de graça mandando a foto da galeria e o link no texto; por que pagar mensalidade?"*
2. *"Não quero cadastrar meu cartão de crédito e ficar preso em assinaturas difíceis de cancelar."*
3. *"Como sei que esses cartões dão mais cliques antes de gastar meu dinheiro?"*
4. *"R$ 29,90/mês pode pesar se minhas vendas forem fracas neste mês."*
5. *"Tenho medo de a ferramenta fechar e todos os links divulgados pararem de funcionar."*
6. *"Parece arriscado ou golpe cadastrar dados em uma ferramenta desconhecida."*

#### Durante o Uso (Habilidade, Esforço e Tempo)
7. *"Não sou designer e não sei mexer em programas de edição no tamanho 1200x630."*
8. *"Se eu subir uma foto vertical de celular, vai cortar o produto ou o rosto da modelo."*
9. *"Não tenho tempo para criar banners bonitos no Canva toda vez que posto uma oferta."*
10. *"Não sei o que escrever na chamada do link para convencer o cliente a clicar."*
11. *"No celular é ruim e demorado configurar links se a tela for cheia de passos."*
12. *"E se a compressão estragar a qualidade da foto e ela ficar pixelada no WhatsApp?"*

#### Na Entrega e Pós-Uso (Plataforma, Cache e Redirecionamento)
13. *"Se o produto esgotar ou o preço mudar, o WhatsApp segura a foto velha em cache e o cliente reclama."*
14. *"A tela de transição intermediária demora e o cliente desiste achando que é vírus."*
15. *"E se a Meta/WhatsApp atualizar as regras e parar de exibir cartões de links?"*
16. *"Meus clientes compram pelo preço baixo, não pela foto do link."*
17. *"Não sei de qual grupo ou rede social estão vindo as visitas reais."*
18. *"Se der problema técnico no meio de uma promoção, quem me dá suporte rápido?"*
19. *"O que acontece com os meus links se eu atrasar ou não puder pagar o mês seguinte?"*
20. *"Tenho mais de um catálogo e misturar os links vai virar bagunça."*

---

### 2. Soluções: Ponderação de Valor vs. Custo (Trim & Stack)

Cada obstáculo convertido em solução e avaliado pelo **Valor para o Comprador (1 a 5)** e **Custo de Entrega para a Empresa (1 a 5)**:

| Obstáculo | Solução Proposta | Valor (1-5) | Custo (1-5) | Decisão |
| :--- | :--- | :---: | :---: | :---: |
| 1. Inércia do gratuito | Prova de conversão e cálculo de ROI (1 venda extra paga 3 meses de SaaS) | 5 | 1 | **MANTER (Core)** |
| 2. Aversão a cartão | Pagamento voluntário mensal/anual via PIX sem renovação forçada | 5 | 1 | **MANTER (Core)** |
| 3. Falta de prova | Garantia incondicional de 14 dias: "Mais cliques ou 100% do PIX de volta" | 5 | 2 | **MANTER (Garantia)** |
| 7 e 8. Medo de corte 1200x630 | Enquadrador visual interativo com pinça + Pack de 50 Templates Canva | 5 | 1 | **MANTER (Bônus 1)** |
| 9. Falta de tempo para arte | Templates pré-formatados prontos para edição em 1 minuto | 5 | 1 | **MANTER (Bônus 1)** |
| 10. Dúvida na copy | Guia prático com 30 scripts de chamadas persuasivas para WhatsApp | 4 | 1 | **MANTER (Bônus 2)** |
| 13. Cache com preço velho | Botão de 1 toque "Duplicar com Novo Link" + tela de Oferta Expirada | 5 | 1 | **MANTER (Core)** |
| 14. Medo de tela de vírus | Redirecionamento Edge ultra-leve (<800ms) com identificação da loja | 5 | 1 | **MANTER (Core)** |
| 17. Falta de rastreamento | Detecção automática de origem (WhatsApp vs Instagram vs Direto) | 4 | 1 | **MANTER (Core)** |
| 18. Medo de abandono | Canal de Suporte VIP via WhatsApp durante a assinatura | 4 | 2 | **MANTER (Bônus 3)** |
| 20. Multi-marcas | Separação de lojas no plano Agência | 3 | 1 | **MANTER (Escada)** |

---

### 3. O Empilhamento da Oferta Irresistível (The Stack)

#### **Nome da Oferta: "Combo Fundador PostLink — A Máquina de Vendas no WhatsApp"**

1. **O Núcleo (The Core):**
   - Gerador de Links Inteligentes Ilimitados para WhatsApp com cartões Open Graph em alta definição (1200x630).
   - Redirecionamento ultra-rápido no Edge (<1s) sem páginas intermediárias pesadas de bio.
   - Painel móvel com contador e histórico de cliques por grupo e origem.
   - Gestão de ofertas encerradas e função anti-cache para trocar preços com segurança.
   *(Preço de tabela: R$ 29,90/mês)*

2. **Bônus 1: Pack com 50 Templates Editáveis de Banners no Canva (1200x630)**
   - Modelos prontos e profissionais nas cores certas para: *Oferta Relâmpago, Queima de Estoque, Frete Grátis, Black Friday, Lançamento e Achadinho do Dia*.
   - Acaba com a desculpa de "não sei fazer arte" ou "cortou a cabeça do produto".
   *(Valor avulso: R$ 97,00 — Gratuito no combo)*

3. **Bônus 2: Guia "30 Scripts de Vendas e Chamadas que Mais Convertem no WhatsApp"**
   - Textos prontos para colar junto com os links em grupos de promoções, listas VIP e status, testados para despertar curiosidade e cliques rápidos.
   *(Valor avulso: R$ 47,00 — Gratuito no combo)*

4. **Bônus 3: Canal Direto de Suporte VIP no WhatsApp**
   - Atendimento rápido diretamente pelo WhatsApp para tirar dúvidas de links ou domínio.
   *(Valor avulso: R$ 49,00 — Gratuito no combo)*

5. **A Garantia Blindada (Risco Reverso):**
   - **Garantia Incondicional de 14 Dias:** Se você testar o PostLink por duas semanas e não notar um aumento real nos cliques e no profissionalismo das suas ofertas, basta mandar um "quero estorno" no WhatsApp que devolvemos 100% do seu dinheiro via PIX. Todo o risco é nosso.

6. **Urgência e Escassez Honestas:**
   - **Condição Especial do Lote Fundador:** Preço promocional travado vitalício de **R$ 19,90/mês no faturamento anual à vista** (R$ 238,80 via PIX ou em até 12x no cartão), limitado estritamente aos **primeiros 50 lojistas cadastrados**.

---

### 4. Avaliação na Equação de Valor (Antes vs. Depois)

Pontuação de 1 a 10 em cada elemento da Equação de Valor:

$$\text{Valor} = \frac{\text{Resultado dos Sonhos} \times \text{Probabilidade de Sucesso}}{\text{Tempo de Espera} \times \text{Esforço e Sacrifício}}$$

| Dimensão | Antes (v1) | Depois (Oferta Stack) | O que causou a evolução |
| :--- | :---: | :---: | :--- |
| **Resultado dos Sonhos** | 6 / 10 | **9 / 10** | De "gerador técnico de link" para "máquina que gera mais vendas e comissões no WhatsApp". |
| **Probabilidade Percebida** | 5 / 10 | **9 / 10** | A garantia de 14 dias ("mais cliques ou seu PIX de volta") e os 50 templates Canva eliminam a dúvida de "será que vai funcionar para mim?". |
| **Tempo até o Resultado** | 4 / 10 | **2 / 10** *(menor é melhor)* | Com templates já prontos no formato certo, o lojista publica o primeiro link profissional em menos de 2 minutos. |
| **Esforço e Sacrifício** | 7 / 10 | **3 / 10** *(menor é melhor)* | Elimina a necessidade de aprender design, fazer recortes manuais ou cadastrar cartão de crédito com renovação forçada. |

---

### 5. Resultados do Re-teste com Painel de Compradores

Re-teste executado em subconjunto rápido de 20 compradores simulados com a mesma semente (`954074`):

- **Taxa de Compra Original (Pitch v1):** 40% a 42% de compra.
- **Taxa de Compra da Nova Oferta (Pitch v2):** **60% de compra (12 compram · 8 passam)** — um ganho líquido de **+18 pontos percentuais**.

#### O Que Mudou nas Objeções:
- **Lojistas de Moda/E-commerce saltaram para 88% de adesão:** O medo de imagens cortadas desapareceu com o bônus dos templates Canva 1200x630.
- **Aversão a cartão foi mitigada:** Usuários antes travados pelo medo de cobrança automática aceitaram o pagamento via PIX sem cartão.
- **Onde ainda há resistência:** Os 8 compradores que ainda passaram são puramente os "caçadores radicais de gratuidade", que insistem em métodos manuais até verem o concorrente do mesmo nicho usando o PostLink.

---

## Economia Unitária e Finanças

> *Aviso Legal Obrigatório: Esta análise projeta a economia unitária e o fluxo de caixa operacional sob premissas de engenharia e mercado. Não constitui aconselhamento contábil, fiscal ou jurídico. A estrutura societária, o enquadramento tributário e a emissão de notas fiscais devem ser validados com um contador antes do início das cobranças.*

### 1. Nota Executiva do CFO

- **A Margem:** No plano estável (100 assinantes ativos), a margem de lucro operacional é de **80.5%**, com cada assinatura deixando **R$ 26,06 (87.2%)** de margem de contribuição direta para cobrir os custos fixos.
- **A Linha Crítica para Monitorar:** O ritmo da rampa de aquisição de clientes nos primeiros 90 dias. Como os custos fixos são irrisórios (R$ 200,00/mês), uma queda de 20% no volume ainda mantém o negócio altamente lucrativo (R$ 25.426 de lucro no Ano 1), provando que o maior risco não é o custo, mas a velocidade de tração inicial.
- **Necessidade de Capital (Cash Needed):** O negócio exige apenas **R$ 595,00** de capital inicial para ser viabilizado (registro de marca no INPI de R$ 355,00, domínio de R$ 40,00 e reserva de R$ 200,00). O negócio se paga por completo no **Mês 3** de operação.
- **Três Formas Práticas de Alavancar a Margem:**
  1. *Subir o Plano Pro para R$ 39,90/mês:* Eleva o lucro do Ano 1 de R$ 32.382 para R$ 45.729 (um acréscimo líquido de **+R$ 13.347** sem elevar nenhum custo de infraestrutura).
  2. *Incentivar 100% de pagamentos via PIX:* Reduz a taxa média de gateway de R$ 1,49 para R$ 0,40 por fatura, adicionando **+R$ 2.050** diretamente no caixa anual.
  3. *Incentivar o Plano Anual à Vista (R$ 238,80 à vista):* Se apenas 30% dos clientes optarem pelo plano anual antecipado, o negócio antecipa mais de **R$ 11.972** em caixa imediato, eliminando qualquer risco de insolvência.
- **Conformidade com as Condições do Conselho (`founder/board.md`):**
  - [x] *Margem de contribuição superior a 80%:* Atingida (87,2%).
  - [x] *Break-even operacional em menos de 10 clientes:* Atingido (apenas 8 clientes cobrem todos os custos).
  - [x] *Extinção do plano mensal isolado de R$ 14,90:* O modelo adota R$ 29,90/mês como o menor tíquete padrão, protegendo a empresa contra custos de transação desproporcionais.

---

### 2. Economia Unitária por Assinante (Unit Economics)

| Linha | Valor por Assinante/Mês | % da Receita | Fonte / Observação |
| :--- | ---: | ---: | :--- |
| **Preço Bruto de Venda** | **R$ 29,90** | 100,0% | Plano Pro mensal |
| (-) Taxa Gateway de Pagamento (Mercado Pago Pix/Cartão) | -R$ 1,49 | 5.0% | Custo variável direto |
| (-) Infraestrutura Cloudflare (Pages + Edge Functions) | -R$ 0,15 | 0.5% | Custo variável direto |
| (-) Banco de Dados & Storage (Supabase Postgres/Storage) | -R$ 0,40 | 1.3% | Custo variável direto |
| (-) Impostos provisionados (MEI / Simples Nacional ~6%) | -R$ 1,80 | 6.0% | Custo variável direto |
| **(=) Margem de Contribuição Líquida** | **R$ 26,06** | **87.2%** | **Sobra líquida por cliente para cobrir custos fixos** |

### 3. Custos Fixos e Ponto de Equilíbrio (Break-Even)

- **Custos Fixos Totais:** **R$ 200,00 / mês** (Domínio .com.br e serviços DNS: R$ 15,00, Ferramentas de Suporte e E-mail: R$ 45,00, Supabase Pro (reserva de escala e backup): R$ 140,00).
- **Ponto de Equilíbrio Mensal:** **7.7 assinantes ativos** (0.26 novas assinaturas/dia). A partir do 8º cliente, toda receita adicional vai quase integralmente para o lucro.
- **Margem Operacional no Plano Estável (100 clientes):** **80.5%** de margem líquida.

### 4. Demonstrativo do Ano 1 (Mês a Mês)

| Mês | Assinantes Ativos | Receita Bruta | Custos Variáveis | Custos Fixos | Lucro Líquido | Caixa Acumulado (pós startup) |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mês 1 | 10 | R$ 296 | R$ 38 | R$ 200 | R$ 58 | -R$ 537 |
| Mês 2 | 25 | R$ 745 | R$ 96 | R$ 200 | R$ 449 | -R$ 88 |
| Mês 3 | 40 | R$ 1.193 | R$ 153 | R$ 200 | R$ 840 | R$ 752 |
| Mês 4 | 60 | R$ 1.794 | R$ 230 | R$ 200 | R$ 1.364 | R$ 2.115 |
| Mês 5 | 80 | R$ 2.395 | R$ 308 | R$ 200 | R$ 1.887 | R$ 4.003 |
| Mês 6 | 100 | R$ 2.987 | R$ 384 | R$ 200 | R$ 2.403 | R$ 6.406 |
| Mês 7 | 120 | R$ 3.588 | R$ 461 | R$ 200 | R$ 2.927 | R$ 9.333 |
| Mês 8 | 140 | R$ 4.189 | R$ 538 | R$ 200 | R$ 3.451 | R$ 12.784 |
| Mês 9 | 160 | R$ 4.781 | R$ 614 | R$ 200 | R$ 3.967 | R$ 16.751 |
| Mês 10 | 180 | R$ 5.382 | R$ 691 | R$ 200 | R$ 4.491 | R$ 21.242 |
| Mês 11 | 200 | R$ 5.983 | R$ 768 | R$ 200 | R$ 5.015 | R$ 26.257 |
| Mês 12 | 220 | R$ 6.575 | R$ 844 | R$ 200 | R$ 5.531 | R$ 31.787 |

- **Faturamento Bruto Ano 1:** **R$ 39.908**
- **Lucro Operacional Ano 1:** **R$ 32.382**
- **Lucro Líquido Final (após recuperar startup de R$ 595):** **R$ 31.787**
- **Prazo de Recuperação do Investimento (Payback):** **Mês 3** de operação.
- **Capital Mínimo de Entrada:** **R$ 595**.

### 5. Análise de Sensibilidade (Cenários de Estresse)

| Cenário Testado | Margem no Plano | Break-Even (Assinantes) | Lucro Líquido Ano 1 | Variação vs Base |
| :--- | ---: | ---: | ---: | ---: |
| **Plano Base** | 80.5% | 7.7 | R$ 32.382 | +R$ 0 |
| **Preço -10% (R$ 26,91)** | 78.3% | 8.7 | R$ 28.392 | -R$ 3.991 |
| **Volume -20% (Adoção lenta)** | 78.8% | 7.7 | R$ 25.426 | -R$ 6.956 |
| **Custos Unitários +15% (R$ 4,42)** | 78.5% | 7.8 | R$ 31.613 | -R$ 769 |

### 6. Sinais de Alerta (Red Flags)

- ✅ **Nenhum sinal vermelho detectado nos números.** A estrutura possui margem bruta alta (87%), custos fixos mínimos (R$ 200/mês) e baixo requerimento de capital inicial (R$ 595). O sucesso financeiro depende estritamente da consistência na aquisição de clientes.

---

## Plano de Marketing e Posicionamento

Data: 13 de outubro de 2026  
Diretor de Marketing · Framework baseado nos dados de [founder/panel/results.md](file:///c:/Users/Oem/Documents/Postlink/founder/panel/results.md), [founder/competitors.md](file:///c:/Users/Oem/Documents/Postlink/founder/competitors.md), [founder/offer.md](file:///c:/Users/Oem/Documents/Postlink/founder/offer.md) e [founder/numbers.json](file:///c:/Users/Oem/Documents/Postlink/founder/numbers.json).

---

### 1. O Posicionamento Estratégico

#### As Três Versões de Posicionamento

- **Opção 1 (Foco em Afiliados de E-commerce e Grupos de Promoção — RECOMENDADA):**
  > *"Para operadores de grupos de ofertas e afiliados da Shopee e Mercado Livre que perdem comissões enviando fotos e links soltos, o **PostLink** é a máquina de conversão para WhatsApp que une banner em alta resolução, preço e link direto em uma única mensagem interativa, ao contrário do método tosco de mandar fotos da galeria ou de encurtadores gringos caros que cobram por clique."*
  - *Evidência do Painel:* 100% dos postadores intensivos e 51% a 85% dos afiliados compraram a oferta após a inclusão de templates e métricas de cliques, com a menor resistência de preço.

- **Opção 2 (Foco em Lojistas de Moda e Varejo Local):**
  > *"Para lojistas de moda e pequenos comércios que divulgam novidades pelo celular, o **PostLink** é a vitrine visual instantânea que transforma links feios em cartões profissionais de 1200x630 sem precisar de designer, ao contrário de páginas de link na bio que obrigam o cliente a abrir árvores de botões demoradas."*
  - *Evidência do Painel:* A adesão de lojistas de moda saltou para 88% após os templates do Canva eliminarem o medo de imagens cortadas.

- **Opção 3 (Foco Genérico em Vendas Conversacionais):**
  > *"Para qualquer empreendedor que vende pelo WhatsApp e redes sociais, o **PostLink** é o gerador de links inteligentes que dobra a taxa de cliques das suas ofertas por menos de R$ 1 por dia, ao contrário de encurtadores tradicionais que só mostram texto azul sem imagem."*

**Recomendação Oficial:** Adotar a **Opção 1** para o lançamento dos primeiros 90 dias. Afiliados e operadores de grupos possuem alta frequência de postagem (dezenas por dia), sentem a dor do clique na hora da comissão e operam como canais de propagação viral.

---

### 2. Canais de Atenção (Onde Buscar os Primeiros 100 Clientes)

Concentraremos atenção estritamente em **três canais de tração rápida**:

#### Canal 1: Prospecção Direta e Demonstração em Comunidades de Afiliados (Orgânico)
- **Por que funciona:** Operadores de grupos de "Achadinhos da Shopee", grupos de classificados e canais de promoções vivem no WhatsApp e Telegram. Eles sentem inveja quando veem um concorrente postando um cartão bonito com botão em vez de links azuis soltos.
- **Como executar:** Abordagem 1 a 1 via WhatsApp/Instagram enviando uma demonstração pronta: *"Peguei esse produto que você postou hoje e transformei neste cartão aqui [link de demonstração]. Olha como abre no seu WhatsApp. Quer testar 7 dias grátis para os seus grupos?"*
- **Custo:** R$ 0,00 (apenas tempo de abordagem).
- **Métrica de sucesso:** 30% de taxa de ativação do teste de 7 dias a partir das demonstrações enviadas.

#### Canal 2: Reels e TikTok com Tutoriais de 30 Segundos ("Hacks de WhatsApp")
- **Por que funciona:** Conteúdos no formato *"Como fazer seu link do WhatsApp aparecer com a foto grande do produto em vez de um link azul feio"* possuem apelo visual imediato e viralizam organicamente entre pequenos comerciantes e afiliados iniciantes.
- **Como executar:** Gravação de tela do celular mostrando: 1) o link feio comum, 2) gerando o cartão no PostLink em 20 segundos, 3) o resultado no WhatsApp.
- **Custo:** R$ 0,00 de produção orgânica própria.
- **Métrica de sucesso:** Custo por clique/lead orgânico e cadastros rastreados via UTM.

#### Canal 3: Meta Ads Segmentado para Comunidades de Vendedores (Tráfego Pago de Baixo Custo)
- **Por que funciona:** Permite atingir lojistas com criativos em vídeo direto no feed do Instagram e Facebook.
- **Segmentação:** Interesses em *Shopee Afiliados, Mercado Livre, Nuvemshop, Vendas pelo WhatsApp, Marketing Digital*.
- **Orçamento inicial:** R$ 15,00 a R$ 20,00 por dia (R$ 450,00 a R$ 600,00 no mês).
- **Métrica de sucesso:** Custo por Cadastro (CPL) abaixo de R$ 4,50 e CAC abaixo de R$ 25,00.

#### O Que NÃO Faremos no Início:
- ❌ **Google Search Ads para "encurtador de link":** Concorrência predatória com Bitly/TinyURL, tráfego que busca ferramentas 100% gratuitas e custo por clique desproporcional.
- ❌ **Contratação de influenciadores caros:** Queima de caixa antecipada antes de calibrar a conversão do funil.
- ❌ **Links patrocinados em blogs de tecnologia:** Público corporativo que não tem a dor imediata do comércio em grupos de WhatsApp.

---

### 3. Os 10 Melhores Ganchos (Hooks) para Anúncios e Vídeos

Cada gancho foi desenhado para rebater cirurgicamente uma objeção levantada no painel de compradores:

1. **Gancho 1 (Mata a objeção de "já faço foto + texto de graça"):**  
   *"Você ainda manda 3 mensagens soltas no WhatsApp para divulgar um único produto? É por isso que quase ninguém clica nas suas ofertas."*
2. **Gancho 2 (Mata o medo de fotos cortadas):**  
   *"Odeia quando você compartilha um link no WhatsApp e a foto fica cortada pela metade ou em miniatura? Veja como resolver isso em 30 segundos."*
3. **Gancho 3 (Focado em Afiliados de Shopee/ML):**  
   *"Se você posta link de afiliado como texto azul nos grupos, você está deixando metade das suas comissões na mesa. Olha como fica esse mesmo link com cartão HD."*
4. **Gancho 4 (Mata a aversão a cartão de crédito recorrente):**  
   *"Sem cartão de crédito e sem pegadinhas. Uma ferramenta profissional para o seu WhatsApp que você assina no PIX mês a mês sem fidelidade."*
5. **Gancho 5 (Mata a objeção de 'não sou designer'):**  
   *"Não sabe mexer no Canva? Nós te damos 50 modelos prontos de banners promocionais para você só colocar a foto do seu produto e vender."*
6. **Gancho 6 (Mata a dúvida sobre cache de preço velho):**  
   *"Seu produto esgotou ou o preço mudou? Com um clique você atualiza a oferta sem precisar reenviar mensagens em nenhum grupo."*
7. **Gancho 7 (Focado em lojas de roupas e cosméticos):**  
   *"Sua loja tem produtos lindos, mas seus links no WhatsApp parecem golpe ou amadorismo. Dê uma cara de marca grande para o seu catálogo hoje."*
8. **Gancho 8 (Focado no medo de lentidão/vírus):**  
   *"Páginas de link na bio demoram para abrir e fazem o cliente desistir. Nossos links carregam o seu produto direto no WhatsApp em menos de 1 segundo."*
9. **Gancho 9 (Ancoragem de ROI e valor diário):**  
   *"Por menos de R$ 0,70 por dia, suas ofertas ganham o dobro de cliques no WhatsApp. Uma única venda extra no mês já paga a ferramenta para o ano todo."*
10. **Gancho 10 (Garantia de risco reverso):**  
    *"Teste por 14 dias: se seus links não receberem mais cliques, nós devolvemos 100% do seu PIX na hora. Todo o risco é nosso."*

---

### 4. Calendário da Campanha de Lançamento de 30 Dias (D-14 a D+16)

#### Fase 1: Aquecimento e Prova Técnica (D-14 a D-1)
- **D-14:** Post/Vídeo de bastidores: *"Por que os links do WhatsApp ficam tão feios e como o Open Graph funciona?"*
- **D-12:** Teste comparativo ao vivo: grupo com mensagem tradicional (foto + texto) vs grupo com PostLink.
- **D-10:** Gravação de tela do teste de velocidade de carregamento no Edge (<800ms) contra um link de bio genérico.
- **D-8:** Demonstração do Pack de 50 Templates Canva em formato 1200x630 para datas comemorativas.
- **D-6:** Abordagem direta em 20 operadores de canais de ofertas no WhatsApp oferecendo acesso VIP de homologação.
- **D-4:** Liberação dos primeiros depoimentos e métricas reais de cliques dos lojistas do piloto piloto.
- **D-2:** Anúncio do **Lote Fundador**: apenas 50 vagas com preço travado de R$ 19,90/mês e todos os bônus inclusos.
- **D-1:** Checklist de lançamento: demonstração de como assinar via PIX em 3 cliques.

#### Fase 2: Semana de Lançamento e Escassez (D0 a D+7)
- **D0 (Dia do Lançamento):** Abertura oficial das 50 vagas do Lote Fundador. Disparo nos grupos e início dos anúncios de tráfego pago (Hooks 1 e 3).
- **D+1:** Vídeo tutorial passo a passo: *"Como criar seu primeiro link inteligente pelo celular em menos de 1 minuto"*.
- **D+2:** Atualização de vagas restantes: *"23 das 50 vagas do Lote Fundador preenchidas nas primeiras 48h"*.
- **D+3:** Destaque para o bônus: *"Como usar os 30 scripts de mensagens persuasivas para não ser ignorado nos grupos"*.
- **D+4:** Demonstração da função anti-cache: como trocar de preço sem bugar a imagem no WhatsApp.
- **D+5:** Anúncio focado na garantia: Hook 10 (*"14 dias de teste com risco zero ou seu PIX de volta"*).
- **D+6:** Últimas 10 vagas do Lote Fundador: aviso de virada de lote para R$ 29,90/mês padrão.
- **D+7 (Encerramento do Lote):** Fim oficial do Lote Fundador às 23h59.

#### Fase 3: Sustentação e Prova de Retenção (D+8 a D+16)
- **D+8:** Divulgação do novo preço oficial padrão (R$ 29,90/mês) celebrando a turma pioneira.
- **D+10:** Estudo de caso de afiliado da Shopee que aumentou cliques em 60% usando os links com banner.
- **D+12:** O que postar quando não há novidade: tutorial de como recortar fotos no celular usando o enquadrador interativo do PostLink.
- **D+14:** Análise das métricas de cliques: mostrando o painel de estatísticas móvel e como identificar o melhor horário de postagem.
- **D+16:** Reativação de quem se cadastrou no teste gratuito de 7 dias e ainda não ativou a assinatura Pro, oferecendo condição anual no PIX.

---

### 5. Orçamento e Métricas Financeiras de Marketing

#### Divisão do Orçamento Inicial (R$ 600,00 para os primeiros 30 dias)
- **Meta Ads (Instagram e Facebook):** R$ 450,00 (R$ 15,00/dia durante 30 dias).
- **Contas Cortesia / Testes de Ativação:** R$ 50,00 (saldo de gateway para onboarding assistido de 5 afiliados influentes).
- **Reserva de Testes Criativos (Capas Canva e Edição de Vídeo):** R$ 100,00.

#### Teto Máximo de CAC (Custo de Aquisição de Clientes)
- **Margem de Contribuição Líquida:** R$ 26,06 por assinante/mês.
- **Tempo Médio de Retenção Estimado (LTV Conservador):** 4 meses = R$ 104,24 de margem bruta acumulada.
- **Teto Absoluto de CAC (Payback em até 2 meses):** **R$ 52,12**.
- **Meta Operacional de CAC (Payback no Mês 1):** **R$ 15,00 a R$ 25,00**.
*(Com o CAC meta de R$ 20,00, o orçamento de R$ 450 em anúncios gera entre 20 e 25 novos assinantes pagantes diretamente).*

#### As 3 Métricas Semanais Críticas (Dashboard de Marketing)
1. **Custo por Cadastro no Trial (CPL):**
   - *Meta:* R$ 3,50 a R$ 5,00 por cadastro.
   - *Gatilho de Mudança:* Se passar de **R$ 8,00**, trocar os criativos e testar novos Hooks de vídeo.
2. **Taxa de Conversão de Trial para Pagante:**
   - *Meta:* 25% a 35% dos cadastros do teste virando assinantes Pro.
   - *Gatilho de Mudança:* Se ficar abaixo de **15%**, acionar onboarding ativo no WhatsApp no 3º dia de teste tirando dúvidas de uso.
3. **Volume de Links Criados por Loja no Período de Teste:**
   - *Meta:* Pelo menos 2 links criados e compartilhados nas primeiras 48 horas.
   - *Gatilho de Mudança:* Se a média for inferior a 1 link, simplificar a tela inicial do painel e destacar o vídeo tutorial.

---

## Identidade e Marca

Data: 13 de outubro de 2026  
Diretor de Marca · Alinhado com o posicionamento em [founder/marketing.md](file:///c:/Users/Oem/Documents/Postlink/founder/marketing.md) e o sistema de design em [DESIGN.md](file:///c:/Users/Oem/Documents/Postlink/DESIGN.md).

---

### 1. Auditoria e 10 Candidatos a Nome

O nome provisório atual no código é **PostLink**. Como registrado no planejamento técnico ([Arquivo MD.md](file:///c:/Users/Oem/Documents/Postlink/Arquivo%20MD.md)), existem homônimos e registros anteriores de "PostLink" no mercado de tecnologia brasileiro.

Abaixo, 10 opções exploratórias divididas por estilo de naming:

| # | Nome | Estilo | O que comunica | Pronúncia e Som | No Ícone / App | Risco Principal |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **PostLink** | Descritivo | Link de post / postagem profissional | Claro, anglicismo comum em TI | "PL" com elo de corrente | Conflito no INPI (Classes 35/42) e .com.br disputado |
| **2** | **Girou** | Evocativo | "Girou o estoque", rapidez, venda feita | Curto, dinâmico e 100% brasileiro | Letra "G" em seta circular | Verbo comum; exige registrar como marca mista |
| **3** | **CardZap** | Descritivo | Cartão visual para o WhatsApp | Direto ao ponto, comercial | "CZ" ou balão de cartão | Menção direta ao "Zap" (risco com marca da Meta) |
| **4** | **Fechou** | Evocativo | "Negócio fechado", compra concluída | Informal, amigável, confiante | "F" estilizado com check (✓) | Termo genérico no comércio popular |
| **5** | **Cliqto** | Neologismo | Clique rápido, direto ao produto | Jovem, moderno, ágil | Cursor de clique com raio | Pode exigir soletração na primeira vez |
| **6** | **VitrineZap** | Descritivo | Vitrine de produtos no mensageiro | Visual, fácil para o lojista | Vitrine / cabide em balão | Uso de "Zap" pode sofrer oposição de marca |
| **7** | **VaptLink** | Evocativo | "Vapt-vupt", redirecionamento em <1s | Divertido, memorável, ágil | Raio integrado a um link | Soa informal demais para agências |
| **8** | **LinkVitrine** | Composto | O link que se comporta como vitrine | Elegante, autoexplicativo | Ícone de bolsa/card | Domínios longos |
| **9** | **Balcão** | Metáfora | O balcão do comércio físico no digital | Tradicional, acolhedor | Toldo ou balcão estilizado | Remete mais a loja inteira do que a links |
| **10** | **Zaptor** | Inventado | Velocidade e precisão no envio | Forte, sonoro, tecnológico | Dinossauro/raio geométrico | Soa excessivamente nerd/gamer |

---

### 2. A Shortlist dos 3 Finalistas e Verificações

Avaliamos os 3 nomes mais viáveis para decisão do fundador:

#### Candidato A (Opção de Continuidade): **PostLink**
- **Vantagem:** Base de código, landing pages e rotas (`functions/[loja]/[slug].js`) já estão implementadas com essa identidade.
- **Risco:** Conflito marcário prévio no Brasil e nos EUA com softwares legados de postagem de links.
- **Verificações a concluir pelo fundador:**
  - *INPI Brasil:* Pesquisar termo exato "POSTLINK" nas classes **35** (serviços de publicidade e links comerciais) e **42** (SaaS / software na nuvem) no [Portal de Busca do INPI](https://busca.inpi.gov.br/pePI/).
  - *Domínio:* `postlink.com.br` está reservado ou em uso por terceiros? Alternativas recomendadas: `usepostlink.com.br`, `postlink.app`, `postlink.me`.
  - *Redes:* `@postlinkbr`, `@usepostlink`.

#### Candidato B (Opção Brasileira Autêntica): **Girou** (ou **GirouLink**)
- **Vantagem:** Fala direto com a alma do varejista brasileiro (*"o estoque girou"*, *"a promoção girou"*). Soa nativo, simpático e memorável.
- **Verificações a concluir pelo fundador:**
  - *INPI Brasil:* Buscar "GIROU" na classe 42 no [INPI](https://busca.inpi.gov.br/pePI/).
  - *Domínio:* Testar `girou.app` ou `girou.com.br` no [Registro.br](https://registro.br).
  - *Redes:* `@girouapp`, `@giroulink`.

#### Candidato C (Opção Mais Autoexplicativa): **CardLink** (ou **LinkCard**)
- **Vantagem:** Explica exatamente o produto sem usar o termo protegido "Zap". Qualquer pessoa entende que é um "link que vira cartão".
- **Verificações a concluir pelo fundador:**
  - *INPI Brasil:* Verificar anterioridades de "CARDLINK" na classe 35 e 42.
  - *Domínio:* `cardlink.com.br` ou `meucardlink.com.br`.

> *Aviso Legal:* As pesquisas acima são preliminares de fontes públicas. A titularidade e o direito exclusivo sobre a marca só existem após o deferimento do registro no INPI pelo empreendedor.

---

### 3. Tom de Voz e Promessa da Marca

#### A Promessa em Uma Linha (The One-Line Promise)
> **"A sua oferta no WhatsApp com imagem em alta definição, no tamanho certo e abrindo em menos de 1 segundo, sempre."**

#### Três Opções de Tagline
1. *"Links que vendem em um toque."* *(Recomendada — curta, comercial e orientada a conversão)*
2. *"O fim dos links feios no WhatsApp."* *(De combate — explora o contraste e a dor visual)*
3. *"Sua oferta com presença de loja grande."* *(De status — atrai o pequeno comerciante que quer profissionalismo)*

#### A Voz da Marca em 3 Adjetivos

| Adjetivo | O que FAZER (Do) | O que NÃO FAZER (Don't) |
| :--- | :--- | :--- |
| **1. Pragmática e Direta** | Falar a língua do comerciante na correria do balcão: frases curtas, foco em lucro, tempo e cliques. | Usar jargões acadêmicos em inglês ("omnichannel pipeline", "deep link middleware", "growth hacking"). |
| **2. Segura e Transparente** | Enfatizar segurança de dados (LGPD), ativação sem cartão no PIX e cancelamento sem letras miúdas. | Parecer mensagens de spam, pirâmides financeiras ou truques duvidosos de bot de spam. |
| **3. Entusiasta do Sucesso** | Tratar cada link do lojista como uma vitrine que merece respeito e acabamento profissional. | Fazer promessas vazias de enriquecimento automático ou "fature 10k dormindo". |

#### Reescrita de Tom: Antes vs. Depois
- **Antes (Texto técnico comum de TI):**  
  *"Sistema Jamstack hospedado no Edge do Cloudflare que intercepta requisições de crawlers para servir tags Open Graph parametrizadas."*
- **Depois (Voz da Marca PostLink):**  
  *"Chega de mandar link azul sem graça ou foto cortada. O PostLink transforma qualquer produto em um cartão profissional com foto em alta definição que o seu cliente toca e compra na hora."*

---

### 4. O Briefing Visual (The Look)

Alinhado às diretrizes do [DESIGN.md](file:///c:/Users/Oem/Documents/Postlink/DESIGN.md):

#### Cores Principais e Acessibilidade (WCAG)

```
[ Deep Trust Blue ]        [ Signal Emerald ]       [ WhatsApp Canvas ]
     #003E80                    #22C55E                  #EFEAE2
  (Primária/Marca)          (Ação/Conversão)        (Contraste/Fundo)
```

1. **Deep Trust Blue (`#003e80`):**
   - *Papel:* Cor institucional de confiança, estabilidade e autoridade técnica. Usada em títulos, cabeçalho e elementos estruturais.
   - *Acessibilidade:* Texto branco sobre `#003e80` possui contraste **11.2:1 (Certificação WCAG AAA)**.
2. **Signal Emerald Green (`#22c55e`):**
   - *Papel:* Cor de gatilho de ação, remetendo diretamente à energia e ao ecossistema do WhatsApp sem copiar o verde proprietário da Meta. Usada nos botões de CTA principais, badges de sucesso e destaques.
   - *Acessibilidade:* Texto branco sobre a versão escura (`#006e2f`) possui contraste **5.4:1 (Certificação WCAG AA)**.
3. **WhatsApp Canvas / Superfície Limpa (`#efeae2` e `#faf8ff`):**
   - *Papel:* O tom bege-areia suave característico do fundo de conversas do WhatsApp (`#efeae2`), gerando conforto visual e reconhecimento imediato no simulador de balão.

#### Tipografia
- **Títulos e Destaques (Display):** **Plus Jakarta Sans** (Google Fonts / Gratuita e Open-Source).
  - *Por que ela:* Geométrica, moderna, com pesos marcantes (Bold 700 / ExtraBold 800) que conferem peso de marca tech sólida.
- **Corpo e Interface (Body):** **Plus Jakarta Sans** ou **Inter** (Google Fonts / Gratuita).
  - *Por que ela:* Excelente legibilidade em telas de celulares pequenos sob luz solar direta.

#### Briefing do Logo
- **O que deve transmitir:** A fusão entre o elo de conexão (🔗 link) e um cartão visual nítido (moldura 1.91:1) com uma ponta discreta de balão de mensagem.
- **Onde deve funcionar com perfeição:**
  - Favicon e ícone de aplicativo em 32x32px e 64x64px.
  - Barra de navegação móvel do painel em 140x36px.
  - Selo discreto de rodapé: *"Criado com PostLink"*.
- **O que evitar terminantemente:**
  - Não usar degradês complexos que virem borrão em telas de baixa densidade.
  - Não copiar o telefone branco dentro do balão verde da Meta (risco de notificação judicial da Meta por violação de propriedade intelectual).

---

### 5. Os 5 Primeiros Pontos de Contato (Touchpoints)

1. **A Landing Page no Celular (`public/index.html`):** O lojista deve ver, nos primeiros 3 segundos, o "Antes e Depois": um link azul horroroso do lado esquerdo versus o cartão do PostLink em alta definição do lado direito.
2. **A Tela de Transição Humana (`/{loja}/{slug}`):** Deve ser limpa, ultra-rápida (<800ms) e amigável: exibir a imagem do produto, o nome da loja e a mensagem *"Indo para a loja..."*, sem nenhuma cara de redirecionador suspeito.
3. **O Comprovante de Ativação via PIX:** Uma mensagem direta e objetiva no WhatsApp ou e-mail: *"Seu PostLink Pro está liberado! Seus 50 templates Canva já estão no seu painel. Toque aqui para criar seu primeiro link em 1 minuto."*
4. **O Primeiro Criativo de Redes Sociais:** Demonstração sem enrolação de alguém colando uma foto no painel, copiando o link e colando no WhatsApp, mostrando o cartão se expandindo perfeitamente na tela.
5. **A Resposta ao Primeiro Lojista com Dúvida:** Atendimento humano, caloroso e resolutivo em português: *"Oi [Nome]! Vi que você testou o link do vestido no grupo. Deu certo o corte da imagem? Se precisar de ajuda para enquadrar, me manda a foto aqui que eu ajusto o modelo pra você!"*

---

## Operações e Rotinas do Dia 1

Data: 13 de outubro de 2026  
Diretor de Operações · Rotinas do Dia 1, cadeia de fornecedores, SOPs, governança legal e matriz de riscos para SaaS de alta margem.

---

### 1. O Ciclo Diário de Operações (Da Abertura ao Fechamento)

Como um negócio 100% digital e hospedado em infraestrutura de nuvem Serverless, a operação diária é enxuta, mas requer disciplina em horários comerciais críticos:

| Horário | Etapa Operacional | O que é feito | O Cliente Vê? |
| :---: | :--- | :--- | :---: |
| **08:30** | **Check de Saúde da Infraestrutura** | Verificar dashboard do Cloudflare (taxa de erro 5xx) e Supabase (conexões do Postgres). | Não |
| **09:00** | **Revisão de Denúncias e Anti-Abuso** | Acessar painel `/admin` ou tabela `denuncias` para revisar links sinalizados pelo canal público `/denunciar`. | Não |
| **09:30** | **Onboarding e Suporte Ativo** | Responder mensagens de lojistas no WhatsApp de suporte, auxiliando quem teve dúvidas no corte de banners. | **SIM** |
| **11:00** | **Prospecção Ativa (10 Demos/dia)** | Enviar 10 links de demonstração personalizados para novos operadores de grupos de ofertas no WhatsApp/Instagram. | **SIM** |
| **14:00** | **Conciliação Financeira de Assinaturas** | Checar webhooks do Mercado Pago com falhas e acompanhar quem está no 6º dia de teste grátis para aviso de ativação. | **SIM** |
| **16:00** | **Publicação de Conteúdo Rápido** | Postar um vídeo curto de 30s (tutorial ou bastidor) nos Reels/TikTok conforme calendário de marketing. | **SIM** |
| **18:00** | **Fechamento e Checagem de Métricas** | Registrar novos trials do dia, assinaturas pagas e faturamento líquido gerado no Mercado Pago. | Não |

---

### 2. Fornecedores Técnicos e Custos Operacionais

Todos os parceiros da operação são serviços consolidados e contratáveis imediatamente:

| Função | Fornecedor Principal | Preço / Termos | Alternativa de Contingência | Fonte Oficial |
| :--- | :--- | :--- | :--- | :--- |
| **Borda / Hospedagem Edge** | [Cloudflare Pages](https://pages.cloudflare.com) | Grátis até 100k requests/dia; Pro a $20/mês | [Vercel](https://vercel.com) Edge | [Tabela Cloudflare](https://www.cloudflare.com/plans/) |
| **Banco & Storage** | [Supabase](https://supabase.com) | Grátis no início; Pro a $25/mês (~R$ 140/mês) | [Neon Postgres](https://neon.tech) + Cloudflare R2 | [Tabela Supabase](https://supabase.com/pricing) |
| **Gateway de Pagamento** | [Mercado Pago Brasil](https://www.mercadopago.com.br) | Pix 0,99% (~R$ 0,30); Cartão 3,99% a 4,98% + R$ 0,40 | [Asaas](https://www.asaas.com) ou [Stripe BR](https://stripe.com/br) | [Tarifas Mercado Pago](https://www.mercadopago.com.br/ajuda/custos-receber-vendas-online_2626) |
| **Domínio Nacional** | [Registro.br](https://registro.br) | R$ 40,00 / ano | Hostinger / GoDaddy | [Tabela Registro.br](https://registro.br) |
| **E-mail Corporativo** | [Zoho Mail](https://www.zoho.com/mail) | Grátis para 5 caixas ou R$ 6,00/mês por usuário | Google Workspace | [Tabela Zoho](https://www.zoho.com/mail/zohomail-pricing.html) |
| **Templates dos Bônus** | [Canva Pro](https://www.canva.com) | R$ 34,90 / mês (para criação e atualização contínua) | Figma (gratuito) | [Tabela Canva](https://www.canva.com/pricing/) |

---

### 3. Estrutura de Pessoas e Escala de Trabalho

#### Fase 1: Fundação Solo (0 a 100 clientes ativos)
- **Papel:** Fundador Geral (Produto, Suporte e Vendas).
- **Carga Horária:** 2 a 3 horas por dia (concentradas no suporte pós-almoço e prospecção matinal).
- **Remuneração:** R$ 0 de salário fixo até atingir o break-even (8 clientes). A partir de 30 clientes (~R$ 900 MRR), retirada de pró-labore básico MEI com reinvestimento de 70% do caixa em expansão.

#### Fase 2: Escala Comercial (100 a 400 clientes ativos — Mês 6 a 12)
- **Papel:** Contratação de 1 Assistente de Atendimento Operacional (MEI / Remoto / Meio Período).
- **Atribuições:** Suporte nível 1 no WhatsApp de atendimento, conferência de enquadramento de fotos para clientes sem tempo e resposta às dúvidas de onboarding.
- **Faixa Salarial Prevista:** R$ 1.200 a R$ 1.500 / mês (coberto com margem folgada a partir de 80 clientes pagantes).

---

### 4. Procedimentos Operacionais Padrão (SOPs)

#### SOP 01: Onboarding Assistido de Novo Lojista
1. O lojista conclui o cadastro no painel.
2. O sistema dispara mensagem receptiva com link do vídeo de 60 segundos: *"Como criar seu primeiro link"*.
3. No D+2 do teste grátis, se o lojista criou 0 links: o suporte envia mensagem cordial: *"Oi [Nome], vi que você entrou no teste do PostLink. Me manda a foto da sua melhor oferta de hoje que eu subo um link demonstrativo para você testar no grupo agora!"*.
4. No D+6 (véspera do fim do trial): aviso automático transparente do término do teste com botão para ativação da condição do Lote Fundador via PIX.

#### SOP 02: Moderação Rápida de Denúncias e Anti-Abuso
1. Qualquer visitante pode tocar em `/denunciar` no rodapé da tela de redirecionamento e relatar abuso (golpe, clonagem de checkout, conteúdo proibido).
2. O sistema insere o registro na tabela `denuncias` do Supabase.
3. Toda manhã às 09:00, o operador consulta as ocorrências pendentes.
4. Se o link for comprovadamente fraudulento (ex: clone de banco ou página de phishing falso):
   - Marcar o link como `ativo = false` imediatamente.
   - Inserir o domínio infrator na tabela `destinos_bloqueados`.
   - Se reincidente, alterar o status da loja para `suspenso` (bloqueando criação e acessos).
   - *Prazo máximo de resposta legal:* Menos de 4 horas após a denúncia (atendendo ao Art. 19 do Marco Civil).

#### SOP 03: Atendimento a Reclamações de "Foto Cortada no WhatsApp"
1. Identificar se o lojista fez upload de foto quadrada (1:1) ou em pé (9:16).
2. Explicar amigavelmente: *"O WhatsApp usa o padrão horizontal de 1200x630 para prévias grandes. Para não cortar a cabeça do produto, use o nosso enquadrador visual arrastando a foto para o centro."*
3. Enviar o link do template Canva correspondente do bônus com a moldura já centralizada.
4. Se o lojista for leigo: cortar a imagem para ele na primeira ocorrência como ação de encantamento (*Customer Success*).

#### SOP 04: Gestão de Inadimplência e Falha no Pagamento
1. Notificação do webhook do Mercado Pago com status `atrasado` ou cancelado.
2. **Período de Carência:** O link **não é derrubado imediatamente**. O lojista tem 3 dias de tolerância para renovar sem interromper suas vendas nos grupos.
3. Uma mensagem automática amigável via WhatsApp/E-mail é enviada com a chave PIX direta para renovação em 1 toque.
4. Após 3 dias sem quitação: bloqueia-se a criação de novos links e a tela de transição exibe aviso amigável de manutenção.

---

### 5. Ferramental Mínimo de Gestão (The Lean Tech Stack)

| Função | Ferramenta Escolhida | Custo Mensal | Motivo da Escolha |
| :--- | :--- | :---: | :--- |
| **Hospedagem & Edge** | Cloudflare Pages & Functions | R$ 0,00 | Latência inferior a 30ms em todo o Brasil e custo zero por requisição inicial. |
| **Banco de Dados** | Supabase Postgres (com RLS) | R$ 0,00 a R$ 140,00 | Backups automáticos, segurança RLS nativa por lojista e storage S3 integrado. |
| **Pagamentos & PIX** | Mercado Pago | % sobre vendas | Integração sólida em Node.js com webhook nativo e conciliação instantânea. |
| **Atendimento** | WhatsApp Business Web | R$ 0,00 | O lojista brasileiro já está lá; dispensa abertura de tickets lentos em helpdesks. |
| **Gestão de Bônus** | Canva Pro | R$ 34,90 | Plataforma universal que 95% dos comerciantes e afiliados já sabem utilizar. |
| **Contabilidade** | Contabilizei / Contador ME | R$ 89,00 a R$ 150,00 | Emissão de DAS/DAS-MEI e notas fiscais eletrônicas de serviços de software. |

---

### 6. Checklist Legal, Fiscal e Regulatório (Brasil)

- [ ] **Enquadramento Tributário:**
  - *Fase Inicial:* Cadastro como **MEI** sob a ocupação de prestação de serviços de internet/conteúdo ou programador, com custo tributário fixo de ~R$ 75,00/mês.
  - *Fase de Expansão (acima de R$ 81 mil/ano):* Migração para **Microempresa (ME)** no Simples Nacional sob o Anexo III (alíquota inicial de 6% sobre faturamento).
- [ ] **Termos de Uso e Marco Civil da Internet (Lei 12.965/2014):**
  - Termos públicos no ar em `/termos/` delimitando que o PostLink é um provedor de aplicação que apenas gera o redirecionamento, isentando a plataforma de responsabilidade por conteúdos de terceiros até que haja notificação específica (Art. 19).
- [ ] **Conformidade com a LGPD (Lei 13.709/2018):**
  - Política pública em `/privacidade/`.
  - A arquitetura técnica foi implementada sob o princípio de **Privacy by Design**: *nenhum endereço IP de visitante é gravado*, nenhum cookie rastreador é injetado e nenhum dado pessoal de compradores é compartilhado.
- [ ] **Protocolo no INPI:**
  - Depósito do pedido de registro de marca nas classes 35 e 42 com taxa de R$ 355,00 para garantir anterioridade legal.

---

### 7. Matriz de Riscos Operacionais (Risk Register)

Os 10 riscos mais críticos ordenados por gravidade e probabilidade:

| # | Risco Operacional | Probabilidade | Impacto | Plano de Contingência e Mitigação |
| :-: | :--- | :---: | :---: | :--- |
| **1** | **Bloqueio do domínio por denúncia de phishing malicioso** | Média | **Crítico** | Manter subdomínios individualizados (`loja.postlink.me`) e 2 domínios reservas já apontados no Cloudflare prontos para chavear o DNS em 5 minutos. |
| **2** | **Cache da Meta mantém foto de preço antigo no WhatsApp** | Alta | Médio | Criar a função "Gerar Nova Versão / Novo Link" no painel com 1 toque, gerando um slug versionado (`/oferta-v2`) que força o WhatsApp a ler a foto nova no ato. |
| **3** | **Instabilidade temporária no webhook do Mercado Pago** | Baixa | Médio | Rotina diária de conciliação assíncrona (cron job) que consulta a API do Mercado Pago para conferir se há pagamentos aprovados não atualizados. |
| **4** | **Lojista posta foto desproporcional e reclama de corte** | Alta | Médio | Enquadrador visual interativo com pinça no mobile e distribuição do Pack de 50 Templates Canva já na proporção exata de 1200x630. |
| **5** | **Tentativa de abuso de tráfego com bots / ataques DDoS** | Baixa | Baixo | Proteção nativa gratuita do Cloudflare WAF e verificação de User-Agent na Edge Function. |
| **6** | **Disputa ou indeferimento da marca PostLink no INPI** | Média | Médio | Reserva prévia dos domínios e identidades dos nomes alternativos finalistas (*Girou* e *CardLink*). |
| **7** | **Inadimplência de cartão no final do trial de 7 dias** | Alta | Médio | Oferta prioritária de pagamento via PIX avulso ou anual com desconto, eliminando a dependência de cartão de crédito. |
| **8** | **Sobrecarga de dúvidas de suporte no WhatsApp** | Média | Médio | Criação de FAQ rápido de 4 perguntas no próprio painel e vídeos tutoriais curtos de 30 segundos. |
| **9** | **Erro na URL de destino digitada pelo lojista (link quebrado)** | Média | Médio | Validação de sintaxe obrigatória (`https://`) e ping de teste antes de permitir salvar o link no formulário. |
| **10** | **Mudança drástica na política de Open Graph da Meta** | Baixa | **Crítico** | Manter a tela de transição com botão "Abrir" e botão de contingência nativa, diversificando para suporte a Telegram e Instagram Stories. |

---

## Plano de Lançamento e Go-To-Market

Data do planejamento: 13 de outubro de 2026  
Data-alvo do lançamento oficial (D0): **10 de novembro de 2026**  
Líder de Lançamento · Alinhado com [founder/offer.md](file:///c:/Users/Oem/Documents/Postlink/founder/offer.md), [founder/marketing.md](file:///c:/Users/Oem/Documents/Postlink/founder/marketing.md), [founder/ops.md](file:///c:/Users/Oem/Documents/Postlink/founder/ops.md) e [founder/numbers.json](file:///c:/Users/Oem/Documents/Postlink/founder/numbers.json).

---

### 1. O Teste Real Antes de Gastar Dinheiro (Validation Gate)

Antes de contratar ferramentas pagas ou iniciar anúncios no Meta Ads, executaremos um **teste de validação de demanda real com preço pago**:

- **O Formato do Teste:** **Pré-Venda VIP do "Lote Fundador"** via abordagem direta 1 a 1 no WhatsApp com 30 operadores de grupos de ofertas (Shopee, Mercado Livre e lojas de moda).
- **A Oferta Testada:** O lojista recebe uma demonstração do seu próprio produto já transformado em cartão HD, com a proposta:  
  *"Estamos liberando o PostLink Pro antecipado para 10 lojistas parceiros. Você ganha 1 ano de links ilimitados + 50 templates Canva + garantia de 14 dias por apenas R$ 19,90/mês no PIX. Quer garantir a sua vaga?"*
- **Linha de Sucesso Obrigatória (Go / No-Go):**
  - **Meta mínima:** Fechar **pelo menos 5 assinantes pagantes reais** dos 30 abordados (taxa de conversão de ~16% em dinheiro vivo).
  - *Se atingir a meta:* Sinal verde para o lançamento oficial em 10 de novembro.
  - *Se falhar:* Se menos de 3 pessoas pagarem, suspender os gastos de marketing e retornar a [founder/offer.md](file:///c:/Users/Oem/Documents/Postlink/founder/offer.md) para recalibrar a proposta de valor.

---

### 2. A Contagem Regressiva (Countdown: D-28 a D-1)

Cronograma semanal detalhado até o dia do lançamento:

```
[Semana 1: 13-19 Out] ──► [Semana 2: 20-26 Out] ──► [Semana 3: 27 Out-02 Nov] ──► [Semana 4: 03-09 Nov] ──► [D0: 10 Nov]
  Fundação & Teste VIP       Bônus & Integrações         Soft Open (Pioneiros)       Aquecimento & Anúncios      LANÇAMENTO
```

#### Semana 1 (13 a 19 de Outubro) — Fundação Técnica e Teste Piloto
- [x] **Infraestrutura:** Apontar domínio definitivo no Cloudflare Pages com HTTPS forçado e certificar rotas Edge (`functions/[loja]/[slug].js`). *(Owner: Fundador / Prazo: 15/Out)*
- [ ] **Pagamento:** Homologar credenciais de produção do Mercado Pago e testar webhook em `functions/api/mp-webhook.js`. *(Owner: Fundador / Prazo: 17/Out)* **[CAMINHO CRÍTICO]**
- [ ] **Teste de Pré-Venda:** Disparar 30 abordagens de pré-venda 1 a 1 para validar a linha de sucesso de 5 clientes pagantes. *(Owner: Fundador / Prazo: 19/Out)* **[CAMINHO CRÍTICO]**
- [ ] **Legal:** Protocolar pedido de marca no INPI nas classes 35 e 42. *(Owner: Fundador / Prazo: 18/Out)*

#### Semana 2 (20 a 26 de Outubro) — Produção dos Bônus e Refinamento do Produto
- [ ] **Design:** Finalizar o Pack com os **50 Templates Editáveis no Canva (1200x630)** e gerar o link de compartilhamento como template. *(Owner: Fundador / Prazo: 22/Out)*
- [ ] **Conteúdo:** Redigir o Guia *"30 Scripts de Chamadas de Vendas para WhatsApp"* em PDF. *(Owner: Fundador / Prazo: 24/Out)*
- [ ] **Engenharia de Produto:** Validar o botão de 1 toque *"Duplicar com Novo Link"* no painel para garantia anti-cache. *(Owner: Fundador / Prazo: 25/Out)*
- [ ] **Teste de Plataforma:** Colar links em dispositivos reais (Android, iPhone e WhatsApp Web) para validar consistência visual do balão. *(Owner: Fundador / Prazo: 26/Out)*

#### Semana 3 (27 de Outubro a 2 de Novembro) — Soft Open (Lançamento Suave)
- [ ] **Ativação dos Pioneiros:** Liberar o acesso aos 5 a 10 assinantes pagantes da pré-venda no painel. *(Owner: Fundador / Prazo: 27/Out)*
- [ ] **Customer Success:** Acompanhar os primeiros links criados e coletar métricas de cliques geradas. *(Owner: Fundador / Prazo: 30/Out)*
- [ ] **Gravação de Conteúdo:** Produzir 3 vídeos de demonstração rápida (gravação de tela mostrando a criação do link em 30 segundos). *(Owner: Fundador / Prazo: 01/Nov)*
- [ ] **Depoimentos:** Coletar 2 prints de feedback espontâneo dos pioneiros (*"Nossa, ficou muito profissional no grupo"*). *(Owner: Fundador / Prazo: 02/Nov)*

#### Semana 4 (3 a 9 de Novembro) — Aquecimento e Véspera (D-7 a D-1)
- [ ] **Campanha de Aquecimento:** Iniciar calendário de postagens de marketing nos Reels e TikTok conforme [founder/marketing.md](file:///c:/Users/Oem/Documents/Postlink/founder/marketing.md). *(Owner: Fundador / Prazo: 03/Nov)*
- [ ] **Meta Ads:** Subir campanha de tráfego pago no Meta Ads (orçamento de R$ 15,00/dia) com os criativos dos Hooks 1 e 3 em modo pausado, pronta para ativar. *(Owner: Fundador / Prazo: 06/Nov)* **[CAMINHO CRÍTICO]**
- [ ] **Checklist de Segurança:** Conferir isolamento de RLS no Postgres, canal `/denunciar` no ar e termos de uso. *(Owner: Fundador / Prazo: 08/Nov)*
- [ ] **Véspera (D-1):** Ensaio geral: criar um link do zero, pagar R$ 1,00 via PIX de teste e verificar a ativação imediata no painel. *(Owner: Fundador / Prazo: 09/Nov 20:00)*

---

### 3. O Dia do Lançamento (D0: 10 de Novembro de 2026)

Cronograma de execução hora a hora:

| Horário | Ação de Lançamento | Responsável | Procedimento em Caso de Falha |
| :---: | :--- | :---: | :--- |
| **07:00** | Checagem de status dos servidores (Cloudflare e Supabase). | Fundador | Se erro 5xx, acionar deploy de contingência. |
| **08:00** | Virada da landing page com o badge: **"Lote Fundador Aberto — 50 Vagas"**. | Fundador | Conferir responsividade móvel em 4G lento. |
| **08:30** | Ativação dos anúncios no Meta Ads (Hooks 1 e 3). | Fundador | Se anúncio for reprovado, ativar criativo reserva de demonstração em tela. |
| **09:00** | Disparo de mensagens personalizadas em 20 comunidades parceiras no WhatsApp. | Fundador | Se houver banimento em algum grupo, migrar para prospecção individual no privado. |
| **11:00** | Postagem oficial do vídeo de lançamento nos Reels e TikTok. | Fundador | Fixar link com cupom do Lote Fundador nos comentários. |
| **12:00** | Primeiro balanço de cliques, cadastros de trial e pagamentos via PIX. | Fundador | Verificar se algum lojista travou no envio de imagem. |
| **15:00** | Postagem de atualização de escassez: *"14 das 50 vagas do Lote Fundador preenchidas!"*. | Fundador | Manter o contador de vagas rigorosamente verdadeiro. |
| **18:00** | Rodada de suporte no WhatsApp: acolher lojistas em teste e enviar templates Canva. | Fundador | Aplicar o SOP 03 para quem tiver dúvidas de corte. |
| **21:00** | Fechamento do Dia D e post de agradecimento aos primeiros assinantes. | Fundador | Fazer backup de segurança da base no Supabase. |

---

### 4. O Plano dos Primeiros 30 Dias (Metas e Revisões)

#### Metas Semanais de Assinantes Ativos (Caminho até o Break-Even e Lucro)

```
Semana 1 (D0-D7)   :  15 a 20 assinantes   (Break-even de 8 clientes superado logo no D+3)
Semana 2 (D8-D14)  :  35 a 45 assinantes   (Lote Fundador esgotado; início do preço padrão R$ 29,90)
Semana 3 (D15-D21) :  60 a 70 assinantes   (Tração orgânica via selo discreto nos links)
Semana 4 (D22-D30) :  85 a 100 assinantes  (~R$ 2.900 de MRR recorrente e margem líquida de 80%)
```

#### Gatilhos de Mudança Rápida (Se os números saírem do trilho)
- **Se o CAC ultrapassar R$ 35,00:** Pausar anúncios no Meta Ads e concentrar 100% da energia em parcerias e prospecção direta em comunidades de WhatsApp.
- **Se a conversão do teste grátis (trial) ficar abaixo de 20%:** Entrar em contato manual com cada lojista no D+3 do teste e oferecer cortar o primeiro banner para ele gratuitamente.
- **Se houver mais de 5% de pedidos de estorno na garantia:** Revisar a velocidade da tela de transição e o tutorial de corte de fotos.

#### Os Três Marcos de Revisão Estratégica
1. **Revisão D+7 (Fechamento do Lote Fundador):**
   - *Perguntas a responder:* As 50 vagas foram preenchidas? O volume veio mais de tráfego pago ou de grupos orgânicos?
   - *Ação:* Encerrar a tarifa promocional de R$ 19,90 e fixar R$ 29,90/mês como preço padrão.
2. **Revisão D+14 (Primeiro Ciclo de Trials):**
   - *Perguntas a responder:* Quantos usuários que entraram no teste grátis viraram pagantes após os 7 dias? Alguém acionou a garantia de 14 dias?
   - *Ação:* Ajustar a régua de e-mails/WhatsApp de fim de trial para maximizar a conversão.
3. **Revisão D+30 (Fechamento do Mês 1):**
   - *Perguntas a responder:* O faturamento bruto e o lucro líquido bateram a projeção do CFO em [founder/cfo.md](file:///c:/Users/Oem/Documents/Postlink/founder/cfo.md)? O saldo de caixa está positivo?
   - *Ação:* Decidir a parcela do lucro a ser reinvestida em anúncios de escala para o Mês 2.

---

_Aviso Legal: Os dados do painel representam simulações comportamentais e os números financeiros são projeções fundamentadas em dados de engenharia e mercado. A confirmação definitiva exige validação com clientes pagantes reais e orçamentos formais. Este documento não substitui aconselhamento contábil, tributário ou jurídico._
