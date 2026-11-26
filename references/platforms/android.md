# Android (Jetpack Compose and Views)

## Assistive technology and settings to support
| Feature | What it does | How your app responds |
|---|---|---|
| **TalkBack** | Screen reader; swipe to move, double-tap to activate, reading controls and actions menu | Labels, roles, states, merging, traversal, live regions, custom actions |
| **Switch Access** (incl. Camera Switches) | Scan with switches or facial gestures | Everything focusable; secondary actions as custom actions |
| **Voice Access** | Operate by speech using visible labels and numbers | Accessible names that match visible text |
| **Select to Speak** | Reads selected text aloud | Real text, not images of text |
| **Keyboard / D-pad** | Hardware navigation | Focus order, visible focus, `Enter` activates |
| **Font size, Display size** | Text scaling (non-linear, up to 200%) and UI scaling | `sp` for text; layouts that wrap and scroll |
| **Bold text, High-contrast text, Colour correction, Colour inversion** | Visual adjustments | Don't fight them; check legibility with them on |
| **Remove animations** | Animator duration scale 0 | Respect `ANIMATOR_DURATION_SCALE`; no essential info in animation |
| **Time to take action** | User's preferred timeout | `AccessibilityManager.getRecommendedTimeoutMillis()` |
| **Captions** | System caption style | Media3/ExoPlayer respects caption settings |

## Numbers
- Touch targets **48×48dp** (pointer input may be smaller).
- Text contrast 4.5:1 below 18sp (14sp bold), 3:1 above.
- Text in `sp`; test at the largest font size and display size.

## Compose cheat sheet
| Need | API |
|---|---|
| Name an icon/image | `contentDescription = "Search"`; `null` for decorative |
| Purpose, not type | "Submit", not "Submit button"; `Role` gives the type |
| One stop for a group | `Modifier.semantics(mergeDescendants = true) {}` (`clickable`/`toggleable` already merge) |
| Replace / clear | `clearAndSetSemantics { … }` (sparingly: also hides from autofill, tests and agents) |
| Hide decoration but keep for tests | `Modifier.semantics { hideFromAccessibility() }` |
| Heading | `semantics { heading() }` |
| Role | `clickable(role = Role.Button)`, `toggleable(role = Role.Switch / Checkbox)`, `selectable(role = Role.RadioButton / Tab)` |
| Action label | `clickable(onClickLabel = "Open order")`, `combinedClickable(onLongClickLabel = …)` |
| State words | `stateDescription = "Subscribed"` |
| Extra actions | `customActions = listOf(CustomAccessibilityAction("Archive") { …; true })` |
| Expand / collapse | `semantics { expand { … }; collapse { … } }` |
| Live updates | `liveRegion = LiveRegionMode.Polite` (Assertive rarely; never on timers) |
| Pane / sheet title | `paneTitle = "Filters"` |
| Errors | `semantics { error("Enter a valid email") }` + `isError`/`supportingText` |
| Progress | `progressBarRangeInfo`, `progressSemantics()` |
| List position | `collectionInfo` / `collectionItemInfo` for custom lists |
| Order | `isTraversalGroup = true` on the container, `traversalIndex` on children |
| Target size | `minimumInteractiveComponentSize()` (before `size()`) or `sizeIn(minWidth = 48.dp, minHeight = 48.dp)` |
| Autofill | `semantics { contentType = ContentType.EmailAddress }` |
| Input focus | `FocusRequester`, `onFocusChanged`, `focusable()` |

## Views cheat sheet
`android:contentDescription`, `android:importantForAccessibility="no"`, `android:labelFor`, `android:accessibilityHeading`, `android:accessibilityLiveRegion`, `android:accessibilityPaneTitle`, `android:screenReaderFocusable`, `accessibilityTraversalBefore/After`, `nextFocusDown/Up/Left/Right/Forward`, `ViewCompat.addAccessibilityAction` / `replaceAccessibilityAction`, `ViewCompat.setStateDescription`, `TextInputLayout.setError`, `android:autofillHints`, `TouchDelegate`.

## Common Android traps
- `contentDescription` on a text button (replaces the visible text, breaks Voice Access) or with the role in it.
- `importantForAccessibility="no"` on real content.
- `android:hint` as the only label on an `EditText`.
- Custom clickables under 48dp, or Compose's extended touch area overlapping neighbours.
- `Modifier.clickable` on a `Box` with no role, label or state.
- Swipe-to-dismiss with no custom action.
- `dp` text sizes; layouts with fixed heights that clip at 200% font.
- Assertive live regions on timers or counters.

## Testing
- **TalkBack** (install on emulators from the Play Store), **Switch Access**, **Voice Access** on a device.
- **Accessibility Scanner** app: contrast, touch targets, labels.
- **Compose 1.8+:** `ui-test-junit4-accessibility` + `composeTestRule.enableAccessibilityChecks()`; checks run on actions or `onRoot().tryPerformAccessibilityChecks()`.
- **Espresso:** `AccessibilityChecks.enable().setRunChecksFromRootView(true)`.
- **Android Lint** accessibility checks (missing content descriptions, etc.).
- Layout Inspector / `printToLog` of the semantics tree (`onRoot(useUnmergedTree = true).printToLog("SEM")`).

## Sources
Android Developers: Compose accessibility (semantics, merging, traversal, API defaults, testing, scalable content), Make apps more accessible, Espresso accessibility checking; Dinesh (2023) for the assistive-technology overview, with corrections.
