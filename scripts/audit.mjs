#!/usr/bin/env node
// Static accessibility audit for web (HTML/JSX/Vue/Svelte/Astro + CSS), React Native,
// Flutter, iOS (SwiftUI/UIKit) and Android (Compose + XML layouts).
//
//   node scripts/audit.mjs <paths…> [--format text|json|github] [--fail-on error|warn|info|never]
//                                    [--rules web,css,rn,flutter,ios,compose,android-xml] [--list-rules]
//
// It is a heuristic first pass: it finds likely problems quickly and can be wrong.
// Silence a finding with a comment on the same or previous line:  a11y-ignore <rule-id> (reason)
// Exit codes: 0 = nothing at or above --fail-on, 1 = findings at or above it, 2 = usage error.

import { readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { extname, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { isSuppressed, lineCol, stripComments } from './lib/source.mjs';
import webRules from './rules/web.mjs';
import cssRules from './rules/css.mjs';
import rnRules from './rules/react-native.mjs';
import flutterRules from './rules/flutter.mjs';
import iosRules from './rules/swiftui.mjs';
import { compose as composeRules, androidXml as androidXmlRules } from './rules/android.mjs';

export const RULE_SETS = {
  web: webRules,
  css: cssRules,
  rn: rnRules,
  flutter: flutterRules,
  ios: iosRules,
  compose: composeRules,
  'android-xml': androidXmlRules,
};
export const ALL_RULES = Object.values(RULE_SETS).flat();

const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'out', 'coverage', 'Pods', 'DerivedData', '.dart_tool', '.gradle', '.expo', 'vendor', '.svelte-kit', '.nuxt', '.turbo', '.cache', '.idea', '.vscode', 'generated']);
const MARKUP = new Set(['.html', '.htm', '.vue', '.svelte', '.astro']);
const SCRIPT = new Set(['.jsx', '.tsx', '.js', '.ts', '.mjs', '.cjs']);
const STYLE = new Set(['.css', '.scss', '.sass', '.less']);
const SEVERITY = { info: 1, warn: 2, error: 3 };

function walk(p, out) {
  let st;
  try { st = statSync(p); } catch { return; }
  if (st.isDirectory()) {
    for (const name of readdirSync(p)) {
      if (IGNORE_DIRS.has(name) || (name.startsWith('.') && name !== '.')) continue;
      walk(join(p, name), out);
    }
  } else if (st.isFile() && st.size <= 1_000_000 && !/\.min\.(js|css)$/.test(p)) {
    out.push(p);
  }
}

/** Decide which rule sets apply to a file. */
export function classify(path, text) {
  const ext = extname(path).toLowerCase();
  const sets = [];
  if (MARKUP.has(ext)) sets.push('web', 'css');
  else if (SCRIPT.has(ext)) {
    if (/from\s+['"]react-native['"]|require\(\s*['"]react-native['"]\s*\)|from\s+['"]react-native-/.test(text)) sets.push('rn');
    else sets.push('web');
  } else if (STYLE.has(ext)) sets.push('css');
  else if (ext === '.dart') sets.push('flutter');
  else if (ext === '.swift') sets.push('ios');
  else if (ext === '.kt' || ext === '.kts') { if (/androidx\.compose|@Composable/.test(text)) sets.push('compose'); }
  else if (ext === '.xml' && /[\\/]res[\\/]layout[^\\/]*[\\/]/.test(path)) sets.push('android-xml');
  return sets;
}

function cssView(text, ext) {
  if (STYLE.has(ext)) return stripComments(text, 'css');
  // Keep only <style> blocks, preserving offsets.
  let out = text.replace(/[^\n]/g, ' ');
  const re = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = re.exec(text))) {
    const start = m.index + m[0].indexOf(m[1]);
    out = out.slice(0, start) + m[1] + out.slice(start + m[1].length);
  }
  return stripComments(out, 'css');
}

/** Audit one file's text. Returns findings. */
export function auditText(path, text, { only } = {}) {
  const ext = extname(path).toLowerCase();
  const lines = text.split('\n');
  const findings = [];
  for (const set of classify(path, text)) {
    if (only && !only.includes(set)) continue;
    const kind = set === 'css' ? 'css' : MARKUP.has(ext) ? 'markup' : ext === '.xml' ? 'markup' : 'code';
    const body = set === 'css' ? cssView(text, ext) : stripComments(text, kind);
    const ctx = { text: body, css: body, path, ext, lines };
    for (const rule of RULE_SETS[set]) {
      let hits = [];
      try { hits = rule.check(ctx) || []; } catch (err) { hits = []; }
      for (const h of hits) {
        const { line, col } = lineCol(text, h.index);
        if (isSuppressed(lines, line, rule.id)) continue;
        findings.push({
          file: path, line, col,
          rule: rule.id, severity: rule.severity, tier: rule.tier, sc: rule.sc,
          title: rule.title, message: h.message || rule.title, fix: rule.fix, ref: rule.ref,
          snippet: (lines[line - 1] || '').trim().slice(0, 140),
        });
      }
    }
  }
  return findings;
}

