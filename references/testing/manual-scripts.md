# Manual test scripts

Automation finds about half the problems at best. These short scripts find most of the rest. Run them on the **main flows** (sign up, log in, search, the core task, checkout/submit, settings) and on every new component. Budget about 10 minutes per flow per tool.

## 1. Keyboard only (web, tablets and desktop; also iOS Full Keyboard Access and Android with a keyboard)
1. Put the mouse away. Start at the top (address bar on web) and press **Tab** repeatedly.
2. Every interactive element is reached, **in visual reading order**, and nothing invisible gets focus.
3. A **visible focus indicator** is always on screen, never hidden behind sticky headers, cookie bars or chat buttons.
4. **Enter** activates links and buttons; **Space** activates buttons, checkboxes and switches; **arrows** move inside radio groups, tabs, menus, sliders and listboxes; **Escape** closes dialogs, menus and tooltips.
5. Open each dialog/menu: focus goes in, stays in, and returns to the trigger when it closes.
6. No traps: you can always Tab or Escape out.
7. A skip link appears on first Tab where navigation is long.
8. Submit forms with errors: focus goes to the summary or first error.

**iOS:** Settings → Accessibility → Keyboards → Full Keyboard Access. Tab moves; Space activates; Escape (or Cmd+.) goes back.
**Android:** connect a keyboard; Tab and arrows move; Enter activates.

## 2. Screen reader: VoiceOver (iOS)
Turn on: Settings → Accessibility → VoiceOver, or triple-click the side button (set it in Accessibility Shortcut). **Real device; it's not in the Simulator.**

| Gesture | Does |
|---|---|
| Swipe right / left | Next / previous element |
| Double-tap | Activate |
| Two-finger swipe up | Read everything from the top |
| Rotor (twist two fingers) then swipe up/down | Move by headings, links, form controls, actions |
| Swipe up/down on an adjustable element | Change its value |
| Two-finger scrub (Z shape) | Back / close |
| Three-finger swipe | Scroll |

Check on every screen:
1. On arrival, the **screen title** is read.
2. Swipe through everything: each element has a **sensible name**, the right **role** ("button", "heading", "link", "tab, 2 of 3"), and **state** ("selected", "dimmed", "expanded", "checked"). No "button" without a name, no file names, no "image".
3. Reading order matches the visual order; cards read as one item where they should.
4. Rotor → Headings: the headings outline the screen.
5. Rows with swipe actions: swipe up/down on the row lists **actions**.
6. Trigger saves, errors, loading: the change is **announced**, focus doesn't jump.
7. Open sheets/dialogs: you can't swipe to content behind them; two-finger scrub closes them.
8. Custom gestures (swipe cards, drag) have an alternative.

## 3. Screen reader: TalkBack (Android)
Turn on: Settings → Accessibility → TalkBack, or hold both volume keys (shortcut). Emulators need TalkBack from the Play Store.

| Gesture | Does |
|---|---|
| Swipe right / left | Next / previous |
| Double-tap | Activate |
| Swipe up then down (or three-finger tap, depending on version) | Reading controls (headings, links, controls) |
| Three-finger tap / swipe-down-then-right | TalkBack menu; **Actions** for custom actions |
| Two-finger swipe | Scroll |
| Back gesture / swipe down-then-left | Back |

Check the same list as VoiceOver, plus: text buttons are read with their **visible text** (not a replaced description); live updates aren't read repeatedly; the 48dp targets are easy to hit.

## 4. Screen reader: web
- **Windows:** NVDA (free) with Chrome or Firefox. Insert+F7 lists links, headings and landmarks; H/Shift+H jumps headings; Tab through forms; arrows read everything.
- **macOS:** VoiceOver (Cmd+F5) with Safari. VO+U opens the rotor (headings, links, landmarks, form controls).
- **Mobile web:** VoiceOver with Safari, TalkBack with Chrome.
Check: page title, one `h1` and a sensible outline, landmarks, every link makes sense in the links list, form fields read their labels, hints, required and errors, dialogs contain focus, status messages are read.

## 5. Voice control
- **iOS Voice Control:** "Show names" / "Show numbers"; say "Tap Continue". **Android Voice Access:** say the visible label or the number. **Desktop:** Dragon or macOS/Windows Voice Access.
- Every control can be activated by **saying its visible label**. Icon-only controls have names people can guess (or show numbers).

## 6. Switch access
- **iOS Switch Control** (use a Bluetooth keyboard key or screen tap as a switch) or **Android Switch Access**.
- Scan through a screen: every control is reachable; swipe-only and drag-only actions have alternatives; nothing times out before you can reach it.

## 7. Text size and zoom
- **iOS:** Settings → Accessibility → Display & Text Size → Larger Text → largest (AX5). **Android:** Font size and Display size to max. **Web:** browser zoom 200% and 400% (at 1280px width), and browser default font size "Very large".
- Nothing clipped, overlapping or truncated that matters; rows stack; screens scroll; buttons grow; no horizontal scrolling for text on web at 320px.
- Web: run a text-spacing bookmarklet (line height 1.5, letter spacing 0.12em, word spacing 0.16em, paragraph spacing 2em); nothing breaks.

## 8. Colour and contrast
- Greyscale (iOS: Display & Text Size → Color Filters → Grayscale; Android: Color correction / Grayscale in Digital Wellbeing or developer options; web: DevTools Rendering → emulate vision deficiencies): every state still distinguishable.
- Check text over images at the worst point.
- Increase Contrast / high-contrast text / forced colours: nothing disappears.
- Dark mode: every pair re-checked.

## 9. Motion and time
- Reduce Motion (iOS), Remove animations (Android), `prefers-reduced-motion` (emulate in DevTools): no large movement, nothing lost.
- Auto-advancing content can be paused; toasts with actions can be reached; session timeouts warn and extend.

## 10. Orientation and input
- Rotate the device on every screen (unless orientation is essential).
- Use a mouse or trackpad on iPad/Android: hover content is dismissible and hoverable.
- Paste into password and code fields; use a password manager.

## Recording results
Use [templates/test-plan.md](../../templates/test-plan.md) to plan and [templates/review-report.md](../../templates/review-report.md) to report: tool and version, device and OS, what passed, what failed (tier, criterion, steps to reproduce), and what wasn't tested.

## Sources
Apple HIG (VoiceOver, Full Keyboard Access, Voice Control, Switch Control, Larger Text); Android Developers (TalkBack, Switch Access, Voice Access, testing); React Native docs (simulator limits); Flutter accessibility testing; W3C WAI; Allan (2026, testing habits); Kumar (2025, device testing).
