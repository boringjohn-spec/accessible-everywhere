---
name: accessible-everywhere
description: Make anything you design or build usable by disabled people, on the web, iOS, Android, React Native and Flutter. Sets WCAG 2.2 AA as the bar and covers accessible design tokens (contrast pairs, text that scales, target sizes, focus, motion), screen reader semantics, keyboard, switch and voice control, 14 cross-platform component contracts, forms and login, dialogs, media, charts, cognitive load, and the CI checks and manual test scripts that prove it. Use it whenever you design, build, refactor or review a user interface (a screen, component, design system, form, flow, app or site), even if nobody says "accessibility", and whenever someone mentions a11y, WCAG, ADA, EAA, Section 508, contrast, screen readers, VoiceOver, TalkBack, Dynamic Type, font scaling, keyboard navigation or inclusive design.
license: MIT
metadata:
  version: 1.0.0
  author: Gaga John
  standard: WCAG 2.2 Level AA (ISO/IEC 40500:2025)
---

# Accessible everywhere

Accessibility is not a web feature and not a final QA step. The same people use websites, web apps and phone apps: people who are blind and use a screen reader, people with low vision who enlarge text, people who can't use a mouse or a touchscreen and use a keyboard, a switch or their voice, people who are colour-blind, Deaf, have tremors, migraines from motion, or find dense or tricky interfaces hard to follow. This skill makes their needs part of how you design, build and ship, on every platform.

**The rule:** a design or a component is not done until it works without sight, without a mouse or touch, at the user's text size, without colour, and without memory tricks, and you can show how you checked.

## The bar: three tiers

Grade every finding and every requirement with one tier. Never mix them up.

| Tier | Meaning | Blocks shipping? |
|---|---|---|
| **Required** | WCAG 2.2 Level A or AA (the legal baseline in most places: ISO/IEC 40500, EN 301 549 / EAA, ADA and Section 508 practice) | Yes |
| **Platform** | What the platform owner expects: Apple HIG, Android/Material, Flutter guidance (44pt / 48dp targets, full Dynamic Type or font-scale range, system colours) | Should fix before release |
| **Recommended** | WCAG AAA and W3C cognitive guidance (7:1 body text, 2px focus ring, plain language, no timeouts) | No, but it makes the product better for everyone |

WCAG applies to native apps too. W3C applies it through WCAG2ICT and the WCAG2Mobile draft: judge each **screen** as you would judge a page. See [wcag-map.md](references/wcag-map.md) for every A/AA criterion with its web and native-app meaning.

## First: work out the platform and the mode

1. **Platform.** Look at the files or ask: web (HTML/CSS/ARIA, React, Vue, Svelte…), iOS (SwiftUI/UIKit), Android (Compose/Views), React Native, Flutter. Load the matching file from [references/platforms/](references/platforms/). Several can apply (for example React Native plus its iOS and Android behaviour).
2. **Mode.** Pick one, or run them in order:
   - **Design**: a screen, flow, mockup, design system or tokens are being planned.
   - **Build**: UI code is being written or changed.
   - **Review and ship**: existing work is being checked, audited or prepared for release.

## The 12 non-negotiables (every mode, every platform)

1. **Native first.** Use the platform's real control (`<button>`, `Button`, `Toggle`, `Switch`, `TextField`). Add accessibility properties only to restore meaning that is missing. No ARIA is better than bad ARIA. ([principles](references/principles.md))
2. **Every control has a name, a role and a state** that assistive technology can read. Icon-only controls get a label that names the action, not the icon. The visible label is part of the name, at the start.
3. **Text contrast 4.5:1, large text 3:1, UI parts and meaningful graphics 3:1**, in every theme and state. Calculate it with [contrast.mjs](scripts/contrast.mjs), never guess.
4. **Never colour alone.** Errors, status, links in text, chart series and required fields carry a second cue: text, icon, shape, underline or pattern.
5. **Text follows the user's size setting** (rem, Dynamic Type, sp, `allowFontScaling`, `textScaler`) and the layout survives 200% and the largest accessibility sizes: it wraps, stacks and scrolls instead of clipping.
6. **Everything works without a pointer.** Keyboard on web and desktop; keyboard, switch and voice on mobile. Focus order follows the visual order, focus is always visible and never hidden behind sticky UI, and there are no traps.
7. **Targets at least 24×24 CSS px** (Required), **44×44pt on iOS and 48×48dp on Android** (Platform).
8. **Every gesture, drag, hover, shake, timer or sound has a simple alternative**: a button, a tap, a menu or an actions entry, visible text, or a visual or haptic cue.
9. **Structure is real.** Real headings (style ≠ level), screen and page titles, landmarks or groups, a reading order that matches what people see, and hidden content hidden from everyone.
10. **Changes are announced, not hidden.** Status messages, errors and new content reach screen readers without stealing focus; dialogs and sheets move focus in, keep it there, and return it.
11. **Respect the user's settings**: reduced motion, increased contrast and forced colours, bold text, reduced transparency, captions, autoplay off. No flashing more than 3 times a second.
12. **Prove it.** Automated checks find about half the problems at best. Every review ends with a CI gate for the stack and a short manual test with the real assistive technology.

