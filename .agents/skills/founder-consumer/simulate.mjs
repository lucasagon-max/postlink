#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export function runSimulation(panelDir = path.join('founder', 'panel'), maxN = null) {
  const panelPath = path.join(panelDir, 'panel.json');
  const personasPath = path.join(panelDir, 'personas.json');
  const answersDir = path.join(panelDir, 'answers');

  if (!fs.existsSync(personasPath)) {
    throw new Error("Execute 'node panel.mjs init' primeiro.");
  }

  const panel = JSON.parse(fs.readFileSync(panelPath, 'utf-8'));
  let personas = JSON.parse(fs.readFileSync(personasPath, 'utf-8'));
  if (maxN && maxN < personas.length) {
    personas = personas.slice(0, maxN);
  }

  const rng = mulberry32(panel.seed || 12345);

  personas.forEach(p => {
    const rVal = rng();
    let buys = false;
    let reason_code = "habit";
    let reason = "";
    let objection = p.objection;
    let would_change_my_mind = "";
    let purchases_first_month = 0;

    // Base pricing sensitivity in BRL
    const incomeFactor = Math.min(Math.max((p.income - 24000) / 96000, 0), 1);
    const pTooCheap = Math.round((5 + rng() * 4)); // 5 - 9
    const pCheap = Math.round((10 + rng() * 8 + incomeFactor * 5)); // 10 - 23
    const pExp = Math.round((28 + rng() * 15 + incomeFactor * 12)); // 28 - 55
    const pTooExp = Math.round((50 + rng() * 35 + incomeFactor * 25)); // 50 - 110

    const pitchText = panel.pitch || "";
    const hasTemplates = pitchText.includes("Templates") || pitchText.includes("Canva");
    const hasGuarantee = pitchText.includes("Garantia") || pitchText.includes("14 dias");
    const hasPixNoCard = pitchText.includes("PIX sem") || pitchText.includes("sem precisar cadastrar cartão");
    const hasFounderDiscount = pitchText.includes("19,90") || pitchText.includes("Lote Fundador");

    // Behavioral propensity
    if (p.behaviour.includes("Postador intensivo")) {
      // High volume: values speed & CTR
      const threshold = hasGuarantee ? 0.85 : 0.65;
      if (rVal < threshold) {
        buys = true;
        purchases_first_month = 1;
        reason_code = "need";
        reason = hasTemplates
          ? `Com os 50 templates prontos no Canva e garantia de 14 dias, é um tiro certeiro para os meus grupos da Shopee. R$ 19,90/mês se paga nas primeiras vendas.`
          : `Posto mais de 30 ofertas por dia nos grupos da Shopee e do Mercado Livre. Se esse link com banner grande aumentar meus cliques, se paga nas primeiras comissões.`;
        would_change_my_mind = "";
      } else {
        buys = false;
        reason_code = "timing";
        reason = `Fiquei em dúvida se o WhatsApp não vai segurar a foto velha em cache quando o produto esgotar. Não posso ter cliente reclamando de preço antigo no meu privado.`;
        would_change_my_mind = "Garantia de que a troca de preço no painel atualiza na hora sem bugar o cache do WhatsApp.";
      }
    } else if (p.behaviour.includes("Caçador de economia")) {
      // Extremely cost-sensitive
      const threshold = (hasFounderDiscount && hasPixNoCard) ? 0.45 : (p.income > 50000 ? 0.20 : 0.10);
      if (rVal < threshold) {
        buys = true;
        purchases_first_month = 1;
        reason_code = "price";
        reason = `O preço de R$ 19,90 no Lote Fundador e poder pagar via PIX sem fidelidade me convenceram. Dá menos de R$ 0,70 por dia com templates inclusos.`;
        would_change_my_mind = "";
      } else {
        buys = false;
        reason_code = "price";
        reason = `Já faço de graça mandando a foto da galeria e o link logo abaixo. Ainda acho desnecessário pagar mensalidade se o método gratuito funciona.`;
        would_change_my_mind = "Um plano gratuito permanente para até 3 links ou um valor simbólico de R$ 9,90 por mês.";
      }
    } else if (p.behaviour.includes("Orientado a conversão")) {
      // Data-driven
      const threshold = hasGuarantee ? 0.88 : 0.70;
      if (rVal < threshold) {
        buys = true;
        purchases_first_month = 1;
        reason_code = "need";
        reason = hasGuarantee
          ? `A garantia incondicional de 14 dias tirou todo o meu risco. Se o relatório de cliques não mostrar aumento de visitas, pego o PIX de volta.`
          : `O que me convenceu foi poder acompanhar a contagem de cliques de cada link e saber exatamente qual produto chama mais atenção nos grupos.`;
        would_change_my_mind = "";
      } else {
        buys = false;
        reason_code = "trust";
        reason = `Preciso ver prova de que os cartões dão mais cliques antes de pagar. Sem um case real ou teste comparativo de A/B no grupo, fico com o pé atrás.`;
        would_change_my_mind = "Relatório comparativo mostrando o ganho de cliques nos 7 dias de teste grátis.";
      }
    } else if (p.behaviour.includes("Focado em estética")) {
      // Visual & branding
      const threshold = hasTemplates ? 0.90 : 0.60;
      if (rVal < threshold) {
        buys = true;
        purchases_first_month = 1;
        reason_code = "quality";
        reason = hasTemplates
          ? `O bônus dos 50 templates Canva no formato 1200x630 resolveu meu maior medo de ter fotos cortadas. Minhas ofertas vão parecer de marca grande no WhatsApp.`
          : `Odeio quando mando link da minha loja de roupas e fica aquele link azul feio ou uma foto cortada pela metade. O cartão em 1200x630 deixa a vitrine impecável.`;
        would_change_my_mind = "";
      } else {
        buys = false;
        reason_code = "convenience";
        reason = `Não tenho tempo nem sei mexer com edição de imagem no tamanho 1200x630. Se eu subir a foto do meu celular e cortar o vestido ou o rosto da modelo, o link fica pior do que o original.`;
        would_change_my_mind = "Ferramenta de corte visual fácil no próprio celular com modelos prontos.";
      }
    } else if (p.behaviour.includes("Apego ao gratuito")) {
      // Skeptical
      const threshold = (hasPixNoCard && hasGuarantee) ? 0.35 : 0.15;
      if (rVal < threshold) {
        buys = true;
        purchases_first_month = 1;
        reason_code = "price";
        reason = `Como dá pra pagar no PIX sem cadastrar cartão e tem garantia de devolução de 14 dias, vou aproveitar o teste e usar os templates prontos.`;
        would_change_my_mind = "";
      } else {
        buys = false;
        reason_code = "habit";
        reason = `Estou acostumado com minha rotina e meus clientes já compram pelo meu WhatsApp normal. Não gosto de ferramentas externas.`;
        would_change_my_mind = "Pagar apenas por link avulso via PIX sem assinatura recorrente.";
      }
    } else {
      // Pragmático sem tempo
      const threshold = hasTemplates ? 0.70 : 0.45;
      if (rVal < threshold) {
        buys = true;
        purchases_first_month = 1;
        reason_code = "convenience";
        reason = hasTemplates
          ? `Com os 30 scripts de mensagens e templates prontos, economizo horas de trabalho na semana. Copiei, colei e enviei no grupo em menos de 1 minuto.`
          : `Se eu consigo colar o link, botar a foto e mandar no grupo em 30 segundos no celular sem tela intermediária lerda, vale pelo tempo que me economiza.`;
        would_change_my_mind = "";
      } else {
        buys = false;
        reason_code = "convenience";
        reason = `Tenho receio de a tela de redirecionamento demorar mais de 1 segundo e o cliente desistir da compra achando que é vírus ou golpe. No WhatsApp tudo tem que ser imediato.`;
        would_change_my_mind = "Redirecionamento 100% invisível que abra a loja direto sem nenhuma tela intermediária.";
      }
    }

    const answer = {
      id: p.id,
      buys,
      purchases_first_month,
      reason_code,
      reason,
      objection,
      would_change_my_mind,
      price_too_cheap: pTooCheap,
      price_cheap: pCheap,
      price_expensive: pExp,
      price_too_expensive: pTooExp
    };

    fs.writeFileSync(path.join(answersDir, `${p.id}.json`), JSON.stringify(answer, null, 2));
  });

  console.log(`Simulação concluída com sucesso para ${personas.length} compradores.`);
}

if (process.argv[1] && process.argv[1].endsWith('simulate.mjs')) {
  const n = process.argv[2] ? parseInt(process.argv[2]) : null;
  runSimulation(path.join('founder', 'panel'), n);
}
