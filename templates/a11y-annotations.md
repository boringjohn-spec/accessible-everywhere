# Accessibility annotations: <screen or component name>

Fill one per screen (or per complex component) and hand it over with the design. Every field is something a developer can't see in a mockup.

**Platform(s):** web / iOS / Android / React Native / Flutter
**Target:** WCAG 2.2 AA + platform standards

## 1. Identity
- **Page / screen title** (announced on arrival): …
- **Main heading (h1):** …
- **Purpose in one sentence** (for the cognitive check): …

## 2. Structure
| Order | Element | Heading level / landmark / group | Notes |
|---|---|---|---|
| 1 | Skip link (web) | — | Only if navigation comes first |
| 2 | … | h2 | … |
| 3 | … | group: "Order summary" (read as one item) | … |

## 3. Reading and focus order
Number the elements in the order a screen reader and the keyboard should reach them. Call out anything that differs from top-to-bottom, start-to-end.
1. …
2. …

## 4. Names for things without visible text
| Element | Accessible name | Role | State(s) |
|---|---|---|---|
| ⌕ icon button | "Search" | button | — |
| ♡ icon button | "Favourite" | button / toggle | selected / not selected |
| Product photo | "Blue waterproof jacket, front view" | image | — |
| Divider illustration | (decorative: hidden) | — | — |

## 5. States and announcements
| Event | What's announced (without moving focus) | Where focus goes |
|---|---|---|
| Item added to cart | "Added to cart. 3 items." | stays on the button |
| Form error on submit | error summary / field errors | first error |
| Dialog opens | dialog title | first field / title / least destructive button |
| Dialog closes | — | back to the trigger |
| Results update | "12 results" | stays in the search field |

## 6. Interaction alternatives
| Gesture or special input | Alternative |
|---|---|
| Swipe row to delete | Edit mode → Delete; custom action "Delete" |
| Drag to reorder | Move up / Move down buttons; custom actions |
| Pinch to zoom map | + / − buttons |
| Hover to show actions | Always visible, or a visible "More" menu |
| Auto-advancing carousel | Off by default; Pause button first |

## 7. Colour and contrast
| Pair (fg on bg) | Use | Ratio | Theme(s) |
|---|---|---|---|
| text on surface | text | …:1 | light, dark |
| border-input on surface | ui | …:1 | light, dark |
Non-colour cues for: errors …, status …, selected …, links …

## 8. Text size and layout
- At 200% text (web) / AX5 Dynamic Type / 200% font scale: what wraps, what stacks, what scrolls: …
- Anything that can't grow (tab bar, toolbar) and its fallback (Large Content Viewer): …
- Landscape / rotation behaviour: …

## 9. Targets
- Smallest target on the screen and its size: … (≥ 24px; 44pt iOS; 48dp Android)

## 10. Motion and time
- Animations and their reduced-motion versions: …
- Anything on a timer (toasts, sessions, carousels) and how people get more time: …

## 11. Content
- Alt text written for: …
- Video/audio: captions … / audio description … / transcript …
- Plain-language check done: yes / no
