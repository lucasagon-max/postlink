---
name: PostLink
description: Smart link generator for WhatsApp with HD Open Graph cards
colors:
  primary: "#003e80"
  primary-container: "#1e56a0"
  on-primary: "#ffffff"
  primary-fixed: "#d6e3ff"
  secondary: "#22c55e"
  secondary-dark: "#006e2f"
  secondary-container: "#dcfce7"
  on-secondary-container: "#007432"
  tertiary: "#004842"
  background: "#faf8ff"
  surface: "#faf8ff"
  surface-card: "#ffffff"
  surface-container-low: "#f2f3ff"
  surface-container: "#eaedff"
  surface-container-high: "#e2e7ff"
  on-surface: "#131b2e"
  on-surface-variant: "#424751"
  outline: "#737782"
  outline-variant: "#c2c6d3"
  error: "#ba1a1a"
  error-container: "#ffdad6"
  on-error-container: "#410002"
  wa-canvas: "#efeae2"
typography:
  icons:
    fontFamily: "'Material Symbols Outlined'"
  display:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: "clamp(2rem, 5vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.02em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  2xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  2xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-container}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg}"
    padding: "12px 20px"
  button-secondary-hover:
    backgroundColor: "{colors.secondary-dark}"
  button-hero-cta:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.xl}"
    padding: "16px 32px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  chip-demo:
    backgroundColor: "{colors.surface-container-low}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "4px 8px"
  badge-pill:
    backgroundColor: "{colors.secondary-container}"
    textColor: "{colors.on-secondary-container}"
    rounded: "{rounded.full}"
    padding: "6px 14px"
---

# Design System: PostLink

## Overview

**Creative North Star: "The Retail Signal"**

O design system do PostLink é concebido para transformar a comunicação comercial cotidiana em uma alavanca direta de conversão via WhatsApp e redes sociais. Ele equilibra a sobriedade institucional e técnica de uma infraestrutura em nuvem de alto desempenho com o impacto visual vibrante e direto do varejo digital.

O sistema opera em dois modos complementares e integrados:
- **Modo Persuade (Landing Page · `public/index.html`):** Focado em conversão e convencimento imediato. Destaca a discrepância visual entre links ordinários e cartões em alta definição, oferecendo demonstração interativa em tempo real sem atrito de cadastro (*try before signup*), comparativos pedagógicos de impacto visual e chamadas para ação com gradientes de alta energia.
- **Modo Operate (Painel do Lojista · `public/painel/index.html`):** Focado em velocidade, escaneabilidade e gestão eficiente. Recua as molduras para dar destaque aos cartões gerados, facilitando a criação de links, consulta de métricas e controle de assinatura em um fluxo ágil de baixa carga cognitiva.

**Key Characteristics:**
- **Clareza utilitária com apelo de conversão:** Tipografia geométrica legível com pesos expressivos combinados a ações de alto contraste.
- **Fidelidade nativa de mensageria:** Simulação hiper-realista do balão de conversa do WhatsApp (proporção 1.91:1, textura de fundo autêntica `#efeae2` e balão `#E7FFDB`).
- **Camadas tonais limpas (Flat-by-Default):** Profundidade arquitetada por transições tonais sutis (`#faf8ff`, `#f2f3ff`, `#eaedff`) e bordas translúcidas de 1px, sem poluição de sombras pesadas ou cartões aninhados redundantes.
- **Interação tátil e ágil:** Feedback tátil instantâneo ao toque e clique (`active:scale-95`), reforçando a agilidade de uma ferramenta de alta produtividade para comerciantes.

## Colors

A paleta contrapõe a base institucional marítima ao verde-esmeralda elétrico característico do ecossistema do WhatsApp, estabelecendo hierarquia rigorosa entre autoridade técnica e incentivo à conversão.

