# Motion, flashing and time

Motion can make people with vestibular disorders dizzy or sick (sometimes for days), flashing can trigger seizures, and anything that moves or disappears on a timer can be impossible to read, reach or operate for people who need more time.

## What counts as motion

**Motion animation** = adding in-between steps so something appears to move, grow, shrink, rotate or zoom. **Colour changes and opacity fades are not motion.** Blur can count when it changes perceived size or position. Scrolling itself is essential and allowed; **extra effects driven by scrolling** (parallax, elements sliding in, scroll-jacking, zooming backgrounds) are not essential.

Common triggers: parallax; large-area slides and zooms (page and screen transitions); spinning and bouncing; scroll-linked animation; auto-playing video backgrounds; animated depth (z-axis); peripheral motion (things moving at the edge while the user reads).

## Rules

| Tier | Rule | Source |
|---|---|---|
| **Required** | Nothing flashes more than **3 times in any 1 second**, or the flashing area is small (under about 25% of a 10° field, roughly 341×256 px on a 1024×768 screen). Saturated red flashes are stricter. Applies to everything on the page. | 2.3.1 |
| **Required** | Anything that **moves, blinks or scrolls automatically for over 5 seconds** next to other content (carousels, tickers, marquees, animated banners, background video) can be **paused, stopped or hidden**. Auto-updating content can be paused or slowed. | 2.2.2 |
| **Required** | Audio that plays automatically for over 3 seconds can be paused or has its own volume. Prefer no autoplay. | 1.4.2 |
| **Required** | Time limits can be turned off, extended, or warned about with ≥ 20 seconds and a one-step extension (except real-time, essential, > 20 hours). | 2.2.1 |
| **Platform** | Honour the system **Reduce Motion** setting (iOS, Android "Remove animations", `prefers-reduced-motion`), plus iOS **Dim Flashing Lights** and **Auto-Play Video Previews** off. | Apple HIG, platform docs |
| **Recommended** | Motion triggered by interaction can be turned off (AAA 2.3.3); offer an in-app "reduce motion" toggle that can override the system. Avoid UI that disappears on a timer (Apple). | 2.3.3, Apple HIG |

## The reduced-motion recipe

When reduced motion is on:
- Replace slides, zooms and scale transitions with **cross-fades** or instant changes.
- Remove parallax, scroll-linked effects, auto-advancing carousels and background video (show a still frame).
- **Tighten springs** (no bounce), and make motion **track the finger directly** rather than animating on its own.
- No animated depth (z-axis) and no animated blur.
- **Keep** the feedback itself: a state still visibly changes, loading still shows (a static or gently pulsing indicator is fine), focus still moves. Reduced motion means less movement, not less information.

### Motion tokens
Define each motion token with a reduced version, so components can't forget it:
```css
:root { --motion-enter: transform 240ms cubic-bezier(.2,.8,.2,1), opacity 240ms; }
@media (prefers-reduced-motion: reduce) {
  :root { --motion-enter: opacity 150ms linear; }
  *, *::before, *::after { scroll-behavior: auto !important; }
}
```
A safer default for new code: put movement **inside** `@media (prefers-reduced-motion: no-preference) { … }` so it's opt-in.

### Per platform
| Platform | Read the setting | Notes |
|---|---|---|
| Web | `@media (prefers-reduced-motion: reduce)`; JS `matchMedia('(prefers-reduced-motion: reduce)')` (listen for changes) | Also `scroll-behavior: auto`; pause `<video autoplay>`; GSAP `matchMedia`, Framer Motion `useReducedMotion`, View Transitions: skip or fade |
| iOS | SwiftUI `@Environment(\.accessibilityReduceMotion)`; UIKit `UIAccessibility.isReduceMotionEnabled` + notification; `UIAccessibility.prefersCrossFadeTransitions` | Also `\.accessibilityReduceTransparency`, Dim Flashing Lights for video (`AVPlayer` handles system support), `isVideoAutoplayEnabled` |
| Android | `Settings.Global.ANIMATOR_DURATION_SCALE == 0` (Remove animations); `ValueAnimator.areAnimatorsEnabled()` | Compose animations respect the animator scale for many APIs; check custom ones |
| React Native | `AccessibilityInfo.isReduceMotionEnabled()` + `reduceMotionChanged` event; Reanimated `useReducedMotion()`, `ReduceMotion.System` | `prefersCrossFadeTransitions()` (iOS) |
| Flutter | `MediaQuery.disableAnimationsOf(context)` (true when the OS asks to reduce or remove animation) | Use it to shorten or skip `AnimationController`s and route transitions |

## Things that disappear on a timer

Toasts, snackbars, auto-hiding controls (video players), OTP countdowns and session timeouts are timing problems:
- Messages with an **action** (Undo, Retry) must not vanish before people can reach them; make them persist until dismissed, or put the action somewhere persistent too.
- Android exposes the user's preferred timeout ("Time to take action"): `AccessibilityManager.getRecommendedTimeoutMillis()` / React Native `getRecommendedTimeoutMillis()`. Use it.
- Warn before session timeouts and offer one-step extension; save work.
See [components/toast-snackbar.md](../components/toast-snackbar.md).

## Haptics and sound

- Sound alone never carries meaning: pair success or error sounds with visible text and, on mobile, **haptics** (Apple recommends pairing audio cues with haptics and visual cues).
- Haptics alone never carry meaning either (some people turn them off or can't feel them).

## Sources
WCAG 2.2 (1.4.2, 2.2.1, 2.2.2, 2.3.1, 2.3.3 and Understanding); Apple HIG Accessibility (Reduce Motion guidance, Dim Flashing Lights, timers, haptics); Android, React Native and Flutter docs; W3C WAI (Understanding Animation from Interactions; Three Flashes); Allan (2026, carousels).
