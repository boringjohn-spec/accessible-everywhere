# Slider

> For picking an approximate value from a range. Use the native slider, name what it controls, expose a meaningful value, and make it work without dragging.

## Use it when
- Approximate values where feel matters more than precision: volume, brightness, zoom, playback position, a price range filter.
- **Not** for exact values (money, age, quantities): use a text or number field, or a stepper. Nobody should have to drag to exactly £57.24.

## Contract
| # | Requirement | Tier | SC |
|---|---|---|---|
| 1 | Native slider (or full slider semantics: role, min, max, current value) | Required | 4.1.2 |
| 2 | A name that says what it controls ("Volume"), not "slider" | Required | 1.1.1, 4.1.2 |
| 3 | The value is meaningful when spoken ("20 °C", "Medium", "£40 to £120"), not just a raw number | Required | 4.1.2 |
| 4 | Works **without dragging**: arrow keys (web), swipe up/down (screen readers), tap on the track, or +/− buttons or a paired input | Required | 2.5.7, 2.1.1 |
| 5 | Thumb and the filled track 3:1 against the background; visible focus | Required | 1.4.11, 2.4.7 |
| 6 | Thumb target ≥ 24px (44pt / 48dp) | Required / Platform | 2.5.8 |
| 7 | Two-thumb range: two separately named sliders ("Minimum price", "Maximum price") | Required | 4.1.2 |

## Web
```html
<label for="volume">Volume</label>
<input id="volume" type="range" min="0" max="100" step="5" value="40">

<!-- Custom slider (only if you must) -->
<div role="slider" tabindex="0" aria-label="Temperature"
     aria-valuemin="10" aria-valuemax="30" aria-valuenow="20" aria-valuetext="20 °C"></div>
```
- Keys for custom sliders: Right/Up increase, Left/Down decrease, **Page Up/Down** big steps, **Home/End** min/max.
- `aria-valuetext` only when the number alone isn't meaningful.
- Vertical: `aria-orientation="vertical"`, and the keys must match the visual direction.
- Pair with a number input when precise values are sometimes needed.

## iOS
```swift
Slider(value: $volume, in: 0...100, step: 5) { Text("Volume") }
  .accessibilityValue("\(Int(volume)) percent")
```
- `Slider` is adjustable: VoiceOver users swipe up/down.
- Custom controls: `.accessibilityElement()`, `.accessibilityLabel("Volume")`, `.accessibilityValue(…)`, `.accessibilityAdjustableAction { direction in … }`.
- Stepper is a good exact-value alternative.

## Android
```kotlin
Slider(
  value = volume, onValueChange = { volume = it }, valueRange = 0f..100f, steps = 19,
  modifier = Modifier.semantics { contentDescription = "Volume"; stateDescription = "${volume.toInt()} percent" }
)
```
- Material `Slider`/`RangeSlider` expose progress semantics and TalkBack adjustment (volume keys or swipe).
- Custom: `Modifier.progressSemantics(value, range, steps)` or `semantics { setProgress { … } }`.

## React Native
```tsx
<View
  accessible
  accessibilityRole="adjustable"
  accessibilityLabel="Volume"
  accessibilityValue={{ min: 0, max: 100, now: volume, text: `${volume} percent` }}
  accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
  onAccessibilityAction={e => {
    if (e.nativeEvent.actionName === 'increment') setVolume(v => Math.min(100, v + 5));
    if (e.nativeEvent.actionName === 'decrement') setVolume(v => Math.max(0, v - 5));
  }}
>
  {/* track + thumb */}
</View>
```
- With the newer props: `role="slider"`, `aria-valuemin/max/now/text`.
- The label names the purpose; don't put the value in the label ("Slider with value 40" is wrong).

## Flutter
```dart
Slider(
  value: volume, min: 0, max: 100, divisions: 20,
  label: '${volume.round()}%',        // shown on the value indicator
  semanticFormatterCallback: (v) => '${v.round()} percent',
  onChanged: (v) => setState(() => volume = v),
);
```
- Put the name in a visible `Text` next to it and merge them (`MergeSemantics`), or wrap in `Semantics(label: 'Volume')`.
- `RangeSlider` for ranges.

## Common mistakes
- Gesture-only custom sliders (pan handlers) that screen reader users can't adjust.
- Label that repeats role or value; value without units.
- Tiny thumbs; thumbs that don't show focus.
- Sliders for exact amounts.

## Test it
- Keyboard: arrows, Page Up/Down, Home/End.
- VoiceOver/TalkBack: hear "Volume, 40 percent, adjustable"; swipe up/down changes it.
- No-drag check: can you set it with taps or buttons only?
- Automated: axe `aria-input-field-name`, `aria-required-attr`; Compose/Espresso checks.

## Sources
Allan, *Accessibility by Default: Sliders and Tooltips* (2026); Kumar (2025, React Native slider, with corrections); WAI-ARIA Authoring Practices (slider); Apple SwiftUI (`accessibilityAdjustableAction`); Android Compose; React Native docs; Flutter docs; WCAG 2.2 (2.5.7).
