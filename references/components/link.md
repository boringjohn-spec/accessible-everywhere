# Link

> A link takes you somewhere. Use a real link, write text that makes sense on its own, mark it without relying on colour, and warn when it opens somewhere unexpected.

## Use it when
- Going to another page, route, section or URL, or downloading a file.
- **Not** for actions on this screen (that's a [button](button.md)). Styling can make a link look like a button or the reverse; the element must match the behaviour.
- **In native apps**, moving between screens is usually a list row or button with a chevron. Use the link role for links inside text and for URLs that open in the browser (React Native's docs say: `link` for external URLs, `button` for in-app navigation).

## Contract
| # | Requirement | Tier | SC |
|---|---|---|---|
| 1 | Real link element with a destination (`<a href>`), so new tab, copy link, history and screen reader link lists work | Required | 2.1.1, 4.1.2 |
| 2 | Purpose clear from the text, or the text plus its sentence/list item/cell. No bare "click here" / "read more" | Required | 2.4.4 |
| 3 | Image, icon and logo links have a name describing the destination | Required | 1.1.1, 2.4.4 |
| 4 | Links in text are distinguishable without colour (underline), or 3:1 against surrounding text **plus** a non-colour cue on hover and focus | Required | 1.4.1 |
| 5 | Link text 4.5:1 against the background | Required | 1.4.3 |
| 6 | Visible focus | Required | 2.4.7 |
| 7 | Warn when a link opens a new tab/window, another app, or downloads a file | Recommended | 3.2.5 (AAA) |
| 8 | A "Skip to main content" link first on pages with repeated navigation | Required (one way of meeting 2.4.1) | 2.4.1 |

## Design notes
- Write link text that names the destination: "Read the 2026 accessibility report", not "Read more".
- Repeated "Read more" links on cards: make the card title the link, or add hidden context ("Read more about Pricing").
- Keep links underlined in body text. Navigation menus and buttons-styled links can drop the underline because their context makes them obviously interactive.
- Show an external-link or download icon **with** a text alternative, and the file type and size for downloads ("Annual report (PDF, 2 MB)").

## Web
```html
<a href="/report-2026">Read the 2026 accessibility report</a>

<a href="/">
  <img src="logo.svg" alt="Shopname home">
</a>

<a href="https://example.org" target="_blank" rel="noopener">
  Partner site <svg aria-hidden="true" focusable="false">…</svg>
  <span class="visually-hidden">(opens in a new tab)</span>
</a>

<a class="skip-link" href="#main">Skip to main content</a>
…
<main id="main" tabindex="-1">…</main>
```
- `<a>` without `href` is not a link and isn't focusable. `href="#"` with a click handler is a button in disguise.
- A real link supports Cmd/Ctrl/middle-click; don't intercept those in client-side routers.
- If you use `aria-label` on a link with visible text, it must contain that text.

## iOS
- Links in `Text` with Markdown or `AttributedString` (`Text("[Privacy policy](https://…)")`) are exposed as links; VoiceOver users reach them through the rotor ("Links").
- A `Link("Privacy policy", destination: url)` gets the link trait.
- A custom view that opens a URL: `.accessibilityAddTraits(.isLink)`, and a label that names the destination.
- Say when something opens Safari or another app ("Opens in Safari") with `accessibilityHint` if it isn't obvious.

## Android
- Compose: text links with `LinkAnnotation.Url` in an `AnnotatedString` are exposed to TalkBack (users open them through the links menu / reading controls).
- A clickable row that navigates: `Modifier.clickable(onClickLabel = "Open order details") { … }`; it's a button in TalkBack terms, which is fine for in-app navigation.
- Views: `TextView` with `autoLink` or `ClickableSpan` + `LinkMovementMethod`; long paragraphs with many links are hard to use, so keep them few.

## React Native
```tsx
<Text>
  Read our{' '}
  <Text accessibilityRole="link" onPress={() => Linking.openURL(url)} style={{ textDecorationLine: 'underline' }}>
    privacy policy
  </Text>
</Text>
```
- `accessibilityRole="link"` for external URLs; `button` for in-app navigation.
- Nested pressable `Text` inside `Text` is reachable on iOS via the rotor and on Android via TalkBack's links menu; test both.

## Flutter
- `Semantics(link: true, label: 'Privacy policy', child: …)` for custom link widgets; the `url_launcher` package's `Link` widget sets link semantics (and a real `<a>` on Flutter web).
- Text spans with `TapGestureRecognizer` aren't reliably exposed as separate links; prefer separate tappable widgets for important links.

## Common mistakes
- "Click here", "Learn more", "Read more" repeated with no context.
- Links that only differ by colour in a paragraph.
- Buttons used for navigation (lose new tab, copy link, history) and links used for actions.
- Logo links with no name, or with the alt "logo".
- Opening new tabs without warning.

## Test it
- Screen reader links list (NVDA/JAWS Insert+F7, VoiceOver rotor "Links"): every link makes sense out of context.
- Greyscale: links in text still visible as links.
- Keyboard: Tab reaches them in order; Enter activates.
- Automated: axe `link-name`, `link-in-text-block`; jsx-a11y `anchor-is-valid`, `anchor-has-content`.

## Sources
Allan, *Accessibility by Default: Links* (2026); Matuzović (2017) on underlines; React Native docs; Apple SwiftUI; Android Compose; Flutter; WCAG 2.2.
