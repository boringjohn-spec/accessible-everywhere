# Targets and spacing

Small or crowded targets fail people with tremors, limited dexterity, large fingers, people on a moving bus, and anyone using a head pointer or switch-driven pointer. Size and spacing are both part of the fix.

## Sizes

| Tier | Rule | Source |
|---|---|---|
| **Required** | Every pointer target is at least **24×24 CSS px**, or is spaced so a 24px-diameter circle centred on it doesn't overlap another target or another small target's circle | WCAG 2.2 2.5.8 |
| **Platform, iOS** | **44×44pt** default control size; 28×28pt absolute minimum | Apple HIG |
| **Platform, Android** | **48×48dp**; Material controls pad themselves to this when they're interactive | Android Developers, Material |
| **Platform, Flutter** | 48×48 (Android) and 44×44 (iOS), checked by `androidTapTargetGuideline` / `iOSTapTargetGuideline` | Flutter docs |
| **Recommended, web** | 44×44 CSS px (WCAG AAA 2.5.5) on touch-first designs; 40×40 is a reasonable dense-desktop floor | WCAG 2.2 2.5.5 |

Exceptions to 2.5.8: links inside a sentence or paragraph; a target with an equivalent full-size control on the same page; controls whose size the browser or OS sets and you haven't changed; and cases where the size is essential or legally required. A slider track or colour picker counts as one target.

## Spacing

- Apple: about **12pt** of padding around controls with a visible bezel, about **24pt** around controls without one.
- Put destructive actions away from frequent ones ("Delete" not touching "Save").
- Never let two hit areas overlap. On Android, Compose extends the touch area of a small clickable beyond its bounds; if that overlaps a neighbour, taps go to the wrong one. Size the element properly instead.

## Making the hit area bigger without changing the look

| Platform | Technique |
|---|---|
| Web | Padding on the interactive element; or a `::before` / `::after` with `position: absolute; inset: -10px` on a `position: relative` control. Don't extend into neighbours. Inline links in text are exempt. |
| iOS (SwiftUI) | `.frame(minWidth: 44, minHeight: 44)` + `.contentShape(Rectangle())` on the button's label. UIKit: override `point(inside:with:)` or enlarge the button's frame. |
| Android (Compose) | `Modifier.minimumInteractiveComponentSize()` (reserves 48dp of layout space and centres the element; put it **before** `size()`), or `sizeIn(minWidth = 48.dp, minHeight = 48.dp)` on the clickable. Views: padding + `minWidth`/`minHeight` reaching 48dp, or a `TouchDelegate`. |
| React Native | `hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}` on `Pressable`, or `minWidth`/`minHeight: 44` (iOS) / 48 (Android). |
| Flutter | Material buttons use `MaterialTapTargetSize.padded` by default (don't set `shrinkWrap` on touch layouts); wrap custom tappables in `SizedBox(width: 48, height: 48)` or `ConstrainedBox(BoxConstraints(minWidth: 48, minHeight: 48))`. |

## Dense interfaces

Tables, toolbars, calendars, code editors and data grids are where small targets creep in. Options, in order:
1. Make rows and cells taller on touch (`@media (pointer: coarse)`, size classes, density settings).
2. Offer a **density setting** (comfortable / compact), defaulting to comfortable on touch.
3. Use the **spacing exception**: smaller targets are fine if each has 24px of clear space around its centre.
4. Provide an **equivalent** larger control (a row-level menu instead of five tiny icons).

## Related rules
- Every drag needs a non-drag alternative (2.5.7) and every multi-finger gesture a single-pointer one (2.5.1). See [components/list-rows-swipe.md](../components/list-rows-swipe.md) and [components/slider.md](../components/slider.md).
- Actions fire on release, not touch-down (2.5.2), so a mistaken touch can be slid off.
- Label and control share one hit target: tapping a checkbox's text toggles it.

## Sources
WCAG 2.2 (2.5.5, 2.5.8 and Understanding); Apple HIG Accessibility (control sizes, padding); Android Compose accessibility API defaults; Flutter accessibility testing; Hausler (2015) on visible boundaries.
