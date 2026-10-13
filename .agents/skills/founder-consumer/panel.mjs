#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const FIRST_NAMES = [
  "Maya", "Jordan", "Priya", "Marcus", "Sofia", "Ethan", "Aisha", "Liam", "Chloe", "Daniel", "Nadia", "Owen",
  "Grace", "Ravi", "Emma", "Kenji", "Zoe", "Luca", "Hana", "Noah", "Fatima", "Caleb", "Isla", "Mateo", "Leah",
  "Omar", "Ava", "Theo", "Mei", "Jonah", "Sara", "Diego", "Ruby", "Kofi", "Nora", "Felix", "Amara", "Ben", "Lina",
  "Sam", "Aria", "Julian", "Keisha", "Marco", "Ines", "Tariq", "Elena", "Hugo", "Yara", "Callum", "Rosa", "Idris",
  "Freya", "Andre", "Leila", "Mason", "Talia", "Rohan", "Esme", "Victor", "Anya", "Kai", "Beatriz", "Declan",
  "Sana", "Jasper", "Min", "Gabriel", "Olivia", "Arjun", "Clara", "Malik", "Iris", "Wes", "Noor", "Rafael", "Ivy",
  "Dev", "Maeve", "Tomas", "Celine", "Adrian", "Lucia", "Hamza", "Poppy", "Ezra", "Sienna", "Darius", "Quinn",
  "Selin", "Rhys", "Nia", "Oscar", "Tess", "Bilal", "Jade", "Luis", "Harper", "Emil", "Kira", "Pablo", "Alma",
  "Seth", "Zara", "Nico", "Farah", "Levi", "June", "Eli", "Ana", "Yusuf", "Lena", "Cole", "Mira", "Raj", "Elle",
  "Finn", "Dana", "Sol", "Ada"
];

const REASONS = ["price", "habit", "need", "trust", "quality", "convenience", "timing", "values", "other"];
const ANSWER_FIELDS = ["id", "buys", "reason_code", "reason"];
const WAVE = 10;

// Mulberry32 PRNG for deterministic seeded randomness
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function quota(items, n, key = "share") {
  const total = items.reduce((acc, it) => acc + (parseFloat(it[key]) || 1.0), 0) || 1.0;
  const raw = items.map(it => n * (parseFloat(it[key]) || 1.0) / total);
  const counts = raw.map(r => Math.floor(r));
  const order = raw.map((r, i) => [r - counts[i], i]).sort((a, b) => b[0] - a[0]).map(x => x[1]);
  let diff = n - counts.reduce((a, b) => a + b, 0);
  for (let i = 0; i < diff; i++) {
    counts[order[i]]++;
  }
  return counts;
}

function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function deal(customer, n = 100, seed = 7) {
  const rng = mulberry32(seed);
  const age = customer.age || [25, 45];
  let segs = [];
  const segQuotas = quota(customer.segments, n);
  customer.segments.forEach((s, idx) => {
    for (let k = 0; k < segQuotas[idx]; k++) segs.push(s);
  });

  let behs = [];
  const behQuotas = quota(customer.behaviours, n);
  customer.behaviours.forEach((b, idx) => {
    for (let k = 0; k < behQuotas[idx]; k++) behs.push(b);
  });

  shuffle(segs, rng);
  shuffle(behs, rng);

  let names = [...FIRST_NAMES];
  shuffle(names, rng);
  while (names.length < n) {
    const round = Math.floor(names.length / FIRST_NAMES.length) + 1;
    names.push(...FIRST_NAMES.map(x => `${x} ${round}`));
  }

  const objections = customer.objections;
  const habits = customer.habits || [];
  const cards = [];

  for (let i = 0; i < n; i++) {
    const s = segs[i];
    const b = behs[i];
    const lo = parseFloat(s.income[0]);
    const hi = parseFloat(s.income[1]);
    const inc = Math.round((lo + rng() * (hi - lo)) / 1000) * 1000;
    const a = Math.floor(age[0] + rng() * (age[1] - age[0] + 1));
    const pid = "P" + String(i + 1).padStart(3, "0");
    cards.push({
      id: pid,
      name: names[i],
      age: a,
      segment: s.name,
      income: inc,
      behaviour: b.name,
      behaviour_how: b.how || "",
      objection: objections[Math.floor(rng() * objections.length)],
      habit: habits.length ? habits[Math.floor(rng() * habits.length)] : ""
    });
  }
  return cards;
}

