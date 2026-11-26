// CSS rules: .css/.scss/.sass/.less files and <style> blocks in markup files.

function rules(css) {
  // Yields { selector, body, index } for simple (non-nested-aware) rule blocks.
  const out = [];
  const re = /([^{};]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(css))) out.push({ selector: m[1].trim(), body: m[2], index: m.index });
  return out;
}

export default [
  {
    id: 'css/outline-none',
    title: 'Focus outline removed without a visible replacement',
    severity: 'error', tier: 'Required', sc: '2.4.7',
    fix: 'Keep or replace the focus indicator: :focus-visible { outline: 2px solid <token>; outline-offset: 2px }. Check 3:1 against the background.',
    ref: 'references/foundations/focus.md',
    check({ css }) {
      const hasVisible = /:focus-visible[^{]*\{[^}]*(outline\s*:\s*(?!none|0\b)|box-shadow|border)/.test(css);
      return rules(css).filter((r) => {
        if (!/outline\s*:\s*(none|0)\b|outline-style\s*:\s*none/.test(r.body)) return false;
        if (/:focus-visible/.test(r.selector)) return false;
        if (/:focus(?!-)/.test(r.selector) && /(box-shadow|border|background|text-decoration)\s*:/.test(r.body)) return false;
        if (/:focus:not\(:focus-visible\)/.test(r.selector) && hasVisible) return false;
        return /:focus|^\*|^[a-z,\s]*\b(a|button|input|select|textarea)\b|^:root|^html|^body/i.test(r.selector) || !hasVisible;
      }).map((r) => ({ index: r.index, message: `"${r.selector.slice(0, 60)}" removes the outline${hasVisible ? '' : ' and no :focus-visible style was found in this file'}.` }));
    },
  },
  {
    id: 'css/px-font-size',
    title: 'Font size in px (ignores the user\'s default text size)',
    severity: 'warn', tier: 'Platform', sc: '1.4.4',
    fix: 'Use rem (1rem = the user\'s default size). px still zooms, but it ignores the browser text-size setting many low-vision users rely on.',
    ref: 'references/foundations/typography.md',
    check({ css }) {
      const out = [];
      const re = /\bfont(?:-size)?\s*:\s*([^;{}]*)/g;
      let m;
      while ((m = re.exec(css))) {
        const value = m[1];
        if (!/\b\d+(?:\.\d+)?px\b/.test(value)) continue;
        if (/\d(rem|em)\b|%|var\(/.test(value)) continue; // max(1rem, 16px), clamp(1rem, …), percentages keep user scaling
        if (/^\s*font\s*:/.test(m[0]) && !/\d+px\s*(\/|\s+[\w"'])/.test(value)) continue;
        out.push({ index: m.index });
      }
      return out;
    },
  },
  {
    id: 'css/fixed-root-font-size',
    title: 'Root font size fixed in px or vw only',
    severity: 'error', tier: 'Platform', sc: '1.4.4',
    fix: 'Leave the root at 100% (or a percentage). A px root cancels the user\'s text-size setting even if everything else uses rem; a vw-only root stops text responding to zoom.',
    ref: 'references/foundations/typography.md',
    check({ css }) {
      return rules(css)
        .filter((r) => /(^|,)\s*(html|:root)\s*($|,)/.test(r.selector) && /font-size\s*:\s*([\d.]+px|[\d.]+vw|calc\([^;]*vw[^;]*\))\s*[;}]?/.test(r.body) && !/font-size\s*:\s*[^;]*rem/.test(r.body))
        .map((r) => ({ index: r.index }));
    },
  },
  {
    id: 'css/justified-text',
    title: 'Justified text',
    severity: 'info', tier: 'Recommended', sc: '1.4.8',
    fix: 'Use start-aligned text. Justified text creates uneven gaps that make reading harder, especially for people with dyslexia.',
    ref: 'references/foundations/typography.md',
    check({ css }) {
      const out = [];
      const re = /text-align\s*:\s*justify/g;
      let m;
      while ((m = re.exec(css))) out.push({ index: m.index });
      return out;
    },
  },
  {
    id: 'css/motion-without-reduced-motion',
    title: 'Movement animations with no prefers-reduced-motion handling in this file',
    severity: 'warn', tier: 'Platform', sc: '2.3.3, 2.2.2',
    fix: 'Wrap movement in @media (prefers-reduced-motion: no-preference) { … }, or add a reduce block that swaps slides and zooms for fades.',
    ref: 'references/foundations/motion.md',
    check({ css }) {
      if (/prefers-reduced-motion/.test(css)) return [];
      const m = /@keyframes[^{]*\{[^]*?(transform|translate|rotate|scale|left|top)\s*[:(]/.exec(css) || /(animation|transition)\s*:[^;]*(transform|translate|rotate|scale)/.exec(css) || /scroll-behavior\s*:\s*smooth/.exec(css);
      return m ? [{ index: m.index }] : [];
    },
  },
  {
    id: 'css/user-zoom-blocked',
    title: 'Text size adjustment disabled',
    severity: 'warn', tier: 'Platform', sc: '1.4.4',
    fix: 'Remove -webkit-text-size-adjust: none; use 100% if you need to stop landscape auto-inflation.',
    ref: 'references/foundations/typography.md',
    check({ css }) {
      const out = [];
      const re = /text-size-adjust\s*:\s*none/g;
      let m;
      while ((m = re.exec(css))) out.push({ index: m.index });
      return out;
    },
  },
];
