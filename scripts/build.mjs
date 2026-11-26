#!/usr/bin/env node
// Generates the portable rule files from rules/AGENTS.md:
//   rules/accessible-everywhere.mdc   (Cursor project rule)
//   rules/copilot-instructions.md     (GitHub Copilot: copy to .github/copilot-instructions.md)
// Usage: node scripts/build.mjs [--check]   (--check fails if the generated files are out of date)

import { readFileSync, writeFileSync, existsSync, realpathSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const GENERATED = '<!-- Generated from rules/AGENTS.md by scripts/build.mjs. Edit AGENTS.md, then run `npm run build`. -->';

export function outputs() {
  const src = readFileSync(join(root, 'rules', 'AGENTS.md'), 'utf8').trim();
  const mdc = [
    '---',
    'description: Accessibility rules (WCAG 2.2 AA + platform standards) for web, iOS, Android, React Native and Flutter UI. Apply when creating, changing or reviewing user interface code.',
    'globs: "**/*.{html,htm,jsx,tsx,vue,svelte,astro,css,scss,swift,kt,dart,xml}"',
    'alwaysApply: false',
    '---',
    '',
    GENERATED,
    '',
    src,
    '',
  ].join('\n');
  const copilot = [GENERATED, '', src, ''].join('\n');
  return {
    [join(root, 'rules', 'accessible-everywhere.mdc')]: mdc,
    [join(root, 'rules', 'copilot-instructions.md')]: copilot,
  };
}

export function main(argv = process.argv.slice(2)) {
  const check = argv.includes('--check');
  let stale = 0;
  for (const [file, content] of Object.entries(outputs())) {
    const current = existsSync(file) ? readFileSync(file, 'utf8') : null;
    if (current === content) continue;
    if (check) { console.error(`Out of date: ${file.slice(root.length + 1)} (run npm run build)`); stale++; }
    else { writeFileSync(file, content); console.log(`Wrote ${file.slice(root.length + 1)}`); }
  }
  if (check && !stale) console.log('Generated files are up to date.');
  return stale ? 1 : 0;
}

const invoked = process.argv[1] && pathToFileURL(realpathSync(process.argv[1])).href;
if (import.meta.url === invoked) process.exitCode = main();
