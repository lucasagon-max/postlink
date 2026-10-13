# Plano de Lançamento e Go-To-Market: PostLink

Data do planejamento: 13 de outubro de 2026  
Data-alvo do lançamento oficial (D0): **10 de novembro de 2026**  
Líder de Lançamento · Alinhado com [founder/offer.md](file:///c:/Users/Oem/Documents/Postlink/founder/offer.md), [founder/marketing.md](file:///c:/Users/Oem/Documents/Postlink/founder/marketing.md), [founder/ops.md](file:///c:/Users/Oem/Documents/Postlink/founder/ops.md) e [founder/numbers.json](file:///c:/Users/Oem/Documents/Postlink/founder/numbers.json).

---

## 1. O Teste Real Antes de Gastar Dinheiro (Validation Gate)

Antes de contratar ferramentas pagas ou iniciar anúncios no Meta Ads, executaremos um **teste de validação de demanda real com preço pago**:

- **O Formato do Teste:** **Pré-Venda VIP do "Lote Fundador"** via abordagem direta 1 a 1 no WhatsApp com 30 operadores de grupos de ofertas (Shopee, Mercado Livre e lojas de moda).
- **A Oferta Testada:** O lojista recebe uma demonstração do seu próprio produto já transformado em cartão HD, com a proposta:  
  *"Estamos liberando o PostLink Pro antecipado para 10 lojistas parceiros. Você ganha 1 ano de links ilimitados + 50 templates Canva + garantia de 14 dias por apenas R$ 19,90/mês no PIX. Quer garantir a sua vaga?"*
- **Linha de Sucesso Obrigatória (Go / No-Go):**
  - **Meta mínima:** Fechar **pelo menos 5 assinantes pagantes reais** dos 30 abordados (taxa de conversão de ~16% em dinheiro vivo).
  - *Se atingir a meta:* Sinal verde para o lançamento oficial em 10 de novembro.
  - *Se falhar:* Se menos de 3 pessoas pagarem, suspender os gastos de marketing e retornar a [founder/offer.md](file:///c:/Users/Oem/Documents/Postlink/founder/offer.md) para recalibrar a proposta de valor.

---

## 2. A Contagem Regressiva (Countdown: D-28 a D-1)

Cronograma semanal detalhado até o dia do lançamento:

```
[Semana 1: 13-19 Out] ──► [Semana 2: 20-26 Out] ──► [Semana 3: 27 Out-02 Nov] ──► [Semana 4: 03-09 Nov] ──► [D0: 10 Nov]
  Fundação & Teste VIP       Bônus & Integrações         Soft Open (Pioneiros)       Aquecimento & Anúncios      LANÇAMENTO
```

### Semana 1 (13 a 19 de Outubro) — Fundação Técnica e Teste Piloto
- [x] **Infraestrutura:** Apontar domínio definitivo no Cloudflare Pages com HTTPS forçado e certificar rotas Edge (`functions/[loja]/[slug].js`). *(Owner: Fundador / Prazo: 15/Out)*
- [ ] **Pagamento:** Homologar credenciais de produção do Mercado Pago e testar webhook em `functions/api/mp-webhook.js`. *(Owner: Fundador / Prazo: 17/Out)* **[CAMINHO CRÍTICO]**
- [ ] **Teste de Pré-Venda:** Disparar 30 abordagens de pré-venda 1 a 1 para validar a linha de sucesso de 5 clientes pagantes. *(Owner: Fundador / Prazo: 19/Out)* **[CAMINHO CRÍTICO]**
- [ ] **Legal:** Protocolar pedido de marca no INPI nas classes 35 e 42. *(Owner: Fundador / Prazo: 18/Out)*

### Semana 2 (20 a 26 de Outubro) — Produção dos Bônus e Refinamento do Produto
- [ ] **Design:** Finalizar o Pack com os **50 Templates Editáveis no Canva (1200x630)** e gerar o link de compartilhamento como template. *(Owner: Fundador / Prazo: 22/Out)*
- [ ] **Conteúdo:** Redigir o Guia *"30 Scripts de Chamadas de Vendas para WhatsApp"* em PDF. *(Owner: Fundador / Prazo: 24/Out)*
- [ ] **Engenharia de Produto:** Validar o botão de 1 toque *"Duplicar com Novo Link"* no painel para garantia anti-cache. *(Owner: Fundador / Prazo: 25/Out)*
- [ ] **Teste de Plataforma:** Colar links em dispositivos reais (Android, iPhone e WhatsApp Web) para validar consistência visual do balão. *(Owner: Fundador / Prazo: 26/Out)*

### Semana 3 (27 de Outubro a 2 de Novembro) — Soft Open (Lançamento Suave)
- [ ] **Ativação dos Pioneiros:** Liberar o acesso aos 5 a 10 assinantes pagantes da pré-venda no painel. *(Owner: Fundador / Prazo: 27/Out)*
- [ ] **Customer Success:** Acompanhar os primeiros links criados e coletar métricas de cliques geradas. *(Owner: Fundador / Prazo: 30/Out)*
- [ ] **Gravação de Conteúdo:** Produzir 3 vídeos de demonstração rápida (gravação de tela mostrando a criação do link em 30 segundos). *(Owner: Fundador / Prazo: 01/Nov)*
- [ ] **Depoimentos:** Coletar 2 prints de feedback espontâneo dos pioneiros (*"Nossa, ficou muito profissional no grupo"*). *(Owner: Fundador / Prazo: 02/Nov)*

### Semana 4 (3 a 9 de Novembro) — Aquecimento e Véspera (D-7 a D-1)
- [ ] **Campanha de Aquecimento:** Iniciar calendário de postagens de marketing nos Reels e TikTok conforme [founder/marketing.md](file:///c:/Users/Oem/Documents/Postlink/founder/marketing.md). *(Owner: Fundador / Prazo: 03/Nov)*
- [ ] **Meta Ads:** Subir campanha de tráfego pago no Meta Ads (orçamento de R$ 15,00/dia) com os criativos dos Hooks 1 e 3 em modo pausado, pronta para ativar. *(Owner: Fundador / Prazo: 06/Nov)* **[CAMINHO CRÍTICO]**
- [ ] **Checklist de Segurança:** Conferir isolamento de RLS no Postgres, canal `/denunciar` no ar e termos de uso. *(Owner: Fundador / Prazo: 08/Nov)*
- [ ] **Véspera (D-1):** Ensaio geral: criar um link do zero, pagar R$ 1,00 via PIX de teste e verificar a ativação imediata no painel. *(Owner: Fundador / Prazo: 09/Nov 20:00)*

---

## 3. O Dia do Lançamento (D0: 10 de Novembro de 2026)

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

## 4. O Plano dos Primeiros 30 Dias (Metas e Revisões)

### Metas Semanais de Assinantes Ativos (Caminho até o Break-Even e Lucro)

```
Semana 1 (D0-D7)   :  15 a 20 assinantes   (Break-even de 8 clientes superado logo no D+3)
Semana 2 (D8-D14)  :  35 a 45 assinantes   (Lote Fundador esgotado; início do preço padrão R$ 29,90)
Semana 3 (D15-D21) :  60 a 70 assinantes   (Tração orgânica via selo discreto nos links)
Semana 4 (D22-D30) :  85 a 100 assinantes  (~R$ 2.900 de MRR recorrente e margem líquida de 80%)
```

### Gatilhos de Mudança Rápida (Se os números saírem do trilho)
- **Se o CAC ultrapassar R$ 35,00:** Pausar anúncios no Meta Ads e concentrar 100% da energia em parcerias e prospecção direta em comunidades de WhatsApp.
- **Se a conversão do teste grátis (trial) ficar abaixo de 20%:** Entrar em contato manual com cada lojista no D+3 do teste e oferecer cortar o primeiro banner para ele gratuitamente.
- **Se houver mais de 5% de pedidos de estorno na garantia:** Revisar a velocidade da tela de transição e o tutorial de corte de fotos.

### Os Três Marcos de Revisão Estratégica
1. **Revisão D+7 (Fechamento do Lote Fundador):**
   - *Perguntas a responder:* As 50 vagas foram preenchidas? O volume veio mais de tráfego pago ou de grupos orgânicos?
   - *Ação:* Encerrar a tarifa promocional de R$ 19,90 e fixar R$ 29,90/mês como preço padrão.
2. **Revisão D+14 (Primeiro Ciclo de Trials):**
   - *Perguntas a responder:* Quantos usuários que entraram no teste grátis viraram pagantes após os 7 dias? Alguém acionou a garantia de 14 dias?
   - *Ação:* Ajustar a régua de e-mails/WhatsApp de fim de trial para maximizar a conversão.
3. **Revisão D+30 (Fechamento do Mês 1):**
   - *Perguntas a responder:* O faturamento bruto e o lucro líquido bateram a projeção do CFO em [founder/cfo.md](file:///c:/Users/Oem/Documents/Postlink/founder/cfo.md)? O saldo de caixa está positivo?
   - *Ação:* Decidir a parcela do lucro a ser reinvestida em anúncios de escala para o Mês 2.
