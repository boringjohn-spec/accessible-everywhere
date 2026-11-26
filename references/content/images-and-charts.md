# Images, icons, charts and complex graphics

> Decide what each image is **for**, then write the alternative for that purpose: nothing for decoration, the meaning for information, the action for controls, and a short name plus a full description for charts and diagrams.

## The decision (W3C images decision tree, simplified)
1. **Does it contain text?** If that text is also nearby as real text, or it's just visual styling → decorative (empty alt). If it's the function of a control → describe the function. Otherwise → the alt contains the same text.
2. **Is it in a link or button?** → describe the **destination or action** ("Home", "Search"), not the picture.
3. **Does it add information?** Simple photo or graphic → a short description of the meaning **in this context**. Chart, diagram, map → short name + long description (below). Repeats adjacent text → decorative.
4. **Purely decorative or not meant for users?** → decorative.

## How to mark each type
| Type | Web | iOS | Android | React Native | Flutter |
|---|---|---|---|---|---|
| Decorative | `alt=""` (never omit `alt`); CSS backgrounds | `Image(decorative:)` / `.accessibilityHidden(true)` | `contentDescription = null` | `accessible={false}` / `aria-hidden` | `Image(excludeFromSemantics: true)`, `ExcludeSemantics` |
| Informative | `alt="Team celebrating the product launch on stage"` | `.accessibilityLabel(…)` | `contentDescription = …` | `accessibilityLabel` + `accessibilityRole="image"` | `Image(semanticLabel: …)` |
| Functional (in a control) | alt or `aria-label` on the control = the action | label on the button | `contentDescription` on the icon | label on the touchable | `tooltip` / `Semantics(label:)` |
| Images of text | Avoid; if unavoidable, alt = the same words | same | same | same | same |
| Groups (rating stars, image sets) | one alt for the group ("Rated 4 out of 5"), others empty | combine into one element | merge | one accessible container | `MergeSemantics` + one label |

## Writing alt text
- Say what matters **here**: the same bird photo is "a park in spring" on a parks site and "a male robin, red breast visible" on a birding site.
- Don't start with "Image of" or "Picture of"; the role already says it. Do say "Photo", "Illustration" or "Screenshot" when the medium matters.
- Keep it short (about one sentence). Longer detail belongs in the page or a long description.
- No file names, no keyword stuffing, no repeating the caption.
- Avatars next to a name: decorative. A logo that links home: "Shopname home".
- AI-generated alt text is a draft. A person checks it, because it describes appearance, not purpose.

## Icons
- Icon + visible text: the icon is decorative.
- Icon-only control: the control has a name (the action).
- Status icons (error, success) carry meaning: give them a text alternative or pair them with visible text.
- Meaningful icons meet 3:1 contrast (1.4.11) and scale with text where they sit inline.

## Charts, graphs, diagrams, maps
Every meaningful chart needs four things:
1. **A short alternative** that names it and points to the details: "Bar chart of monthly sales, 2026. Details in the table below."
2. **The takeaway in text**, visible to everyone (a title or caption that states the point: "Sales doubled after the March launch").
3. **The data**: an accessible table, a downloadable CSV, or a structured long description (values, trends, axes, outliers).
4. **Visual design that doesn't depend on colour**: direct labels on lines and bars, patterns or dashes, different marker shapes, 3:1 contrast for lines and bars against the background and each other where they touch, legend order matching the visual order.

Interactive charts also need:
- Keyboard access to data points (arrow keys between points, a visible focus marker) and the same information in tooltips available on focus.
- Screen reader access: SwiftUI Charts and `accessibilityChartDescriptor` (iOS **Audio Graphs**), Compose `collectionInfo` and per-point semantics, a hidden table or `aria-describedby` to a summary on web, a `Semantics` summary in Flutter.
- No hover-only information.

Web patterns for long descriptions:
```html
<figure role="group" aria-labelledby="fig1-cap">
  <img src="sales.png" alt="Bar chart of monthly sales in 2026; values in the table below.">
  <figcaption id="fig1-cap">Sales doubled after the March launch.</figcaption>
  <details><summary>Data table</summary><table>…</table></details>
</figure>
```
`aria-describedby` works for short plain-text descriptions only; it flattens headings and tables.

## SVG
- Decorative: `aria-hidden="true" focusable="false"`.
- Meaningful: `role="img"` + `aria-label`, or `<title>` as the first child plus `aria-labelledby` pointing to it.
- Interactive SVG (maps, charts): real focusable elements with names; test with a screen reader.

## Sources
W3C WAI Images Tutorial and decision tree; Complex Images; WCAG 2.2 (1.1.1, 1.4.1, 1.4.5, 1.4.11); Apple HIG VoiceOver ("make charts and infographics fully accessible") and SwiftUI chart descriptor; Android Compose semantics; Flutter Image API; Matuzović (2017) on SVG and hidden content.
