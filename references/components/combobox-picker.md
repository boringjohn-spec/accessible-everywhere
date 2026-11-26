# Combobox, select and picker

> Prefer the native select or picker. Build a combobox only when people need to type to filter a long list, and then keep focus in the input, announce the highlighted option and the number of results, and close with Escape.

## Use it when
| Need | Use |
|---|---|
| One choice from a short known list (under ~20) | Native `<select>`, iOS `Picker`/menu, Android `ExposedDropdownMenuBox`, Flutter `DropdownMenu` |
| One choice from a long list (countries, airports) | Combobox with list autocomplete (typing filters; the value must be in the list) |
| Free text with suggestions (search) | Combobox where any value is allowed |
| Narrowing a list already on screen | A filter field + the list, not a combobox |
| Many choices at once | Checkbox list or a multi-select listbox, not a custom tag picker if you can avoid it |

Don't put buttons (edit, delete) inside options: it stops being a listbox and no assistive technology can explain it.

## Contract
| # | Requirement | Tier | SC |
|---|---|---|---|
| 1 | Visible label tied to the input | Required | 3.3.2, 1.3.1 |
| 2 | Role and state exposed: combobox, expanded/collapsed, the options list, the selected option | Required | 4.1.2 |
| 3 | Keyboard: Down opens/moves, Up moves, Enter selects, Escape closes (and clears if already closed), typing filters | Required | 2.1.1 |
| 4 | The highlighted option is announced as people move through it; real focus stays in the input | Required | 4.1.2 |
| 5 | Result changes are announced without moving focus ("5 results", "No results", "Loading") | Required | 4.1.3 |
| 6 | Options reachable by touch screen readers (swipe) on mobile web and in apps | Required | 2.1.1, 4.1.2 |
| 7 | Choosing an option doesn't submit the form or navigate by itself | Required | 3.2.2 |
| 8 | Popup content meets 1.4.13 if it appears on hover/focus (dismissible, hoverable, persistent) | Required | 1.4.13 |

## Web
```html
<label for="country">Country</label>
<input id="country" type="text" role="combobox" aria-autocomplete="list"
       aria-expanded="false" aria-controls="country-list" autocomplete="country-name">
<ul id="country-list" role="listbox" aria-label="Countries" hidden>
  <li id="opt-gh" role="option" aria-selected="false">Ghana</li>
  <li id="opt-gr" role="option" aria-selected="false">Greece</li>
</ul>
<div role="status" class="visually-hidden" id="country-status"></div>
```
- Script keeps in sync: `aria-expanded`, `hidden`, **`aria-activedescendant`** on the input (the highlighted option's id), `aria-selected` on the chosen option, and the status text ("2 suggestions").
- `aria-autocomplete` must match what it does: `list`, `inline`, `both` or `none`.
- `aria-haspopup="listbox"` is implied for comboboxes; set it only for grid, tree or dialog popups.
- Active ≠ selected: `aria-activedescendant` is where you are; `aria-selected` is what's chosen.
- Strongly prefer a tested implementation (React Aria `useComboBox`, Downshift, Headless UI) over writing this by hand.
- Native `<select>` is accessible everywhere; the newer customizable select (`appearance: base-select`) keeps native semantics where supported.

## iOS
- Use `Picker` (menu, wheel, inline, navigation-link styles) or `Menu`; they're fully accessible.
- Search with suggestions: `.searchable(text:)` + `.searchSuggestions { … }`; announce result counts with `AccessibilityNotification.Announcement`.

## Android
```kotlin
ExposedDropdownMenuBox(expanded = expanded, onExpandedChange = { expanded = it }) {
  OutlinedTextField(
    value = selected, onValueChange = {}, readOnly = true,
    label = { Text("Country") },
    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded) },
    modifier = Modifier.menuAnchor(MenuAnchorType.PrimaryNotEditable) // Material3 1.4+: ExposedDropdownMenuAnchorType
  )
  ExposedDropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
    countries.forEach { c -> DropdownMenuItem(text = { Text(c) }, onClick = { selected = c; expanded = false }) }
  }
}
```
- Editable (type-to-filter) uses `MenuAnchorType.PrimaryEditable`; announce result counts with a polite live region.
- Views: `MaterialAutoCompleteTextView` inside `TextInputLayout`.

## React Native
- There's no core select. Use a well-maintained picker that maps to native controls (`@react-native-picker/picker`), or a full-screen searchable list in a `<Modal>` with a labelled search field, list items with `accessibilityRole="button"` (or `radio` + `checked`), and an announcement of the result count.
- Custom dropdowns drawn as absolutely positioned views often can't be reached by TalkBack/VoiceOver swipes; test on devices.

## Flutter
- `DropdownMenu` (Material 3, supports typing to filter), `DropdownButton`, `Autocomplete`, `CupertinoPicker`. These expose semantics; give them a `label`.
- Announce changing result counts with `SemanticsService.announce`.

## Common mistakes
- A custom dropdown made of divs or views with no roles, no keyboard and no screen reader access.
- Focus moved into the list (breaks typing) or lost when the list closes.
- Results update silently.
- Options with nested buttons.
- Selecting an option triggers navigation (a "jump menu").

## Test it
- Keyboard: type, arrows, Enter, Escape behave as above; focus stays in the input.
- Screen reader: hear the label, "combo box, collapsed"; typing announces the count; arrowing announces each option; selection is announced.
- Mobile: swipe through options with VoiceOver/TalkBack and double-tap to choose.
- Automated: axe `aria-required-children`, `aria-input-field-name`; unit tests that `aria-activedescendant` points at a real option.

## Sources
Allan, *Accessibility by Default: Comboboxes* (2026); Hausler (2015, "component identity crisis"); WAI-ARIA Authoring Practices (combobox, listbox); Android Compose Material 3; Apple SwiftUI; React Native; Flutter; WCAG 2.2.