### Primary
- **Deep Maritime Navy** (`#003e80`): Âncora institucional da marca. Utilizado em logotipos, títulos principais, botões estruturais, badges institucionais e gradientes hero.
- **Deep Maritime Container** (`#1e56a0`): Variação de apoio para estados de hover de botões primários, gradientes de encerramento e destaques textuais no Hero.
- **Primary Fixed** (`#d6e3ff`): Superfície de apoio para números de etapas de processo e chips de categorias ativas.

### Secondary
- **Signal Emerald** (`#22c55e`): O acento vital de conversão. Reservado para botões de ação principal ("Começar Grátis", "Criar Link Grátis Agora", "Ver Cartão HD"), confirmações de sucesso e indicadores de status online.
- **Signal Emerald Dark** (`#006e2f`): Estados de hover de botões de conversão e tipografia de alto contraste sobre fundos claros.
- **Signal Emerald Container** (`#dcfce7`): Fundo de pílulas de destaque, badges de benefício ("1200x630 HD", "Melhor Escolha") e feedback de validação.
- **On Secondary Container** (`#007432`): Texto de alto contraste sobre superfícies verdes claras.

### Tertiary
- **Deep Forest Cyan** (`#004842`): Utilizado para acentos analíticos pontuais e segmentação funcional avançada.

### Neutral & Surfaces
- **Clean Slate Background** (`#faf8ff`): Superfície de fundo de toda a aplicação, promovendo respiro visual e sensação de amplitude.
- **Pure Surface Card** (`#ffffff`): Fundo principal de cartões de conteúdo, inputs e janelas modais.
- **Low Tone Surface** (`#f2f3ff`): Superfície de agrupamento interno, áreas de filtros inativos e containers do widget de demonstração.
- **High Tone Surface** (`#eaedff`): Estados de hover sobre áreas neutras e divisores de seção.
- **Dark Navy Ink Text** (`#131b2e`): Cor primária de texto para leitura sem esforço.
- **Muted Slate Text** (`#424751`): Texto secundário, descrições auxiliares e subtítulos.
- **Outline Subtle** (`#c2c6d3`): Linhas de demarcação de 1px com transparência para caixas, cartões e divisórias.

### Semantic & Comparison
- **Error Red** (`#ba1a1a`): Delimitação do cenário negativo ("Antes / Link comum sem PostLink") no comparativo visual e mensagens de falha.
- **Error Container** (`#ffdad6`): Fundo do badge de alerta de link comum com baixa conversão.
- **On Error Container** (`#410002`): Texto de contraste sobre o badge de erro.
- **WhatsApp Canvas** (`#efeae2`): Fundo canônico do padrão de papel de parede do WhatsApp, acompanhado do balão nativo `#E7FFDB` e ticks azuis `#53BDEB`.

### Named Rules
**The WhatsApp Anchor Rule.** O verde Signal Emerald (`#22c55e`) é rigorosamente reservado para conversão, status positivos e elementos de mensageria; nunca deve ser diluído em fundos genéricos de tela cheia ou botões de cancelamento.
**The Comparison Split Rule.** No bloco comparativo Antes vs Depois, o cenário "Antes" deve utilizar exclusivamente bordas e selos em tons de Erro (`#ba1a1a`/`#ffdad6`), enquanto o cenário "Depois" utiliza verde Signal Emerald e anel externo de celebração (`ring-4 ring-secondary-container/30`).
**The High-Contrast Text Rule.** Qualquer texto interativo ou funcional deve atender ao contraste mínimo de 4.5:1 (WCAG AA), assegurando legibilidade plena em smartphones sob iluminação externa.

## Typography

**Display Font:** Plus Jakarta Sans (`'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`)  
**Body Font:** Plus Jakarta Sans  
**Icons:** Material Symbols Outlined (`'Material Symbols Outlined'`)  
**Monospace / Technical:** Monospace nativo do sistema para URLs, slugs e identificadores de links.

