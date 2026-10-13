#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const KEYS = ["too_cheap", "cheap", "expensive", "too_expensive"];

function f(v) {
  if (v === undefined || v === null) return null;
  const cleaned = String(v).replace(/[R$\s,]/g, '').trim();
  const num = parseFloat(cleaned);
  return (!isNaN(num) && num > 0) ? num : null;
}

function read(srcPath) {
  const raw = [];
  if (fs.statSync(srcPath).isDirectory()) {
    const files = fs.readdirSync(srcPath).filter(f => f.endsWith('.json')).sort();
    for (const file of files) {
      try {
        const content = JSON.parse(fs.readFileSync(path.join(srcPath, file), 'utf-8'));
        raw.push(KEYS.map(k => f(content[`price_${k}`])));
      } catch (e) {
        raw.push(null);
      }
    }
  } else if (srcPath.endsWith('.csv')) {
    const lines = fs.readFileSync(srcPath, 'utf-8').split(/\r?\n/).filter(Boolean);
    const headers = lines[0].split(',').map(h => h.trim());
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      const row = {};
      headers.forEach((h, idx) => row[h] = parts[idx]);
      raw.push(KEYS.map(k => f(row[k])));
    }
  }

  const rows = [];
  let dropped = 0;
  for (const r of raw) {
    if (!r || r.some(v => v === null) || !(r[0] <= r[1] && r[1] <= r[2] && r[2] <= r[3])) {
      dropped++;
      continue;
    }
    rows.push(r);
  }
  return { rows, dropped };
}

function curves(rows, grid) {
  const n = rows.length;
  const tc = grid.map(p => rows.filter(r => r[0] >= p).length / n); // too cheap
  const ch = grid.map(p => rows.filter(r => r[1] >= p).length / n); // cheap / bargain
  const ex = grid.map(p => rows.filter(r => r[2] <= p).length / n); // expensive
  const te = grid.map(p => rows.filter(r => r[3] <= p).length / n); // too expensive
  return { tc, ch, ex, te };
}

function cross(grid, falling, rising) {
  for (let i = 1; i < grid.length; i++) {
    const d0 = rising[i - 1] - falling[i - 1];
    const d1 = rising[i] - falling[i];
    if (d0 <= 0 && 0 <= d1 && d1 !== d0) {
      const t = -d0 / (d1 - d0);
      return grid[i - 1] + t * (grid[i] - grid[i - 1]);
    }
    if (d0 === 0) return grid[i - 1];
  }
  return null;
}

function analyse(rows) {
  if (rows.length < 5) throw new Error(`Precisa de pelo menos 5 respostas completas (recebeu ${rows.length})`);
  const lo = Math.min(...rows.map(r => r[0]));
  const hi = Math.max(...rows.map(r => r[3]));
  const step = Math.max(0.01, Math.round(((hi - lo) / 400) * 100) / 100);

  const grid = [];
  let p = lo;
  while (p <= hi + 1e-9) {
    grid.push(Math.round(p * 10000) / 10000);
    p += step;
  }

  const { tc, ch, ex, te } = curves(rows, grid);
  const notCheap = ch.map(v => 1 - v);
  const notExp = ex.map(v => 1 - v);

  const pts = {
    PMC: cross(grid, tc, notCheap),
    PME: cross(grid, notExp, te),
    OPP: cross(grid, tc, te),
    IPP: cross(grid, ch, ex)
  };

  const medians = {};
  KEYS.forEach((k, idx) => {
    const sorted = rows.map(r => r[idx]).sort((a, b) => a - b);
    medians[k] = sorted[Math.floor(sorted.length / 2)];
  });

  return {
    n: rows.length,
    points: pts,
    range: [pts.PMC, pts.PME],
    median: medians
  };
}

function report(res, dropped, currentPrice = null) {
  const fmt = v => v === null ? "n/a" : `R$ ${v.toFixed(2).replace('.', ',')}`;
  const p = res.points;
  const lines = [
    "# Curva de Sensibilidade de Preço (Van Westendorp)",
    "",
    `${res.n} respostas completas do painel${dropped ? `, ${dropped} descartadas por inconsistência` : ''}.`,
    "",
    "| Ponto | Preço | O que significa na prática |",
    "| :--- | ---: | :--- |",
    `| **PMC** (Ponto Marginal de Barateamento) | ${fmt(p.PMC)} | Abaixo deste valor, o cliente desconfia da qualidade ou acha amador. |`,
    `| **OPP** (Ponto de Preço Ótimo) | ${fmt(p.OPP)} | Onde há a menor resistência: igual número de pessoas acha muito barato ou muito caro. |`,
    `| **IPP** (Ponto de Indiferença de Preço) | ${fmt(p.IPP)} | Onde a proporção dos que acham uma pechincha iguala a dos que acham caro. |`,
    `| **PME** (Ponto Marginal de Encarecimento) | ${fmt(p.PME)} | Acima deste valor, o produto é considerado proibitivo pela maioria. |`,
    "",
    `**Faixa Aceitável de Preço: de ${fmt(p.PMC)} a ${fmt(p.PME)}.**`,
    "",
    `Mediana das respostas individuais:`,
    `- Muito barato (desconfiança): ${fmt(res.median.too_cheap)}`,
    `- Uma pechincha (ótimo negócio): ${fmt(res.median.cheap)}`,
    `- Começando a ficar caro: ${fmt(res.median.expensive)}`,
    `- Proibitivo (não compraria): ${fmt(res.median.too_expensive)}`
  ];

  if (currentPrice !== null && p.PMC !== null && p.PME !== null) {
    const where = currentPrice < p.PMC ? "abaixo do piso aceitável (parece barato demais/amador)" :
                 (currentPrice > p.PME ? "acima do teto tolerado (gera forte resistência)" : "dentro da faixa aceitável de mercado");
    lines.push("", `O seu preço atual de teste (**${fmt(currentPrice)}**) está **${where}**.`);
  }

  return lines.join('\n') + '\n';
}

function main() {
  const args = process.argv.slice(2);
  const src = args[0] || path.join('founder', 'panel', 'answers');
  const priceIdx = args.indexOf('--price');
  const outIdx = args.indexOf('--out');
  const currentPrice = priceIdx !== -1 ? parseFloat(args[priceIdx + 1]) : 29.90;
  const outPath = outIdx !== -1 ? args[outIdx + 1] : path.join('founder', 'pricing-curve.md');

  const { rows, dropped } = read(src);
  const res = analyse(rows);
  const text = report(res, dropped, currentPrice);

  if (outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, text, 'utf-8');
    console.log(`Escreveu análise em ${outPath}`);
  } else {
    console.log(text);
  }
}

main();
