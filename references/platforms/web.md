# Web (sites, web apps, PWAs, web views)

## Assistive technology and settings to support
- **Screen readers:** NVDA and JAWS (Windows, usually with Chrome, Edge or Firefox), VoiceOver (macOS and iOS Safari), TalkBack (Android Chrome), Narrator, Orca.
- **Keyboard only**, switch access, voice control (Dragon, Voice Control, Voice Access), screen magnifiers, browser zoom (up to 400%), browser default font size.
- **User preferences in CSS:** `prefers-reduced-motion`, `prefers-color-scheme`, `prefers-contrast`, `forced-colors`, `prefers-reduced-transparency` (limited support).

## The semantics toolkit
| Need | Use |
|---|---|
| Actions | `<button type="button">` |
| Navigation | `<a href>` |
| Form fields | `<input>`, `<select>`, `<textarea>` with `<label for>`; `<fieldset>` + `<legend>` for groups; `autocomplete` |
| Structure | `<h1>`–`<h6>`, `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`, `<section>` with a heading, `<ul>/<ol>`, `<table>` with `<th scope>` and `<caption>` |
| Disclosure, dialog | `<details>`/`<summary>`, `<dialog>` + `showModal()`, `popover` attribute |
| Hide from everyone | `hidden`, `display:none`, `inert` |
| Hide from assistive technology only | `aria-hidden="true"` (never on focusable content), `alt=""` |
| Hide visually only | `.visually-hidden` class (see [structure.md](../structure.md)) |
| Status messages | an existing `role="status"` / `aria-live="polite"` region |
| Custom widgets | ARIA per the WAI-ARIA Authoring Practices pattern, or a tested library (React Aria, Radix, Headless UI, Ariakit) |

**The first rule of ARIA:** if a native element does it, use the native element. ARIA changes what's announced, not what happens; it adds no keyboard support.

## Page-level musts
- `<html lang="…">`; a descriptive `<title>` (updated on SPA route changes).
- Viewport: `<meta name="viewport" content="width=device-width, initial-scale=1">`. **Never** `maximum-scale=1` or `user-scalable=no`.
- One `<main>`; a skip link when navigation comes first.
- Focus styles via `:focus-visible`; never `outline: none` alone.
- `rem` for font sizes; layouts that reflow at 320px and 200% text.
- Keyboard: everything reachable in visual order; no positive `tabindex`; no traps.

## Single-page apps (React, Vue, Svelte, Angular, Next, Nuxt…)
- **Route changes:** update `document.title`, then move focus to the new view's `<h1>` (give it `tabindex="-1"`) or announce the new page. Frameworks don't do this by default everywhere (Next.js App Router announces route changes; check your router).
- **Loading states:** `aria-busy="true"` on the region while loading; announce completion ("12 results loaded").
- **Component libraries:** check every third-party component (date pickers, selects, modals, data grids); many are not accessible.
- **Portals and overlays** render at the end of `<body>`: make sure focus moves into them and the rest is `inert`.
- **Icons:** SVG icons decorative by default (`aria-hidden="true" focusable="false"`); the button carries the name.
- **JSX:** `htmlFor`, `aria-*` attributes as-is; lint with `eslint-plugin-jsx-a11y`.

## Common web traps (all flagged by `scripts/audit.mjs`)
- `<div onClick>` / `<span onClick>` as buttons; `<a>` without `href` used as buttons.
- `<img>` without `alt`; `alt="image"` or file names.
- Inputs without labels; placeholder as label.
- `outline: none` / `outline: 0` with no replacement.
- `tabindex` > 0.
- `aria-hidden="true"` on focusable elements or their ancestors.
- `user-scalable=no` / `maximum-scale=1`.
- Fixed `px` font sizes and a fixed root size.
- `autoplay` media without `muted` and controls.
- Hover-only menus with focusable but invisible links (`opacity: 0` without `visibility: hidden` / `inert`).

## Embedded web views in apps
Content rendered in a `WKWebView`, Android `WebView`, React Native WebView or Flutter web view follows web rules **and** must not break the app's text scaling. Set text size to follow the system (iOS: `-webkit-text-size-adjust` and Dynamic Type-aware CSS; Android: `WebSettings.setTextZoom` from the font scale).

## CI and tools
- Runtime: **axe-core** via `@axe-core/playwright`, `@axe-core/react`, `cypress-axe`, `jest-axe` (for component tests; colour contrast doesn't work in JSDOM).
- Static: **eslint-plugin-jsx-a11y** (React), `eslint-plugin-vuejs-accessibility` (Vue), Svelte compiler a11y warnings, Angular ESLint template accessibility rules.
- Browser: DevTools Accessibility tree and contrast picker, Lighthouse accessibility audit, WAVE, Accessibility Insights for Web.
- See [testing/automated.md](../testing/automated.md).

## Sources
Allan, *Accessibility by Default* series (2026); Matuzović (2017); Abbott (2023); WCAG 2.2; axe-core and eslint-plugin-jsx-a11y READMEs.
