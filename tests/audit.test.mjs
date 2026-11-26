import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_RULES, auditPaths, auditText, classify, main } from '../scripts/audit.mjs';

const here = fileURLToPath(new URL('.', import.meta.url));
const BAD = join(here, 'fixtures', 'bad');
const GOOD = join(here, 'fixtures', 'good');

const quiet = (fn) => {
  const log = console.log;
  console.log = () => {};
  try { return fn(); } finally { console.log = log; }
};

test('every rule fires at least once on the bad fixtures', () => {
  const { findings } = auditPaths([BAD]);
  const hit = new Set(findings.map((f) => f.rule));
  const missing = ALL_RULES.map((r) => r.id).filter((id) => !hit.has(id));
  assert.deepEqual(missing, [], `rules with no bad fixture: ${missing.join(', ')}`);
});

test('good fixtures produce no findings at all', () => {
  const { findings } = auditPaths([GOOD]);
  assert.deepEqual(findings.map((f) => `${f.rule} ${f.file}:${f.line}`), []);
});

test('every rule is fully described', () => {
  const ids = new Set();
  for (const r of ALL_RULES) {
    assert.ok(/^[a-z-]+\/[a-z0-9-]+$/.test(r.id), `bad id ${r.id}`);
    assert.ok(!ids.has(r.id), `duplicate id ${r.id}`);
    ids.add(r.id);
    assert.ok(['error', 'warn', 'info'].includes(r.severity), `${r.id} severity`);
    assert.ok(['Required', 'Platform', 'Recommended'].includes(r.tier), `${r.id} tier`);
    assert.ok(/^\d\.\d\.\d+/.test(r.sc), `${r.id} sc`);
    assert.ok(r.title && r.fix && r.ref, `${r.id} text`);
  }
});

test('a11y-ignore comments suppress a finding', () => {
  const html = '<!-- a11y-ignore web/img-alt (decorative tracking pixel) -->\n<img src="p.gif">\n';
  assert.equal(auditText('x.html', html).filter((f) => f.rule === 'web/img-alt').length, 0);
  const other = '<!-- a11y-ignore web/iframe-title -->\n<img src="p.gif">\n';
  assert.equal(auditText('x.html', other).filter((f) => f.rule === 'web/img-alt').length, 1);
});

test('commented-out code is ignored', () => {
  const html = '<!-- <img src="old.png"> -->\n';
  assert.equal(auditText('x.html', html).length, 0);
  const tsx = 'import { View } from "react-native";\n// <Text allowFontScaling={false}>x</Text>\n';
  assert.equal(auditText('x.tsx', tsx).length, 0);
});

test('files are routed to the right rule sets', () => {
  assert.deepEqual(classify('a.tsx', "import { View } from 'react-native'"), ['rn']);
  assert.deepEqual(classify('a.tsx', "import React from 'react'"), ['web']);
  assert.deepEqual(classify('a.vue', ''), ['web', 'css']);
  assert.deepEqual(classify('a.scss', ''), ['css']);
  assert.deepEqual(classify('lib/a.dart', ''), ['flutter']);
  assert.deepEqual(classify('A.swift', ''), ['ios']);
  assert.deepEqual(classify('A.kt', 'import androidx.compose.ui.Modifier'), ['compose']);
  assert.deepEqual(classify('A.kt', 'class Plain'), []);
  assert.deepEqual(classify('app/src/main/res/layout/a.xml', ''), ['android-xml']);
  assert.deepEqual(classify('app/src/main/res/values/strings.xml', ''), []);
});

test('rem-based font sizes are not flagged', () => {
  const css = 'input { font-size: max(1rem, 16px); }\np { font-size: clamp(1rem, 0.9rem + 1vw, 1.25rem); }\n';
  assert.equal(auditText('a.css', css).filter((f) => f.rule === 'css/px-font-size').length, 0);
  assert.equal(auditText('a.css', 'p { font-size: 14px; }').filter((f) => f.rule === 'css/px-font-size').length, 1);
});

test('labels found by for/id, wrapping label or aria-label', () => {
  const ok = [
    '<label for="e">Email</label><input id="e" type="email" autocomplete="email">',
    '<label>Email <input type="email" autocomplete="email"></label>',
    '<input aria-label="Search" type="search">',
    '<label htmlFor="q">Search</label><input id="q" type="search" />',
  ];
  for (const html of ok) assert.equal(auditText('a.html', html).filter((f) => f.rule === 'web/form-field-label').length, 0, html);
});

test('CLI exit codes', () => {
  assert.equal(quiet(() => main([BAD])), 1);
  assert.equal(quiet(() => main([GOOD, '--fail-on', 'info'])), 0);
  assert.equal(quiet(() => main([BAD, '--fail-on', 'never'])), 0);
  assert.equal(quiet(() => main([])), 2);
  assert.equal(quiet(() => main([BAD, '--rules', 'nope'])), 2);
  assert.equal(quiet(() => main([join(BAD, 'ios'), '--rules', 'web'])), 0);
});
