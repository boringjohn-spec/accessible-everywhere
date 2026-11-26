# Checklists

Short, scannable lists for each mode. Each line links to where the full rule lives. **R** = Required (WCAG 2.2 A/AA), **P** = Platform, **+** = Recommended.

## Design checklist

**Colour**
- [ ] R: every text pair ≥ 4.5:1 (large ≥ 3:1) in light, dark and every state ([color](foundations/color.md))
- [ ] R: input borders, focus rings, toggle states, icons and chart marks ≥ 3:1 against neighbours
- [ ] R: no meaning carried by colour alone (errors, status, links, required, chart series); passes a greyscale check
- [ ] P: higher-contrast variants for Increase Contrast / forced colours
- [ ] +: body text ≥ 7:1 where the brand allows

**Type and layout**
- [ ] R: type scale in user-relative units (rem / Dynamic Type / sp / textScaler) ([typography](foundations/typography.md))
- [ ] R: layouts at 200% text and 320px width (web) / AX5 and 200% font scale (mobile): wrap, stack, scroll, no clipping
- [ ] R: heading levels set by the outline, not by size; one title per screen
- [ ] +: line height ≥ 1.5, line length ≤ 80ch, no justified text, no thin body weights

**Targets and interaction**
- [ ] R: targets ≥ 24×24px or spaced; P: 44pt iOS, 48dp Android ([targets](foundations/targets-spacing.md))
- [ ] R: every drag, swipe, pinch, long-press, hover and shake has a simple alternative
- [ ] R: no hover-only actions; secondary actions visible or in a visible menu
- [ ] R: nothing auto-advances or times out without pause / extend ([motion](foundations/motion.md))
- [ ] P: reduced-motion version of every transition

**Patterns and content**
- [ ] Each component chosen with its "use it when" rule ([components](components/))
- [ ] Icon-only controls have names written in the spec
- [ ] Images: decorative or a written alt; charts have a summary and the data ([images](content/images-and-charts.md))
- [ ] Video: captions and audio description planned ([media](content/media.md))
- [ ] R: errors say what and how to fix; login allows paste and password managers; nothing asked twice
- [ ] +: plain language, one main task per screen, costs shown up front, undo or review ([cognitive](content/cognitive.md))

**Handoff**
- [ ] Annotations done: titles, headings, reading/focus order, names, announcements, gesture alternatives, large-text layout ([template](../templates/a11y-annotations.md))

## Build checklist

- [ ] Native controls for everything that has one; no clickable `div` / `View` / `GestureDetector` without role, name, focus and keyboard ([principles](principles.md))
- [ ] Every control: name (visible label first), role, state, value ([wcag-map 4.1.2](wcag-map.md))
- [ ] Icon-only controls labelled with the action; decorative images hidden
- [ ] Form fields: visible label tied to the field, `autocomplete`/content type, errors tied to fields and announced ([text-field](components/text-field.md), [forms](components/forms-and-auth.md))
- [ ] Focus: visible, logical order, moved into dialogs and back, moved to the new title on navigation ([focus](foundations/focus.md))
- [ ] Status messages announced without moving focus ([structure](structure.md))
- [ ] Hidden content hidden from everyone; nothing focusable inside `aria-hidden`
- [ ] Text scaling on; nothing clamps or disables it
- [ ] Reduced motion, increased contrast and dark mode respected
- [ ] Targets meet size; hit areas don't overlap
- [ ] `node scripts/audit.mjs <changed files>` clean or explained; `node scripts/contrast.mjs` on new colours

## Ship checklist

- [ ] Automated: the stack's CI gate passes ([automated](testing/automated.md))
- [ ] Screen reader pass on each main flow (VoiceOver and TalkBack on mobile; NVDA or VoiceOver on web) ([manual scripts](testing/manual-scripts.md))
- [ ] Keyboard-only pass (web, tablet, desktop); switch or Full Keyboard Access pass (mobile)
- [ ] Voice control: say the visible labels of the main actions
- [ ] Largest text size and 200% / 400% zoom: nothing clipped or overlapping
- [ ] Greyscale or colour filter: all states still distinguishable
- [ ] Reduced motion on: no large movement, nothing lost
- [ ] Rotation (mobile) works; nothing locked to one orientation without reason
- [ ] Media: captions and transcripts present and checked
- [ ] Findings reported with tier and criterion; unverified items listed ([report template](../templates/review-report.md))
