// Colour parsing, WCAG 2 contrast and OKLCH helpers. No dependencies.
// Contrast follows the WCAG 2.2 definitions of relative luminance (sRGB, threshold 0.04045)
// and contrast ratio ((L1 + 0.05) / (L2 + 0.05)).

const NAMED = {
  black: '#000000', white: '#ffffff', red: '#ff0000', green: '#008000', blue: '#0000ff',
  yellow: '#ffff00', orange: '#ffa500', purple: '#800080', gray: '#808080', grey: '#808080',
  silver: '#c0c0c0', maroon: '#800000', olive: '#808000', lime: '#00ff00', aqua: '#00ffff',
  teal: '#008080', navy: '#000080', fuchsia: '#ff00ff', pink: '#ffc0cb', brown: '#a52a2a',
  gold: '#ffd700', indigo: '#4b0082', violet: '#ee82ee', crimson: '#dc143c', coral: '#ff7f50',
  tomato: '#ff6347', salmon: '#fa8072', khaki: '#f0e68c', beige: '#f5f5dc', ivory: '#fffff0',
  lavender: '#e6e6fa', tan: '#d2b48c', chocolate: '#d2691e', darkgray: '#a9a9a9', darkgrey: '#a9a9a9',
  dimgray: '#696969', dimgrey: '#696969', lightgray: '#d3d3d3', lightgrey: '#d3d3d3',
  gainsboro: '#dcdcdc', whitesmoke: '#f5f5f5', slategray: '#708090', slategrey: '#708090',
  darkblue: '#00008b', darkgreen: '#006400', darkred: '#8b0000', royalblue: '#4169e1',
  steelblue: '#4682b4', dodgerblue: '#1e90ff', skyblue: '#87ceeb', seagreen: '#2e8b57',
  forestgreen: '#228b22', firebrick: '#b22222', rebeccapurple: '#663399', cyan: '#00ffff',
  magenta: '#ff00ff', transparent: '#00000000',
};

const clamp01 = (x) => Math.min(1, Math.max(0, x));

function parseNumber(token, scale = 1) {
  const t = String(token).trim();
  if (t.endsWith('%')) return (parseFloat(t) / 100) * scale;
  return parseFloat(t);
}

function splitArgs(inner) {
  // Supports "r, g, b, a", "r g b / a" and mixtures.
  const [main, alpha] = inner.split('/').map((s) => s && s.trim());
  const parts = main.split(/[\s,]+/).filter(Boolean);
  if (alpha !== undefined) parts.push(alpha);
  return parts;
}

function hueToDeg(token) {
  const t = String(token).trim().toLowerCase();
  if (t.endsWith('turn')) return parseFloat(t) * 360;
  if (t.endsWith('rad')) return (parseFloat(t) * 180) / Math.PI;
  if (t.endsWith('grad')) return parseFloat(t) * 0.9;
  return parseFloat(t);
}

/** Parse a CSS-like colour string into { r, g, b, a } with r,g,b in 0..1 (sRGB) and a in 0..1. */
export function parseColor(input) {
  if (input && typeof input === 'object' && 'r' in input) return input;
  let s = String(input).trim().toLowerCase();
  if (NAMED[s]) s = NAMED[s];
  let m;
  if ((m = s.match(/^#([0-9a-f]{3,8})$/))) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) throw new Error(`Invalid hex colour: ${input}`);
    const n = (i) => parseInt(h.slice(i, i + 2), 16) / 255;
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) : 1 };
  }
  if ((m = s.match(/^rgba?\((.+)\)$/))) {
    const p = splitArgs(m[1]);
    const ch = (t) => clamp01(parseNumber(t, 255) / 255);
    return { r: ch(p[0]), g: ch(p[1]), b: ch(p[2]), a: p[3] !== undefined ? clamp01(parseNumber(p[3])) : 1 };
  }
  if ((m = s.match(/^hsla?\((.+)\)$/))) {
    const p = splitArgs(m[1]);
    const h = ((hueToDeg(p[0]) % 360) + 360) % 360;
    const sat = clamp01(parseNumber(p[1], 1));
    const l = clamp01(parseNumber(p[2], 1));
    const k = (n) => (n + h / 30) % 12;
    const a = sat * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return { r: f(0), g: f(8), b: f(4), a: p[3] !== undefined ? clamp01(parseNumber(p[3])) : 1 };
  }
  if ((m = s.match(/^oklch\((.+)\)$/))) {
    const p = splitArgs(m[1]);
    const L = String(p[0]).trim().endsWith('%') ? parseFloat(p[0]) / 100 : parseFloat(p[0]);
    const C = String(p[1]).trim().endsWith('%') ? (parseFloat(p[1]) / 100) * 0.4 : parseFloat(p[1]);
    const H = p[2] === 'none' ? 0 : hueToDeg(p[2]);
    const rgb = oklchToRgb({ L, C, H });
    return { ...rgb, a: p[3] !== undefined ? clamp01(parseNumber(p[3])) : 1 };
  }
  throw new Error(`Unsupported colour: ${input} (use hex, rgb(), hsl(), oklch() or a common name)`);
}

