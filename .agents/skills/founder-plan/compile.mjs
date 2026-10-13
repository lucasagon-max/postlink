#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SECTIONS = [
  ["summary.md", "Resumo Executivo", "founder-plan"],
  ["board.md", "O Que o Conselho Disse", "founder-board"],
  ["competitors.md", "Mapeamento da Concorrência", "founder-competitors"],
  ["panel/results.md", "O Painel de Compradores", "founder-consumer"],
  ["pricing.md", "Estratégia de Precificação", "founder-pricing"],
  ["offer.md", "A Oferta Irresistível", "founder-offer"],
  ["cfo.md", "Economia Unitária e Finanças", "founder-cfo"],
  ["marketing.md", "Plano de Marketing e Posicionamento", "founder-marketing"],
  ["brand.md", "Identidade e Marca", "founder-brand"],
  ["ops.md", "Operações e Rotinas do Dia 1", "founder-ops"],
  ["launch.md", "Plano de Lançamento e Go-To-Market", "founder-launch"]
];

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8').trim();
  } catch (e) {
    return null;
  }
}

function stripH1(text) {
  if (!text) return "";
  const lines = text.split(/\r?\n/);
  let cleanLines = lines;
  if (lines.length && lines[0].startsWith("# ")) {
    cleanLines = lines.slice(1);
  }
  return cleanLines.map(l => l.startsWith("#") ? "#" + l : l).join('\n').trim();
}

export async function getVerdict(dir = "founder", minBuyRate = 0.25) {
  const checks = [];
  let numbers = null;
  let panel = null;

  const numRaw = readText(path.join(dir, "numbers.json"));
  if (numRaw) {
    const numSpec = JSON.parse(numRaw);
    const cfoModulePath = pathToFileURL(path.join(__dirname, "..", "founder-cfo", "unit_economics.mjs")).href;
    const { analyse } = await import(cfoModulePath);
    numbers = analyse(numSpec);
    const u = numbers.unit;
    const c = numbers.contribution;
    checks.push({
      ok: c > 0,
      text: c > 0
        ? `Cada ${u} gera R$ ${c.toFixed(2).replace('.', ',')} de margem líquida antes dos custos fixos (${(numbers.contributionPct * 100).toFixed(1)}% de contribuição).`
        : `Cada ${u} GERA PREJUÍZO de R$ ${(-c).toFixed(2).replace('.', ',')} antes dos custos fixos.`
    });

    const y = numbers.yearProfit;
    checks.push({
      ok: y > 0,
      text: y > 0
        ? `Ano 1 gera lucro operacional positivo de R$ ${Math.round(y).toLocaleString('pt-BR')}.`
        : `Ano 1 opera com PREJUÍZO de R$ ${Math.round(-y).toLocaleString('pt-BR')}.`
    });

    const be = numbers.breakevenPerDay;
    const cap = numbers.capacityPerDay;
    if (cap !== undefined && cap !== null) {
      const fits = isFinite(be) && be <= parseFloat(cap);
      checks.push({
        ok: fits,
        text: `Ponto de equilíbrio (${be.toFixed(2)} assinaturas/dia) cabe com folga dentro da capacidade declarada (${cap}/dia).`
      });
    }
  }

  const panRaw = readText(path.join(dir, "panel", "results.json"));
  if (panRaw) {
    panel = JSON.parse(panRaw);
    const r = panel.buy_rate;
    checks.push({
      ok: r >= minBuyRate,
      text: `${panel.buys} de ${panel.answered} compradores simulados compram (${Math.round(r * 100)}%, superando a régua mínima de ${Math.round(minBuyRate * 100)}%).`
    });
  }

  let verdictStr = "Incomplete";
  if (numbers === null) {
    verdictStr = "Incomplete";
  } else if (checks.every(c => c.ok)) {
    verdictStr = "Profitable";
  } else {
    verdictStr = "Not yet";
  }

  return { verdict: verdictStr, checks, numbers, panel };
}

