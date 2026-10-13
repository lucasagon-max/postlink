# Parecer Financeiro do CFO: PostLink

> *Aviso Legal Obrigatório: Esta análise projeta a economia unitária e o fluxo de caixa operacional sob premissas de engenharia e mercado. Não constitui aconselhamento contábil, fiscal ou jurídico. A estrutura societária, o enquadramento tributário e a emissão de notas fiscais devem ser validados com um contador antes do início das cobranças.*

## 1. Nota Executiva do CFO

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

## 2. Economia Unitária por Assinante (Unit Economics)

| Linha | Valor por Assinante/Mês | % da Receita | Fonte / Observação |
| :--- | ---: | ---: | :--- |
| **Preço Bruto de Venda** | **R$ 29,90** | 100,0% | Plano Pro mensal |
| (-) Taxa Gateway de Pagamento (Mercado Pago Pix/Cartão) | -R$ 1,49 | 5.0% | Custo variável direto |
| (-) Infraestrutura Cloudflare (Pages + Edge Functions) | -R$ 0,15 | 0.5% | Custo variável direto |
| (-) Banco de Dados & Storage (Supabase Postgres/Storage) | -R$ 0,40 | 1.3% | Custo variável direto |
| (-) Impostos provisionados (MEI / Simples Nacional ~6%) | -R$ 1,80 | 6.0% | Custo variável direto |
| **(=) Margem de Contribuição Líquida** | **R$ 26,06** | **87.2%** | **Sobra líquida por cliente para cobrir custos fixos** |

## 3. Custos Fixos e Ponto de Equilíbrio (Break-Even)

- **Custos Fixos Totais:** **R$ 200,00 / mês** (Domínio .com.br e serviços DNS: R$ 15,00, Ferramentas de Suporte e E-mail: R$ 45,00, Supabase Pro (reserva de escala e backup): R$ 140,00).
- **Ponto de Equilíbrio Mensal:** **7.7 assinantes ativos** (0.26 novas assinaturas/dia). A partir do 8º cliente, toda receita adicional vai quase integralmente para o lucro.
- **Margem Operacional no Plano Estável (100 clientes):** **80.5%** de margem líquida.

## 4. Demonstrativo do Ano 1 (Mês a Mês)

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

## 5. Análise de Sensibilidade (Cenários de Estresse)

| Cenário Testado | Margem no Plano | Break-Even (Assinantes) | Lucro Líquido Ano 1 | Variação vs Base |
| :--- | ---: | ---: | ---: | ---: |
| **Plano Base** | 80.5% | 7.7 | R$ 32.382 | +R$ 0 |
| **Preço -10% (R$ 26,91)** | 78.3% | 8.7 | R$ 28.392 | -R$ 3.991 |
| **Volume -20% (Adoção lenta)** | 78.8% | 7.7 | R$ 25.426 | -R$ 6.956 |
| **Custos Unitários +15% (R$ 4,42)** | 78.5% | 7.8 | R$ 31.613 | -R$ 769 |

## 6. Sinais de Alerta (Red Flags)

- ✅ **Nenhum sinal vermelho detectado nos números.** A estrutura possui margem bruta alta (87%), custos fixos mínimos (R$ 200/mês) e baixo requerimento de capital inicial (R$ 595). O sucesso financeiro depende estritamente da consistência na aquisição de clientes.
