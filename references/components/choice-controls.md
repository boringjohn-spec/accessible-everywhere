# Checkbox, radio group and switch

> Use the native control, make the label part of the tap target, group related options under a name, and expose the checked state. A switch is for a setting that applies immediately; a checkbox is for choices you submit.

## Use it when
| Control | Use for | Not for |
|---|---|---|
| **Checkbox** | Independent yes/no choices, or picking several from a list; agreeing to terms | Instant settings (switch); one-of-many (radio) |
| **Radio group** | Exactly one choice from 2–7 visible options | Long lists (use a select/picker); choices that act instantly |
| **Switch** | An on/off **setting that takes effect immediately** (Wi-Fi, notifications, dark mode) | Choices in a form you submit later; actions ("Save" is a button) |

## Contract
| # | Requirement | Tier | SC |
|---|---|---|---|
| 1 | Native control with role and state (checked / unchecked / mixed; selected; on / off) | Required | 4.1.2 |
| 2 | Visible label tied to the control; tapping the label toggles it (one target) | Required | 1.3.1, 3.3.2, 2.5.8 |
| 3 | Groups have a name ("Contact methods") announced with the options | Required | 1.3.1 |
| 4 | The checked state isn't shown by colour alone (check mark, knob position, I/O mark) | Required | 1.4.1 |
| 5 | Box, circle, track and thumb 3:1 against the background in every state | Required | 1.4.11 |
| 6 | Keyboard: Space toggles a checkbox and switch; a radio group is one Tab stop, arrows move and select | Required | 2.1.1 |
| 7 | Changing a choice doesn't jump the user elsewhere or submit (unless announced beforehand) | Required | 3.2.2 |
| 8 | Target: whole row (label + control) ≥ 44pt / 48dp | Platform | 2.5.8 |

## Design notes
- Make the entire row the target (label, description and control).
- Don't use a switch inside a form that has a Submit button; the state is ambiguous ("is it saved?").
- Show switch state with more than colour: the knob position plus, ideally, an on/off mark or a text value ("On").
- "Select all" with some selected = **mixed** state; design and expose it.

## Web
```html
<fieldset>
  <legend>Contact methods</legend>
  <label><input type="checkbox" name="contact" value="email"> Email</label>
  <label><input type="checkbox" name="contact" value="sms"> Text message</label>
</fieldset>

<fieldset>
  <legend>Delivery speed</legend>
  <label><input type="radio" name="speed" value="std" checked> Standard (3–5 days)</label>
  <label><input type="radio" name="speed" value="exp"> Express (next day)</label>
</fieldset>

<!-- Switch: a checkbox with role="switch", or a button -->
<label><input type="checkbox" role="switch" checked> Email notifications</label>
<button type="button" role="switch" aria-checked="true">Email notifications</button>
```
- Custom-styled checkboxes: visually hide the native input (don't `display:none` it) and style a sibling, so semantics and keyboard stay. Keep a visible focus ring on the styled box.
- Indeterminate: set `input.indeterminate = true` in JS (announced as "mixed").
- Radios with the same `name` form a group; the browser handles arrow keys.

## iOS
```swift
Toggle("Email notifications", isOn: $emailOn)           // switch: label + state built in

// Checkbox-style row (iOS has no native checkbox)
Button { agree.toggle() } label: {
  Label("I agree to the terms", systemImage: agree ? "checkmark.square.fill" : "square")
}
.accessibilityAddTraits(.isToggle)                       // iOS 17+
.accessibilityValue(agree ? "Checked" : "Unchecked")

// Radio-style choice: Picker, or a list with checkmarks
Picker("Delivery speed", selection: $speed) {
  Text("Standard").tag(Speed.standard)
  Text("Express").tag(Speed.express)
}.pickerStyle(.inline)
```
- Custom list choices: put `.accessibilityAddTraits(.isSelected)` on the chosen row and group the rows under a header.

## Android
```kotlin
// Whole row is the target; the Checkbox itself has no click handler
Row(
  Modifier
    .toggleable(value = checked, role = Role.Checkbox, onValueChange = { checked = it })
    .padding(16.dp)
) {
  Checkbox(checked = checked, onCheckedChange = null)
  Text("Email")
}

Column(Modifier.selectableGroup()) {
  options.forEach { option ->
    Row(Modifier.selectable(selected = option == selected, role = Role.RadioButton, onClick = { selected = option })) {
      RadioButton(selected = option == selected, onClick = null)
      Text(option.label)
    }
  }
}

Row(Modifier.toggleable(value = on, role = Role.Switch, onValueChange = { on = it })) {
  Text("Email notifications", Modifier.weight(1f))
  Switch(checked = on, onCheckedChange = null)
}
```
- `TriStateCheckbox` for mixed. Put the group name in a heading or `semantics { contentDescription }` on the group.
- Views: `CheckBox`, `RadioGroup` + `RadioButton`, `SwitchMaterial`/`MaterialSwitch` with text set (not a separate `TextView`).

## React Native
```tsx
<Pressable
  accessibilityRole="checkbox"
  accessibilityState={{ checked }}   // true | false | 'mixed'
  onPress={() => setChecked(c => !c)}
>
  <CheckIcon checked={checked} /><Text>Email</Text>
</Pressable>

<View accessibilityRole="radiogroup" accessibilityLabel="Delivery speed">
  {options.map(o => (
    <Pressable key={o.id} accessibilityRole="radio"
      accessibilityState={{ checked: o.id === speed }} onPress={() => setSpeed(o.id)}>
      <Text>{o.label}</Text>
    </Pressable>
  ))}
</View>

<Switch value={on} onValueChange={setOn} accessibilityLabel="Email notifications" />
```
- The core `Switch` needs an `accessibilityLabel` (or wrap it with its text in one accessible row).

## Flutter
```dart
CheckboxListTile(value: email, onChanged: (v) => setState(() => email = v!), title: const Text('Email'));
SwitchListTile(value: on, onChanged: (v) => setState(() => on = v), title: const Text('Email notifications'));
RadioListTile<Speed>(value: Speed.standard, groupValue: speed, onChanged: setSpeed, title: const Text('Standard'));
```
- The `…ListTile` widgets merge label and control into one target and one announcement. Use them instead of a bare `Checkbox` next to a `Text`.
- `Checkbox(tristate: true)` for mixed. Recent Flutter versions add a `RadioGroup` ancestor for radios; follow the API of the version you're on.

## Common mistakes
- Label not clickable; tiny checkbox as the only target.
- Custom checkbox made of a `div`/`View` with no role or state.
- Switches used in forms that need a Save; switches that need a confirmation.
- Selected state shown only by colour (filled vs outlined in similar hues).
- Radio groups with no group label.

## Test it
- Screen reader: hear the group name, the option label, the role and the state; toggle and hear the new state.
- Keyboard: Space toggles; arrows move through radios.
- Greyscale: checked vs unchecked still obvious.
- Automated: axe `label`, `aria-toggle-field-name`; jsx-a11y `label-has-associated-control`; Flutter `labeledTapTargetGuideline`.

## Sources
Allan, *Accessibility by Default: Form Controls* (2026); Android Compose accessibility; Apple SwiftUI accessibility; React Native docs; Flutter docs; WCAG 2.2.