export function auditPaths(paths, opts = {}) {
  const files = [];
  for (const p of paths) walk(resolve(p), files);
  const findings = [];
  for (const f of files) {
    const ext = extname(f).toLowerCase();
    if (![...MARKUP, ...SCRIPT, ...STYLE, '.dart', '.swift', '.kt', '.kts', '.xml'].includes(ext)) continue;
    const text = readFileSync(f, 'utf8');
    findings.push(...auditText(f, text, opts));
  }
  return { files: files.length, findings };
}

function parseArgs(argv) {
  const o = { paths: [], format: 'text', failOn: 'error' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--format') o.format = argv[++i];
    else if (a === '--fail-on') o.failOn = argv[++i];
    else if (a === '--rules') o.only = argv[++i].split(',').map((s) => s.trim());
    else if (a === '--list-rules') o.list = true;
    else if (a === '-h' || a === '--help') o.help = true;
    else o.paths.push(a);
  }
  return o;
}

const HELP = `Usage: audit.mjs <paths…> [--format text|json|github] [--fail-on error|warn|info|never]
                 [--rules ${Object.keys(RULE_SETS).join(',')}] [--list-rules]
Silence a finding: put "a11y-ignore <rule-id>" in a comment on the same or previous line.`;

function printText(findings, cwd, nFiles) {
  const byFile = new Map();
  for (const f of findings) {
    const k = relative(cwd, f.file) || f.file;
    if (!byFile.has(k)) byFile.set(k, []);
    byFile.get(k).push(f);
  }
  for (const [file, list] of byFile) {
    console.log(`\n${file}`);
    for (const f of list.sort((a, b) => a.line - b.line)) {
      console.log(`  ${String(f.line).padStart(4)}:${String(f.col).padEnd(3)} ${f.severity.padEnd(5)} ${f.rule}  [${f.tier}, WCAG ${f.sc}]`);
      console.log(`        ${f.message}`);
      if (f.snippet) console.log(`        > ${f.snippet}`);
      console.log(`        Fix: ${f.fix}`);
    }
  }
  const count = (s) => findings.filter((f) => f.severity === s).length;
  console.log(`\n${nFiles} files scanned: ${count('error')} errors, ${count('warn')} warnings, ${count('info')} notes.`);
  console.log('Static checks find likely problems only. Test with real assistive technology too (references/testing/manual-scripts.md).');
}

export function main(argv = process.argv.slice(2)) {
  const o = parseArgs(argv);
  if (o.list) {
    for (const [set, rules] of Object.entries(RULE_SETS)) {
      console.log(`\n${set}`);
      for (const r of rules) console.log(`  ${r.id.padEnd(40)} ${r.severity.padEnd(5)} ${r.tier.padEnd(11)} WCAG ${r.sc.padEnd(16)} ${r.title}`);
    }
    return 0;
  }
  if (o.help || o.paths.length === 0) { console.log(HELP); return o.help ? 0 : 2; }
  if (!['text', 'json', 'github'].includes(o.format) || !['error', 'warn', 'info', 'never'].includes(o.failOn)) { console.log(HELP); return 2; }
  if (o.only) {
    const unknown = o.only.filter((s) => !RULE_SETS[s]);
    if (unknown.length) { console.error(`Unknown rule set(s): ${unknown.join(', ')}`); return 2; }
  }
  const { files, findings } = auditPaths(o.paths, { only: o.only });
  const cwd = process.cwd();
  if (o.format === 'json') console.log(JSON.stringify({ files, findings: findings.map((f) => ({ ...f, file: relative(cwd, f.file).split(sep).join('/') })) }, null, 2));
  else if (o.format === 'github') {
    for (const f of findings) {
      const level = f.severity === 'error' ? 'error' : f.severity === 'warn' ? 'warning' : 'notice';
      const msg = `${f.message} [${f.tier}, WCAG ${f.sc}] Fix: ${f.fix}`.replace(/\r?\n/g, ' ');
      console.log(`::${level} file=${relative(cwd, f.file)},line=${f.line},col=${f.col},title=${f.rule}::${msg}`);
    }
  } else printText(findings, cwd, files);
  if (o.failOn === 'never') return 0;
  const threshold = SEVERITY[o.failOn];
  return findings.some((f) => SEVERITY[f.severity] >= threshold) ? 1 : 0;
}

const invoked = process.argv[1] && pathToFileURL(realpathSync(process.argv[1])).href;
if (import.meta.url === invoked) process.exitCode = main();
