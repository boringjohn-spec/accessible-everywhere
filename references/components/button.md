# Button (including icon buttons and toggle buttons)

> A button does something on this screen. Use the platform's real button, give it a name that says the action, expose its state if it toggles, and make it big enough.

## Use it when
- Something happens here: save, submit, open a dialog, play, add to cart, expand.
- **Not** for going somewhere (that's a [link](link.md)); **not** for an on/off setting that takes effect immediately (that's a switch, see [choice-controls.md](choice-controls.md)).

## Contract
| # | Requirement | Tier | SC |
|---|---|---|---|
| 1 | Native button element/component, so it's focusable, has the button role and works with Enter/Space, tap, switch and voice | Required | 2.1.1, 4.1.2 |
| 2 | Accessible name = the visible text. Icon-only buttons get a label naming the **action** ("Search", "Close"), not the icon ("magnifying glass") or the role ("Search button") | Required | 1.1.1, 4.1.2 |
| 3 | If there's visible text, the accessible name contains it, at the start | Required | 2.5.3 |
| 4 | Toggle buttons expose their on/off state; don't also change the label (pick one) | Required | 4.1.2 |
| 5 | Visible focus indicator, 3:1 | Required | 2.4.7, 1.4.11 |
| 6 | Text 4.5:1 against the button fill; the button's shape (fill or border) 3:1 against the page if it's the only thing identifying it as a button | Required | 1.4.3, 1.4.11 |
| 7 | Target ≥ 24×24px; 44pt iOS / 48dp Android | Required / Platform | 2.5.8 |
| 8 | Activates on release, not touch-down | Required | 2.5.2 |
| 9 | Disabled buttons explain why, or stay enabled and validate on press | Recommended | 3.3.1 |
| 10 | Icon-only buttons have a visible hint too (tooltip on hover **and** focus, or a text label) for people who don't know the icon | Recommended | (cognitive) |

## Design notes
- Buttons should look like buttons (fill or border), not just coloured text; "controls look like controls" helps cognitive accessibility.
- Spec the accessible name of every icon-only button in the handoff.
- **Disabled is often the wrong choice.** A greyed-out "Continue" with no reason leaves people stuck, and native `disabled` removes it from keyboard focus and sometimes from screen readers. Prefer: keep it enabled, validate on press, show what's missing. If you must disable, say why next to it.
- Destructive buttons: label with the outcome ("Delete project"), not "OK"; put them away from the main action; confirm or offer undo.

## Web
```html
<button type="button">Save changes</button>

<!-- Icon-only -->
<button type="button" aria-label="Search">
  <svg aria-hidden="true" focusable="false">…</svg>
</button>

<!-- Toggle: fixed label + aria-pressed -->
<button type="button" aria-pressed="false">Bold</button>

<!-- "Disabled" that stays focusable and explains itself -->
<button type="submit" aria-disabled="true" aria-describedby="pay-why">Pay now</button>
<p id="pay-why">Add a delivery address to continue.</p>
```
- Always set `type` (`button` or `submit`); inside a form the default is `submit`.
- `aria-disabled="true"` doesn't block clicks; stop the action in your handler and style it as unavailable.
- Never `<div onclick>` or `<a href="#" onclick>` for actions. If you're stuck with a non-button, it needs `role="button"`, `tabindex="0"`, and Enter **and** Space handlers; that's why you should use `<button>`.
- Don't use the `title` attribute as the name.

## iOS
```swift
Button("Save changes") { save() }

Button { search() } label: { Image(systemName: "magnifyingglass") }
  .accessibilityLabel("Search")

// Toggle button: use a Toggle with button style, or expose selection
Toggle("Bold", isOn: $isBold).toggleStyle(.button)

Button { isFavourite.toggle() } label: {
  Image(systemName: isFavourite ? "heart.fill" : "heart")
}
.accessibilityLabel("Favourite")
.accessibilityAddTraits(isFavourite ? .isSelected : [])
```
- SF Symbols sometimes get an automatic label from the symbol name; replace it with the action.
- UIKit: `button.accessibilityLabel = "Search"`; custom `UIView` buttons need `isAccessibilityElement = true`, `accessibilityTraits = .button`.
- Voice Control alternatives: `.accessibilityInputLabels(["Search", "Find"])`.
- Disabled: `.disabled(true)` adds the "dimmed" trait.

## Android
```kotlin
Button(onClick = ::save) { Text("Save changes") }

IconButton(onClick = ::search) {
  Icon(Icons.Default.Search, contentDescription = "Search")
}

IconToggleButton(checked = isFavourite, onCheckedChange = { isFavourite = it }) {
  Icon(
    if (isFavourite) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
    contentDescription = "Favourite"
  )
}
```
- Don't put the role in `contentDescription` ("Search button"); TalkBack adds "button".
- Text buttons need **no** `contentDescription`. Adding one replaces the visible text and breaks Voice Access.
- Custom clickable: `Modifier.clickable(role = Role.Button, onClickLabel = "Save draft") { … }` and ensure 48dp (`minimumInteractiveComponentSize()`).
- Views: `ImageButton` + `android:contentDescription="@string/search"`.

## React Native
```tsx
<Pressable onPress={save} accessibilityRole="button" style={{ minHeight: 44 }}>
  <Text>Save changes</Text>
</Pressable>

<Pressable onPress={search} accessibilityRole="button" accessibilityLabel="Search" hitSlop={10}>
  <SearchIcon />
</Pressable>

<Pressable
  onPress={() => setBold(b => !b)}
  accessibilityRole="togglebutton"
  accessibilityState={{ checked: isBold }}
>
  <Text>Bold</Text>
</Pressable>
```
- Touchables wrapping only an icon or image have **no name**; always add `accessibilityLabel`.
- `disabled` on `Pressable` sets the disabled state for assistive technology.
- Keep `accessibilityHint` rare: Android always reads hints.

## Flutter
```dart
ElevatedButton(onPressed: save, child: const Text('Save changes'));

IconButton(
  onPressed: search,
  icon: const Icon(Icons.search),
  tooltip: 'Search', // also becomes the accessible label
);
```
- `onPressed: null` makes the button disabled (and announced as such).
- Toggle buttons: Material 3 `IconButton(isSelected: …)`; check with TalkBack/VoiceOver that the state is announced, and if not wrap the control in `Semantics(toggled: …)`.
- Custom tappables (`GestureDetector`, `InkWell` on a container) need `Semantics(button: true, label: …)` and a 48×48 size.

## Common mistakes
- Icon-only button with no name ("button, button, button").
- `aria-label` / `contentDescription` that doesn't include the visible text.
- Clickable `div`, `View` or `GestureDetector` instead of a button.
- `outline: none` with no replacement focus style.
- Disabled submit buttons with no explanation.
- Label changes **and** pressed state both used on a toggle ("Mute, pressed" → "Unmute, not pressed").

## Test it
- Tab/swipe to it: you hear the action name, "button", and the state if it toggles.
- Activate with Enter and Space (web), double-tap (screen reader), switch select, and by saying its visible label (Voice Control / Voice Access).
- Focus ring visible; target ≥ 44pt / 48dp on device.
- Automated: axe `button-name`; jsx-a11y `control-has-associated-label`; Compose/Espresso checks (label, target); Flutter `labeledTapTargetGuideline`.

## Sources
Allan, *Accessibility by Default: Buttons* (2026); Hausler (2015); Android Developers (contentDescription rules); Apple SwiftUI accessibility modifiers; React Native docs; Flutter docs; WCAG 2.2.
