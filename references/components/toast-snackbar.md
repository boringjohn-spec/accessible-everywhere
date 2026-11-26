# Toast, snackbar and inline status

> Short status messages are announced without stealing focus, stay long enough to read and act on, are never the only place important information or an action lives, and don't cover what people are working on.

## Use it when
- Brief confirmation of something the user just did: "Saved", "Added to cart", "Message sent", "Copied".
- **Not** for errors people must fix (show them next to the field or as a persistent banner), not for critical warnings (use an alert dialog or a banner), not for anything people need to read later.

## Contract
| # | Requirement | Tier | SC |
|---|---|---|---|
| 1 | Announced to screen readers **without moving focus** | Required | 4.1.3 |
| 2 | If it has an action (Undo, Retry, View), it stays until dismissed, or the same action is available elsewhere, and it's reachable by keyboard, switch and screen reader | Required | 2.2.1, 2.1.1 |
| 3 | Auto-dismiss timing long enough to read (Android: honour the user's recommended timeout); paused on hover/focus | Required | 2.2.1 |
| 4 | Doesn't cover the focused element or key controls (FABs, bottom nav, text fields with the keyboard up) | Required | 2.4.11 |
| 5 | Text 4.5:1 on its background; not colour-only for success/error | Required | 1.4.3, 1.4.1 |
| 6 | Not a stack of many toasts; one at a time, or a notification area | Recommended | (cognitive) |
| 7 | Prefer inline status next to the thing that changed for anything important | Recommended | — |

## Web
```html
<!-- Render this container once, empty, at page load -->
<div id="toast-region" role="status" aria-live="polite" class="toasts"></div>

<script>
  function toast(msg) {
    const r = document.getElementById('toast-region');
    r.textContent = '';                 // reset so the same message is re-announced
    setTimeout(() => { r.textContent = msg; }, 50);
  }
</script>
```
- The live region must **exist before** the text changes; injecting a new `role="status"` element with text often isn't announced.
- `role="alert"` only for urgent errors, not "Saved".
- Toasts with buttons: don't auto-hide them (or make the timeout long and pause on hover/focus), and give a keyboard way to reach the newest one (a shortcut like F6 or a "notifications" landmark). Never move focus to a toast automatically.

## iOS
- There's no system toast. For a transient confirmation, post an announcement: `AccessibilityNotification.Announcement("Saved").post()` (iOS 17+) or `UIAccessibility.post(notification: .announcement, argument: "Saved")`.
- If you show a visual banner with Undo, keep it until dismissed while VoiceOver is running (`UIAccessibility.isVoiceOverRunning` / `\.accessibilityVoiceOverEnabled`), or make Undo available elsewhere (shake-to-undo isn't enough: it's a motion gesture).

## Android
- Material `Snackbar` / Compose `SnackbarHost` is announced by TalkBack. Use `SnackbarDuration.Indefinite` (or Long) when it has an action, and don't rely on it for errors.
- Compute durations with `AccessibilityManager.getRecommendedTimeoutMillis(originalMs, FLAG_CONTENT_TEXT or FLAG_CONTENT_CONTROLS)`.
- Old-style `Toast` can't hold actions and disappears fast; use it only for trivial confirmations.

## React Native
```tsx
AccessibilityInfo.announceForAccessibility('Added to cart');
const ms = Platform.OS === 'android'
  ? await AccessibilityInfo.getRecommendedTimeoutMillis(4000)
  : 4000;
```
- A visual toast component should also call `announceForAccessibility` (an Android-only live region isn't enough for iOS).
- With an action: keep it until dismissed when `isScreenReaderEnabled()` is true.

## Flutter
```dart
ScaffoldMessenger.of(context).showSnackBar(
  SnackBar(content: const Text('Message archived'), action: SnackBarAction(label: 'Undo', onPressed: undo),
    duration: const Duration(seconds: 10)),
);
```
- `SnackBar` content is announced; recent Flutter versions keep snackbars with actions visible while accessible navigation is on (check yours). For messages without a visual, use `SemanticsService.announce`.

## Common mistakes
- Error messages only in a toast that disappears.
- Undo inside a 3-second toast that screen reader and switch users can't reach in time.
- Moving focus to the toast.
- A new live region inserted each time (silent).
- Toasts covering the bottom navigation or the field being typed in.

## Test it
- Screen reader: trigger the action; the message is read and focus stays put.
- Reach the toast's action with keyboard, switch and screen reader before it disappears.
- Largest text: toast text wraps; doesn't cover key controls.

## Sources
WCAG 2.2 (4.1.3 status messages, 2.2.1 timing, 2.4.11); Apple HIG (avoid time-boxed UI, announcements); Android (Snackbar, recommended timeout); React Native AccessibilityInfo; Flutter docs; Kumar (2025, live regions, corrected).
