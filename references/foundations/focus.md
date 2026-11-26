# Focus

Focus is where keyboard, switch and screen reader users are. If they can't see it, can't move it in a sensible order, or lose it when the screen changes, they can't use the product. On mobile there are two kinds:
- **Input focus**: the keyboard / switch / Full Keyboard Access cursor (and the text-input focus).
- **Accessibility focus**: where VoiceOver or TalkBack is (the cursor that moves when you swipe).
They often move together, but not always. Manage both.

## Visible focus (Required: 2.4.7, 1.4.11, 2.4.11)

- Every interactive element shows a clear focus indicator when reached by keyboard or switch.
- Never remove the outline without a replacement that is at least as visible. `outline: none` with nothing else is a failure.
- The indicator reaches **3:1** against the colours next to it (1.4.11).
- The focused element is **never completely covered** by your sticky header, footer, cookie bar, chat button or bottom sheet (2.4.11).
- **Recommended (AAA 2.4.13):** an indicator at least as big as a 2px outline around the control, with at least 3:1 change between focused and unfocused states.

### Focus-ring token (web)
```css
:root {
  --focus-ring-color: #0b57d0;  /* check 3:1 against every surface it can appear on */
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;
}
:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
/* On busy or coloured surfaces, a two-tone ring survives any background: */
.on-image :focus-visible { outline: 2px solid #fff; box-shadow: 0 0 0 4px #000; }
/* Keep the outline in forced-colors mode; box-shadow is removed there. */
@media (forced-colors: active) { :focus-visible { outline: 2px solid CanvasText; } }
/* Sticky header: keep focused elements from scrolling under it (2.4.11) */
html { scroll-padding-top: var(--sticky-header-height, 4rem); }
```
- Use `:focus-visible`, not `:focus`, so mouse clicks don't show rings but keyboard does (supported in all current browsers).
- Hover and focus should share the same "you are here" visual where possible.
- Tailwind and similar: check that a component's `shadow-*` or `ring-*` doesn't override the focus ring.

### Native
- **iOS:** the system draws the focus ring for Full Keyboard Access; custom controls must be focusable (`.focusable()`, `accessibilityRespondsToUserInteraction`) and you shouldn't hide the ring. `@FocusState` controls input focus; `@AccessibilityFocusState` + `.accessibilityFocused()` controls VoiceOver focus.
- **Android:** keyboard and D-pad focus need a visible focused state on custom components (Compose `Indication`, `onFocusChanged` to restyle; Views `state_focused` drawable). Compose `FocusRequester` moves input focus.
- **React Native:** Android keyboard focus works on `focusable` views; style focus via `onFocus`/`onBlur` state. `AccessibilityInfo.sendAccessibilityEvent(ref, 'focus')` moves screen reader focus (`setAccessibilityFocus` is deprecated).
- **Flutter:** `Focus`, `FocusNode`, `FocusTraversalGroup`; Material widgets show focus highlights; custom widgets use `FocusableActionDetector` to get focus, hover and shortcuts together.

## Focus order (Required: 2.4.3, 1.3.2)

- Order follows the visual reading order (top to bottom, start to end; reversed in RTL).
- **Fix order in the source, not with overrides.** Web: DOM order matches visual order; don't reorder with CSS `order`, `flex-direction: *-reverse`, grid placement or absolute positioning in ways that change meaning. Never use positive `tabindex`.
- Native overrides exist (`accessibilitySortPriority`, `traversalIndex` + `isTraversalGroup`, `accessibilityTraversalBefore/After`, `nextFocus*`, `OrdinalSortKey`). Use them only to fix a real mismatch, and test after.
- **Group related things** so they're read together (an image with its caption, a card's title with its price): SwiftUI `.accessibilityElement(children: .combine)`, Compose `mergeDescendants`, React Native `accessible`, Flutter `MergeSemantics`.
- Composite widgets (tabs, menus, grids, toolbars, radio groups) are **one Tab stop**; arrow keys move inside (roving `tabindex` or `aria-activedescendant` on web).

## Moving focus when things change (Required: 2.4.3, 3.2.1, 4.1.3)

| Event | Where focus goes |
|---|---|
| Dialog, sheet or menu opens | Into it: the first field (forms), the title or first content (information), or the **least destructive action** (confirmations) |
| Dialog closes | Back to the control that opened it |
| Client-side route change (SPA) | The new page's `<h1>` (with `tabindex="-1"`) or main region, and `document.title` updated |
| Native screen push | The system moves VoiceOver/TalkBack to the new screen; announce the screen title (`UIAccessibility.post(.screenChanged, …)`, `paneTitle`) for custom transitions |
| Item deleted from a list | The next item, or the list heading if it was the last |
| Form submitted with errors | The error summary or the first invalid field |
| Content loaded in place (infinite scroll, "load more") | Stay where you are; announce "20 more results loaded" |
| Toast or status message | **Don't move focus**; announce it (4.1.3) |

Never move focus just because something got focus or a value changed (3.2.1, 3.2.2). Never steal focus on a timer.

## Keyboard traps (Required: 2.1.2)

Focus must always be able to leave a component with standard keys (Tab, Shift+Tab, Escape, arrows). Modal dialogs deliberately contain focus, but Escape (or a close button) always gets out. Embedded maps, editors, iframes and video players are common traps.

## Sources
WCAG 2.2 (1.3.2, 1.4.11, 2.1.2, 2.4.3, 2.4.7, 2.4.11, 2.4.13, 3.2.1, 4.1.3); Matuzović (2017); Hausler (2015); Allan (2026, foundations, dialogs); Apple SwiftUI accessibility modifiers; Android Compose traversal; React Native AccessibilityInfo; Flutter docs.
