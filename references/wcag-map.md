# WCAG 2.2 A and AA, mapped to web and native apps

All 55 Level A and AA success criteria of WCAG 2.2 (the **Required** tier), in plain words, with what each means in a native app and how to check it. The normative text is at https://www.w3.org/TR/WCAG22/. This page paraphrases; when wording matters, read the source.

**Native apps:** W3C applies WCAG to software through **WCAG2ICT** (Group Note, Dec 2025) and the **WCAG2Mobile** draft (May 2025). In short: a "web page" becomes a **screen or view**, "CSS pixels" become the platform's density-independent unit (**pt** on iOS, **dp** on Android), and a few criteria that depend on a "set of web pages" usually don't apply to a single app.

**Check column:** `Auto` = automated tools catch much of it; `Partly` = tools catch some cases; `Manual` = needs a person.

4.1.1 Parsing was removed in WCAG 2.2 (obsolete). Don't report it.

## 1 Perceivable

### 1.1 Text alternatives
| SC | Level | What it means | In native apps | Check |
|---|---|---|---|---|
| 1.1.1 Non-text content | A | Every image, icon and control that isn't text has a text alternative that serves the same purpose. Decorative things are hidden from assistive technology. Controls get a name that says what they do. | Same. `accessibilityLabel` / `contentDescription` / `Semantics(label:)`; decorative: `accessibilityHidden(true)`, `contentDescription = null`, `ExcludeSemantics`. | Partly (missing labels: Auto; label quality: Manual) |

