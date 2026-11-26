// iOS rules (.swift files: SwiftUI and UIKit).

const all = (re, text) => {
  const out = [];
  let m;
  while ((m = re.exec(text))) out.push({ index: m.index, match: m });
  return out;
};
const after = (text, index, n = 400) => text.slice(index, index + n);

export default [
  {
    id: 'ios/fixed-font-size',
    title: 'Fixed font size that ignores Dynamic Type',
    severity: 'error', tier: 'Required', sc: '1.4.4',
    fix: 'Use text styles (.font(.body), .headline…) or Font.custom(name, size:, relativeTo:). .system(size:) and .custom(_:fixedSize:) never scale.',
    ref: 'references/foundations/typography.md',
    check({ text }) { return all(/\.system\(\s*size\s*:|\.custom\([^)]*fixedSize\s*:/g, text); },
  },
  {
    id: 'ios/uifont-not-scaled',
    title: 'UIFont created at a fixed size with no UIFontMetrics in this file',
    severity: 'warn', tier: 'Required', sc: '1.4.4',
    fix: 'Use UIFont.preferredFont(forTextStyle:) or UIFontMetrics(forTextStyle:).scaledFont(for:), and set adjustsFontForContentSizeCategory = true.',
    ref: 'references/platforms/ios.md',
    check({ text }) {
      if (/UIFontMetrics|preferredFont\(/.test(text)) return [];
      return all(/UIFont\.(systemFont|boldSystemFont|italicSystemFont|monospacedSystemFont)\(\s*ofSize|UIFont\(\s*name\s*:/g, text);
    },
  },
  {
    id: 'ios/tap-gesture-not-button',
    title: 'onTapGesture used where a Button belongs',
    severity: 'warn', tier: 'Required', sc: '4.1.2, 2.1.1',
    fix: 'Use Button (style it any way you like) so it gets the button trait, Full Keyboard Access focus and Voice Control. If you must keep the gesture, add .accessibilityAddTraits(.isButton) and an accessibilityAction.',
    ref: 'references/components/button.md',
    check({ text }) {
      return all(/\.onTapGesture\b/g, text).filter(({ index }) => {
        const near = text.slice(Math.max(0, index - 300), index + 300);
        return !/accessibilityAddTraits\(\s*\.isButton|accessibilityAction|accessibilityRepresentation/.test(near);
      });
    },
  },
  {
    id: 'ios/image-no-label',
    title: 'Asset image with no accessibility label or hidden flag',
    severity: 'warn', tier: 'Required', sc: '1.1.1',
    fix: 'Informative: .accessibilityLabel("<meaning>"). Decorative: Image(decorative: "name") or .accessibilityHidden(true).',
    ref: 'references/content/images-and-charts.md',
    check({ text }) {
      return all(/\bImage\(\s*"[^"]+"\s*\)/g, text).filter(({ index }) => {
        // Only the modifier chain attached to this Image: the rest of its line plus following lines starting with "."
        const rest = after(text, index, 800).split('\n');
        let chain = rest[0];
        for (const l of rest.slice(1)) { if (/^\s*\./.test(l)) chain += l; else break; }
        return !/accessibilityLabel|accessibilityHidden/.test(chain);
      });
    },
  },
  {
    id: 'ios/single-line-text',
    title: '.lineLimit(1) may truncate text at large sizes',
    severity: 'info', tier: 'Platform', sc: '1.4.4',
    fix: 'Let important text wrap at large Dynamic Type sizes (no line limit, or relax it when dynamicTypeSize.isAccessibilitySize).',
    ref: 'references/foundations/typography.md',
    check({ text }) { return all(/\.lineLimit\(\s*1\s*\)/g, text); },
  },
  {
    id: 'ios/dynamic-type-capped',
    title: 'Dynamic Type capped below accessibility sizes',
    severity: 'warn', tier: 'Required', sc: '1.4.4',
    fix: 'Do not cap the whole screen. If one element cannot grow, cap only it, and use the Large Content Viewer for bars.',
    ref: 'references/platforms/ios.md',
    check({ text }) { return all(/\.dynamicTypeSize\(\s*(?:[\w.]*\s*)?\.\.[.<]?\s*(?:DynamicTypeSize)?\.(xSmall|small|medium|large|xLarge|xxLarge|xxxLarge)\s*\)/g, text); },
  },
  {
    id: 'ios/label-includes-role',
    title: 'Accessibility label repeats the role',
    severity: 'warn', tier: 'Required', sc: '4.1.2',
    fix: 'Name the action only ("Play"); VoiceOver adds the trait ("button").',
    ref: 'references/components/button.md',
    check({ text }) { return all(/accessibilityLabel\(\s*(?:Text\()?\s*"[^"]*\b(button|image|icon|link)"\s*\)/gi, text); },
  },
];
