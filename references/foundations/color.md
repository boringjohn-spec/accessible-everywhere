# Colour and contrast

Colour has two separate accessibility jobs, and they need different rules:
- **Contrast** helps people with low vision, older eyes, glare and cheap screens read and see things.
- **Not using colour alone** helps people who are colour-blind (and screen reader users, and everyone in greyscale or forced-colours modes) get the meaning.

## Contrast thresholds (Required, WCAG 2.2 AA)

| What | Minimum | Criterion |
|---|---|---|
| Body text and images of text | **4.5:1** | 1.4.3 |
| Large text: ≥ 24px (18pt), or ≥ 18.66px (14pt) **bold** | **3:1** | 1.4.3 |
| Parts needed to identify a control or its state: input borders, checkbox and radio marks, toggle on/off, focus indicators, icon-only buttons, selected tab indicators | **3:1** against adjacent colours | 1.4.11 |
| Meaningful graphics: chart lines and bars, icons that carry meaning, infographic parts | **3:1** against adjacent colours | 1.4.11 |
| Disabled controls, pure decoration, logos, incidental text in photos | no requirement | 1.4.3 / 1.4.11 |

- **Placeholder text is not exempt.** If you show it, it needs 4.5:1, which usually makes it look like real input, which is one more reason not to use placeholders as labels.
- **Native sizes:** use the same numbers in pt (iOS) or sp (Android). Apple's Accessibility Inspector treats *any* bold text as large; WCAG only counts bold at 14pt and above. Use the stricter WCAG rule.
- **Recommended:** body text at **7:1** (AAA 1.4.6) where the brand allows; focus indicators with a 3:1 change between focused and unfocused states (AAA 2.4.13).
- WCAG measures text against its **specified background**. If you set a text colour, set the background too (and the reverse), or a user's own defaults can produce unreadable pairs.

## How to measure

Use `scripts/contrast.mjs`. It uses the WCAG formula: ratio = (L1 + 0.05) / (L2 + 0.05), with sRGB relative luminance (linearisation threshold 0.04045). Rules:
- **Measure what's rendered.** Semi-transparent text or backgrounds must be blended over what's actually behind them first (the script does this when you give it the backdrop).
- **Text over images, video or gradients:** measure at the **worst point**, or put a solid or semi-opaque scrim behind the text. A text shadow alone is not reliable.
- **Every theme, every state.** Light, dark, increased contrast; default, hover, pressed, focused, selected, error, visited.
- **Thin and unusual fonts** read worse than the maths says. Treat hairline weights as failing at small sizes even when they pass.
- **APCA** (the perceptual method proposed for WCAG 3) is a useful second opinion, especially for dark mode and coloured text. WCAG 2 maths stays the pass/fail rule until WCAG 3 is a standard.

