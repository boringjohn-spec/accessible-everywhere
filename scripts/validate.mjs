#!/usr/bin/env node
// Checks the skill package: frontmatter, links, component structure, WCAG coverage and rule references.
import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ALL_RULES } from './audit.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// WCAG 2.2 Level A and AA success criteria (4.1.1 Parsing removed in 2.2).
export const WCAG22_A_AA = {
  '1.1.1': 'A', '1.2.1': 'A', '1.2.2': 'A', '1.2.3': 'A', '1.2.4': 'AA', '1.2.5': 'AA',
  '1.3.1': 'A', '1.3.2': 'A', '1.3.3': 'A', '1.3.4': 'AA', '1.3.5': 'AA',
  '1.4.1': 'A', '1.4.2': 'A', '1.4.3': 'AA', '1.4.4': 'AA', '1.4.5': 'AA', '1.4.10': 'AA', '1.4.11': 'AA', '1.4.12': 'AA', '1.4.13': 'AA',
  '2.1.1': 'A', '2.1.2': 'A', '2.1.4': 'A', '2.2.1': 'A', '2.2.2': 'A', '2.3.1': 'A',
  '2.4.1': 'A', '2.4.2': 'A', '2.4.3': 'A', '2.4.4': 'A', '2.4.5': 'AA', '2.4.6': 'AA', '2.4.7': 'AA', '2.4.11': 'AA',
  '2.5.1': 'A', '2.5.2': 'A', '2.5.3': 'A', '2.5.4': 'A', '2.5.7': 'AA', '2.5.8': 'AA',
  '3.1.1': 'A', '3.1.2': 'AA', '3.2.1': 'A', '3.2.2': 'A', '3.2.3': 'AA', '3.2.4': 'AA', '3.2.6': 'A',
  '3.3.1': 'A', '3.3.2': 'A', '3.3.3': 'AA', '3.3.4': 'AA', '3.3.7': 'A', '3.3.8': 'AA',
  '4.1.2': 'A', '4.1.3': 'AA',
};

export const COMPONENTS = [
  'button', 'link', 'text-field', 'choice-controls', 'forms-and-auth', 'dialog-and-sheet', 'tabs',
  'accordion-disclosure', 'combobox-picker', 'slider', 'tooltip', 'carousel-pager', 'list-rows-swipe', 'toast-snackbar',
];
const PLATFORMS = ['web', 'ios', 'android', 'react-native', 'flutter'];

function mdFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...mdFiles(p));
    else if (name.endsWith('.md')) out.push(p);
  }
  return out;
}

export function validate() {
  const errors = [];
  const err = (m) => errors.push(m);

  // SKILL.md frontmatter
  const skill = readFileSync(join(root, 'SKILL.md'), 'utf8');
  const fm = skill.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) err('SKILL.md: missing frontmatter');
  else {
    const name = fm[1].match(/^name:\s*(.+)$/m)?.[1].trim();
    const desc = fm[1].match(/^description:\s*(.+)$/m)?.[1].trim();
    if (name !== 'accessible-everywhere') err(`SKILL.md: name should be accessible-everywhere, got ${name}`);
    if (!/^[a-z0-9-]{1,64}$/.test(name || '')) err('SKILL.md: name must be lowercase letters, digits and hyphens (≤ 64)');
    if (!desc) err('SKILL.md: missing description');
    else if (desc.length > 1024) err(`SKILL.md: description is ${desc.length} characters (max 1024)`);
    if (!/^license:/m.test(fm[1])) err('SKILL.md: missing license');
  }
  const bodyLines = skill.split('\n').length;
  if (bodyLines > 500) err(`SKILL.md: ${bodyLines} lines; keep it under 500 and move detail to references/`);

  // Relative links resolve
  const files = [join(root, 'SKILL.md'), join(root, 'README.md'), join(root, 'CONTRIBUTING.md'), join(root, 'rules', 'AGENTS.md'),
    ...mdFiles(join(root, 'references')), ...mdFiles(join(root, 'templates'))].filter(existsSync);
  for (const f of files) {
    const text = readFileSync(f, 'utf8').replace(/```[\s\S]*?```/g, '');
    for (const m of text.matchAll(/\]\(([^)\s]+)\)/g)) {
      const href = m[1];
      if (/^(https?:|mailto:|#)/.test(href)) continue;
      const target = join(dirname(f), href.split('#')[0]);
      if (!existsSync(target)) err(`${relative(root, f)}: broken link ${href}`);
    }
  }

  // Components
  for (const c of COMPONENTS) {
    const p = join(root, 'references', 'components', `${c}.md`);
    if (!existsSync(p)) { err(`missing component file ${c}.md`); continue; }
    const t = readFileSync(p, 'utf8');
    for (const h of ['## Contract', '## Common mistakes', '## Test it', '## Sources']) if (!t.includes(h)) err(`${c}.md: missing "${h}"`);
    for (const plat of ['Web', 'iOS', 'Android', 'React Native', 'Flutter']) if (!t.includes(plat)) err(`${c}.md: no ${plat} guidance`);
    if (!/\|\s*Tier\s*\|\s*SC\s*\|/.test(t)) err(`${c}.md: contract table needs Tier and SC columns`);
  }
  const extra = readdirSync(join(root, 'references', 'components')).filter((n) => !COMPONENTS.includes(n.replace(/\.md$/, '')));
  if (extra.length) err(`components not listed in validate.mjs: ${extra.join(', ')}`);

  // Platforms
  for (const p of PLATFORMS) if (!existsSync(join(root, 'references', 'platforms', `${p}.md`))) err(`missing platform file ${p}.md`);

  // WCAG coverage
  const map = readFileSync(join(root, 'references', 'wcag-map.md'), 'utf8');
  for (const [sc, level] of Object.entries(WCAG22_A_AA)) {
    const row = map.split('\n').find((l) => l.startsWith(`| ${sc} `));
    if (!row) { err(`wcag-map.md: missing ${sc}`); continue; }
    const cell = row.split('|')[2]?.trim();
    if (cell !== level) err(`wcag-map.md: ${sc} should be Level ${level}, found "${cell}"`);
  }

  // Audit rules point at real reference files
  for (const r of ALL_RULES) if (!existsSync(join(root, r.ref))) err(`rule ${r.id}: ref ${r.ref} does not exist`);

  return errors;
}

export function main() {
  const errors = validate();
  if (errors.length) {
    for (const e of errors) console.error(`✗ ${e}`);
    console.error(`\n${errors.length} problem(s).`);
    return 1;
  }
  console.log(`✓ Skill package valid: ${COMPONENTS.length} components, ${PLATFORMS.length} platforms, ${Object.keys(WCAG22_A_AA).length} WCAG A/AA criteria mapped, ${ALL_RULES.length} audit rules.`);
  return 0;
}

const invoked = process.argv[1] && pathToFileURL(realpathSync(process.argv[1])).href;
if (import.meta.url === invoked) process.exitCode = main();
