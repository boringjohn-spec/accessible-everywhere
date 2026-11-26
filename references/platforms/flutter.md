# Flutter (iOS, Android, web, desktop)

Flutter draws its own widgets and builds a **semantics tree** that it hands to each platform's accessibility API (and, on the web, turns into an accessible DOM). Standard Material and Cupertino widgets produce good semantics; custom widgets need `Semantics`.

## Assistive technology to test with
- Mobile: **TalkBack**, **VoiceOver**, Switch Access / Switch Control, Voice Access / Voice Control, AssistiveTouch, Android Accessibility Menu.
- Web: VoiceOver (iOS, macOS), TalkBack (Android), NVDA and JAWS (Windows).
- Desktop: Narrator / NVDA (Windows), VoiceOver (macOS), Orca (Linux).

## Flutter's own release checklist (official)
Every button does something; screen readers describe every control intelligibly; contrast ≥ 4.5:1 (disabled excepted); no automatic context change while typing; tap targets ≥ 48×48; important actions can be undone and errors suggest fixes; usable in colour-blind and greyscale modes; usable at very large text and display scales.

## Semantics cheat sheet
| Need | API |
|---|---|
| Name / hint / value | `Semantics(label:, hint:, value:)`; `Tooltip(message:)` and `IconButton(tooltip:)` also provide labels |
| Role and state | `Semantics(button: true, header: true, link: true, image: true, textField: true, checked:, toggled:, selected:, enabled:, focused:)`; `SemanticsRole` (list, listItem, slider, …) mainly for web |
| Group | `MergeSemantics` |
| Hide decoration | `ExcludeSemantics`; `Semantics(excludeSemantics: true)` |
| Block what's behind a modal | `BlockSemantics` (routes and dialogs do this for you) |
| Screen / route name | `Semantics(scopesRoute: true, namesRoute: true, label: 'Filters')` |
| Order | `Semantics(sortKey: OrdinalSortKey(1))` within a `FocusTraversalGroup` |
| Live updates | `Semantics(liveRegion: true)`; `SemanticsService.announce(msg, TextDirection.ltr)` |
| Custom actions | `Semantics(customSemanticsActions: { CustomSemanticsAction(label: 'Archive'): archive })` |
| Adjustable | `Semantics(onIncrease:, onDecrease:, increasedValue:, decreasedValue:)` |
| List position | `IndexedSemantics` (lists do this) |
| Speech language | `TextSpan.locale`; from 3.38 `MaterialApp.locale` / `Localizations.override` affect voices |
| Platform settings | `MediaQuery.textScalerOf`, `MediaQuery.boldTextOf`, `MediaQuery.highContrastOf`, `MediaQuery.disableAnimationsOf`, `MediaQuery.accessibleNavigationOf`, `PlatformDispatcher.instance.accessibilityFeatures` |
| Keyboard focus | `Focus`, `FocusNode`, `FocusTraversalGroup`, `FocusableActionDetector`, `Shortcuts` + `Actions` |

## Text scaling
Flutter text follows the OS font size automatically. Your job is room:
- Don't wrap the app in `MediaQuery(data: …copyWith(textScaler: TextScaler.noScaling))` or clamp to 1.0. If a specific widget truly can't grow, clamp with `textScaler.clamp(maxScaleFactor: 2.0)` locally and test.
- Test on a small phone at the largest font setting: rows wrap or stack, nothing overflows (yellow-black overflow stripes are failures).

## Flutter web: turn semantics on
Flutter web **doesn't build the accessible DOM until a user activates a hidden "Enable accessibility" button**. Most screen reader users won't find it. Turn it on:
```dart
import 'package:flutter/foundation.dart';
import 'package:flutter/semantics.dart';

void main() {
  runApp(const MyApp());
  if (kIsWeb) SemanticsBinding.instance.ensureSemantics();
}
```
From Flutter 3.50: real `<input type="range">` sliders, route landmarks (`role="region"`), focus restored when dialogs close, Escape dismisses tooltips, pinch-zoom up to 500% by default, and 16px inputs on iOS Safari. Debug with `--dart-define=FLUTTER_WEB_DEBUG_SHOW_SEMANTICS=true`.

## Common Flutter traps (flagged by `scripts/audit.mjs`)
- Flutter web without `ensureSemantics()`.
- `GestureDetector` / `InkWell` on a container with no `Semantics(button: true, label: …)`.
- `textScaler: TextScaler.noScaling` / `textScaleFactor: 1.0` overrides.
- `Icon` buttons without `tooltip` or label; `Image` without `semanticLabel` (or `excludeFromSemantics: true` when decorative).
- `MaterialTapTargetSize.shrinkWrap` on touch layouts.
- Fixed-height containers around text.
- Custom overlays (`Stack` + `Positioned`) without `BlockSemantics`.

## Testing (official)
```dart
testWidgets('meets accessibility guidelines', (tester) async {
  final handle = tester.ensureSemantics();
  await tester.pumpWidget(const MyApp());
  await expectLater(tester, meetsGuideline(androidTapTargetGuideline)); // 48×48
  await expectLater(tester, meetsGuideline(iOSTapTargetGuideline));     // 44×44
  await expectLater(tester, meetsGuideline(labeledTapTargetGuideline)); // tappables have labels
  await expectLater(tester, meetsGuideline(textContrastGuideline));     // text contrast
  handle.dispose();
});
```
Plus: Accessibility Scanner (Android), Xcode Accessibility Inspector audit (iOS), Chrome DevTools accessibility tree (web), and real TalkBack/VoiceOver passes.

Note: Flutter's docs say "W3C recommends 44×44 CSS px"; that's AAA 2.5.5. The AA requirement is 24×24 (2.5.8). Flutter's 48/44 matchers are the stricter platform targets.

## Sources
Flutter docs (Accessibility, UI design and styling, Assistive technologies, Accessibility testing, Web accessibility), read from the flutter/website repository; Semantics API details from the Flutter API (marked as unverified where the reference couldn't be reached during research).
