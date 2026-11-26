// Flutter rules (.dart files).
import { callArgs } from '../lib/source.mjs';

const all = (re, text) => {
  const out = [];
  let m;
  while ((m = re.exec(text))) out.push({ index: m.index, match: m });
  return out;
};

export default [
  {
    id: 'flutter/text-scaling-disabled',
    title: 'Text scaling turned off or clamped to 1',
    severity: 'error', tier: 'Required', sc: '1.4.4',
    fix: 'Let text follow the system size. If one widget truly cannot grow, clamp it locally with textScaler.clamp(maxScaleFactor: 2.0) and test at the largest setting.',
    ref: 'references/platforms/flutter.md',
    check({ text }) {
      return all(/TextScaler\.noScaling|textScaleFactor\s*:\s*1(\.0)?\b|TextScaler\.linear\(\s*1(\.0)?\s*\)|maxScaleFactor\s*:\s*1(\.0)?\b/g, text);
    },
  },
  {
    id: 'flutter/gesture-without-semantics',
    title: 'GestureDetector used as a control without Semantics',
    severity: 'warn', tier: 'Required', sc: '4.1.2, 2.1.1',
    fix: 'Prefer a Material/Cupertino button. Otherwise wrap it in Semantics(button: true, label: "<action>") and make it focusable (FocusableActionDetector) with a 48×48 target.',
    ref: 'references/components/button.md',
    check({ text }) {
      return all(/GestureDetector\s*\(/g, text).filter(({ index }) => {
        const args = callArgs(text, text.indexOf('(', index));
        if (!/\bonTap\s*:/.test(args)) return false;
        const before = text.slice(Math.max(0, index - 300), index);
        return !/Semantics\s*\(/.test(before);
      });
    },
  },
  {
    id: 'flutter/icon-button-no-label',
    title: 'IconButton without a tooltip or semantic label',
    severity: 'error', tier: 'Required', sc: '1.1.1, 4.1.2',
    fix: 'Add tooltip: "<action>" (it becomes the accessible name), or a semanticLabel on the Icon.',
    ref: 'references/components/button.md',
    check({ text }) {
      return all(/\bIconButton(?:\.\w+)?\s*\(/g, text).filter(({ index }) => {
        const args = callArgs(text, text.indexOf('(', index));
        return !/\btooltip\s*:|semanticLabel\s*:/.test(args);
      });
    },
  },
  {
    id: 'flutter/image-no-label',
    title: 'Image without semanticLabel or excludeFromSemantics',
    severity: 'warn', tier: 'Required', sc: '1.1.1',
    fix: 'Informative images: semanticLabel: "<meaning>". Decorative images: excludeFromSemantics: true.',
    ref: 'references/content/images-and-charts.md',
    check({ text }) {
      return all(/\bImage(?:\.(asset|network|file|memory))?\s*\(/g, text).filter(({ index }) => {
        const args = callArgs(text, text.indexOf('(', index));
        if (/semanticLabel\s*:|excludeFromSemantics\s*:/.test(args)) return false;
        const before = text.slice(Math.max(0, index - 200), index);
        return !/ExcludeSemantics\s*\(\s*(child\s*:)?\s*$/.test(before) && !/Semantics\s*\([^)]*label\s*:/.test(before);
      });
    },
  },
  {
    id: 'flutter/shrinkwrap-tap-target',
    title: 'Tap targets shrunk below the minimum',
    severity: 'warn', tier: 'Platform', sc: '2.5.8',
    fix: 'Keep MaterialTapTargetSize.padded on touch layouts so targets stay 48×48.',
    ref: 'references/foundations/targets-spacing.md',
    check({ text }) { return all(/MaterialTapTargetSize\.shrinkWrap|VisualDensity\.compact/g, text); },
  },
  {
    id: 'flutter/web-semantics-off',
    title: 'App entry point without ensureSemantics (Flutter web)',
    severity: 'info', tier: 'Platform', sc: '4.1.2',
    fix: 'If this app runs on the web, call SemanticsBinding.instance.ensureSemantics() after runApp (guarded by kIsWeb). Otherwise screen reader users must find a hidden "Enable accessibility" button first.',
    ref: 'references/platforms/flutter.md',
    check({ text, path }) {
      if (!/main\.dart$/.test(path) || !/\brunApp\s*\(/.test(text) || /ensureSemantics/.test(text)) return [];
      return [{ index: text.search(/\brunApp\s*\(/) }];
    },
  },
];