### 1.2 Time-based media
| SC | Level | What it means | In native apps | Check |
|---|---|---|---|---|
| 1.2.1 Audio-only and video-only (prerecorded) | A | Podcasts and audio clips get a transcript. Silent video gets a transcript or a narrated audio track. | Same. | Manual |
| 1.2.2 Captions (prerecorded) | A | Prerecorded video with sound has synchronised captions (speech, speakers, meaningful sounds). Unchecked auto-captions don't count. | Same; respect system caption style settings. | Manual |
| 1.2.3 Audio description or media alternative (prerecorded) | A | Important visual information in video is available through audio description or a full text alternative. | Same. | Manual |
| 1.2.4 Captions (live) | AA | Live video with sound has live captions. | Same. | Manual |
| 1.2.5 Audio description (prerecorded) | AA | Prerecorded video has audio description of important visuals (a transcript alone isn't enough at AA). | Same. | Manual |

### 1.3 Adaptable
| SC | Level | What it means | In native apps | Check |
|---|---|---|---|---|
| 1.3.1 Info and relationships | A | Structure you can see is in the code too: headings, lists, tables, labels tied to fields, groups, required markers. | Heading traits (`.isHeader`, `heading()`, `header: true`), grouping, labelled fields, list and collection info. | Partly |
| 1.3.2 Meaningful sequence | A | The reading order in code makes sense and matches the visual meaning. CSS or layout tricks don't scramble it. | View-tree order; `accessibilitySortPriority`, `traversalIndex`, `OrdinalSortKey` only when needed. | Manual |
| 1.3.3 Sensory characteristics | A | Instructions don't rely only on shape, colour, size, position or sound ("tap the round button on the right"). | Same. | Manual |
| 1.3.4 Orientation | AA | Don't lock to portrait or landscape unless essential (a cheque scan, a piano). | Very relevant: support rotation; mounted devices can't be turned. | Manual |
| 1.3.5 Identify input purpose | AA | Fields about the user declare their purpose (`autocomplete="email"`, `given-name`, `postal-code`, `one-time-code`…) so browsers and tools can fill them. | iOS `textContentType`, Android `autofillHints` / Compose `ContentType`, React Native `textContentType` and `autoComplete`, Flutter `autofillHints`. | Auto (web) / Partly |

### 1.4 Distinguishable
| SC | Level | What it means | In native apps | Check |
|---|---|---|---|---|
| 1.4.1 Use of colour | A | Colour is never the only way to show information, an action, a state or a link. | Same. Also honour iOS "Differentiate Without Color". | Manual |
| 1.4.2 Audio control | A | Audio that plays by itself for more than 3 seconds can be paused or stopped, or has its own volume. | Same; don't autoplay sound. | Manual |
| 1.4.3 Contrast (minimum) | AA | Text 4.5:1; large text (≥ 24px / 18pt, or ≥ 18.66px / 14pt bold) 3:1. Exempt: disabled controls, decoration, logos, incidental text in photos. Placeholder text is **not** exempt. | Same thresholds in pt/sp; check light and dark, and Increase Contrast. | Auto (flat colours) / Manual (over images) |
| 1.4.4 Resize text | AA | Text can grow to 200% without losing content or function. | Supporting the platform's full text-size range (Dynamic Type, font scale, `textScaler`) meets it; turning scaling off fails. | Manual |
| 1.4.5 Images of text | AA | Use real text, not pictures of text (logos excepted). | Same. | Partly |
| 1.4.10 Reflow | AA | Content works at 320 CSS px wide (400% zoom) without scrolling in two directions, except maps, tables, video, games. | Interpreted as: layouts respond to large text, display zoom, split view and rotation without losing content. | Manual |
| 1.4.11 Non-text contrast | AA | Parts needed to see a control and its state (borders of inputs, focus rings, checkbox marks, toggle states, icons) and meaningful graphics reach 3:1 against neighbours. Inactive controls exempt. | Same. | Partly |
| 1.4.12 Text spacing | AA | No loss when users set line height 1.5×, paragraph spacing 2×, letter spacing 0.12×, word spacing 0.16×. | Usually not applicable: native apps rarely let users override spacing. Web views inside apps: applies. | Manual (bookmarklet) |
| 1.4.13 Content on hover or focus | AA | Tooltips, popovers and submenus that appear on hover or focus can be dismissed (Escape) without moving, can be hovered, and stay until dismissed. | Applies with pointer and keyboard on iPad, Android tablets, desktop. | Manual |

## 2 Operable

### 2.1 Keyboard accessible
| SC | Level | What it means | In native apps | Check |
|---|---|---|---|---|
| 2.1.1 Keyboard | A | Everything works from a keyboard, with no special timing. | Everything works with an external keyboard (Full Keyboard Access, Android keyboard), switch and voice; platform input services count. | Manual |
| 2.1.2 No keyboard trap | A | Focus can always leave a component with the keyboard. | Same; custom views must not swallow focus. | Manual |
| 2.1.4 Character key shortcuts | A | Single-letter shortcuts can be turned off, remapped, or only work when that control has focus. | Same for apps with keyboard shortcuts. | Manual |

### 2.2 Enough time
| SC | Level | What it means | In native apps | Check |
|---|---|---|---|---|
| 2.2.1 Timing adjustable | A | Time limits can be turned off, extended (at least 10×), or the user is warned and gets at least 20 seconds to extend with one action. Exceptions: real-time, essential, over 20 hours. | Same: session timeouts, OTP timers, auto-dismissing toasts that carry actions. Android exposes the user's preferred timeout. | Manual |
| 2.2.2 Pause, stop, hide | A | Anything that moves, blinks or scrolls automatically for over 5 seconds, or auto-updates, can be paused, stopped or hidden. | Same: auto-advancing carousels, tickers, animated banners. | Manual |

### 2.3 Seizures and physical reactions
| SC | Level | What it means | In native apps | Check |
|---|---|---|---|---|
| 2.3.1 Three flashes or below threshold | A | Nothing flashes more than 3 times in any second, or the flashing area is small. Saturated red is stricter. | Same; support iOS Dim Flashing Lights for video. | Manual (PEAT / Harding for video) |

### 2.4 Navigable
| SC | Level | What it means | In native apps | Check |
|---|---|---|---|---|
| 2.4.1 Bypass blocks | A | A way to skip repeated blocks: skip link, landmarks, headings. | Usually not applicable to a single app (WCAG2ICT); headings and the platform's navigation serve the purpose. | Partly |
| 2.4.2 Page titled | A | Every page has a title that says its topic or purpose (and updates on client-side route changes). | Every screen has a title the screen reader announces on arrival (navigation title, `paneTitle`). | Partly |
| 2.4.3 Focus order | A | Focus moves in an order that keeps meaning and operation. | Same for keyboard and switch focus; `traversalIndex`, `accessibilitySortPriority` only to fix real problems. | Manual |
| 2.4.4 Link purpose (in context) | A | You can tell where a link goes from its text, or its text plus its sentence, list item or table cell. | "Link" = any control that behaves like a hyperlink. | Partly |
| 2.4.5 Multiple ways | AA | More than one way to find a page in a site (search, nav, sitemap), except steps in a process. | Usually not applicable to a single app. | Manual |
| 2.4.6 Headings and labels | AA | Headings and labels describe their topic or purpose. | Same. | Manual |
| 2.4.7 Focus visible | AA | Keyboard focus is visible. | Same with keyboard and switch; don't hide the system focus ring. | Manual |
| 2.4.11 Focus not obscured (minimum) | AA | The focused item is never **completely** hidden by your own sticky headers, footers, banners or chat widgets. | Same: sticky bars, bottom sheets, keyboards covering fields. | Manual |

### 2.5 Input modalities
| SC | Level | What it means | In native apps | Check |
|---|---|---|---|---|
| 2.5.1 Pointer gestures | A | Multi-finger or path-based gestures (pinch, two-finger swipe, drawing a shape) also work with a single tap or click. | Very relevant: pinch-zoom maps need +/− buttons. System and assistive-tech gestures are exempt. | Manual |
| 2.5.2 Pointer cancellation | A | Actions happen on release (up event), or can be aborted or undone. Don't trigger on touch-down. | Same. | Manual |
| 2.5.3 Label in name | A | The accessible name contains the visible label text, ideally at the start, so voice users can say what they see. | Same; on iOS add `accessibilityInputLabels` for alternatives. | Partly |
| 2.5.4 Motion actuation | A | Anything triggered by shaking or tilting also has a UI control, and the motion response can be turned off. | Very relevant: shake to undo, tilt to scroll. | Manual |
| 2.5.7 Dragging movements | AA | Anything done by dragging can also be done with single taps or clicks without dragging (reorder buttons, tap to place, a menu). | Very relevant: drag to reorder, sliders, swipe cards, maps. | Manual |
| 2.5.8 Target size (minimum) | AA | Pointer targets are at least 24×24 CSS px, or spaced so a 24px circle on each doesn't overlap another target. Exceptions: inline links in text, an equivalent control elsewhere, user-agent controls, essential. | 24×24 pt/dp is the floor; the platform targets are 44pt (iOS) and 48dp (Android). | Partly |

## 3 Understandable

### 3.1 Readable
| SC | Level | What it means | In native apps | Check |
|---|---|---|---|---|
| 3.1.1 Language of page | A | The page's main language is set (`<html lang>`). | Using the system locale meets it; set the speech language for content in another language. | Auto |
| 3.1.2 Language of parts | AA | Passages in another language are marked (`lang` on the element). | `accessibilityLanguage` (iOS / React Native), `TextSpan.locale` (Flutter), `LocaleSpan` (Android). | Manual |

### 3.2 Predictable
| SC | Level | What it means | In native apps | Check |
|---|---|---|---|---|
| 3.2.1 On focus | A | Focusing something never changes context by itself (no auto-submit, no navigation, no new window). | Same. | Manual |
| 3.2.2 On input | A | Changing a setting (choosing an option, ticking a box) doesn't change context unless the user was told first. | Same. | Manual |
| 3.2.3 Consistent navigation | AA | Repeated navigation appears in the same order across pages. | Usually not applicable to a single app; still good practice. | Manual |
| 3.2.4 Consistent identification | AA | Things that do the same job are named the same across pages. | Usually not applicable to a single app; still good practice. | Manual |
| 3.2.6 Consistent help | A | Help (contact details, chat, FAQ link, chatbot) that repeats across pages stays in the same relative place. | Same across screens. | Manual |

### 3.3 Input assistance
| SC | Level | What it means | In native apps | Check |
|---|---|---|---|---|
| 3.3.1 Error identification | A | Detected errors say which field and what's wrong, in text. | Same; announce it. | Manual |
| 3.3.2 Labels or instructions | A | Inputs have visible labels or instructions (a placeholder alone isn't enough). | Same. | Partly |
| 3.3.3 Error suggestion | AA | If you know how to fix an error, say so (unless that harms security). | Same. | Manual |
| 3.3.4 Error prevention (legal, financial, data) | AA | Purchases, legal commitments, data changes and deletions are reversible, checked, or confirmed with a review step. | Same. | Manual |
| 3.3.7 Redundant entry | A | Information already given in the same process is filled in or selectable, not typed again (exceptions: essential, security, no longer valid). | Same. | Manual |
| 3.3.8 Accessible authentication (minimum) | AA | No memory, transcription or puzzle test to log in unless there is an alternative, or help (password managers and **paste allowed**), or object or personal-content recognition. | Same: allow paste and autofill (`textContentType`, `autofillHints`), offer passkeys, magic links, OTP autofill. | Partly |

## 4 Robust

### 4.1 Compatible
| SC | Level | What it means | In native apps | Check |
|---|---|---|---|---|
| 4.1.2 Name, role, value | A | Every control exposes its name, role, state and value to assistive technology, and changes are reported. Native controls do this; custom ones must. | The core of native accessibility: labels, traits / roles, states, values, actions. | Partly |
| 4.1.3 Status messages | AA | Status messages (saved, 3 results, error, loading) reach screen readers without moving focus. | Announcements and live regions: `AccessibilityNotification.Announcement`, `liveRegion`, `announceForAccessibility`, `SemanticsService.announce`. | Manual |

## Useful AAA criteria (Recommended tier)

| SC | What it adds |
|---|---|
| 1.4.6 Contrast (enhanced) | 7:1 text, 4.5:1 large text. Good target for body text. |
| 1.4.8 Visual presentation | Line length ≤ 80 characters, no justified text, line height ≥ 1.5, user-selectable colours. |
| 2.2.6 Timeouts | Warn about inactivity timeouts that lose data, unless data is kept 20 hours. |
| 2.3.3 Animation from interactions | Motion triggered by interaction can be turned off (honour reduced motion). |
| 2.4.12 Focus not obscured (enhanced) | No part of the focused item is hidden. |
| 2.4.13 Focus appearance | Focus indicator at least as large as a 2px outline around the control, with 3:1 change between focused and unfocused. |
| 2.5.5 Target size (enhanced) | 44×44 CSS px. |
| 3.3.9 Accessible authentication (enhanced) | No object or personal-content recognition either. |

## Laws and standards (context, not legal advice)

- **WCAG 2.2** is ISO/IEC 40500:2025. It is backwards compatible: meeting 2.2 meets 2.1 and 2.0.
- **EU:** the European Accessibility Act (applies to products and services placed on the market from 28 June 2025) uses EN 301 549; the 2026 edition of EN 301 549 uses WCAG 2.2, with a software chapter for apps.
- **US:** ADA (Title II rule for state and local government uses WCAG 2.1 AA and points to WCAG2ICT for apps); Section 508 (federal, WCAG 2.0 AA via its standards).
- Other countries mostly reference WCAG 2.x AA. Check the local law with a qualified person; this skill doesn't give legal advice.