const BRIEF = `You are a simulated buyer on a consumer panel. A founder wants to know, before spending any money, whether real people like you would buy. Your answer is only useful if it is honest: most people do not buy most things, and a polite yes is worse than a clear no.

=== WHO YOU ARE ===
{name}, {age}. {segment}. You earn about R$ {income} a year.
How you buy: {behaviour}. {behaviour_how}
{habit_line}The first thing that comes to mind when you hear an offer like this: "{objection}"
You are one of these people: {target}.
=== END ===

=== WHAT IS BEING OFFERED (you see it for the first time, the way a passer-by or a scroller would) ===
{pitch}
=== END ===

Decide as {name} would, with {name}'s money, habits and doubts, in a normal week. Do not be agreeable. Do not invent facts about the business beyond what is written above.

Create the file {out} with your file-writing tool (do not just print the answer in your reply) containing ONLY this JSON, no markdown fence, nothing else:
{{
  "id": "{id}",
  "buys": true or false,
  "purchases_first_month": how many times you would buy in the first month (0 if you would not buy),
  "reason_code": one of {reasons},
  "reason": "why, in one or two sentences, in your own voice",
  "objection": "the doubt that weighs most for you, in your own words",
  "would_change_my_mind": "the one thing that would flip your answer, or empty",
  "price_too_cheap": the price at which it would seem too cheap to be any good (a number),
  "price_cheap": the price at which it would feel like a bargain (a number),
  "price_expensive": the price at which it starts to feel expensive but you might still buy (a number),
  "price_too_expensive": the price at which you would not buy it at all (a number)
}}
`;

function answerOk(pathStr, pid) {
  if (!fs.existsSync(pathStr)) return "missing";
  try {
    const raw = fs.readFileSync(pathStr, 'utf-8');
    const a = JSON.parse(raw);
    for (const f of ANSWER_FIELDS) {
      if (!(f in a)) return `missing ${f}`;
    }
    if (a.id !== pid) return `id is ${a.id}, expected ${pid}`;
    if (typeof a.buys !== 'boolean') return "'buys' must be boolean";
    if (!REASONS.includes(a.reason_code)) return `reason_code ${a.reason_code} not valid`;
    return null;
  } catch (e) {
    return "not valid JSON";
  }
}