### Hierarchy
- **Display** (`clamp(2rem, 5vw, 3rem)`, peso 800, line-height 1.15, letter-spacing `-0.02em`): Chamada principal do Hero da Landing Page, com suporte a realces textuais orgânicos (`underline decoration-secondary decoration-wavy`).
- **Headline** (`1.5rem` / `24px` a `2rem` / `32px`, peso 700-800, line-height 1.25): Títulos de seções da Landing Page ("Antes vs Depois", "Como funciona em 3 passos") e cabeçalhos principais do painel (`h1`).
- **Title** (`1.125rem` / `18px` a `1.25rem` / `20px`, peso 600-700, line-height 1.3): Títulos de cartões, modais e etapas numeradas (`h2`).
- **Body** (`0.875rem` / `14px`, peso 400-500, line-height 1.5): Textos explicativos, corpo do widget e instruções comerciais.
- **Label / Micro** (`0.75rem` / `12px`, peso 600, line-height 1.4, letter-spacing `0.02em`): Rótulos de inputs, chips de demonstração, carimbos de hora e badges de benefícios.

### Named Rules
**The Single-Family Harmony Rule.** Uma única família geométrica (Plus Jakarta Sans) rege todas as superfícies, estabelecendo hierarquia tipográfica através de peso (400 a 800), escala padronizada e espaçamento, eliminando ruído entre fontes distintas.
**The No-Arbitrary-Text Rule.** Nenhuma tipografia deve utilizar classes manuais arbitrárias inferiores a 12px (ex: `text-[10px]`); o piso mínimo de leitura para rótulos secundários é `text-xs` (12px), protegendo a acessibilidade móvel.

## Layout

O layout segue o princípio de contenção geométrica centralizada, adaptando-se do smartphone ao monitor ultrawide:
- **Landing Page (Persuade):**
  - **Hero & Comparativo:** Centralizado em `max-w-4xl` (896px) com ritmo vertical generoso (`py-12` a `py-16`) para foco absoluto no argumento de venda.
  - **Barra de Navegação e Rodapé:** Contêiner largo em `max-w-6xl` (1152px) com alinhamento flexível entre logotipo e chamadas para ação.
  - **Grid de Etapas:** Grid de 3 colunas balanceadas (`grid-cols-1 md:grid-cols-3 gap-6`) guiando o visitante linearmente da foto ao resultado.
- **Painel do Lojista (Operate):**
  - **Área Útil:** `max-w-7xl` (1280px) com espaçamento de 16px no mobile e 24px no desktop.
  - **Editor SPA:** Grid split de 12 colunas (7 colunas para formulário de entrada, 5 colunas para o preview do WhatsApp).

## Elevation & Depth

O sistema prioriza superfícies planas delimitadas por bordas nítidas de 1px com transparência suave (`flat-by-default`). Elevações tridimensionais são reservadas para momentos de foco e ações de conversão destacadas.

### Shadow Vocabulary
- **Subtle Surface** (`box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)`): Cartões de etapas, itens de métricas e inputs em repouso.
- **Interactive Focus** (`box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)`): Widget de teste interativo e cartões de planos com hover.
- **WhatsApp Bubble Shadow** (`box-shadow: 0 1px 1px rgba(11, 20, 26, 0.12)`): Sombra nativa que fixa o balão verde sobre o papel de parede do WhatsApp.
- **Hero CTA Float** (`box-shadow: 0 10px 15px -3px rgba(34, 197, 94, 0.3)`): Elevação vibrante no botão principal de conversão esmeralda.

## Shapes

- **Escala de Arredondamento:**
  - `sm` (4px): Badges internos compactos.
  - `md` (8px): Botões secundários, inputs e chips de exemplos.
  - `lg` (12px): Botões principais de conversão e balões internos.
  - `xl` (16px): Cartões do widget, etapas e formulários.
  - `2xl` (24px): Seções comparativas e cartões destacados do Hero.
  - `full` (9999px): Pílulas de badges, contadores e chips de multicanal.
- **Bordas e Anéis:**
  - Bordas padrão: `border border-outline-variant/50` a `border-outline-variant/70`.
  - Anéis de foco e destaque: `ring-4 ring-secondary-container/30` para o cartão vencedor e `focus:ring-1 focus:ring-primary` para campos ativos.

## Components

