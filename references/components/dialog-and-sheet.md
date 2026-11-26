# Dialog, alert dialog and sheet

> When it opens, focus goes in and the screen reader says what it is; while it's open, nothing behind it can be reached; it closes with Escape or a visible button; when it closes, focus goes back to where it came from.

## Use it when
| Type | For | Example |
|---|---|---|
| **Dialog (modal)** | A focused task or extra detail the user asked for, without leaving the screen | Edit details, view a record, filters |
| **Alert dialog** | Something urgent that needs a decision before continuing | "Delete project?", payment failed, session expiring |
| **Non-modal dialog / popover** | Extra controls while the page stays usable | Find-and-replace panel, colour picker |
| **Sheet / bottom sheet** | The mobile form of a dialog; modal unless it's a persistent panel | Share sheet, filters, quick actions |

Don't use alert dialogs for routine messages: they interrupt by design. Don't remove dialogs just because they "aren't accessible"; build them properly.

## Contract (the six behaviours)
| # | Requirement | Tier | SC |
|---|---|---|---|
| 1 | **Open:** focus moves inside. Form → first field. Information → the title or first content. Destructive confirmation → the **least destructive** button (Cancel) | Required | 2.4.3 |
| 2 | **Name:** announced with its title ("Delete project, dialog"); description tied where it explains consequences | Required | 4.1.2, 1.3.1 |
| 3 | **Contain:** while a modal is open, focus, swipes and taps can't reach anything behind it | Required | 2.4.3, 1.3.1 |
| 4 | **Close:** a visible close/cancel button, **Escape** (web, keyboard), the platform's back/escape gesture (Android back, VoiceOver two-finger scrub) | Required | 2.1.1, 2.1.2 |
| 5 | **Return:** focus goes back to the control that opened it | Required | 2.4.3 |
| 6 | **Fit:** works at 400% zoom / 320px wide and at the largest text size (scrolls inside; nothing cut off); not obscured by the keyboard | Required | 1.4.10, 1.4.4 |
| 7 | Backdrop tap closes only when nothing can be lost (not on forms with input) | Recommended | — |

## Web
```html
<button type="button" id="open-delete">Delete project</button>

<dialog id="delete" aria-labelledby="delete-title" aria-describedby="delete-desc">
  <h2 id="delete-title">Delete "Website redesign"?</h2>
  <p id="delete-desc">This deletes 24 files. You can't undo this.</p>
  <button type="button" value="cancel" autofocus>Cancel</button>
  <button type="button" value="delete">Delete project</button>
</dialog>

<script>
  const dlg = document.getElementById('delete');
  document.getElementById('open-delete').addEventListener('click', () => dlg.showModal());
  dlg.addEventListener('click', e => { if (e.target.matches('button')) dlg.close(e.target.value); });
</script>
```
- `<dialog>` + `showModal()` gives you: the rest of the page **inert**, **Escape** to close, top-layer rendering, and focus returned on close in current browsers.
- Use `role="alertdialog"` (on a custom dialog) for urgent confirmations, with `aria-describedby` on the message.
- Custom dialogs (when you can't use `<dialog>`): `role="dialog"` + `aria-modal="true"` + `aria-labelledby`, put **`inert`** on everything else (not just `aria-hidden`, which still lets keyboard focus in), trap Tab, handle Escape, restore focus. Prefer a tested library (React Aria, Radix, Headless UI) to hand-rolled traps.
- Lock page scroll behind the dialog; let the dialog scroll.

## iOS
- System presentations (`.sheet`, `.alert`, `.confirmationDialog`, `.fullScreenCover`, `UIAlertController`) handle focus, containment and escape for you. Use them.
- Custom overlays:
```swift
CustomSheet()
  .accessibilityAddTraits(.isModal)          // VoiceOver ignores what's behind
  .accessibilityAction(.escape) { dismiss() } // two-finger scrub closes it
  .accessibilityFocused($titleFocused)        // move VoiceOver focus in on appear
```
- UIKit: `view.accessibilityViewIsModal = true`; override `accessibilityPerformEscape()`; `UIAccessibility.post(notification: .screenChanged, argument: titleLabel)` on open, `.layoutChanged` with the trigger on close.

## Android
- `AlertDialog`, `Dialog`, `ModalBottomSheet` (Compose) and `DialogFragment` / `BottomSheetDialogFragment` (Views) contain TalkBack focus and handle back.
- Custom panes: `Modifier.semantics { paneTitle = "Filters" }` so TalkBack announces it; `BackHandler { close() }`; hide the content behind from accessibility while open.
- Return focus: keep a `FocusRequester` on the trigger and request it on close (keyboard); TalkBack usually returns on its own for system dialogs.

## React Native
- The core `<Modal>` opens a separate native window, so screen readers stay inside it. Give it a visible title and a close button; `onRequestClose` handles Android back.
- Custom overlays (an absolutely positioned `View`):
```tsx
<View accessibilityViewIsModal /* iOS */ onAccessibilityEscape={close}>
  <Text accessibilityRole="header">Filters</Text>
  …
</View>
// and on the content behind it (Android):
<View importantForAccessibility={open ? 'no-hide-descendants' : 'auto'}>…</View>
```
- Move focus in with `AccessibilityInfo.sendAccessibilityEvent(titleRef, 'focus')` and back to the trigger on close.

## Flutter
- `showDialog`, `showModalBottomSheet`, `showCupertinoModalPopup` push a route with a modal barrier: semantics behind are blocked and back/escape closes it. Give the dialog a title (`AlertDialog(title: …)`).
- Custom overlays: wrap the overlay in `BlockSemantics` (or use a route), give it `Semantics(scopesRoute: true, namesRoute: true, label: 'Filters')`, handle back with `PopScope`, and restore focus with the trigger's `FocusNode`.

## Common mistakes
- Focus stays on the page behind; screen reader can swipe to content under the overlay.
- `aria-hidden` on the background without `inert`, so Tab still reaches it.
- No way to close with the keyboard or the back gesture.
- Focus lands on the destructive button by default.
- Focus lost to the top of the page after closing.
- Dialog taller than the screen at large text with no scrolling.

## Test it
- Keyboard: open, Tab cycles inside only, Escape closes, focus returns to the trigger.
- VoiceOver/TalkBack: on open the title is read; swiping never leaves the dialog; two-finger scrub (iOS) or back (Android) closes it.
- Largest text size and 400% zoom: everything reachable by scrolling inside the dialog.
- Automated: axe `aria-dialog-name`; Compose/Espresso checks on the open dialog.

## Sources
Allan, *Accessibility by Default: Dialogs* (2026) and *Foundational Principles* (2026); Hausler (2015, menu vs non-modal dialog); Apple SwiftUI modifiers (`isModal`, escape action, focus state); Android Compose (`paneTitle`); React Native docs (`accessibilityViewIsModal`, `onAccessibilityEscape`, `importantForAccessibility`); Flutter docs; WCAG 2.2.
