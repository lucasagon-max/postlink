# Manual de Operações e Rotinas: PostLink

Data: 13 de outubro de 2026  
Diretor de Operações · Rotinas do Dia 1, cadeia de fornecedores, SOPs, governança legal e matriz de riscos para SaaS de alta margem.

---

## 1. O Ciclo Diário de Operações (Da Abertura ao Fechamento)

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

## 2. Fornecedores Técnicos e Custos Operacionais

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

## 3. Estrutura de Pessoas e Escala de Trabalho

### Fase 1: Fundação Solo (0 a 100 clientes ativos)
- **Papel:** Fundador Geral (Produto, Suporte e Vendas).
- **Carga Horária:** 2 a 3 horas por dia (concentradas no suporte pós-almoço e prospecção matinal).
- **Remuneração:** R$ 0 de salário fixo até atingir o break-even (8 clientes). A partir de 30 clientes (~R$ 900 MRR), retirada de pró-labore básico MEI com reinvestimento de 70% do caixa em expansão.

### Fase 2: Escala Comercial (100 a 400 clientes ativos — Mês 6 a 12)
- **Papel:** Contratação de 1 Assistente de Atendimento Operacional (MEI / Remoto / Meio Período).
- **Atribuições:** Suporte nível 1 no WhatsApp de atendimento, conferência de enquadramento de fotos para clientes sem tempo e resposta às dúvidas de onboarding.
- **Faixa Salarial Prevista:** R$ 1.200 a R$ 1.500 / mês (coberto com margem folgada a partir de 80 clientes pagantes).

---

## 4. Procedimentos Operacionais Padrão (SOPs)

### SOP 01: Onboarding Assistido de Novo Lojista
1. O lojista conclui o cadastro no painel.
2. O sistema dispara mensagem receptiva com link do vídeo de 60 segundos: *"Como criar seu primeiro link"*.
3. No D+2 do teste grátis, se o lojista criou 0 links: o suporte envia mensagem cordial: *"Oi [Nome], vi que você entrou no teste do PostLink. Me manda a foto da sua melhor oferta de hoje que eu subo um link demonstrativo para você testar no grupo agora!"*.
4. No D+6 (véspera do fim do trial): aviso automático transparente do término do teste com botão para ativação da condição do Lote Fundador via PIX.

### SOP 02: Moderação Rápida de Denúncias e Anti-Abuso
1. Qualquer visitante pode tocar em `/denunciar` no rodapé da tela de redirecionamento e relatar abuso (golpe, clonagem de checkout, conteúdo proibido).
2. O sistema insere o registro na tabela `denuncias` do Supabase.
3. Toda manhã às 09:00, o operador consulta as ocorrências pendentes.
4. Se o link for comprovadamente fraudulento (ex: clone de banco ou página de phishing falso):
   - Marcar o link como `ativo = false` imediatamente.
   - Inserir o domínio infrator na tabela `destinos_bloqueados`.
   - Se reincidente, alterar o status da loja para `suspenso` (bloqueando criação e acessos).
   - *Prazo máximo de resposta legal:* Menos de 4 horas após a denúncia (atendendo ao Art. 19 do Marco Civil).

### SOP 03: Atendimento a Reclamações de "Foto Cortada no WhatsApp"
1. Identificar se o lojista fez upload de foto quadrada (1:1) ou em pé (9:16).
2. Explicar amigavelmente: *"O WhatsApp usa o padrão horizontal de 1200x630 para prévias grandes. Para não cortar a cabeça do produto, use o nosso enquadrador visual arrastando a foto para o centro."*
3. Enviar o link do template Canva correspondente do bônus com a moldura já centralizada.
4. Se o lojista for leigo: cortar a imagem para ele na primeira ocorrência como ação de encantamento (*Customer Success*).

### SOP 04: Gestão de Inadimplência e Falha no Pagamento
1. Notificação do webhook do Mercado Pago com status `atrasado` ou cancelado.
2. **Período de Carência:** O link **não é derrubado imediatamente**. O lojista tem 3 dias de tolerância para renovar sem interromper suas vendas nos grupos.
3. Uma mensagem automática amigável via WhatsApp/E-mail é enviada com a chave PIX direta para renovação em 1 toque.
4. Após 3 dias sem quitação: bloqueia-se a criação de novos links e a tela de transição exibe aviso amigável de manutenção.

---

## 5. Ferramental Mínimo de Gestão (The Lean Tech Stack)

| Função | Ferramenta Escolhida | Custo Mensal | Motivo da Escolha |
| :--- | :--- | :---: | :--- |
| **Hospedagem & Edge** | Cloudflare Pages & Functions | R$ 0,00 | Latência inferior a 30ms em todo o Brasil e custo zero por requisição inicial. |
| **Banco de Dados** | Supabase Postgres (com RLS) | R$ 0,00 a R$ 140,00 | Backups automáticos, segurança RLS nativa por lojista e storage S3 integrado. |
| **Pagamentos & PIX** | Mercado Pago | % sobre vendas | Integração sólida em Node.js com webhook nativo e conciliação instantânea. |
| **Atendimento** | WhatsApp Business Web | R$ 0,00 | O lojista brasileiro já está lá; dispensa abertura de tickets lentos em helpdesks. |
| **Gestão de Bônus** | Canva Pro | R$ 34,90 | Plataforma universal que 95% dos comerciantes e afiliados já sabem utilizar. |
| **Contabilidade** | Contabilizei / Contador ME | R$ 89,00 a R$ 150,00 | Emissão de DAS/DAS-MEI e notas fiscais eletrônicas de serviços de software. |

---

## 6. Checklist Legal, Fiscal e Regulatório (Brasil)

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

## 7. Matriz de Riscos Operacionais (Risk Register)

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