## Mode: Design

Produce accessibility as part of the design, not as notes after it.

1. **Tokens.** Build colour as **pairs** (foreground on background, per theme and state) and check every pair; build the type scale on user-relative units and plan how layouts reflow at the largest text sizes; add target-size, spacing, focus-ring and motion tokens (each motion token has a reduced-motion version). Load [foundations/](references/foundations/).
2. **Pick patterns before drawing them.** Use the decision rules in each component file (select vs combobox, tabs vs accordion, button vs link, carousel or not). Avoid hover-only actions, custom gestures with no alternative, auto-advancing content and timeouts.
3. **Annotate the handoff** with [templates/a11y-annotations.md](templates/a11y-annotations.md): headings and screen titles, reading and focus order, names for icon-only controls, what each state announces, gesture alternatives, what happens at 200% text and in landscape.
4. **Cognitive pass.** Clear purpose per screen, one main task, controls that look like controls, costs and consequences shown up front, undo or review before anything irreversible. See [content/cognitive.md](references/content/cognitive.md).

## Mode: Build

1. Load the platform file and the component files you need from [components/](references/components/). Each contract lists what the component must do, then how to do it on web, iOS, Android, React Native and Flutter.
2. Write the accessible version first time; don't bolt it on. Prefer proven primitives: native elements, platform components, or audited libraries (React Aria, Radix, Headless UI) over hand-written widgets.
3. Wire in the user's settings (text size, reduced motion, contrast) where you set fonts, animation and colour.
4. Before you say "done", run [scripts/audit.mjs](scripts/audit.mjs) on the files you touched and [scripts/contrast.mjs](scripts/contrast.mjs) on any colours you added, and list the manual checks that still need a person.

## Mode: Review and ship

1. Run `node scripts/audit.mjs <paths>` (web, CSS, React Native, Flutter, SwiftUI and Compose rules) and `node scripts/contrast.mjs --tokens <file>` if there are tokens.
2. Walk the flows yourself where you can: keyboard-only (web), then the screen reader structure (names, roles, states, order).
3. Report with [templates/review-report.md](templates/review-report.md): each finding has a tier, the WCAG criterion number, the platform, where it is, who it blocks, and the fix. Order: Required first.
4. Add or recommend the **CI gate** for the stack and hand over a **manual test plan** ([templates/test-plan.md](templates/test-plan.md)). See [testing/](references/testing/).
5. Mark anything you could not verify as **Not verified**. Never claim a product "is WCAG compliant" or "is accessible" from automated checks or code reading alone, and never give legal advice: state what was checked and what passed.

## Where things live

| Need | File |
|---|---|
| Why the rules exist, how to weigh trade-offs | [principles.md](references/principles.md) |
| Every WCAG 2.2 A/AA criterion: plain meaning, native-app meaning, how to test | [wcag-map.md](references/wcag-map.md) |
| Quick checklists per mode | [checklists.md](references/checklists.md) |
| Colour, type, targets and spacing, focus, motion | [foundations/](references/foundations/) |
| Headings, titles, landmarks, order, hiding content, announcements, focus on navigation | [structure.md](references/structure.md) |
| Images, charts and complex graphics; audio and video; cognitive and plain language | [content/](references/content/) |
| Button, Link, Text field, Checkbox/Radio/Switch, Forms and login, Dialog and sheet, Tabs, Accordion and disclosure, Combobox and picker, Slider, Tooltip, Carousel and pager, List rows with swipe actions, Toast and snackbar | [components/](references/components/) |
| Web, iOS, Android, React Native, Flutter: APIs, settings, assistive technology, traps | [platforms/](references/platforms/) |
| CI tools per platform; manual screen reader, keyboard, switch and voice scripts | [testing/](references/testing/) |

## Scripts

```bash
node scripts/contrast.mjs "#767676" "#ffffff"          # one pair, all WCAG thresholds
node scripts/contrast.mjs --tokens tokens.json           # every pair in every theme
node scripts/contrast.mjs "#999" "#fff" --suggest text   # nearest passing colour, same hue
node scripts/audit.mjs src/ ios/ android/ lib/           # static checks for 6 rule sets
node scripts/audit.mjs src/ --format json --fail-on warn # for CI
```

Both scripts are dependency-free Node (20+). The audit is a static, heuristic first pass: it finds likely problems fast, and it can be wrong. It does not replace the platform test tools or a person using assistive technology.

## How to talk about results

- Cite the criterion: "Fails 1.4.3 Contrast (Minimum), Required: #9a9a9a on #ffffff is 2.81:1, needs 4.5:1."
- Say who is blocked: "A VoiceOver user hears 'button' with no name."
- Give the fix in the project's own stack and design system.
- Separate what you verified from what you inferred. Automated results are evidence, not a verdict.
