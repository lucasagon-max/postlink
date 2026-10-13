# The Product lens

Score: 7/10 | Vote: FUND IF

## What is strong

- **Foco deliberado em dizer "não" ao supérfluo:** O escopo do MVP tomou a decisão correta de cortar construtores de microsites, bio-links pesados, QR codes complexos e catálogos integrados. O produto faz apenas uma coisa: pega uma imagem e um destino e entrega um cartão impecável no WhatsApp em menos de 30 segundos. Essa contenção é rara e louvável.
- **Começar da experiência real e trabalhar para trás:** O painel possui um simulador fidedigno do balão de conversa do WhatsApp em tempo real. O lojista não precisa adivinhar como o link vai aparecer: ele vê a interface exata do mensageiro enquanto digita, reduzindo a ansiedade cognitiva.
- **Cuidado com os detalhes invisíveis (Craft):** O processamento de compressão via Canvas no próprio navegador do usuário (garantindo carregamento instantâneo sem sobrecarregar a rede móvel) e a arquitetura de privacidade por padrão (sem cookies invasivos ou armazenamento de IPs) demonstram apreço pela engenharia limpa e pelo respeito ao usuário final.

## What would kill it (the top 3, most dangerous first)

1. **A costura rompida do cache do WhatsApp (The Broken Seam):** O ponto em que a experiência se rompe de forma catastrófica é a edição de links já compartilhados. Quando o lojista altera a foto ou o preço de um link no painel, a Meta mantém a versão antiga em cache para aquele endereço em grupos e conversas. Se o lojista colar o link novamente e vir a foto velha, ele terá a certeza de que a ferramenta "quebrou" ou "não funciona". A promessa de "trocar fotos e preços sem reenviar" promete mais do que o protocolo do WhatsApp permite entregar sem gerar um novo link ou novo slug versionado.
2. **A fricção da tela de transição intermediária para o comprador final:** Para quem recebe a oferta no celular, tocar em um cartão e ver uma tela branca ou cinza de transição com a mensagem "Redirecionando..." (mesmo que por 800ms) gera sensação de link intermediário, suspeita de vírus ou lentidão de rede. Em conexões 3G instáveis nas periferias ou interiores do Brasil, se essa tela travar, a compra é abandonada e a culpa recai sobre o lojista.
3. **Frustração no corte e proporção de imagens (O drama do 1.91:1):** O lojista típico tira fotos na vertical (9:16) ou quadrada (1:1). As prévias ricas do WhatsApp exigem proporção retangular paisagem (1200x630). Se o painel apenas cortar automaticamente ou espremer a foto, rostos de modelos ou preços de produtos serão decepados. Sem uma ferramenta de enquadramento visual intuitiva (crop com arrastar e pinçar), o produto entregará cartões feios, quebrando sua própria promessa fundamental de "impacto visual impecável".

## The questions I would ask the founder

1. Qual é a experiência exata dos primeiros 3 minutos de um usuário que acabou de se cadastrar pelo celular: ele consegue sair do cadastro com um link gerado e colado no WhatsApp sem ver nenhuma tela de erro ou lentidão?
2. Como você resolve a quebra de expectativa quando o cache do WhatsApp não atualiza a imagem editada imediatamente, sem culpar o usuário ou o WhatsApp?
3. A tela de transição intermediária pode ser eliminada por completo para navegadores modernos utilizando redirecionamento HTTP 302 direto no Edge sempre que possível, mantendo a tela HTML apenas como contingência de cookies/bots?

## If FUND IF: the conditions

- [ ] **Enquadrador visual interativo de corte no upload:** Não permitir corte cego. O lojista precisa ver exatamente onde a área 1.91:1 se posiciona sobre a foto enviada, podendo arrastar e dar zoom no próprio celular antes de salvar.
- [ ] **Tratamento transparente do cache de preview:** Criar uma função de "Duplicar com Nova Versão / Novo Link" no painel com 1 toque, explicando de forma educativa e amigável: "Para o WhatsApp exibir a nova foto imediatamente nos grupos, criamos um link atualizado para você".
- [ ] **Polimento obsessivo da tela de transição:** A tela de transição humana deve ser instantânea, sem elementos genéricos que pareçam páginas de malware. Ela deve carregar a identidade visual da loja e fazer a transição invisível em milissegundos sem flash de tela em branco.
