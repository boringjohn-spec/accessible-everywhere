#!/usr/bin/env node
// WCAG 2 contrast checker for colour pairs and design-token files.
//
//   node scripts/contrast.mjs "#767676" "#ffffff"
//   node scripts/contrast.mjs "rgba(0,0,0,.6)" "#ffffff"           # translucent text is composited first
//   node scripts/contrast.mjs "#999" "#fff" --suggest text           # nearest passing colour, same hue
//   node scripts/contrast.mjs --tokens tokens.json [--level AA|AAA] [--json]
//
// Token file format (see references/foundations/color.md):
// {
//   "colors": { "white": "#ffffff" },                 // optional, shared by every theme
//   "themes": {
//     "light": {
//       "colors": { "text": "#1a1a1a", "surface": "#ffffff" },
//       "pairs": [ { "fg": "text", "bg": "surface", "use": "text" } ]   // use: text | large-text | ui
//     }
//   }
// }
// fg / bg may be token names or colour literals. A pair may set "backdrop" for translucent backgrounds.
// Exit code 1 if any pair fails, 2 on bad input.

import { readFileSync, realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { contrastRatio, formatRatio, parseColor, suggestPassing, THRESHOLDS, toHex } from './lib/color.mjs';

function parseArgs(argv) {
  const opts = { positional: [], level: 'AA', json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--tokens') opts.tokens = argv[++i];
    else if (a === '--suggest') opts.suggest = argv[++i];
    else if (a === '--backdrop') opts.backdrop = argv[++i];
    else if (a === '--level') opts.level = String(argv[++i]).toUpperCase();
    else if (a === '--json') opts.json = true;
    else if (a === '-h' || a === '--help') opts.help = true;
    else opts.positional.push(a);
  }
  return opts;
}

const HELP = `Usage:
  contrast.mjs <foreground> <background> [--backdrop <colour>] [--suggest text|large-text|ui] [--json]
  contrast.mjs --tokens <file.json> [--level AA|AAA] [--json]

Colours: hex (#rgb, #rrggbb, #rrggbbaa), rgb()/rgba(), hsl()/hsla(), oklch(), common names.`;

export function checkPair(fg, bg, { backdrop } = {}) {
  const ratio = contrastRatio(fg, bg, backdrop ? { backdrop } : undefined);
  const results = Object.entries(THRESHOLDS).map(([use, t]) => ({
    use,
    label: t.label,
    sc: t.sc,
    AA: ratio >= t.AA,
    AAA: ratio >= t.AAA,
    needAA: t.AA,
    needAAA: t.AAA,
  }));
  return { ratio, results };
}

function resolve(value, colors, seen = new Set()) {
  if (typeof value !== 'string') throw new Error(`Colour value must be a string, got ${JSON.stringify(value)}`);
  if (Object.prototype.hasOwnProperty.call(colors, value)) {
    if (seen.has(value)) throw new Error(`Circular token reference: ${value}`);
    seen.add(value);
    return resolve(colors[value], colors, seen);
  }
  const ref = value.match(/^\{(.+)\}$/);
  if (ref) return resolve(ref[1], colors, seen);
  parseColor(value); // throws if not a colour
  return value;
}

export function checkTokens(data, { level = 'AA' } = {}) {
  if (!data || typeof data !== 'object' || !data.themes) throw new Error('Token file needs a "themes" object.');
  const shared = data.colors || {};
  const out = [];
  for (const [theme, def] of Object.entries(data.themes)) {
    const colors = { ...shared, ...(def.colors || {}) };
    for (const pair of def.pairs || []) {
      const use = pair.use || 'text';
      const t = THRESHOLDS[use];
      if (!t) throw new Error(`Unknown "use" value "${use}" in theme ${theme} (use text, large-text or ui).`);
      const fg = resolve(pair.fg, colors);
      const bg = resolve(pair.bg, colors);
      const backdrop = pair.backdrop ? resolve(pair.backdrop, colors) : undefined;
      const ratio = contrastRatio(fg, bg, backdrop ? { backdrop } : undefined);
      const need = level === 'AAA' ? t.AAA : t.AA;
      const pass = ratio >= need;
      const row = { theme, fg: pair.fg, bg: pair.bg, fgValue: fg, bgValue: bg, use, ratio, need, pass, sc: t.sc };
      if (!pass) {
        const s = suggestPassing(fg, bg, need, backdrop ? { backdrop } : undefined);
        if (s) row.suggestion = s;
      }
      out.push(row);
    }
  }
  return out;
}

function printPair(fg, bg, opts) {
  const { ratio, results } = checkPair(fg, bg, { backdrop: opts.backdrop });
  if (opts.json) {
    const payload = { fg, bg, ratio: Number(ratio.toFixed(4)), results };
    if (opts.suggest) payload.suggestion = suggestPassing(fg, bg, THRESHOLDS[opts.suggest]?.AA ?? 4.5, { backdrop: opts.backdrop });
    console.log(JSON.stringify(payload, null, 2));
    return results.find((r) => r.use === (opts.suggest || 'text')).AA ? 0 : 1;
  }
  console.log(`${toHex(parseColor(fg))} on ${toHex(parseColor(bg))}  →  ${formatRatio(ratio)}`);
  for (const r of results) {
    const aa = r.AA ? 'pass' : 'FAIL';
    const aaa = r.AAA ? 'pass' : 'fail';
    console.log(`  ${r.label.padEnd(40)} AA ${String(r.needAA).padStart(3)}:1 ${aa.padEnd(5)}  AAA ${String(r.needAAA).padStart(3)}:1 ${aaa}   (${r.sc})`);
  }
  if (opts.suggest) {
    const t = THRESHOLDS[opts.suggest];
    if (!t) throw new Error(`--suggest takes text, large-text or ui`);
    const s = suggestPassing(fg, bg, t.AA, { backdrop: opts.backdrop });
    if (!s) console.log(`  No colour with the same hue reaches ${t.AA}:1 on this background. Change the background.`);
    else if (contrastRatio(fg, bg, opts.backdrop ? { backdrop: opts.backdrop } : undefined) >= t.AA) console.log(`  Already passes for ${opts.suggest}.`);
    else console.log(`  Suggestion for ${opts.suggest}: ${s.hex} (${formatRatio(s.ratio)}, ${s.direction}, same hue)`);
  }
  return results.find((r) => r.use === (opts.suggest || 'text')).AA ? 0 : 1;
}

function printTokens(rows, opts) {
  if (opts.json) {
    console.log(JSON.stringify(rows.map((r) => ({ ...r, ratio: Number(r.ratio.toFixed(4)) })), null, 2));
  } else {
    let theme = null;
    for (const r of rows) {
      if (r.theme !== theme) { theme = r.theme; console.log(`\n${theme}`); }
      const mark = r.pass ? '✓' : '✗';
      const fix = r.suggestion ? `  → try ${r.suggestion.hex} (${formatRatio(r.suggestion.ratio)})` : '';
      console.log(`  ${mark} ${`${r.fg} on ${r.bg}`.padEnd(38)} ${r.use.padEnd(10)} ${formatRatio(r.ratio).padStart(8)}  needs ${r.need}:1${fix}`);
    }
    const failed = rows.filter((r) => !r.pass).length;
    console.log(`\n${rows.length - failed}/${rows.length} pairs pass (${opts.level}).`);
  }
  return rows.some((r) => !r.pass) ? 1 : 0;
}

export function main(argv = process.argv.slice(2)) {
  const opts = parseArgs(argv);
  if (opts.help || (!opts.tokens && opts.positional.length < 2)) {
    console.log(HELP);
    return opts.help ? 0 : 2;
  }
  try {
    if (opts.tokens) {
      const data = JSON.parse(readFileSync(opts.tokens, 'utf8'));
      return printTokens(checkTokens(data, { level: opts.level }), opts);
    }
    return printPair(opts.positional[0], opts.positional[1], opts);
  } catch (err) {
    console.error(`contrast: ${err.message}`);
    return 2;
  }
}

const invoked = process.argv[1] && pathToFileURL(realpathSync(process.argv[1])).href;
if (import.meta.url === invoked) process.exitCode = main();
