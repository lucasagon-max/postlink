# Estratégia de Precificação: PostLink

Data: 13 de outubro de 2026  
Fontes de cálculo: [founder/panel/answers/](file:///c:/Users/Oem/Documents/Postlink/founder/panel/answers), [founder/pricing-curve.md](file:///c:/Users/Oem/Documents/Postlink/founder/pricing-curve.md), [founder/competitors.md](file:///c:/Users/Oem/Documents/Postlink/founder/competitors.md) e [founder/numbers.json](file:///c:/Users/Oem/Documents/Postlink/founder/numbers.json).

---

## 1. O Preço Recomendado e a Justificativa

### **Preço Central: R$ 29,90 / mês (Plano Pro)**

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

## 2. A Escada de Preços (Good / Better / Best)

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

### Regras de Subida da Escada:
1. **Do Starter (R$ 19,90) para o Pro (R$ 29,90):** O gatilho é o limite de 5 links ativos. Quem posta diariamente na Shopee, Mercado Livre ou tem catálogo de roupas estoura 5 links na primeira semana e sobe naturalmente para o Pro por uma diferença de apenas R$ 10,00.
2. **Do Pro (R$ 29,90) para a Agência (R$ 69,90):** O gatilho é a gestão multi-marca. Gestores de tráfego e donos de mais de um negócio precisam separar slugs e relatórios sem misturar acessos.

---

## 3. Oferta de Abertura / Lançamento (Opening Offer)

Para acelerar os primeiros 50 clientes pagantes sem viciar o mercado em descontos destrutivos:

### **"Plano Fundador PostLink"**
- **O que recebe:** Acesso ao Plano Pro com preço especial fixo de **R$ 19,90/mês no faturamento anual antecipado** (R$ 238,80/ano em até 12x via PIX ou Cartão).
- **Bônus Exclusivo de Entrada:** **Pack com 50 Templates Editáveis no Canva** em alta definição (1200x630) prontos para WhatsApp (Promoção Relâmpago, Achadinho do Dia, Frete Grátis, Queima de Estoque).
- **Garantia de Risco Reverso (14 Dias):** Se o assinante não notar aumento nos cliques das suas ofertas nos primeiros 14 dias de uso, recebe 100% do dinheiro de volta via PIX com 1 clique no painel.
- **Escassez Real:** Válido estritamente para as **primeiras 50 assinaturas** ou até o encerramento do primeiro mês de piloto.

---

## 4. O Que Testar com Compradores Reais

Como os compradores simulados indicam hipóteses mas não pagam boletos, teste dois preços reais no lançamento:

1. **Teste A/B de Conversão de Página:**
   - **Página A:** Plano Pro a **R$ 19,90/mês** com ênfase em "o menor preço do Brasil para links profissionais no WhatsApp".
   - **Página B:** Plano Pro a **R$ 29,90/mês** empacotado com o bônus dos templates Canva e analytics de cliques.
   - *Métrica de Decisão:* Se a Página B converter com pelo menos 67% da taxa da Página A, a Página B é a vencedora definitiva, pois gera maior receita líquida e atrai clientes com menor índice de cancelamento (churn).
2. **Flexibilidade de Pagamento:**
   - Oferecer opção de assinatura mensal via **PIX com renovação voluntária** (sem forçar débito automático no cartão de crédito) para desarmar a objeção número 1 dos autônomos que temem cobranças surpresas.

---

## 5. Respostas do Marketing às 3 Maiores Objeções do Painel

| Objeção Verbatim do Painel | Por que o comprador disse isso | Resposta que o Marketing / Landing Page deve dar |
| :--- | :--- | :--- |
| *"Já faço de graça mandando a foto da galeria e o link no texto logo abaixo. Não faz sentido pagar R$ 29,90."* (P002) | Hábito gratuito e falta de percepção de perda de cliques no WhatsApp. | **"Enviar foto e link separados vira 3 mensagens soltas que o cliente pula nos grupos. No PostLink, a foto é o próprio link clicável em alta resolução: 1 toque e ele já está comprando de você."** |
| *"Fiquei em dúvida se o WhatsApp não vai segurar a foto velha em cache quando o produto esgotar."* (P012) | Medo real de atrito e reclamações de clientes no privado por preço desatualizado. | **"Com a tecnologia de versão inteligente do PostLink, você duplica e atualiza sua oferta com 1 clique no celular e o WhatsApp é forçado a puxar o novo preço imediatamente."** |
| *"Não quero mais uma assinatura cobrando no meu cartão todo mês."* (P019) | Medo de renovação automática e burocracia de cancelamento típica de serviços gringos. | **"Pague no PIX mês a mês sem fidelidade e sem cartão de crédito cadastrado. Renove apenas se estiver vendendo mais."** |
