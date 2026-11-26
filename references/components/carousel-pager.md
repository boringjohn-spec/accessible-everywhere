# Carousel and pager

> First ask if you need one. If you do: no auto-rotation by default, named previous/next buttons, "2 of 5" position, inactive slides hidden from everyone, focus never moved by a slide change, and buttons as well as swipes.

## Use it when
- A set of related items where showing one at a time genuinely helps (a photo gallery, an onboarding sequence, product images).
- **Question it** when the content is important (show it all), people need to compare (use a grid or list), or it exists only to "save space". Most homepage hero carousels are better as a single strong message plus a list.

## Contract
| # | Requirement | Tier | SC |
|---|---|---|---|
| 1 | No auto-rotation by default. If it rotates: a visible pause/stop control, **first** in the carousel; rotation pauses on hover **and** keyboard focus; rotates no faster than people can read | Required | 2.2.2 |
| 2 | Previous/next are real buttons named "Previous slide" / "Next slide" (or with the slide name) | Required | 4.1.2, 2.4.6 |
| 3 | Current position available ("Slide 2 of 5"); the current dot/indicator marked (`aria-current`, selected trait) | Required | 1.3.1, 4.1.2 |
| 4 | Inactive slides are hidden from everyone (no focusable content off-screen) | Required | 2.4.3, 1.3.1 |
| 5 | Changing slides never moves focus | Required | 3.2.1, 2.4.3 |
| 6 | Swipe is never the only way: buttons too (and they're large enough) | Required | 2.5.1, 2.5.7 |
| 7 | Slide transitions respect reduced motion | Platform / Recommended | 2.3.3 |
| 8 | Text on slide images meets contrast at its worst point | Required | 1.4.3 |

## Design notes
- Screen readers on phones use swipes to move between elements, which clashes with swipe-to-change-slide. Visible buttons solve it.
- Dots are tiny targets; make them 24px+ (44pt/48dp) or rely on the previous/next buttons.
- Don't hide key calls to action on slide 3.

## Web
```html
<section aria-roledescription="carousel" aria-label="Product photos">
  <button type="button" aria-pressed="false">Pause</button>   <!-- only if it auto-rotates -->
  <button type="button" aria-controls="slides">Previous slide</button>
  <button type="button" aria-controls="slides">Next slide</button>
  <div id="slides" aria-live="polite">   <!-- "off" while rotating -->
    <div role="group" aria-roledescription="slide" aria-label="1 of 5">…</div>
    <div role="group" aria-roledescription="slide" aria-label="2 of 5" inert hidden>…</div>
  </div>
</section>
```
- `inert` on inactive slides removes them from Tab order and assistive technology together. `aria-hidden` alone leaves focusable content reachable.
- Use `aria-live="polite"` on the slide container only when rotation is off, so manual changes are announced; set it to `off` while auto-rotating.
- Respect `prefers-reduced-motion`: switch slides with a fade or instantly.

## iOS
- `TabView` with `.tabViewStyle(.page)` gives a pager VoiceOver can scroll (three-finger swipe) and announces the page.
- Custom pagers: make the page indicator **adjustable** (`.accessibilityAdjustableAction`) with `accessibilityValue("Page 2 of 5")`, add previous/next buttons, and `.accessibilityScrollAction` where you scroll programmatically.
- `UIPageControl` is adjustable by default.

## Android
- Compose `HorizontalPager` supports TalkBack scroll actions; add a page indicator with `semantics { stateDescription = "Page 2 of 5" }` and visible previous/next buttons.
- Views: `ViewPager2` + `TabLayout` as indicators.
- Pause any auto-advance while TalkBack is on or the pager has focus.

## React Native
- Use a pager built on native components (`react-native-pager-view`) so screen reader scroll actions work.
- Indicator: `accessibilityRole="adjustable"`, `accessibilityValue={{ text: 'Page 2 of 5' }}`, `increment`/`decrement` actions; plus labelled previous/next buttons.
- Stop auto-play when `AccessibilityInfo.isScreenReaderEnabled()` or `isReduceMotionEnabled()` is true.

## Flutter
- `PageView` exposes scroll semantics; wrap pages in `Semantics(label: 'Page 2 of 5')` or announce on page change with `SemanticsService.announce`.
- Add labelled `IconButton`s for previous/next; skip animated transitions when `MediaQuery.disableAnimationsOf(context)` is true.

## Common mistakes
- Auto-rotation with no pause, or pause hidden at the end.
- Off-screen slides still focusable or read aloud.
- Unnamed arrow buttons ("button", "button").
- Focus jumping to the new slide.
- Swipe-only on mobile.

## Test it
- Keyboard: reach pause first, then previous/next; Tab through only the current slide.
- Screen reader: hear "Slide 2 of 5"; swipe never lands on hidden slides; three-finger swipe (iOS) / scroll actions (Android) change pages.
- Reduced motion: transitions become fades.
- Timing: nothing changes while you read or focus inside.

## Sources
Allan, *Accessibility by Default: Carousels* (2026); WAI-ARIA Authoring Practices (carousel); WCAG 2.2 (2.2.2, 2.5.1, 2.5.7, 2.3.3); Apple SwiftUI (adjustable, scroll actions); Android Compose; React Native; Flutter.