### 1. Hero Interactive Widget (`#hero-demo-form`)
- **Objetivo:** Permitir ao visitante colar um link e visualizar o cartão WhatsApp gerado antes de criar conta.
- **Estrutura:** Container `bg-surface-container-lowest` com borda de 2px `border-primary/20` e cantos `rounded-2xl`.
- **Ações:** Campo de input com ícone de link incorporado, botão esmeralda "Ver Cartão HD", linha de chips de teste rápido (`.demo-chip`) e bloco de resultado em tempo real com botão de conversão "Criar Link com este Cartão".

### 2. Before vs After Visual Comparison (`#comparativo`)
- **Objetivo:** Expor o contraste gritante entre o link padrão ignorado e o cartão PostLink HD.
- **Card Negativo (Antes):** Borda suave de erro (`border-error/25`), selo vermelho, simulação de balão apagado com ícone de miniatura quebrada e lista de deficiências marcadas com cruz vermelha.
- **Card Positivo (Depois):** Borda reforçada `border-2 border-secondary/40`, anel externo `ring-4 ring-secondary-container/30`, balão vívido do WhatsApp com imagem 1.91:1 nítida e lista de vantagens com check verde.

### 3. Process Steps Grid (3 Passos)
- **Objetivo:** Desmistificar a complexidade técnica e provar que criar um link leva menos de 1 minuto.
- **Composição:** 3 cards idênticos em `rounded-2xl`, cada um exibindo um marcador numérico de 40x40px (`w-10 h-10 rounded-xl`) alternando entre `bg-primary-fixed` e `bg-secondary-container`.

### 4. Gradient Hero Banner CTA
- **Objetivo:** Capturar o usuário no rodapé após o consumo do conteúdo.
- **Estilo:** Gradiente angular `bg-gradient-to-br from-primary to-primary-container`, badge translúcido `bg-white/10 backdrop-blur-xs` e botão de conversão de grandes proporções (`px-8 py-4 rounded-xl text-base`).

### 5. Multichannel Compatibility Bar
- **Objetivo:** Comunicar que, além do WhatsApp, o cartão é 100% otimizado para feeds e mensagens diretas em todas as redes sociais.
- **Estilo:** Barra pílula em `bg-surface-container-low` com chips discretos em `bg-surface-container` para Instagram, Facebook, LinkedIn, X e Telegram.

### 6. WhatsApp Preview Bubble
- **Fundo do Balão:** Verde nativo (`#E7FFDB`), borda `#C8E6C9` e sombra `wa-bubble-shadow`.
- **Cartão Open Graph:** Branco puro, imagem fixada em 1.91:1 com `object-cover`.
- **Tipografia Interna:** Título escuro (`#111B21`, bold), descrição secundária (`#3B4A54`), domínio em caixa alta monospace (`#667781`) e carimbo de hora com ticks duplos azuis (`#53BDEB`).

## Do's and Don'ts

### Do:
- **Do** preservar a proporção estrita de 1.91:1 (1200x630) em qualquer componente de cartão ou prévia de rede social.
- **Do** utilizar a codificação semântica de cores (Vermelho vs Verde) ao ilustrar cenários de Antes vs Depois.
- **Do** manter o widget de demonstração interativo no topo da Landing Page para validação imediata do produto.
- **Do** aplicar o efeito tátil `active:scale-95` em todos os botões e chips clicáveis.
- **Do** assegurar que os botões de conversão final utilizem a cor Signal Emerald (`#22c55e`).

### Don't:
- **Don't** empregar o verde Signal Emerald como cor de plano de fundo de páginas inteiras ou em botões de cancelamento/saída.
- **Don't** introduzir fontes além do Plus Jakarta Sans ou ícones fora da família Material Symbols Outlined.
- **Don't** utilizar classes arbitrárias de fonte abaixo de 12px (`text-[10px]`); utilize sempre os tokens normalizados do sistema (`text-xs`).
- **Don't** aninhar cartões com bordas e sombras dentro de outros cartões sem necessidade estrutural real.
