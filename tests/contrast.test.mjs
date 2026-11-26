import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { contrastRatio, formatRatio, parseColor, relativeLuminance, suggestPassing, toHex } from '../scripts/lib/color.mjs';
import { checkTokens, main } from '../scripts/contrast.mjs';

const close = (a, b, eps = 0.005) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);
const quiet = (fn) => {
  const log = console.log;
  const err = console.error;
  console.log = () => {};
  console.error = () => {};
  try { return fn(); } finally { console.log = log; console.error = err; }
};

test('WCAG reference values', () => {
  close(contrastRatio('#000', '#fff'), 21);
  close(contrastRatio('#fff', '#fff'), 1);
  close(contrastRatio('#767676', '#ffffff'), 4.5422);
  assert.ok(contrastRatio('#767676', '#fff') >= 4.5);
  assert.ok(contrastRatio('#777777', '#fff') < 4.5);
  assert.ok(contrastRatio('#949494', '#fff') >= 3);
  assert.ok(contrastRatio('#959595', '#fff') < 3, '#959595 is widely quoted as passing 3:1 but is 2.995:1');
  close(relativeLuminance('#ffffff'), 1, 1e-9);
  close(relativeLuminance('#000000'), 0, 1e-9);
});

test('order of colours does not matter', () => {
  close(contrastRatio('#336699', '#ffffff'), contrastRatio('#ffffff', '#336699'), 1e-9);
});

test('displayed ratios round down so a fail never shows as a pass', () => {
  assert.equal(formatRatio(4.4999), '4.49:1');
  assert.equal(formatRatio(2.9953), '2.99:1');
});

test('colour formats parse to the same value', () => {
  const ref = toHex(parseColor('#336699'));
  assert.equal(toHex(parseColor('#369')), ref);
  assert.equal(toHex(parseColor('rgb(51, 102, 153)')), ref);
  assert.equal(toHex(parseColor('rgb(51 102 153 / 100%)')), ref);
  assert.equal(toHex(parseColor('hsl(210 50% 40%)')), ref);
  assert.equal(toHex(parseColor('white')), '#ffffff');
  const ok = parseColor('oklch(0.6 0.1 250)');
  assert.ok(ok.r >= 0 && ok.r <= 1 && ok.b > ok.r);
  assert.throws(() => parseColor('not-a-colour'));
});

test('translucent colours are composited before measuring', () => {
  // 60% black over white = #666666
  close(contrastRatio('rgba(0,0,0,0.6)', '#ffffff'), contrastRatio('#666666', '#ffffff'), 0.02);
  // translucent background over a dark backdrop
  close(contrastRatio('#ffffff', 'rgba(0,0,0,0.5)', { backdrop: '#000000' }), 21, 0.01);
});

test('suggestions are the nearest passing colour', () => {
  const s = suggestPassing('#999999', '#ffffff', 4.5);
  assert.ok(s && s.ratio >= 4.5);
  assert.equal(s.hex, '#767676');
  const l = suggestPassing('#969696', '#ffffff', 3);
  assert.equal(l.hex, '#949494');
  const blue = suggestPassing('oklch(0.7 0.15 250)', '#ffffff', 4.5);
  assert.ok(blue.ratio >= 4.5 && blue.direction === 'darker');
  const onDark = suggestPassing('#444444', '#111111', 4.5);
  assert.ok(onDark.ratio >= 4.5 && onDark.direction === 'lighter');
});

test('token files: pairs, references, themes and failures', () => {
  const data = JSON.parse(readFileSync(fileURLToPath(new URL('../examples/tokens.example.json', import.meta.url)), 'utf8'));
  const rows = checkTokens(data);
  assert.ok(rows.length >= 8);
  assert.ok(rows.some((r) => r.theme === 'dark'));
  const failing = rows.filter((r) => !r.pass);
  assert.ok(failing.length >= 1, 'the example deliberately includes a failing pair');
  for (const r of failing) assert.ok(r.suggestion && r.suggestion.ratio >= r.need);
  assert.throws(() => checkTokens({ themes: { a: { colors: {}, pairs: [{ fg: '#000', bg: '#fff', use: 'body' }] } } }));
  assert.throws(() => checkTokens({ themes: { a: { colors: { x: 'y', y: 'x' }, pairs: [{ fg: 'x', bg: '#fff' }] } } }));
});

test('CLI exit codes', () => {
  assert.equal(quiet(() => main(['#767676', '#fff'])), 0);
  assert.equal(quiet(() => main(['#999', '#fff'])), 1);
  assert.equal(quiet(() => main(['#888', '#fff', '--suggest', 'large-text'])), 0); // 3.54:1 passes large text
  assert.equal(quiet(() => main(['#888', '#fff'])), 1);                          // …but not body text
  assert.equal(quiet(() => main(['nope', '#fff'])), 2);
  assert.equal(quiet(() => main([])), 2);
});
