# Tabs (and segmented controls, bottom tab bars)

> Tabs switch between a few related, equal views in the same place. Expose which tab is selected, how many there are, and on the web make the tab list one Tab stop with arrow keys inside.

## Use it when
- A small number (2–7) of **related, peer** views where people look at one at a time: Description / Reviews / Specs.
- On mobile: top-level app sections (**bottom tab bar**) or a view switch (**segmented control**).
- **Not** when people need to compare sections side by side (show them together), not for sequential steps (use a stepper), not for unrelated content, and not for long content that people need to scan (use headings or an [accordion](accordion-disclosure.md)).

## Contract
| # | Requirement | Tier | SC |
|---|---|---|---|
| 1 | Tabs announce their role, label, **selected** state and position ("Reviews, tab, 2 of 3, selected") | Required | 4.1.2, 1.3.1 |
| 2 | The selected tab is shown by more than colour (underline, weight, fill) | Required | 1.4.1 |
| 3 | Selected indicator and tab text meet contrast (3:1 indicator, 4.5:1 text) | Required | 1.4.11, 1.4.3 |
| 4 | Web: the tab list is **one Tab stop**; Left/Right (or Up/Down if vertical) move between tabs; Home/End optional; Tab moves into the panel | Required (keyboard) / APG convention | 2.1.1 |
| 5 | Panels are labelled by their tab; hidden panels are hidden from everyone | Required | 1.3.1 |
| 6 | Switching tabs doesn't move focus into the panel or scroll the page unexpectedly | Required | 3.2.1, 3.2.2 |
| 7 | Bottom tab bars: icons have text labels (or, at minimum, accessible names), and stay usable at large text (iOS Large Content Viewer) | Required / Platform | 1.1.1, 1.4.4 |

## Design notes
- Visible text labels on tabs. Icon-only tabs fail people who don't know the icons and voice users who need a name to say.
- Don't scroll tabs horizontally off-screen with no indication; if tabs overflow, show that more exist.
- Keep tab order the same across screens (consistency).

## Web
```html
<div role="tablist" aria-label="Product details">
  <button role="tab" id="t-desc" aria-selected="true"  aria-controls="p-desc" tabindex="0">Description</button>
  <button role="tab" id="t-rev"  aria-selected="false" aria-controls="p-rev"  tabindex="-1">Reviews</button>
  <button role="tab" id="t-spec" aria-selected="false" aria-controls="p-spec" tabindex="-1">Specs</button>
</div>
<div role="tabpanel" id="p-desc" aria-labelledby="t-desc" tabindex="0">…</div>
<div role="tabpanel" id="p-rev"  aria-labelledby="t-rev"  tabindex="0" hidden>…</div>
<div role="tabpanel" id="p-spec" aria-labelledby="t-spec" tabindex="0" hidden>…</div>
```
- **Roving tabindex:** only the selected tab has `tabindex="0"`; the rest `-1`. Arrow keys move focus and update `tabindex`.
- **Automatic activation** (arrow selects immediately) when panels show instantly; **manual activation** (arrow moves, Enter/Space selects) when panels load slowly.
- Panel `tabindex="0"` only if it has no focusable content of its own.
- If the "tabs" change the URL (navigation tabs), they're really a `<nav>` of links with `aria-current="page"`, not a tablist.

## iOS
- `TabView` (bottom tabs) and `Picker(...).pickerStyle(.segmented)` expose tab role, position and selection automatically.
- Custom tab bars: each item `.accessibilityAddTraits(.isButton)` + `.isSelected` when chosen, `.accessibilityLabel("Reviews")`, and `accessibilityValue("2 of 3")` if the position isn't otherwise clear. Add `accessibilityShowsLargeContentViewer` to bar items that can't grow with Dynamic Type.

## Android
- Compose `TabRow` / `PrimaryTabRow` + `Tab(selected, onClick, text)` and `NavigationBar` + `NavigationBarItem` set `Role.Tab` and selection.
- Custom tabs: `Modifier.selectable(selected, role = Role.Tab, onClick)` on each, inside a `selectableGroup()`.
- Always set `label`/`text`, not just an icon.

## React Native
```tsx
<View accessibilityRole="tablist">
  {tabs.map((t, i) => (
    <Pressable key={t.key} accessibilityRole="tab"
      accessibilityState={{ selected: t.key === current }}
      accessibilityLabel={t.label}
      onPress={() => setCurrent(t.key)}>
      <Text>{t.label}</Text>
    </Pressable>
  ))}
</View>
```
- React Navigation's tab navigators set roles and selection for you; give every tab a `tabBarAccessibilityLabel` if the label is hidden.

## Flutter
- `TabBar` + `TabBarView`, `NavigationBar`, `BottomNavigationBar` and `CupertinoTabBar` expose tab semantics and selection. Give each `Tab` / destination a text label.
- Custom tabs: `Semantics(selected: isSelected, button: true, label: 'Reviews', child: …)`.

## Common mistakes
- Selected state only by colour.
- Every tab a separate Tab stop with no arrow-key support (web) or no "selected" state (mobile).
- Icon-only bottom tabs with no names.
- Hidden panels still in the tab order.
- Tabs used for steps of a process.

## Test it
- Screen reader: each tab says name, "tab", position and "selected".
- Keyboard (web): Tab reaches the selected tab, arrows move, Tab goes into the panel.
- Largest text: tab labels readable (or Large Content Viewer on long press).
- Automated: axe `aria-required-children`, `aria-required-parent`, `aria-allowed-attr`.

## Sources
Allan, *Accessibility by Default: Tabs, Accordions and Disclosures* (2026); WAI-ARIA Authoring Practices (tabs pattern); Apple HIG; Android Compose; React Native docs; Flutter docs; WCAG 2.2.
