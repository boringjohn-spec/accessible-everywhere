# Structure: titles, headings, order, hiding and announcing

Screen reader users don't see the layout; they move through a structure. They jump by headings, landmarks, links and form fields, and they hear changes only if you announce them. This file covers the structure every screen needs.

## Titles (Required, 2.4.2)

- **Web:** a unique, descriptive `<title>` per page, most specific first ("Checkout: payment – Shopname"). In single-page apps, **update `document.title` on every route change**.
- **Native:** every screen has a title that's announced when it appears (navigation bar title, `.navigationTitle`, `Scaffold` top app bar, Compose `paneTitle` for panes and sheets, React Navigation `title`/`headerTitle`). Custom transitions: post a screen-changed notification so VoiceOver reads the new screen.

## Headings (Required, 1.3.1 and 2.4.6)

- One `h1` (or one screen title) that says what the screen is for. Then `h2` for sections, `h3` for subsections. Don't skip levels for looks.
- Headings describe their section ("Delivery address", not "Step 2").
- Style is separate from level (see [foundations/typography.md](foundations/typography.md)).
- If the visual design implies a heading but doesn't show one (a card grid with no title), add a visually hidden heading (web) so the outline still makes sense.
- Native: mark section titles as headings (heading trait / `heading()` / `role="heading"` / `Semantics(header: true)`). TalkBack and VoiceOver users navigate by them.

## Landmarks and regions (web)

- `<header>`, `<nav>` (with `aria-label` when there's more than one), `<main>` (one, visible), `<aside>`, `<footer>`, `<form>` with a name, `<search>`.
- A **"Skip to main content"** link as the first focusable element when repeated navigation comes before the main content (2.4.1). It can be visually hidden until focused.
- Don't wrap everything in `role="region"`; too many landmarks become noise.
- Native apps have no landmarks. Headings, screen titles and grouping do that job.

## Lists, tables and groups (Required, 1.3.1)

- Lists of things use `<ul>`/`<ol>`/`<li>` (so "list, 5 items" is announced). Native lists (SwiftUI `List`, `LazyColumn`, `FlatList`, `ListView`) announce position automatically; custom lists need `collectionInfo` (Compose) or `IndexedSemantics` (Flutter).
- Data tables use `<table>`, `<caption>`, `<th scope="col|row">`. Never use tables for layout. Never fake tables with divs unless you add the full grid roles (prefer real tables).
- Related form fields go in `<fieldset>` + `<legend>` (radio groups, checkbox groups, address blocks).
- On mobile, **group what belongs together** so it's one swipe, not five: a product card's name, price and rating read as one element, with its actions as custom actions.

## Reading order (Required, 1.3.2)

Code order = visual order. Common breakers: CSS `order`, `row-reverse`, grid placement, absolute positioning, overlays added at the end of the DOM but shown first, z-stacked native views. Fix the source order; use native order overrides only to fix a real mismatch.

## Hiding content: three different things

| Intent | Web | iOS | Android (Compose / Views) | React Native | Flutter |
|---|---|---|---|---|---|
| Hidden from **everyone** (closed panel, inactive tab, off-screen slide) | `hidden`, `display:none`, `inert` | remove from hierarchy, `.hidden()`, `accessibilityHidden(true)` + not focusable | don't compose it; `View.GONE` | don't render it | don't build it; `Offstage`, `Visibility` |
| Visible, but hidden from **assistive technology** (decorative icon, duplicate text) | `aria-hidden="true"`, `alt=""` (never on focusable things) | `accessibilityHidden(true)` | `contentDescription = null`, `hideFromAccessibility()` / `importantForAccessibility="no"` | `aria-hidden`, `accessibilityElementsHidden` (iOS), `importantForAccessibility="no-hide-descendants"` (Android) | `ExcludeSemantics` |
| Hidden **visually**, kept for assistive technology (headings, extra context, skip link) | `.visually-hidden` class (below) | an element with `accessibilityLabel` but no visible content, or extra info via `accessibilityValue`/`accessibilityCustomContent` | `semantics { contentDescription }` on an invisible node, or `stateDescription` | `accessibilityLabel` on the container | `Semantics(label:)` with no visible child |

```css
.visually-hidden:not(:focus):not(:active) {
  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
}
```

Rules:
- Never `aria-hidden` (or the native equivalents) on something that can still get focus. Use `inert` (web) or remove it.
- Content that's visually hidden must be hidden from everyone too (collapsed menus, closed accordions, off-screen drawers), or keyboard users tab into invisible things.
- Behind a modal: make the rest inert (`<dialog>.showModal()`, `inert`, `accessibilityViewIsModal`, `BlockSemantics`). See [components/dialog-and-sheet.md](components/dialog-and-sheet.md).

## Announcing changes (Required, 4.1.3)

Status messages (saved, added to cart, 12 results, loading, error, offline) must reach screen readers **without moving focus**.

| Platform | Polite update | Urgent update |
|---|---|---|
| Web | An element with `role="status"` (or `aria-live="polite"`) that **exists in the DOM before** its text changes | `role="alert"` for genuinely urgent errors only |
| iOS | `AccessibilityNotification.Announcement("Saved").post()` (SwiftUI, iOS 17+) / `UIAccessibility.post(notification: .announcement, argument:)`; `.layoutChanged` / `.screenChanged` for bigger changes | same, with high priority attributes when needed |
| Android | Compose `semantics { liveRegion = LiveRegionMode.Polite }`; Views `accessibilityLiveRegion="polite"` | `LiveRegionMode.Assertive` sparingly; never on timers or fast-changing values |
| React Native | `AccessibilityInfo.announceForAccessibility("Saved")` (both platforms); `accessibilityLiveRegion` works on **Android only** | `announceForAccessibilityWithOptions(msg, { queue: false })` (iOS) |
| Flutter | `SemanticsService.announce("Saved", TextDirection.ltr)`; `Semantics(liveRegion: true)` | same |

Rules:
- Announce **meaningful** changes once, in a few words. Don't announce every keystroke, timer tick or animation frame.
- Prefer polite. Assertive interrupts whatever the user is hearing.
- Don't rely on a toast alone for important information (see [components/toast-snackbar.md](components/toast-snackbar.md)).

## Language (Required, 3.1.1 and 3.1.2)

- Web: `<html lang="en">`; `lang="fr"` on passages in another language. Screen readers switch pronunciation.
- Native: the system locale covers the app; mark other-language passages with `accessibilityLanguage` (iOS, React Native), `LocaleSpan` (Android), `TextSpan.locale` (Flutter).

## Sources
WCAG 2.2 (1.3.1, 1.3.2, 2.4.1, 2.4.2, 2.4.6, 3.1.1, 3.1.2, 4.1.3); Matuzović (2017) on hiding techniques and order; Allan (2026, foundations, links); Apple HIG VoiceOver; Android Compose semantics; React Native docs; Flutter docs.
