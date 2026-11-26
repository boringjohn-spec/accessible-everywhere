# Accordion and disclosure (expand / collapse)

> A button that shows or hides content, announces whether it's expanded, sits inside a heading when it titles a section, and hides collapsed content from everyone.

## Use it when
| Pattern | For |
|---|---|
| **Disclosure** | One optional block: "Show advanced options", "Read more", order details in a row |
| **Accordion** | Several independent sections people open one or more of: FAQs, settings groups, long forms on mobile |
- **Not** for primary content people need (show it); not when people need to compare sections (show them together, or use [tabs](tabs.md) for peer views); not for every piece of content "to save space".

## Contract
| # | Requirement | Tier | SC |
|---|---|---|---|
| 1 | The trigger is a real button (focusable, Enter/Space, tap) | Required | 2.1.1, 4.1.2 |
| 2 | It announces **expanded / collapsed** | Required | 4.1.2 |
| 3 | Accordion triggers sit inside headings, so heading navigation still finds the sections | Required | 1.3.1 |
| 4 | Collapsed content is hidden from everyone (not just visually) | Required | 1.3.1, 2.4.3 |
| 5 | The state isn't shown only by a chevron's colour; the chevron rotates or changes shape, and the trigger text is clear | Required | 1.4.1 |
| 6 | Opening doesn't move focus or scroll unexpectedly | Required | 3.2.1 |
| 7 | Browser find-in-page can open collapsed sections (web, `hidden="until-found"`) | Recommended | — |

## Web
```html
<!-- Disclosure: native -->
<details>
  <summary>Show advanced options</summary>
  <p>…</p>
</details>

<!-- Accordion: button inside heading -->
<h3>
  <button type="button" aria-expanded="false" aria-controls="faq-1-panel" id="faq-1">
    Can I change my delivery date?
  </button>
</h3>
<div id="faq-1-panel" role="region" aria-labelledby="faq-1" hidden>
  <p>Yes, up to 24 hours before dispatch.</p>
</div>
```
- `<details>`/`<summary>` handles the button role and expanded state natively. `<details name="faq">` on several makes an exclusive accordion (one open at a time).
- Custom: toggle `aria-expanded` **and** `hidden` together.
- Use `role="region"` on panels only when there are a few (up to about 6); more becomes landmark noise.
- `hidden="until-found"` keeps content findable with Ctrl/Cmd+F where supported.

## iOS
- SwiftUI `DisclosureGroup("Advanced options") { … }` announces expanded/collapsed and handles the action.
- Custom rows: the header is a `Button` with `.accessibilityValue(isOpen ? "Expanded" : "Collapsed")` (or a hint), plus `.accessibilityAddTraits(.isHeader)` when it titles a section. Remove collapsed content from the hierarchy (don't just shrink it to zero height).

## Android
```kotlin
Row(
  Modifier
    .clickable(onClickLabel = if (expanded) "Collapse" else "Expand") { expanded = !expanded }
    .semantics {
      heading()
      stateDescription = if (expanded) "Expanded" else "Collapsed"
      if (expanded) collapse { expanded = false; true } else expand { expanded = true; true }
    }
) { Text("Can I change my delivery date?"); Icon(chevron, contentDescription = null) }
if (expanded) { Text("Yes, up to 24 hours before dispatch.") }
```
- Compose `semantics { expand { } / collapse { } }` exposes TalkBack's expand/collapse actions.
- Views: `ViewCompat.setStateDescription()` and `AccessibilityActionCompat.ACTION_EXPAND` / `ACTION_COLLAPSE`.

## React Native
```tsx
<Pressable accessibilityRole="button" accessibilityState={{ expanded: open }}
  onPress={() => setOpen(o => !o)}>
  <Text accessibilityRole="header">Can I change my delivery date?</Text>
</Pressable>
{open && <Text>Yes, up to 24 hours before dispatch.</Text>}
```
- Render collapsed content conditionally (don't hide it with `height: 0`).

## Flutter
- `ExpansionTile` (and `ExpansionPanelList`) expose expanded/collapsed and handle tap and keyboard.
- Custom: `Semantics(button: true, expanded: isOpen, header: true, child: …)` (the `expanded` flag exists in recent Flutter versions; check yours) and build the body only when open.

## Common mistakes
- Header text is clickable but isn't a button.
- No expanded/collapsed state; only a rotating icon shows it.
- Collapsed content still focusable or read by screen readers (hidden with height or opacity).
- Accordions hiding everything, so people must open every section to find anything.

## Test it
- Screen reader: hear "button, collapsed"; activate; hear "expanded"; the content follows in reading order.
- Heading navigation still lists each section.
- Keyboard: Tab to each trigger, Enter/Space toggles; collapsed content is skipped.
- Automated: axe `aria-allowed-attr`, `button-name`; check `aria-expanded` sync in unit tests.

## Sources
Allan, *Accessibility by Default: Tabs, Accordions and Disclosures* (2026); WAI-ARIA Authoring Practices (accordion, disclosure); Android Compose semantics (expand/collapse, stateDescription); Apple SwiftUI; React Native (`expanded` state); Flutter; WCAG 2.2.