Reference points on white (#ffffff): **#767676 is the lightest grey for normal text (4.54:1); #949494 for large text and UI (3.03:1)**. #959595 is widely quoted as the large-text limit, but it measures 2.995:1 and fails; #969696 (2.96:1) fails too. Rounded numbers in articles hide this, which is why the script rounds down when it displays ratios.

## Design tokens: build colour as pairs

A colour token on its own can't pass or fail. A **pair** can. Define tokens as foreground-on-background pairs, per theme and state, and check every one:

```json
{
  "themes": {
    "light": {
      "colors": { "text": "#1a1a1a", "text-muted": "#5f6368", "surface": "#ffffff", "accent": "#0b57d0", "danger": "#b3261e", "border-input": "#79747e" },
      "pairs": [
        { "fg": "text", "bg": "surface", "use": "text" },
        { "fg": "text-muted", "bg": "surface", "use": "text" },
        { "fg": "accent", "bg": "surface", "use": "text" },
        { "fg": "border-input", "bg": "surface", "use": "ui" },
        { "fg": "#ffffff", "bg": "accent", "use": "text" }
      ]
    },
    "dark": { "colors": { }, "pairs": [ ] }
  }
}
```

`use` is `text` (4.5:1), `large-text` (3:1) or `ui` (3:1). Run `node scripts/contrast.mjs --tokens tokens.json` in CI so a failing pair can't be published (this is the "token layer" of accessibility architecture).

## Fixing a failing pair without losing the brand

1. **Change lightness, keep hue and chroma.** Work in OKLCH: lower L for text on light backgrounds, raise it on dark. `contrast.mjs --suggest text` does this and returns the nearest passing colour.
2. **Keep the brand colour for large or non-text uses** (headings, filled buttons with dark text, illustrations) and use a darker sibling for small text and links.
3. **Move text into the large category** (bigger, or truly bold at 14pt+) when the design allows.
4. **Put text on a solid surface** instead of the image or gradient.
5. **Provide a higher-contrast variant** for the system's increased-contrast setting (iOS Increase Contrast, Android high-contrast text, `prefers-contrast: more`). This doesn't replace meeting AA by default.

## Never colour alone (Required, 1.4.1)

| Situation | Second cue |
|---|---|
| Form error | error icon + message text next to the field |
| Required field | the word "required" or a marked asterisk explained once |
| Status (success, warning, failed) | icon shape + text label |
| Links inside text | underline (or another non-colour cue) at rest; colour alone needs 3:1 against surrounding text **plus** a non-colour cue on hover and focus |
| Selected tab, chip, day | weight, underline, check mark, border, `aria-selected` / selected trait |
| Charts | direct labels, patterns or dashes, different marker shapes, a data table |
| Online / offline dots | text or a different shape |

**Test:** view the design in greyscale (or with a colour-blindness simulator). If you can still tell every state apart, you're done.

Colour-blind-risky pairs: **red / green**, **blue / orange** in some lights, **green / brown**, **blue / purple**. Choose palettes with a large lightness difference between series, not just a hue difference. Let people pick chart colours where you can.

## Themes and user colour settings

- **Dark mode is a theme to check, not a guarantee.** Re-check every pair. Avoid pure #ffffff text on pure #000000 for long reading: very high contrast with bright text can be uncomfortable for people with light sensitivity. An off-white on near-black still passes easily.
- **Forced colours (Windows high contrast) / `forced-colors: active`:** the system replaces your colours. Anything shown only by background colour (input boxes, button shapes, selected states) disappears. Give inputs and buttons a real border (a transparent one is enough), use system colour keywords (`CanvasText`, `ButtonText`, `Highlight`) for custom states, and don't draw focus with `box-shadow` alone (shadows are removed); add an `outline`.
- **System colours on iOS** (`.label`, `.secondaryLabel`, `systemRed`…) already have Increase Contrast and dark variants. Use them for text and UI where the brand allows.
- **Smart Invert (iOS):** mark photos, video and brand art with `accessibilityIgnoresInvertColors` so they don't turn into negatives.

## Per platform

| Platform | Where colour comes from | Contrast checks |
|---|---|---|
| Web | CSS custom properties; `@media (prefers-color-scheme)`, `(prefers-contrast: more)`, `(forced-colors: active)` | axe-core, browser DevTools contrast picker, `contrast.mjs` |
| iOS | Asset catalog colours with "High Contrast" variants; system colours; `\.colorSchemeContrast` | Accessibility Inspector audit, `performAccessibilityAudit` |
| Android | Material colour roles; `isHighTextContrastEnabled` (React Native) | Accessibility Scanner, Compose `enableAccessibilityChecks()` |
| React Native | style tokens; `AccessibilityInfo.isDarkerSystemColorsEnabled` (iOS), `isHighTextContrastEnabled` (Android) | platform tools on the built app |
| Flutter | `ThemeData` / `ColorScheme`; `MediaQuery.highContrastOf(context)` | `meetsGuideline(textContrastGuideline)` |

## Sources
WCAG 2.2 (1.4.1, 1.4.3, 1.4.6, 1.4.11, glossary: contrast ratio, relative luminance, large scale); Apple HIG Accessibility; Android "Make apps more accessible"; Hausler (2015); Matuzović (2017); Coady (2017) and W3C Low Vision Task Force comment on light sensitivity; Martinez (2026).
