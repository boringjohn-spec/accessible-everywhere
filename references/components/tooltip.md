# Tooltip, popover and info hint

> A tooltip is a short, optional description. It appears on hover **and** keyboard focus, can be dismissed with Escape, stays while the pointer is over it, and is never the only place important information lives. Touch screens have no hover, so on mobile, show the information or put it behind a tap.

## Use it when
- A short name or description for an icon-only control ("Bold", "Share"), or a brief hint.
- **Not** for essential information, long text, links, buttons or form help people need to complete a task. Use visible text, or a **popover / toggletip** opened by an info button, or a dialog.

## Contract
| # | Requirement | Tier | SC |
|---|---|---|---|
| 1 | Appears on keyboard focus as well as hover | Required | 2.1.1, 1.4.13 |
| 2 | **Dismissible** without moving the pointer or focus (Escape) | Required | 1.4.13 |
| 3 | **Hoverable:** the pointer can move onto the tooltip without it disappearing | Required | 1.4.13 |
| 4 | **Persistent:** stays until dismissed, focus/hover leaves, or it's no longer valid (no short timer) | Required | 1.4.13 |
| 5 | Tied to its trigger as a description (`aria-describedby`), or as the name for an icon-only button | Required | 1.3.1, 4.1.2 |
| 6 | Text 4.5:1 | Required | 1.4.3 |
| 7 | Information needed to complete a task is visible or one tap away, not hover-only | Required | 1.3.3, 2.1.1 |
| 8 | Touch: there's a tap way to get the same information | Required | 2.1.1 |

## Web
```html
<!-- Tooltip describing an icon button -->
<button type="button" aria-label="Delete" aria-describedby="tip-del">
  <svg aria-hidden="true" focusable="false">…</svg>
</button>
<div role="tooltip" id="tip-del" hidden>Deletes this item permanently</div>

<!-- Toggletip for longer or important info: a button that shows a popover -->
<button type="button" popovertarget="fee-info" aria-label="About fees">ⓘ</button>
<div id="fee-info" popover>The 2% fee covers card processing.</div>
```
- Show on `mouseenter` **and** `focus`; hide on `mouseleave` (with a short delay so the pointer can move onto it), `blur` and **Escape**.
- Don't use the `title` attribute as your tooltip: no keyboard, no touch, unstyled, inconsistently announced.
- The `popover` attribute gives light-dismiss and Escape for toggletips; CSS anchor positioning helps place them.
- A tooltip must not cover the thing people are trying to read or the focused element (2.4.11).

## iOS
- There's no hover on iPhone. Put essential information in visible text or behind an info button that opens a popover/sheet.
- Icon-only controls get `accessibilityLabel`; extra explanation can go in `accessibilityHint` (read after a pause if hints are on).
- `.help("…")` shows a tooltip with a pointer (iPad trackpad, Mac) and is exposed to accessibility.

## Android
- Long-press on an icon button shows its tooltip: Compose `TooltipBox` with `PlainTooltip`; Views `TooltipCompat.setTooltipText()` (also shows on mouse hover and keyboard focus).
- The icon's `contentDescription` remains the accessible name.
- Rich tooltips with actions: `RichTooltip` must stay until dismissed and be reachable by TalkBack; prefer a dialog or sheet for anything interactive.

## React Native
- No built-in tooltip. Use visible helper text or an info button that opens a small `Modal` or popover with a close button. Label the info button ("About fees").

## Flutter
```dart
IconButton(icon: const Icon(Icons.delete), tooltip: 'Delete', onPressed: remove);
Tooltip(message: 'Deletes this item permanently', child: …);
```
- `Tooltip` shows on long-press (touch) and hover (pointer) and adds its message to semantics. From Flutter 3.50, Escape dismisses visible tooltips on web.
- Don't put essential text only in a tooltip.

## Common mistakes
- Hover-only tooltips (no focus, no touch).
- Tooltips that vanish when you try to move the mouse onto them, or after 2 seconds.
- Important instructions or form rules hidden in tooltips.
- Interactive content (links, buttons) inside a tooltip.
- `title` attribute as the only label for an icon button.

## Test it
- Keyboard: Tab to the trigger, tooltip appears; Escape hides it while focus stays.
- Mouse: move from trigger onto tooltip; it stays.
- Touch: the same information is reachable.
- Screen reader: the trigger's name and description are read.
- Automated: none reliable; test by hand.

## Sources
Allan, *Accessibility by Default: Sliders and Tooltips* (2026); WCAG 2.2 (1.4.13 and Understanding); Hausler (2015, hover-only content); Android tooltip APIs; Apple HIG; Flutter docs (Escape dismissal on web, 3.50+).
