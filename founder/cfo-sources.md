# Fontes e Premissas Financeiras: PostLink

Data: 13 de outubro de 2026  
Documento de rastreabilidade de dados financeiros conforme metodologia `founder-cfo`.

---

## 1. Receita e Preço Unitário

- **Preço de Venda (`price` = R$ 29,90):**
  - *Fonte:* Definido em [founder/pricing.md](file:///c:/Users/Oem/Documents/Postlink/founder/pricing.md) e validado pela curva de Van Westendorp em [founder/pricing-curve.md](file:///c:/Users/Oem/Documents/Postlink/founder/pricing-curve.md).
  - *Referência:* Refere-se à mensalidade líquida do Plano Pro, o carro-chefe da plataforma para afiliados e lojistas com links ilimitados.

---

## 2. Custos Variáveis por Unidade (`variable`)

- **Taxa Gateway de Pagamento (Mercado Pago Pix/Cartão) — R$ 1,49:**
  - *Fonte:* [Tabela oficial de tarifas do Mercado Pago Brasil](https://www.mercadopago.com.br/ajuda/custos-receber-vendas-online_2626).
  - *Memória de cálculo:* Vendas online via Pix pagam 0,99% (R$ 0,30). Vendas via Cartão de Crédito pagam de 3,99% a 4,98% + taxa fixa de R$ 0,40 (~R$ 1,75). Assumindo um mix de 60% Pix e 40% Cartão, o custo médio ponderado é de **R$ 1,49 por fatura**.
- **Infraestrutura Cloudflare (Pages & Functions no Edge) — R$ 0,15:**
  - *Fonte:* [Cloudflare Pages Pricing](https://www.cloudflare.com/plans/).
  - *Memória de cálculo:* O plano gratuito do Cloudflare Pages oferece tráfego ilimitado e 100.000 requisições/dia para Pages Functions gratuitas. O valor de R$ 0,15 por assinante ativo é uma provisão conservadora para chamadas extras e contingência de DNS em escala.
- **Banco de Dados e Armazenamento (Supabase Postgres & Storage) — R$ 0,40:**
  - *Fonte:* [Supabase Pricing](https://supabase.com/pricing).
  - *Memória de cálculo:* Cada lojista armazena entre 10 e 20 banners comprimidos no Canvas (&le;300 KB cada), consumindo menos de 6 MB de disco. O custo de leitura e tráfego é quase nulo pelo cache público do Cloudflare. Provisão de R$ 0,40/mês por loja para crescimento de linhas no Postgres.
- **Impostos Provisionados (MEI / Simples Nacional) — R$ 1,80:**
  - *Fonte:* Legislação tributária brasileira (LC 123/2006 e Anexo III do Simples Nacional).
  - *Memória de cálculo:* No início (enquadramento MEI), o imposto é um valor fixo mensal (DAS de ~R$ 75/mês). Ao migrar para ME (Microempresa) no Simples Nacional sob a atividade de desenvolvimento/licenciamento de software (Anexo III), a alíquota inicial é de 6% sobre a receita bruta (6% de R$ 29,90 = R$ 1,794 $\approx$ R$ 1,80).

---

## 3. Custos Fixos Mensais (`fixed_monthly`)

- **Domínio .com.br e Serviços de DNS — R$ 15,00/mês:**
  - *Fonte:* [Registro.br](https://registro.br). Custo de R$ 40,00/ano por domínio (~R$ 3,33/mês). Provisão mensal de R$ 15,00 para cobrir o domínio principal mais domínios de contingência ou encaminhamento.
- **Ferramentas de Suporte e E-mail Profissional — R$ 45,00/mês:**
  - *Fonte:* Zoho Mail / Google Workspace (plano básico de e-mail corporativo `contato@postlink.com.br`) e linha telefônica/chip dedicado para atendimento operacional via WhatsApp.
- **Supabase Pro (Backup e Capacidade Dedicada) — R$ 140,00/mês:**
  - *Fonte:* Plano oficial Supabase Pro ($25 USD/mês $\approx$ R$ 140,00 na cotação média de R$ 5,60). Provisão deliberada para backups contínuos de 7 dias e banco de dados sem risco de pausar por inatividade.

---

## 4. Custos Iniciais de Abertura (`startup`)

- **Registro de Marca no INPI — R$ 355,00:**
  - *Fonte:* Tabela oficial de retribuições do INPI (código 389: pedido de registro de marca com especificação pré-aprovada para pessoas físicas ou Microempresas/EPP).
- **Registro de Domínio .com.br (Ano 1) — R$ 40,00:**
  - *Fonte:* Tabela oficial do [Registro.br](https://registro.br).
- **Fundo de Contingência e Testes de Integração — R$ 200,00:**
  - *Fonte:* Estimativa de capital de giro para transações de homologação no Mercado Pago, testes de estorno e pequenos ajustes técnicos pré-lançamento.

---

## 5. Rampa e Projeção de Volume (`ramp_per_day`)

- **Validação com o Painel de Compradores ([founder/panel/results.md](file:///c:/Users/Oem/Documents/Postlink/founder/panel/results.md)):**
  - O painel registrou **60% de intenção de compra** com a oferta estruturada e média de 1 assinatura por mês por comprador.
  - O plano de vendas do Ano 1 foi projetado de forma deliberadamente conservadora:
    - **Mês 1:** 10 assinantes ativos (0,33 assinaturas/dia)
    - **Mês 2:** 25 assinantes ativos (0,83 assinaturas/dia)
    - **Mês 3:** 40 assinantes ativos (1,33 assinaturas/dia)
    - **Mês 6:** 100 assinantes ativos (3,33 assinaturas/dia) $\rightarrow$ *Ponto de Plano Estável*
    - **Mês 12:** 220 assinantes ativos (7,33 assinaturas/dia)
  - Com base em milhares de grupos de afiliados de Shopee e Mercado Livre ativos no Brasil, capturar 10 a 25 lojistas no primeiro bimestre via prospecção direta é uma meta de baixo risco de execução.
