# List rows, cards and swipe actions

> Each row or card is one stop that reads as one sentence; its secondary actions (delete, archive, favourite, reorder) are reachable without swiping, dragging or hunting for tiny icons.

## Use it when
- Lists of messages, orders, files, contacts, products; cards in a feed or grid; any row with swipe-to-delete, drag-to-reorder or several small action icons.

## Contract
| # | Requirement | Tier | SC |
|---|---|---|---|
| 1 | A row's content reads as one item in a sensible order ("Anna Lee, Lunch on Friday?, 2 unread, 10:42") instead of five separate swipes | Platform (helps 1.3.2) | 1.3.1, 1.3.2 |
| 2 | Every swipe action is also available as a **custom accessibility action** and in a visible way (an edit mode, a "More" menu, a button on the detail screen) | Required | 2.5.1, 2.5.7, 2.1.1 |
| 3 | Drag-to-reorder has a non-drag alternative (move up/down buttons, "Move to…" menu, accessibility actions) | Required | 2.5.7 |
| 4 | Hover-revealed row actions are also shown on focus, and on touch they're visible or in a menu | Required | 2.1.1, 1.4.13 |
| 5 | Rows are not nested interactive elements (a clickable card that contains buttons needs care) | Required | 4.1.2 |
| 6 | Unread / selected / status not shown by colour alone | Required | 1.4.1 |
| 7 | Rows grow with large text; secondary info stacks rather than truncating | Required / Platform | 1.4.4, 1.4.10 |
| 8 | Position in list announced where the platform supports it ("3 of 20") | Platform | 1.3.1 |

## Design notes
- Swipe is a shortcut, never the only route. Apple's example: swipe-to-delete **and** Edit → Delete.
- For cards: make the title the link or button, and stretch its hit area over the card with a pseudo-element (web), rather than wrapping the whole card in a link that contains other buttons.
- Destructive swipe actions need undo (a snackbar with Undo that waits long enough) or confirmation.

## Web
```html
<ul aria-label="Inbox">
  <li class="card">
    <h3><a href="/m/42" class="stretched">Anna Lee: Lunch on Friday?</a></h3>
    <p>2 unread · 10:42</p>
    <button type="button" aria-label="Archive message from Anna Lee">…</button>
  </li>
</ul>
```
- `.stretched::after { content: ""; position: absolute; inset: 0; }` on the link (card `position: relative`) makes the whole card clickable while other buttons stay separately focusable (give them `position: relative; z-index: 1`).
- Name repeated actions with their item ("Archive message from Anna Lee") or rely on the list context; avoid ten identical "Delete" buttons with no context.
- Drag-and-drop lists: offer keyboard reordering (select, arrow, drop) and buttons; announce moves ("Moved to position 3 of 8"). Libraries like dnd-kit include keyboard sensors and announcements.

## iOS
```swift
MessageRow(message)
  .accessibilityElement(children: .combine)                 // one stop
  .swipeActions { Button("Archive", role: .destructive) { archive(message) } }
  .accessibilityAction(named: "Archive") { archive(message) } // available from the actions rotor
```
- `List` + `.swipeActions` exposes them as actions in many cases; adding explicit `accessibilityAction(named:)` makes it certain. Provide an `EditButton` / edit mode for delete and move.
- Use `.accessibilityElement(children: .combine)` or a custom `.accessibilityLabel` to control the reading order of the combined row.

## Android
```kotlin
Row(
  Modifier
    .clickable(onClickLabel = "Open message") { open(m) }
    .semantics(mergeDescendants = true) {
      customActions = listOf(
        CustomAccessibilityAction("Archive") { archive(m); true },
        CustomAccessibilityAction("Mark as unread") { markUnread(m); true }
      )
    }
) { /* avatar, name, preview, time */ }
```
- `SwipeToDismissBox` content must also expose the dismiss action as a custom action.
- Move nested icon buttons into `customActions` and clear their own semantics, so Switch Access and Voice Access users get one row with a menu of actions.
- Views: `ViewCompat.addAccessibilityAction(view, "Archive") { _, _ -> archive(); true }`.

## React Native
```tsx
<Pressable
  accessible
  accessibilityRole="button"
  accessibilityLabel={`${m.from}, ${m.subject}, ${m.unread} unread, ${m.time}`}
  accessibilityActions={[{ name: 'archive', label: 'Archive' }, { name: 'markUnread', label: 'Mark as unread' }]}
  onAccessibilityAction={e => e.nativeEvent.actionName === 'archive' ? archive(m) : markUnread(m)}
  onPress={() => open(m)}
>…</Pressable>
```
- Swipeable rows (`react-native-gesture-handler` Swipeable) are invisible to screen readers unless you add these actions.

## Flutter
```dart
Semantics(
  customSemanticsActions: {
    const CustomSemanticsAction(label: 'Archive'): () => archive(m),
  },
  child: Dismissible(key: ValueKey(m.id), onDismissed: (_) => archive(m), child: MessageTile(m)),
);
```
- `ListTile` merges its title, subtitle and trailing text. `ReorderableListView` includes drag handles; also offer move-up/move-down actions.

## Common mistakes
- Swipe-only delete or archive.
- Drag-only reordering.
- Row actions that appear only on hover.
- Each card read as six fragments; or a whole card as a link containing buttons.
- Ten unnamed or identical "More" buttons.

## Test it
- VoiceOver: on a row, swipe up/down to hear the available actions; double-tap one.
- TalkBack: open the actions menu on a row; actions are listed.
- Switch / keyboard: every row action reachable without swiping.
- Reorder a list without dragging.

## Sources
Apple HIG Accessibility (gesture alternatives, swipe-to-delete + Edit); Android Compose custom actions and merging; React Native accessibility actions; Flutter semantics; Hausler (2015, hover-revealed actions); WCAG 2.2 (2.5.1, 2.5.7).
