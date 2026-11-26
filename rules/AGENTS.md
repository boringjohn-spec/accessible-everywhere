# Accessibility rules (accessible-everywhere)

Condensed rules for AI coding tools (AGENTS.md, Cursor, Copilot, Windsurf, Cline and others). Apply them whenever you design, generate, change or review user interface code for the web, iOS, Android, React Native or Flutter. Full guidance, platform code and test scripts: https://github.com/boringjohn-spec/accessible-everywhere

**The bar:** WCAG 2.2 Level AA (Required), plus platform standards (Apple HIG, Android/Material, Flutter). WCAG applies to native apps too: judge each screen as a page.

## Always
1. **Native controls first.** `<button>`, `<a href>`, `<input>` + `<label>`, SwiftUI `Button`/`Toggle`, Compose `Button`/`Checkbox`, Flutter Material widgets, RN `Pressable` with a role. Never a clickable `div`, `View`, `GestureDetector` or `.onTapGesture` without role, name, focus and keyboard support. Accessibility properties only restore missing meaning; no ARIA is better than bad ARIA.
2. **Name, role, state on every control.** Icon-only controls get a label naming the action ("Search", not "magnifying glass" or "Search button"). The visible label is part of the name, at the start. Toggles expose checked/selected/pressed. Don't add a label to controls that already have visible text.
3. **Contrast:** text 4.5:1, large text (≥ 24px or ≥ 18.66px bold) 3:1, UI parts and meaningful graphics 3:1, in every theme and state. Calculate it; don't guess. Placeholder text isn't exempt.
4. **Never colour alone** for errors, status, required fields, links in text, selected states or chart series.
5. **Text follows the user's size setting** (rem; Dynamic Type text styles; sp; `allowFontScaling` on; Flutter `textScaler` not clamped) and layouts survive 200% and the largest accessibility sizes by wrapping and stacking. Never `user-scalable=no` / `maximum-scale=1`.
6. **Keyboard, switch and voice:** everything reachable and operable without a pointer, in visual order, with a visible focus indicator (`:focus-visible`, never `outline: none` alone) that isn't hidden behind sticky UI. No positive `tabindex`. No traps.
7. **Targets** ≥ 24×24 CSS px (Required); 44×44pt iOS and 48×48dp Android (Platform).
8. **Alternatives** for every drag, swipe, pinch, long press, hover, shake, timer and sound: a button, a tap, a custom accessibility action, visible text, more time.
9. **Structure:** one title per page/screen; real headings by outline (style ≠ level); landmarks on web; reading order = visual order; hidden content hidden from everyone (`hidden`/`inert`), and never `aria-hidden` on focusable things.
10. **Announce changes without moving focus:** web `role="status"` region that exists before it updates; iOS `AccessibilityNotification.Announcement`; Android `liveRegion = Polite`; React Native `announceForAccessibility` (live regions are Android-only); Flutter `SemanticsService.announce`.
11. **Dialogs and sheets:** focus in on open (least destructive button for confirmations), named by their title, background inert, close with Escape / back / visible button, focus back to the trigger.
12. **Forms:** visible labels tied to fields (placeholders aren't labels), `autocomplete` / `textContentType` / `autofillHints`, errors in text next to the field and announced, validate on submit (don't disable submit silently), allow paste and password managers, never ask for the same information twice.
13. **Respect settings:** reduced motion (fades instead of slides, no parallax/autoplay), increased contrast and forced colours, bold text, captions. Nothing flashes more than 3 times a second. Moving content over 5 seconds can be paused.
14. **Images:** decorative → hidden (`alt=""`, `contentDescription = null`, `accessibilityHidden`, `ExcludeSemantics`); informative → meaning in context; functional → the action; charts → short name + the data in text or a table.

## Pattern choices
- Action → button; navigation → link; instant on/off setting → switch; choice to submit → checkbox/radio.
- Short known list → native select/picker; long list with typing → combobox (input keeps focus, `aria-activedescendant`, results announced).
- Peer views → tabs (one Tab stop, arrows inside); independent sections → accordion (button inside heading, `aria-expanded`); one optional block → `<details>`.
- Carousels: avoid; if used, no auto-rotation by default, pause first, named prev/next, "2 of 5", inactive slides `inert`.
- Toasts: never the only place for errors or actions; actions stay until dismissed.
- Tooltips: hover **and** focus, Escape dismisses, never essential information; on touch, show it or put it behind an info button.

## Platform quick reference
- **Web:** semantic HTML; ARIA per the WAI-ARIA Authoring Practices or a tested library (React Aria, Radix, Headless UI); update `document.title` and move focus to the new `<h1>` on SPA route changes; `<dialog>.showModal()`.
- **iOS:** `.accessibilityLabel/Value/Hint`, `.accessibilityAddTraits(.isHeader/.isSelected/.isModal)`, `.accessibilityElement(children: .combine)`, `.accessibilityAction(named:)`, `.accessibilityAdjustableAction`, `@AccessibilityFocusState`, `.accessibilityInputLabels`, `@ScaledMetric`, text styles, `\.accessibilityReduceMotion`.
- **Android (Compose):** `contentDescription` (null if decorative), `semantics { heading(); stateDescription; customActions; liveRegion; paneTitle; error() }`, `mergeDescendants`, `clickable(role = Role.Button, onClickLabel = …)`, `minimumInteractiveComponentSize()`, `sp` text.
- **React Native:** `accessibilityRole`/`role`, `accessibilityLabel`, `accessibilityState`, `accessibilityValue`, `accessibilityActions`; `accessibilityViewIsModal` (iOS) + `importantForAccessibility="no-hide-descendants"` (Android) for custom modals; keep `allowFontScaling`.
- **Flutter:** standard widgets first; `Semantics`, `MergeSemantics`, `ExcludeSemantics`, `BlockSemantics`; `IconButton(tooltip:)`; `Image(semanticLabel:)`; Flutter web: `SemanticsBinding.instance.ensureSemantics()`.

## Before you say "done"
- Run the stack's checks (axe / jsx-a11y; `performAccessibilityAudit`; Compose `enableAccessibilityChecks()` / Espresso `AccessibilityChecks`; Flutter `meetsGuideline`) and, if available, `node scripts/audit.mjs <changed files>` and `node scripts/contrast.mjs` from accessible-everywhere.
- List the manual checks still needed (screen reader, keyboard/switch, largest text, greyscale, reduced motion).
- Report findings with tier (Required / Platform / Recommended), WCAG criterion, who is blocked, and the fix. Never claim something "is WCAG compliant" from automated checks alone; never give legal advice.