function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  const dirIdx = args.indexOf('--dir');
  const d = dirIdx !== -1 ? args[dirIdx + 1] : path.join('founder', 'panel');

  if (cmd === 'init') {
    const cIdx = args.indexOf('--customer');
    const pIdx = args.indexOf('--pitch');
    const nIdx = args.indexOf('--n');
    const sIdx = args.indexOf('--seed');
    const customer = JSON.parse(fs.readFileSync(args[cIdx + 1], 'utf-8'));
    const pitch = fs.readFileSync(args[pIdx + 1], 'utf-8').trim();
    const n = nIdx !== -1 ? parseInt(args[nIdx + 1]) : 100;
    const seed = sIdx !== -1 ? parseInt(args[sIdx + 1]) : Math.floor(Math.random() * 1000000);

    const cards = deal(customer, n, seed);
    fs.mkdirSync(d, { recursive: true });
    fs.mkdirSync(path.join(d, 'briefs'), { recursive: true });
    fs.mkdirSync(path.join(d, 'answers'), { recursive: true });
    fs.writeFileSync(path.join(d, 'panel.json'), JSON.stringify({ n, seed, customer, pitch }, null, 2));
    fs.writeFileSync(path.join(d, 'personas.json'), JSON.stringify(cards, null, 2));
    console.log(`dealt ${cards.length} buyers (seed ${seed}) into ${d}. Next: panel prompts`);
  } else if (cmd === 'prompts') {
    const panel = JSON.parse(fs.readFileSync(path.join(d, 'panel.json'), 'utf-8'));
    const cards = JSON.parse(fs.readFileSync(path.join(d, 'personas.json'), 'utf-8'));
    const todo = [];
    cards.forEach(c => {
      const ansPath = path.join(d, 'answers', `${c.id}.json`);
      if (answerOk(ansPath, c.id) === null) return;
      const briefContent = BRIEF
        .replaceAll('{name}', c.name)
        .replaceAll('{age}', c.age)
        .replaceAll('{segment}', c.segment)
        .replaceAll('{income}', c.income.toLocaleString('pt-BR'))
        .replaceAll('{behaviour}', c.behaviour)
        .replaceAll('{behaviour_how}', c.behaviour_how)
        .replaceAll('{habit_line}', c.habit ? `Your day: ${c.habit}.\n` : '')
        .replaceAll('{objection}', c.objection)
        .replaceAll('{target}', panel.customer.target)
        .replaceAll('{pitch}', panel.pitch)
        .replaceAll('{out}', path.resolve(ansPath))
        .replaceAll('{id}', c.id)
        .replaceAll('{reasons}', REASONS.join(' / '));

      const bPath = path.join(d, 'briefs', `${c.id}.md`);
      fs.writeFileSync(bPath, briefContent);
      todo.push([c.id, path.resolve(bPath)]);
    });

    if (todo.length === 0) {
      console.log("every buyer has a valid answer. Next: panel tally");
    } else {
      const waves = [];
      for (let i = 0; i < todo.length; i += WAVE) waves.push(todo.slice(i, i + WAVE));
      console.log(`${todo.length} briefs in ${waves.length} waves of up to ${WAVE}. Launch one wave at a time:`);
      waves.forEach((w, k) => {
        console.log(`wave ${k + 1}: ${w.map(j => `${j[0]}=${j[1]}`).join(' ')}`);
      });
    }
  } else if (cmd === 'check') {
    const cards = JSON.parse(fs.readFileSync(path.join(d, 'personas.json'), 'utf-8'));
    const probs = [];
    cards.forEach(c => {
      const p = answerOk(path.join(d, 'answers', `${c.id}.json`), c.id);
      if (p) probs.push([c.id, p]);
    });
    if (probs.length === 0) {
      console.log("all answers present and valid");
      process.exit(0);
    } else {
      probs.forEach(([pid, p]) => console.log(`${pid}: ${p}`));
      process.exit(1);
    }
  } else if (cmd === 'tally') {
    const panel = JSON.parse(fs.readFileSync(path.join(d, 'panel.json'), 'utf-8'));
    const cards = JSON.parse(fs.readFileSync(path.join(d, 'personas.json'), 'utf-8'));
    const byId = Object.fromEntries(cards.map(c => [c.id, c]));
    const rows = [];
    const skipped = [];
    cards.forEach(c => {
      const ansPath = path.join(d, 'answers', `${c.id}.json`);
      const p = answerOk(ansPath, c.id);
      if (p) {
        skipped.push([c.id, p]);
        return;
      }
      const ans = JSON.parse(fs.readFileSync(ansPath, 'utf-8'));
      rows.push({ ...byId[c.id], ...ans, id: c.id });
    });

    if (rows.length === 0) {
      console.error("no valid answers yet: run briefs first");
      process.exit(1);
    }

    const yes = rows.filter(r => r.buys);
    const no = rows.filter(r => !r.buys);
    const buyRate = yes.length / rows.length;

    function group(key) {
      const map = {};
      rows.forEach(r => {
        map[r[key]] = map[r[key]] || [];
        map[r[key]].push(r);
      });
      return Object.entries(map).map(([k, v]) => [k, v.length, v.filter(x => x.buys).length / v.length]).sort((a, b) => b[2] - a[2]);
    }

    function reasons(rs) {
      const map = {};
      rs.forEach(r => {
        map[r.reason_code] = map[r.reason_code] || [];
        map[r.reason_code].push(r);
      });
      return Object.entries(map).sort((a, b) => b[1].length - a[1].length);
    }

    const sortedInc = [...rows].map(r => r.income).sort((a, b) => a - b);
    const cut1 = sortedInc[Math.floor(sortedInc.length / 3)];
    const cut2 = sortedInc[Math.floor(2 * sortedInc.length / 3)];
    rows.forEach(r => {
      r.income_band = r.income < cut1 ? `até R$ ${cut1.toLocaleString('pt-BR')}` : (r.income >= cut2 ? `R$ ${cut2.toLocaleString('pt-BR')} ou mais` : `R$ ${cut1.toLocaleString('pt-BR')} a R$ ${cut2.toLocaleString('pt-BR')}`);
    });

    const res = {
      business: panel.customer.business,
      seed: panel.seed,
      dealt: cards.length,
      answered: rows.length,
      skipped,
      buys: yes.length,
      passes: no.length,
      buy_rate: buyRate,
      by_segment: group("segment"),
      by_behaviour: group("behaviour"),
      by_income: group("income_band"),
      why_not: reasons(no).map(([k, v]) => [k, v.length, v.slice(0, 2).map(r => r.reason), v.slice(0, 2).map(r => r.id)]),
      why_yes: reasons(yes).map(([k, v]) => [k, v.length, v.slice(0, 2).map(r => r.reason), v.slice(0, 2).map(r => r.id)]),
      flip: no.map(r => r.would_change_my_mind).filter(Boolean),
      purchases_first_month_per_buyer: yes.length ? yes.reduce((a, b) => a + (parseFloat(b.purchases_first_month) || 0), 0) / yes.length : 0,
      price_answers: rows.filter(r => [r.price_too_cheap, r.price_cheap, r.price_expensive, r.price_too_expensive].every(x => x !== undefined && x !== null && !isNaN(parseFloat(x)))).length
    };

    const pct = v => `${Math.round(v * 100)}%`;
    const lines = [
      `# Buyer panel: ${res.business}`,
      "",
      `**${res.buys} buy · ${res.passes} pass** (${pct(res.buy_rate)} buy) out of ${res.answered} simulated buyers. Seed ${res.seed}, so the same cards can be dealt again.`,
      "",
      "These are simulated buyers, not customers. Use this to find objections and weak spots, then confirm the big ones with real people before you spend."
    ];

    [["By segment", "by_segment"], ["By buying behaviour", "by_behaviour"], ["By income", "by_income"]].forEach(([title, key]) => {
      lines.push("", `## ${title}`, "", "| group | buyers | buy rate |", "| --- | ---: | ---: |");
      res[key].forEach(([k, n, r]) => {
        lines.push(`| ${k} | ${n} | ${pct(r)}${n < 8 ? " (thin)" : ""} |`);
      });
    });

    lines.push("", "## Why they pass", "", "| reason | buyers | in their words |", "| --- | ---: | --- |");
    res.why_not.forEach(([k, n, quotes, ids]) => {
      lines.push(`| ${k} | ${n} | ${quotes.map((q, i) => `"${q.replace(/\|/g, '/')}" (${ids[i]})`).join(' · ')} |`);
    });

    lines.push("", "## Why they buy", "", "| reason | buyers | in their words |", "| --- | ---: | --- |");
    res.why_yes.forEach(([k, n, quotes, ids]) => {
      lines.push(`| ${k} | ${n} | ${quotes.map((q, i) => `"${q.replace(/\|/g, '/')}" (${ids[i]})`).join(' · ')} |`);
    });

    if (res.flip.length) {
      lines.push("", "## What would flip a no", "");
      res.flip.slice(0, 12).forEach(f => lines.push(`- ${f}`));
    }

    if (res.purchases_first_month_per_buyer) {
      lines.push("", `Buyers say they would buy **${res.purchases_first_month_per_buyer.toFixed(1)} times** in the first month on average.`);
    }

    if (res.price_answers) {
      lines.push("", `${res.price_answers} buyers gave all four price answers. Run founder-pricing's van_westendorp analysis on the answers folder.`);
    }

    const mdOut = path.join(d, 'results.md');
    fs.writeFileSync(mdOut, lines.join('\n') + '\n');
    fs.writeFileSync(path.join(d, 'results.json'), JSON.stringify(res, null, 2));
    console.log(`${res.buys} buy · ${res.passes} pass (${pct(res.buy_rate)}). Wrote ${mdOut}`);
  }
}

main();