export async function compilePlan(dir = "founder", minBuyRate = 0.25) {
  const { verdict: v, checks, numbers, panel } = await getVerdict(dir, minBuyRate);
  const idea = readText(path.join(dir, "idea.md"));
  let title = "PostLink";
  if (idea) {
    const first = idea.split(/\r?\n/)[0];
    if (first.startsWith("# ")) title = first.replace(/^#\s*/, '').trim();
  }

  const L = [];
  L.push(`# Plano de Negócios Consolidado: ${title}`, "");
  L.push(`**Veredito Oficial: ${v.toUpperCase()}**`, "");
  L.push("### Checagens Matemáticas Automatizadas:");
  checks.forEach(c => {
    L.push(`- ${c.ok ? "✓" : "✗"} ${c.text}`);
  });
  if (v === "Incomplete") {
    L.push("- Números ausentes. Execute /founder-cfo primeiro.");
  }
  L.push("");

  if (numbers) {
    L.push("### Tabela de Números-Chave:");
    L.push("| Indicador Financeiro | Valor Projetado |");
    L.push("| :--- | ---: |");
    L.push(`| Preço por Assinante (Plano Pro) | R$ ${numbers.price.toFixed(2).replace('.', ',')} / mês |`);
    L.push(`| Margem de Contribuição por Assinante | R$ ${numbers.contribution.toFixed(2).replace('.', ',')} (${(numbers.contributionPct * 100).toFixed(1)}%) |`);
    L.push(`| Ponto de Equilíbrio (Break-Even) | ${numbers.breakevenUnitsMonth.toFixed(1)} assinantes ativos |`);
    L.push(`| Lucro Operacional do Ano 1 | R$ ${Math.round(numbers.yearProfit).toLocaleString('pt-BR')} |`);
    L.push(`| Investimento Inicial de Abertura | R$ ${Math.round(numbers.startup).toLocaleString('pt-BR')} |`);
    L.push(`| Capital Mínimo Necessário (Cash Needed) | R$ ${Math.round(numbers.cashNeeded).toLocaleString('pt-BR')} |`);
    L.push(`| Prazo de Retorno do Investimento (Payback) | Mês ${numbers.paybackMonth || 'não atinge'} |`);
    if (panel) {
      L.push(`| Painel de Compradores (Intenção de Compra) | ${panel.buys} compram · ${panel.passes} passam (${Math.round(panel.buy_rate * 100)}%) |`);
    }
    L.push("");
  }

  if (idea) {
    L.push("---", "", "## A Proposta de Negócio (A Ideia)", "", stripH1(idea), "");
  }

  const missing = [];
  for (const [fname, heading, skill] of SECTIONS) {
    const text = readText(path.join(dir, fname));
    if (text) {
      L.push("---", "", `## ${heading}`, "", stripH1(text), "");
    } else {
      missing.push([heading, skill]);
    }
  }

  if (missing.length) {
    L.push("---", "", "## Seções Pendentes", "");
    missing.forEach(([heading, skill]) => {
      L.push(`- ${heading}: execute /${skill}`);
    });
    L.push("");
  }

  L.push("---", "", "_Aviso Legal: Os dados do painel representam simulações comportamentais e os números financeiros são projeções fundamentadas em dados de engenharia e mercado. A confirmação definitiva exige validação com clientes pagantes reais e orçamentos formais. Este documento não substitui aconselhamento contábil, tributário ou jurídico._");

  return { verdict: v, text: L.join('\n') + '\n' };
}

async function main() {
  const args = process.argv.slice(2);
  const dirIdx = args.indexOf('--dir');
  const dir = dirIdx !== -1 ? args[dirIdx + 1] : "founder";
  const minRateIdx = args.indexOf('--min-buy-rate');
  const minRate = minRateIdx !== -1 ? parseFloat(args[minRateIdx + 1]) : 0.25;
  const isCheck = args.includes('--check');
  const outIdx = args.indexOf('--out');
  const outPath = outIdx !== -1 ? args[outIdx + 1] : path.join(dir, "business-plan.md");

  if (isCheck) {
    const { verdict: v, checks } = await getVerdict(dir, minRate);
    console.log(`Veredito: ${v}`);
    checks.forEach(c => console.log(`  ${c.ok ? "✓" : "✗"} ${c.text}`));
    process.exit(v === "Profitable" ? 0 : 1);
  }

  const { verdict: v, text } = await compilePlan(dir, minRate);
  fs.writeFileSync(outPath, text, 'utf-8');
  console.log(`Veredito: ${v}. Compilou plano em ${outPath}`);
}

main();
