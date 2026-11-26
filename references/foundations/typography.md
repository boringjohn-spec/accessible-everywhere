# Typography and text size

Text size belongs to the user. Many people with low vision don't zoom; they set a larger text size once in their system or browser and expect every app to follow it. An accessible type system does three things: follows that setting, keeps the layout working when text gets very large, and keeps structure in the code (headings) separate from looks (styles).

## Rule 1: build the scale on user-relative units (Required, 1.4.4)

| Platform | Use | Don't |
|---|---|---|
| Web | `rem` for font sizes (and for spacing that sits around text); `%` or `em` on the root only. Media queries in `em`/`rem`. | `px` font sizes; a fixed root (`html { font-size: 10px }`); a vw-only root (`font-size: calc(…vw)`) without a rem component; `maximum-scale=1` or `user-scalable=no` |
| iOS | System text styles (`.body`, `.headline`, `.title`…) or `Font.custom(_:size:relativeTo:)`; `UIFontMetrics` + `adjustsFontForContentSizeCategory` in UIKit; `@ScaledMetric` for spacing and icon sizes | `.font(.system(size: 15))` with no relative style; `UIFont.systemFont(ofSize:)` without `UIFontMetrics` |
| Android | `sp` for text (Compose `TextUnit.sp`, Material typography) | `dp` for text; `fontScale` overrides |
| React Native | default `allowFontScaling` (true); `maxFontSizeMultiplier` only where space is truly fixed, and generously (≥ 2) | `allowFontScaling={false}`; global `Text.defaultProps` that disable scaling |
| Flutter | default text scaling from `MediaQuery`; `TextScaler` | `MediaQuery(textScaler: TextScaler.noScaling)` or clamping to 1.0 |

`px` sizes on the web still grow with browser zoom, so they don't automatically fail 1.4.4, but they ignore the user's **default font size** setting, which many low-vision users rely on. Use rem.

## Rule 2: layouts survive the biggest sizes (Required + Platform)

How big "big" is:
- **Web:** 200% text (1.4.4) and 400% zoom at 320 CSS px wide (1.4.10 Reflow), with no two-direction scrolling.
- **iOS:** body text goes from 17pt (default "Large") to **53pt at AX5** (about 3×). Headings grow less (Large Title 34 → 60pt), so **hierarchy compresses** at large sizes.
- **Android:** font scale up to **200%**, applied non-linearly (large text grows less than small text).
- Apple asks apps to support enlarging text by **at least 200%**.

What to design for:
- **Wrap, don't truncate.** Labels and list rows get as many lines as they need (`numberOfLines = 0`, `maxLines` off, no `text-overflow: ellipsis` on important text). Truncate only where the full text is one tap away.
- **Stack at large sizes.** Side-by-side layouts (label + value, icon + text + timestamp, two-column forms) switch to stacked when text is large. Use `ViewThatFits` / `dynamicTypeSize.isAccessibilitySize` (SwiftUI), `fontScale` checks (Compose, React Native), `textScaler` (Flutter), and container or media queries in `rem` (web).
- **Grow containers.** `min-height`, never fixed `height`, for anything holding text. Buttons grow with their label.
- **Scroll the page, not the text.** At large sizes, screens should scroll; nothing should be cut off or overlap.
- **Scale icons that carry meaning** with the text (SF Symbols do this; on web size icons in `em`).
- **Bars that can't grow** (tab bars, toolbars): on iOS add the Large Content Viewer (`accessibilityShowsLargeContentViewer`) so a long press shows a big version.
- **Text spacing (web, 1.4.12):** the layout must still work if a user forces line-height 1.5, paragraph spacing 2em, letter spacing 0.12em, word spacing 0.16em. Avoid fixed heights and clipped containers.

## Rule 3: style is not structure (Required, 1.3.1)

- Choose heading **levels** by the outline of the page (h1 → h2 → h3, no skipping for looks); choose heading **styles** by design. A design system needs style tokens that work on any level: `display-lg`, `title-md`, `label-sm`, used as `<h2 class="title-md">`.
- One `h1` (or one screen title) per page or screen.
- On mobile, mark headings with the heading trait or semantics so VoiceOver's rotor and TalkBack's heading navigation can jump between sections (`.accessibilityAddTraits(.isHeader)` / `accessibilityHeading(_:)`, Compose `semantics { heading() }`, React Native `role="heading"`, Flutter `Semantics(header: true)`).
- Don't fake headings with bold paragraphs, and don't use heading tags just to make text big.

## Readability (Platform + Recommended)

| Topic | Guidance |
|---|---|
| Body size | Web: 16px (1rem) minimum for body text, often 17–20px on small screens. iOS: 17pt default body, 11pt absolute minimum. Android: 14–16sp body. Avoid body text below these. |
| Line height | ≥ 1.5 for paragraphs (AAA 1.4.8); ≥ 1.2 for headings. Apple: avoid tight leading for 3+ lines. |
| Line length | 45–80 characters (`max-width: 65ch` is a good default). |
| Alignment | Left-aligned (start-aligned in RTL). **No justified text** (uneven gaps hurt people with dyslexia). |
| Weight | Avoid thin and hairline weights for body and small text; if the brand uses them, go larger. |
| Case | Avoid long passages in ALL CAPS; screen readers may spell out some all-caps words, and they're harder to read. Use `text-transform` for visual caps so the underlying text stays normal. |
| Images of text | Use real text (1.4.5). Logos are the exception. |
| Fonts | Make sure custom fonts support Bold Text (iOS) and Dynamic Type; avoid icon fonts for meaningful icons (they break with user font overrides) or hide them and provide a label. |
| iOS Safari inputs | Inputs under 16px make Safari zoom the page on focus. Use 16px+ for input text rather than disabling zoom. |

## Tokens

```css
:root {
  --text-body: 1rem;        /* follows the user's browser setting */
  --text-small: 0.875rem;   /* 14px at default; don't go below for meaningful text */
  --text-title-md: 1.5rem;
  --text-display-lg: clamp(2rem, 1.5rem + 2vw, 3.5rem); /* rem in both ends so zoom still works */
  --leading-body: 1.5;
  --measure: 65ch;
}
```

A `clamp()` with `vw` must keep a `rem` part, or the text stops responding to zoom and text-size settings.

## Sources
WCAG 2.2 (1.3.1, 1.4.4, 1.4.5, 1.4.8, 1.4.10, 1.4.12); Apple HIG Typography and Accessibility (Dynamic Type tables, 200% guidance, minimum sizes); Android Compose scalable content; React Native docs; Flutter docs (UI design and styling); Abbott (2023); Matuzović (2017); Allan (2026).
