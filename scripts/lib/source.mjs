// Small, dependency-free helpers for scanning source text.
// They are heuristics: good enough to find likely problems, not a full parser.

/** 1-based line and column for a character index. */
export function lineCol(text, index) {
  let line = 1;
  let last = -1;
  for (let i = 0; i < index && i < text.length; i++) {
    if (text.charCodeAt(i) === 10) { line++; last = i; }
  }
  return { line, col: index - last };
}

/** Parse an attribute string (HTML or JSX) into a Map of lowercase name → { value, expr }. */
export function parseAttrs(str = '') {
  const attrs = new Map();
  let i = 0;
  let spread = false;
  const n = str.length;
  const ws = (c) => c === ' ' || c === '\n' || c === '\t' || c === '\r';
  const readBraces = () => {
    let depth = 0;
    const start = i;
    while (i < n) {
      const c = str[i];
      if (c === '"' || c === "'" || c === '`') {
        const q = c; i++;
        while (i < n && str[i] !== q) { if (str[i] === '\\') i++; i++; }
      } else if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) { i++; break; } }
      i++;
    }
    return str.slice(start, i);
  };
  while (i < n) {
    while (i < n && ws(str[i])) i++;
    if (i >= n) break;
    if (str[i] === '{') { const b = readBraces(); if (/^\{\s*\.\.\./.test(b)) spread = true; continue; }
    if (str[i] === '/' || str[i] === '>') { i++; continue; }
    const start = i;
    while (i < n && !ws(str[i]) && str[i] !== '=' && str[i] !== '>' && !(str[i] === '/' && str[i + 1] === '>')) i++;
    const name = str.slice(start, i).toLowerCase();
    while (i < n && ws(str[i])) i++;
    let value = true;
    let expr = false;
    if (str[i] === '=') {
      i++;
      while (i < n && ws(str[i])) i++;
      const c = str[i];
      if (c === '"' || c === "'") {
        const end = str.indexOf(c, i + 1);
        value = str.slice(i + 1, end === -1 ? n : end);
        i = end === -1 ? n : end + 1;
      } else if (c === '{') {
        value = readBraces();
        expr = true;
      } else {
        const s = i;
        while (i < n && !ws(str[i]) && str[i] !== '>') i++;
        value = str.slice(s, i);
      }
    }
    if (name) attrs.set(name, { value, expr });
  }
  attrs.spread = spread;
  return attrs;
}

// An opening tag: name, then attributes (quoted values, JSX expressions with nested braces, spreads).
const TAG_RE = /<([a-zA-Z][\w:.-]*)((?:\s+(?:\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}|[^\s=>/{}"']+(?:\s*=\s*(?:"[^"]*"|'[^']*'|\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}|[^\s>"'{}]+))?))*)\s*(\/?)>/g;

/** Find opening tags whose name matches `nameTest` (a RegExp tested against the tag name). */
export function findTags(text, nameTest) {
  const out = [];
  TAG_RE.lastIndex = 0;
  let m;
  while ((m = TAG_RE.exec(text))) {
    if (nameTest && !nameTest.test(m[1])) continue;
    out.push({
      name: m[1],
      attrsRaw: m[2] || '',
      attrs: parseAttrs(m[2] || ''),
      selfClosing: m[3] === '/',
      start: m.index,
      end: m.index + m[0].length,
    });
  }
  return out;
}

/** Inner content of an element, handling nesting of the same tag name. '' for self-closing tags. */
export function elementContent(text, tag) {
  if (tag.selfClosing) return '';
  const esc = tag.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<(/?)${esc}(?=[\\s>/])`, 'g');
  re.lastIndex = tag.end;
  let depth = 1;
  let m;
  while ((m = re.exec(text))) {
    if (m[1] === '/') { depth--; if (depth === 0) return text.slice(tag.end, m.index); }
    else {
      // Ignore self-closing nested tags of the same name.
      const close = text.indexOf('>', m.index);
      if (close !== -1 && text[close - 1] !== '/') depth++;
    }
  }
  return text.slice(tag.end, Math.min(text.length, tag.end + 2000));
}

/** Visible text inside markup: strips tags; keeps JSX expressions as a placeholder word. */
export function visibleText(markup) {
  return markup
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
    .replace(/\{[^{}]*\}/g, ' x ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Text of a call's argument list starting at the "(" after `openIndex`, balanced. */
export function callArgs(text, openParenIndex) {
  let depth = 0;
  for (let i = openParenIndex; i < text.length; i++) {
    const c = text[i];
    if (c === '"' || c === "'") {
      const q = c; i++;
      while (i < text.length && text[i] !== q) { if (text[i] === '\\') i++; i++; }
      continue;
    }
    if (c === '(') depth++;
    else if (c === ')') { depth--; if (depth === 0) return text.slice(openParenIndex + 1, i); }
  }
  return text.slice(openParenIndex + 1, Math.min(text.length, openParenIndex + 1500));
}

/** Is there an `a11y-ignore` comment for this rule on the line or the line before? */
export function isSuppressed(lines, line, ruleId) {
  for (const l of [lines[line - 1], lines[line - 2]]) {
    if (!l) continue;
    const m = l.match(/a11y-ignore(?::|\s)?\s*([\w/,\s-]*)/);
    if (!m) continue;
    const ids = m[1].split(/[\s,]+/).filter(Boolean);
    if (ids.length === 0 || ids.includes(ruleId)) return true;
  }
  return false;
}

/** Remove comments so rules don't fire on commented-out code. Keeps offsets by replacing with spaces. */
export function stripComments(text, kind) {
  const blank = (s) => s.replace(/[^\n]/g, ' ');
  let out = text;
  if (kind === 'markup') out = out.replace(/<!--[\s\S]*?-->/g, blank);
  if (kind === 'css') out = out.replace(/\/\*[\s\S]*?\*\//g, blank);
  if (kind === 'code') {
    out = out.replace(/\/\*[\s\S]*?\*\//g, blank);
    out = out.replace(/(^|[^:"'\\])\/\/[^\n]*/g, (m, p) => p + blank(m.slice(p.length)));
  }
  return out;
}
