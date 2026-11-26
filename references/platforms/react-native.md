# React Native (and Expo)

React Native renders real native views, so VoiceOver and TalkBack work, but **some props only work on one platform**. Always test on both.

## Props: what works where (React Native 0.88 docs)
| Prop | iOS | Android | Notes |
|---|---|---|---|
| `accessible` | ✓ | ✓ | Makes a view one stop; touchables are accessible by default and take their label from child text |
| `accessibilityLabel` / `aria-label` | ✓ | ✓ | Name. Required for icon-only touchables |
| `accessibilityLabelledBy` / `aria-labelledby` | ✗ | ✓ | Uses `nativeID`; set `accessibilityLabel` too |
| `accessibilityHint` | ✓ (if hints on) | ✓ (always read) | Keep rare and short |
| `accessibilityRole` or `role` | ✓ | ✓ | `role` wins; values differ: `heading`/`header`, `img`/`image`, `slider`/`adjustable`, `searchbox`/`search`. Use `link` for external URLs, `button` for in-app navigation |
| `accessibilityState` / `aria-*` | ✓ | ✓ | `disabled`, `selected`, `checked` (`true`/`false`/`'mixed'`), `busy`, `expanded` |
| `accessibilityValue` / `aria-value*` | ✓ | ✓ | `min`, `max`, `now`, `text` |
| `accessibilityActions` + `onAccessibilityAction` | ✓ | ✓ | `activate`, `increment`, `decrement`, `longpress` (Android), `expand`/`collapse` (Android), `magicTap`/`escape` (iOS), custom names |
| `accessibilityLiveRegion` / `aria-live` | ✗ | ✓ | **Android only**: also call `announceForAccessibility` for iOS |
| `importantForAccessibility` | ✗ | ✓ | `no-hide-descendants` to hide content behind a custom modal |
| `accessibilityViewIsModal` / `aria-modal` | ✓ | ✗ | Custom modal on iOS |
| `accessibilityElementsHidden` | ✓ | ✗ | Hide a subtree on iOS |
| `aria-hidden` | ✓ | ✓ | Cross-platform hiding |
| `accessibilityLanguage` | ✓ | ✗ | BCP 47 tag |
| `accessibilityIgnoresInvertColors` | ✓ | ✗ | Photos and video under Smart Invert |
| `accessibilityShowsLargeContentViewer` | ✓ | ✗ | Tab bars and toolbars |
| `onAccessibilityEscape` / `onMagicTap` / `onAccessibilityTap` | ✓ | ✗ | Two-finger scrub closes; two-finger double-tap = main action |
| `experimental_accessibilityOrder` | ✓ | ✓ | **Experimental**: don't ship; fix order in the view tree |
| `allowFontScaling` / `maxFontSizeMultiplier` | ✓ | ✓ | Keep scaling on (default); cap only where truly needed, ≥ 2 |

## AccessibilityInfo
- Both: `isScreenReaderEnabled()`, `isReduceMotionEnabled()`, `announceForAccessibility(msg)`, `sendAccessibilityEvent(ref, 'focus')` (moves screen reader focus; target needs `accessible`), listeners `screenReaderChanged`, `reduceMotionChanged`.
- iOS only: `isBoldTextEnabled`, `isGrayscaleEnabled`, `isInvertColorsEnabled`, `isReduceTransparencyEnabled`, `isDarkerSystemColorsEnabled`, `prefersCrossFadeTransitions`, `announceForAccessibilityWithOptions(msg, { queue, priority })`.
- Android only: `isHighTextContrastEnabled`, `isAccessibilityServiceEnabled`, `getRecommendedTimeoutMillis(ms)`.
- `setAccessibilityFocus` is **deprecated**; use `sendAccessibilityEvent(ref, 'focus')`.

## Patterns
```tsx
// Icon button
<Pressable onPress={share} accessibilityRole="button" accessibilityLabel="Share" hitSlop={10}>
  <ShareIcon />
</Pressable>

// Group a card into one stop, actions as custom actions
<Pressable accessible accessibilityLabel={`${title}, ${price}`} onPress={open}
  accessibilityActions={[{ name: 'save', label: 'Save for later' }]}
  onAccessibilityAction={e => e.nativeEvent.actionName === 'save' && save()}>…</Pressable>

// Heading
<Text role="heading">Delivery address</Text>

// Announce on both platforms
AccessibilityInfo.announceForAccessibility('3 results');

// Respect reduced motion
const [reduceMotion, setReduceMotion] = useState(false);
useEffect(() => {
  AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
  return () => sub.remove();
}, []);
```
- Reanimated: `useReducedMotion()` and `ReduceMotion.System` on animations.
- Large text: read `useWindowDimensions().fontScale` to switch rows to stacked layouts.
- React Navigation: give each screen a `title` and tab items labels; check that focus lands on the new screen.

## Common React Native traps (flagged by `scripts/audit.mjs`)
- `allowFontScaling={false}` (or `Text.defaultProps.allowFontScaling = false`).
- `TouchableOpacity`/`Pressable` wrapping only an `Image` or icon with no `accessibilityLabel`.
- `accessibilityLiveRegion` with no `announceForAccessibility` (silent on iOS).
- Labels that include the role ("Play button") or the value ("Slider with value 40").
- Gesture-only components (`PanResponder`, swipeables) with no accessibility actions.
- Custom modals without `accessibilityViewIsModal` / `importantForAccessibility="no-hide-descendants"`.
- `accessibilityRole="link"` for in-app navigation.
- Reliance on `experimental_accessibilityOrder`.

## Testing
- **VoiceOver doesn't run in the iOS Simulator**: use Xcode's Accessibility Inspector there, and a real device for VoiceOver.
- Android emulators need **TalkBack** installed from the Play Store.
- Run the native tools on the built app: Accessibility Scanner (Android), Accessibility Inspector audit (iOS); Espresso/XCUITest checks if you have native test suites.
- Component tests: React Native Testing Library queries by role and label (`getByRole('button', { name: 'Share' })`) catch missing names.

## Sources
React Native docs 0.88: Accessibility and AccessibilityInfo; Kumar (2025), with corrections.