/** Composite a (possibly translucent) colour over an opaque backdrop, in sRGB like browsers do. */
export function blend(top, backdrop) {
  const t = parseColor(top);
  const b = parseColor(backdrop);
  if (b.a < 1) throw new Error('The backdrop must be opaque; blend it over its own background first.');
  const a = t.a;
  return { r: t.r * a + b.r * (1 - a), g: t.g * a + b.g * (1 - a), b: t.b * a + b.b * (1 - a), a: 1 };
}

const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

/** WCAG 2 relative luminance of an opaque colour. */
export function relativeLuminance(color) {
  const { r, g, b } = parseColor(color);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/**
 * WCAG 2 contrast ratio. Translucent colours are composited first:
 * the background over `backdrop` (default white), then the foreground over the result.
 */
export function contrastRatio(fg, bg, { backdrop = '#ffffff' } = {}) {
  let back = parseColor(bg);
  if (back.a < 1) back = blend(back, backdrop);
  let front = parseColor(fg);
  if (front.a < 1) front = blend(front, back);
  const l1 = relativeLuminance(front);
  const l2 = relativeLuminance(back);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/** Round down to 2 decimals so 4.499 never displays as a pass. */
export const formatRatio = (r) => `${(Math.floor(r * 100) / 100).toFixed(2)}:1`;

export const THRESHOLDS = {
  text: { AA: 4.5, AAA: 7, label: 'Text', sc: '1.4.3 / 1.4.6' },
  'large-text': { AA: 3, AAA: 4.5, label: 'Large text (≥ 24px, or ≥ 18.66px bold)', sc: '1.4.3 / 1.4.6' },
  ui: { AA: 3, AAA: 3, label: 'UI parts and meaningful graphics', sc: '1.4.11' },
};

export function toHex({ r, g, b, a = 1 }) {
  const h = (x) => Math.round(clamp01(x) * 255).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}${a < 1 ? h(a) : ''}`;
}

// ---------- OKLCH ----------
export function rgbToOklch(color) {
  const { r, g, b } = parseColor(color);
  const [lr, lg, lb] = [lin(r), lin(g), lin(b)];
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.sqrt(A * A + B * B);
  const H = ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  return { L, C, H };
}

const gam = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

function oklchToRgbRaw({ L, C, H }) {
  const hr = (H * Math.PI) / 180;
  const A = C * Math.cos(hr);
  const B = C * Math.sin(hr);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return {
    r: gam(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: gam(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: gam(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  };
}

const inGamut = ({ r, g, b }) => [r, g, b].every((x) => x >= -1e-4 && x <= 1 + 1e-4);

/** OKLCH → sRGB, reducing chroma until the colour fits in sRGB. */
export function oklchToRgb({ L, C, H }) {
  let rgb = oklchToRgbRaw({ L, C, H });
  if (!inGamut(rgb)) {
    let lo = 0;
    let hi = C;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToRgbRaw({ L, C: mid, H }))) lo = mid;
      else hi = mid;
    }
    rgb = oklchToRgbRaw({ L, C: lo, H });
  }
  return { r: clamp01(rgb.r), g: clamp01(rgb.g), b: clamp01(rgb.b), a: 1 };
}

/**
 * Find the nearest colour to `fg` (same OKLCH hue and chroma where possible) that reaches
 * `target` contrast against `bg`. Returns { hex, ratio, direction } or null.
 */
export function suggestPassing(fg, bg, target, { backdrop = '#ffffff' } = {}) {
  const start = rgbToOklch(fg);
  if (start.C < 0.002) start.C = 0; // keep greys grey
  const tryL = (L) => {
    const rgb = oklchToRgb({ L, C: start.C, H: start.H });
    // Round to a real hex value before measuring, so the reported colour truly passes.
    const hex = toHex(rgb);
    return { hex, ratio: contrastRatio(hex, bg, { backdrop }) };
  };
  const step = 0.01;
  // Walk in one direction until a passing lightness is found, then binary-search the boundary
  // so the suggestion is the closest passing colour, not just a passing one.
  const search = (dir) => {
    let prev = start.L;
    for (let L = start.L; dir < 0 ? L >= -step : L <= 1 + step; L += dir * step) {
      const Lc = Math.min(1, Math.max(0, L));
      if (tryL(Lc).ratio >= target) {
        let fail = prev;
        let pass = Lc;
        for (let i = 0; i < 25; i++) {
          const mid = (fail + pass) / 2;
          if (tryL(mid).ratio >= target) pass = mid;
          else fail = mid;
        }
        return { ...tryL(pass), dL: Math.abs(pass - start.L), direction: dir < 0 ? 'darker' : 'lighter' };
      }
      prev = Lc;
    }
    return null;
  };
  const darker = search(-1);
  const lighter = search(1);
  const best = [darker, lighter].filter(Boolean).sort((a, b) => a.dL - b.dL)[0];
  return best ? { hex: best.hex, ratio: best.ratio, direction: best.direction } : null;
}
