# iOS and iPadOS (SwiftUI and UIKit)

## Assistive technology and settings to support
| Feature | What it does | How your app responds |
|---|---|---|
| **VoiceOver** | Screen reader; swipe to move, double-tap to activate, rotor for headings/links/actions | Labels, traits, values, grouping, order, announcements, rotor support |
| **Voice Control** | Operate by speech ("Tap Save", "Show names", "Show numbers") | Visible labels match accessible names; `accessibilityInputLabels` for alternatives |
| **Switch Control** | Scan and select with one or more switches | Everything reachable as an element; actions as custom actions |
| **Full Keyboard Access** | Hardware keyboard navigation with a focus ring | Focusable custom controls; don't override system shortcuts |
| **AssistiveTouch / Pointer Control** | On-screen menu, head or hand pointer | Large targets; gesture alternatives |
| **Dynamic Type** (incl. Larger Accessibility Sizes) | Text from xSmall to AX5 (body 14 → 53pt) | System text styles or scaled custom fonts; layouts that wrap and stack |
| **Bold Text** | Heavier system text | System fonts adapt; custom fonts must too (`\.legibilityWeight`) |
| **Increase Contrast** | Higher-contrast colours | Asset colours with High Contrast variants; `\.colorSchemeContrast == .increased` |
| **Reduce Motion / Prefer Cross-Fade** | Less movement | `\.accessibilityReduceMotion`; fades instead of slides |
| **Reduce Transparency** | Solid backgrounds | `\.accessibilityReduceTransparency` |
| **Differentiate Without Color** | Shapes/text in addition to colour | `\.accessibilityDifferentiateWithoutColor` |
| **Smart Invert** | Inverts UI but not media | `accessibilityIgnoresInvertColors` on photos and video |
| **Button Shapes, On/Off Labels** | Visual control affordances | Use system controls so they apply |
| **Captions, Audio Descriptions** | Media preferences | `AVPlayer` picks preferred tracks |
| **Dim Flashing Lights, Auto-Play Video Previews off** | Video safety | Use `AVPlayer`; check `isVideoAutoplayEnabled` |
| **Assistive Access** | Simplified mode | Core features only, one interaction per screen, double confirmation for destructive actions |

## Numbers (Apple HIG)
- Controls **44×44pt** default (28×28pt minimum); padding ~12pt around bezelled controls, ~24pt around unbezelled.
- Text: 17pt default body, 11pt minimum; support enlarging text **at least 200%**.
- Contrast: Apple uses WCAG AA values (4.5:1 up to 17pt, 3:1 at 18pt+). Apple counts any bold as large; use WCAG's 14pt-bold rule.

## SwiftUI cheat sheet
| Need | API |
|---|---|
| Name / value / hint | `.accessibilityLabel`, `.accessibilityValue`, `.accessibilityHint` (rarely) |
| Voice Control names | `.accessibilityInputLabels(["Search", "Find"])` |
| Role and state | `.accessibilityAddTraits(.isButton / .isHeader / .isSelected / .isLink / .isToggle / .isModal)`, `.accessibilityRemoveTraits` |
| Heading level | `.accessibilityHeading(.h2)` |
| Hide decoration | `.accessibilityHidden(true)`; `Image(decorative:)` |
| Group / combine | `.accessibilityElement(children: .combine / .contain / .ignore)` |
| Replace a custom control's semantics | `.accessibilityRepresentation { Toggle(…) }` |
| Order | `.accessibilitySortPriority(_:)` (higher first, within a container) |
| Actions | `.accessibilityAction(named: "Archive") { }`, `.accessibilityAction(.escape) { }`, `.accessibilityAction(.magicTap) { }` |
| Adjustable | `.accessibilityAdjustableAction { direction in }` |
| Focus | `@AccessibilityFocusState` + `.accessibilityFocused(_:)`; `@FocusState` for input focus |
| Announcements | `AccessibilityNotification.Announcement("Saved").post()` (iOS 17+) |
| Rotor | `.accessibilityRotor("Unread") { … }` |
| Charts | `.accessibilityChartDescriptor(_:)` (Audio Graphs); Swift Charts adds much automatically |
| Large Content Viewer | `.accessibilityShowsLargeContentViewer()` for bars that can't grow |
| Scaled sizes | `@ScaledMetric var iconSize: CGFloat = 24`; `Font.custom("Brand", size: 17, relativeTo: .body)` |
| Layout at large sizes | `@Environment(\.dynamicTypeSize)` + `.isAccessibilitySize`; `ViewThatFits`; `AnyLayout` switching HStack → VStack |
| Settings | `\.accessibilityReduceMotion`, `\.accessibilityReduceTransparency`, `\.accessibilityDifferentiateWithoutColor`, `\.colorSchemeContrast`, `\.legibilityWeight`, `\.accessibilityVoiceOverEnabled` |
| Tests only | `.accessibilityIdentifier("…")` (not read aloud) |

## UIKit cheat sheet
`isAccessibilityElement`, `accessibilityLabel`, `accessibilityValue`, `accessibilityHint`, `accessibilityTraits`, `accessibilityElements` (order), `shouldGroupAccessibilityChildren`, `accessibilityViewIsModal`, `accessibilityPerformEscape()`, `accessibilityCustomActions`, `accessibilityIncrement()/Decrement()`, `UIAccessibility.post(notification: .announcement / .layoutChanged / .screenChanged, argument:)`, `UIFontMetrics(forTextStyle:).scaledFont(for:)` + `adjustsFontForContentSizeCategory = true`, `UIAccessibility.isReduceMotionEnabled` (+ notifications), `accessibilityRespondsToUserInteraction`, `UILargeContentViewerInteraction`.

## Common iOS traps
- `.onTapGesture` on a `Text`/`Image`/`HStack` instead of a `Button`: no button trait, no Full Keyboard Access focus. Use `Button` (style it however you like).
- Images in buttons labelled with the SF Symbol name ("square.and.arrow.up") instead of the action ("Share").
- Fixed font sizes: `.font(.system(size: 14))`; `UIFont.systemFont(ofSize:)` without `UIFontMetrics`.
- `lineLimit(1)` on important text that then truncates at large sizes.
- Custom overlays without `.isModal`: VoiceOver swipes behind them.
- Custom gesture recognisers (swipe, long press) with no accessibility action.
- Hint text used as the label; labels that include the role ("Play button").

## Testing
- **VoiceOver on a real device** (not available in the Simulator). Triple-click side button shortcut.
- **Accessibility Inspector** (Xcode → Open Developer Tool): inspect elements, **Run Audit** (contrast, hit areas, labels, Dynamic Type clipping); works with the Simulator.
- **XCUITest:** `try app.performAccessibilityAudit()` (Xcode 15+, iOS 17+) in UI tests; filter issue types or handle known issues in the closure.
- Environment overrides in Xcode previews and the Simulator (Dynamic Type, Increase Contrast, Reduce Motion).
- App Store **Accessibility Nutrition Labels**: only declare features you've tested end to end.

## Sources
Apple Human Interface Guidelines: Accessibility (June 2025), VoiceOver (Mar 2025), Typography (Dynamic Type); SwiftUI Accessibility modifiers API; React Native docs (VoiceOver not in Simulator).
