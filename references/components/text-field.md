# Text field

> Every field has a visible label tied to it, says what it wants before people type, keeps its label while they type, fills itself where it can, and explains errors in words next to the field.

## Use it when
- Free text or numbers people type: names, emails, search, amounts, messages.
- For a choice from a known list, use a select/picker or radios; for a value in a range where exactness doesn't matter, a [slider](slider.md); never a slider for exact values (money, age).

## Contract
| # | Requirement | Tier | SC |
|---|---|---|---|
| 1 | A **visible label** that stays visible while typing, programmatically tied to the field | Required | 1.3.1, 3.3.2, 4.1.2 |
| 2 | Placeholder is never the only label; if used, it's an example and has 4.5:1 | Required | 3.3.2, 1.4.3 |
| 3 | Hints and format rules (password rules, date format) shown **before** typing and tied to the field | Required | 3.3.2 |
| 4 | Input purpose declared for personal data (`autocomplete` / content type / autofill hints) | Required | 1.3.5 |
| 5 | Required fields marked in text or a programmatic flag, not colour or `*` alone | Required | 1.3.1, 3.3.2 |
| 6 | Errors identify the field and say what's wrong in text, tied to the field and announced; suggest a fix | Required | 3.3.1, 3.3.3, 4.1.3 |
| 7 | Field boundary 3:1 against the background (border or fill) | Required | 1.4.11 |
| 8 | Paste allowed (especially passwords and codes) | Required | 3.3.8 |
| 9 | The right keyboard for the data (email, number, phone) | Platform | — |
| 10 | Accept common format variations (spaces, dashes, +country codes) instead of rejecting them | Recommended | (cognitive) |

## Design notes
- Label above the field (or floating labels that **stay** visible). Placeholder-only fields lose their purpose the moment someone types.
- Field boundaries must be visible: borderless "minimal" inputs hide the target from people with low vision and cognitive disabilities.
- Write the format rule as help text, not only as an error.
- Error state = icon + text + border change, not a red border alone.
- Group related fields (address, card details) with a heading or legend.

## Web
```html
<label for="email">Email address</label>
<p id="email-hint" class="hint">We'll send the receipt here.</p>
<input id="email" name="email" type="email" autocomplete="email"
       aria-describedby="email-hint email-error" aria-invalid="true" required>
<p id="email-error" class="error"><svg aria-hidden="true">…</svg> Enter an email address like name@example.com</p>
```
- Explicit `for`/`id` is the most robust labelling; wrapping `<label>` also works.
- `type` and `inputmode` choose mobile keyboards (`inputmode="numeric"` for codes; avoid `type="number"` for card numbers or codes).
- `autocomplete` tokens: `name`, `given-name`, `family-name`, `email`, `tel`, `street-address`, `postal-code`, `country-name`, `bday`, `cc-number`, `cc-exp`, `username`, `current-password`, `new-password`, `one-time-code`.
- Don't block paste. Don't `autofocus` into the middle of a page.
- Input text ≥ 16px so iOS Safari doesn't zoom the page.

## iOS
```swift
TextField("Email address", text: $email)          // the title is the label
  .textContentType(.emailAddress)
  .keyboardType(.emailAddress)
  .textInputAutocapitalization(.never)
  .accessibilityHint("We'll send the receipt here.") // or show it as visible text

// Visible label above a field:
VStack(alignment: .leading) {
  Text("Email address").accessibilityHidden(true)
  TextField("name@example.com", text: $email)
    .accessibilityLabel("Email address")
}
```
- `UITextField` has no label element: set `accessibilityLabel`, and keep a visible label next to it.
- Errors: show the message as visible text, add it to the field's value or hint, and post an announcement.
- `textContentType`: `.name`, `.emailAddress`, `.telephoneNumber`, `.postalCode`, `.username`, `.password`, `.newPassword`, `.oneTimeCode`.

## Android
```kotlin
OutlinedTextField(
  value = email,
  onValueChange = { email = it },
  label = { Text("Email address") },            // stays visible as a floating label
  supportingText = { Text(error ?: "We'll send the receipt here.") },
  isError = error != null,
  keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
  modifier = Modifier.semantics {
    contentType = ContentType.EmailAddress
    if (error != null) error(error)
  }
)
```
- Views: Material `TextInputLayout` with `hint` (floating label) and `setError()` (announced); `android:autofillHints="emailAddress"`; `labelFor` when the label is a separate `TextView`.
- Don't rely on `android:hint` on a bare `EditText` as the only label: it disappears visually while typing.

## React Native
```tsx
<Text nativeID="emailLabel">Email address</Text>
<TextInput
  accessibilityLabel="Email address"
  accessibilityLabelledBy="emailLabel"   // Android only; keep the label too
  textContentType="emailAddress"          // iOS
  autoComplete="email"                    // Android (and iOS where supported)
  keyboardType="email-address"
  value={email}
  onChangeText={setEmail}
/>
{error && <Text accessibilityLiveRegion="polite">{error}</Text>}
```
- A `Text` label above the input is **not** linked automatically; set `accessibilityLabel`.
- `accessibilityLiveRegion` only works on Android: also call `AccessibilityInfo.announceForAccessibility(error)` for iOS.

## Flutter
```dart
TextField(
  decoration: InputDecoration(
    labelText: 'Email address',     // floating label, stays visible
    helperText: "We'll send the receipt here.",
    errorText: emailError,           // announced as part of the field
  ),
  keyboardType: TextInputType.emailAddress,
  autofillHints: const [AutofillHints.email],
);
```
- Wrap related fields in `AutofillGroup`.
- `hintText` alone is a placeholder, not a label.

## Common mistakes
- Placeholder as the only label; low-contrast placeholder.
- Labels not tied to fields (a `<label>` without `for`, a `Text` above an RN `TextInput`).
- Red border as the only error signal; error shown only after submit at the top of a long page.
- Blocking paste on passwords or codes.
- Formats rejected for spaces or dashes.

## Test it
- Screen reader: focus the field, hear the label, any hint, "required", and the error if present.
- Type with autofill / password manager: fields fill correctly.
- Voice Control: "Tap Email address" focuses the field.
- 200% text / largest Dynamic Type: label, field and error don't overlap or clip.
- Automated: axe `label`, `autocomplete-valid`; jsx-a11y `label-has-associated-control`; Compose checks (missing label).

## Sources
Allan, *Accessibility by Default: Form Controls* (2026); Hausler (2015) on boundaries and placeholders; WCAG 2.2 (1.3.5, 3.3.x) and section 7 Input Purposes; Android Compose semantics (`error()`); Apple SwiftUI; React Native; Flutter; W3C COGA (accept different formats).
