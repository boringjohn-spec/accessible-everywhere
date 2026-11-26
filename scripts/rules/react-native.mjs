// React Native rules (JS/TS files that import from 'react-native').
import { findTags, elementContent } from '../lib/source.mjs';

const TOUCHABLE = /^(Pressable|TouchableOpacity|TouchableHighlight|TouchableWithoutFeedback|TouchableNativeFeedback|RectButton|BorderlessButton)$/;
const NAME_PROPS = ['accessibilitylabel', 'aria-label', 'accessibilitylabelledby', 'aria-labelledby'];

const all = (re, text) => {
  const out = [];
  let m;
  while ((m = re.exec(text))) out.push({ index: m.index });
  return out;
};

export default [
  {
    id: 'rn/font-scaling-disabled',
    title: 'Text scaling turned off',
    severity: 'error', tier: 'Required', sc: '1.4.4',
    fix: 'Remove allowFontScaling={false}. If a spot truly cannot grow, use maxFontSizeMultiplier (≥ 2) and make the layout wrap.',
    ref: 'references/platforms/react-native.md',
    check({ text }) { return all(/allowFontScaling\s*(?:=\s*\{\s*false\s*\}|:\s*false)/g, text); },
  },
  {
    id: 'rn/low-font-multiplier',
    title: 'maxFontSizeMultiplier below 2',
    severity: 'warn', tier: 'Required', sc: '1.4.4',
    fix: 'Allow at least 2× (200%). Let the layout wrap and stack at large sizes instead of capping text.',
    ref: 'references/foundations/typography.md',
    check({ text }) {
      return all(/maxFontSizeMultiplier\s*(?:=\s*\{\s*|:\s*)(1(?:\.\d+)?|0?\.\d+)\b/g, text);
    },
  },
  {
    id: 'rn/touchable-no-name',
    title: 'Touchable with no text and no accessibility label',
    severity: 'error', tier: 'Required', sc: '4.1.2, 1.1.1',
    fix: 'Add accessibilityLabel="<action>" (and accessibilityRole="button") to icon-only touchables.',
    ref: 'references/components/button.md',
    check({ text }) {
      return findTags(text, TOUCHABLE).filter((t) => {
        if (t.attrs.spread || NAME_PROPS.some((p) => t.attrs.has(p))) return false;
        if (t.attrs.get('accessible')?.value === '{false}') return false;
        const inner = elementContent(text, t);
        if (/<Text\b|<[A-Z][\w.]*Text\b|<Trans\b/.test(inner)) return false;
        if (/\{[^}]*\}/.test(inner.replace(/<[^>]*>/g, ''))) return false;
        return /<(Image|Svg|Icon|[A-Z][\w.]*Icon|Ionicons|MaterialIcons|Feather|FontAwesome\w*|AntDesign|MaterialCommunityIcons)\b/.test(inner) || inner.replace(/<[^>]*>/g, '').trim() === '';
      }).map((t) => ({ index: t.start, message: `<${t.name}> has no accessible name.` }));
    },
  },
  {
    id: 'rn/live-region-android-only',
    title: 'Live region without an iOS announcement',
    severity: 'warn', tier: 'Required', sc: '4.1.3',
    fix: 'accessibilityLiveRegion / aria-live only work on Android. Also call AccessibilityInfo.announceForAccessibility(message) so VoiceOver users hear it.',
    ref: 'references/structure.md',
    check({ text }) {
      if (/announceForAccessibility/.test(text)) return [];
      return all(/(accessibilityLiveRegion|aria-live)\s*=/g, text);
    },
  },
  {
    id: 'rn/role-in-label',
    title: 'Accessibility label repeats the role',
    severity: 'warn', tier: 'Required', sc: '4.1.2',
    fix: 'Name the action only ("Play"); the role is announced separately. "Play button" is read as "Play button, button".',
    ref: 'references/components/button.md',
    check({ text }) {
      return all(/(?:accessibilityLabel|aria-label)\s*=\s*\{?\s*["'`][^"'`]*\b(button|image|icon|link|checkbox|slider|tab)\s*["'`]/gi, text);
    },
  },
  {
    id: 'rn/deprecated-focus-api',
    title: 'Deprecated AccessibilityInfo.setAccessibilityFocus',
    severity: 'info', tier: 'Platform', sc: '2.4.3',
    fix: 'Use AccessibilityInfo.sendAccessibilityEvent(ref, "focus"); the target needs accessible={true}.',
    ref: 'references/platforms/react-native.md',
    check({ text }) { return all(/setAccessibilityFocus\s*\(/g, text); },
  },
  {
    id: 'rn/experimental-order',
    title: 'experimental_accessibilityOrder in use',
    severity: 'warn', tier: 'Platform', sc: '1.3.2, 2.4.3',
    fix: 'The docs mark it experimental and not for production. Fix the reading order in the view tree instead.',
    ref: 'references/platforms/react-native.md',
    check({ text }) { return all(/experimental_accessibilityOrder/g, text); },
  },
  {
    id: 'rn/link-role-for-navigation',
    title: 'accessibilityRole="link" used for in-app navigation',
    severity: 'info', tier: 'Platform', sc: '4.1.2',
    fix: 'React Native docs: use "link" for external URLs and "button" for in-app navigation.',
    ref: 'references/components/link.md',
    check({ text }) {
      return findTags(text, TOUCHABLE).filter((t) => /^\{?\s*["'`]?link\b/.test(String(t.attrs.get('accessibilityrole')?.value || t.attrs.get('role')?.value || '')) && /navigat|router|push\(/.test(String(t.attrs.get('onpress')?.value || ''))).map((t) => ({ index: t.start }));
    },
  },
  {
    id: 'rn/gesture-without-actions',
    title: 'Gesture handler with no accessibility actions in this file',
    severity: 'warn', tier: 'Required', sc: '2.5.1, 2.5.7',
    fix: 'Swipe, drag and pan interactions need an alternative: accessibilityActions + onAccessibilityAction, or visible buttons.',
    ref: 'references/components/list-rows-swipe.md',
    check({ text }) {
      if (/accessibilityActions|onAccessibilityAction/.test(text)) return [];
      const m = /PanResponder\.create|<Swipeable\b|<ReanimatedSwipeable\b|Gesture\.Pan\(|<PanGestureHandler\b/.exec(text);
      return m ? [{ index: m.index }] : [];
    },
  },
];
