# Accessible Everywhere

[![CI](https://github.com/boringjohn-spec/accessible-everywhere/actions/workflows/ci.yml/badge.svg)](https://github.com/boringjohn-spec/accessible-everywhere/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![WCAG 2.2 AA](https://img.shields.io/badge/target-WCAG%202.2%20AA-2b6cb0.svg)](https://www.w3.org/TR/WCAG22/)

**An accessibility skill for people designing and building with AI, on the web, iOS, Android, React Native and Flutter.**

AI tools generate interfaces fast, and most of that UI quietly shuts people out: icon buttons with no names, fixed text sizes, focus rings removed, colour-only errors, swipe-only actions, modals that screen readers wander out of. Accessibility guidance is also usually written for websites only, while the same people use phone apps all day.

This skill makes accessibility part of the work from the first design decision to the release check, for every platform:

- **Design:** accessible design tokens (contrast-checked colour *pairs*, type that follows the user's text size, target sizes, focus and motion tokens), pattern choices, and handoff annotations.
- **Build:** 14 component contracts with code for web, iOS (SwiftUI/UIKit), Android (Compose/Views), React Native and Flutter.
- **Review and ship:** a static audit (58 rules across 7 rule sets), a WCAG contrast calculator that suggests fixes, the CI checks for each platform, and manual test scripts for VoiceOver, TalkBack, keyboard, switch and voice control.

The bar is **WCAG 2.2 Level AA** (ISO/IEC 40500:2025, used by the European Accessibility Act via EN 301 549), applied to native apps the way W3C's WCAG2ICT and WCAG2Mobile guidance describe, plus Apple's, Google's and Flutter's own platform standards.

## Contents

```
accessible-everywhere/
├── SKILL.md                     The operating manual the AI reads first: tiers, modes, 12 non-negotiables
├── references/
│   ├── principles.md            Who you're designing for, and the 9 ideas behind every rule
│   ├── wcag-map.md              All 55 WCAG 2.2 A/AA criteria: plain meaning, native-app meaning, how to check
│   ├── checklists.md            Design, build and ship checklists
│   ├── structure.md             Titles, headings, landmarks, order, hiding, announcements
│   ├── foundations/             color · typography · targets-spacing · focus · motion
│   ├── components/              14 cross-platform contracts (button → toast)
│   ├── platforms/               web · ios · android · react-native · flutter
│   ├── content/                 images-and-charts · media · cognitive
│   └── testing/                 automated (CI per platform) · manual-scripts
├── scripts/
│   ├── contrast.mjs             WCAG contrast for pairs and token files, with nearest-passing suggestions
│   ├── audit.mjs                Static audit: web, CSS, React Native, Flutter, iOS, Compose, Android XML
│   ├── build.mjs / validate.mjs Generated rule files; package validation
├── templates/                   a11y-annotations · test-plan · review-report
├── rules/                       AGENTS.md (portable rules) + generated Cursor .mdc and Copilot instructions
├── examples/tokens.example.json
└── tests/                       Unit tests and good/bad fixtures for every platform
```

## Install

### Claude Code (and other tools that read `SKILL.md` Agent Skills)
```bash
git clone https://github.com/boringjohn-spec/accessible-everywhere.git ~/.claude/skills/accessible-everywhere
```
For a single project, clone it into `.claude/skills/accessible-everywhere` inside the project instead. The skill loads automatically when you design, build or review UI, or ask about accessibility.

### Cursor
Copy `rules/accessible-everywhere.mdc` into your project's `.cursor/rules/` folder.

### GitHub Copilot
Copy `rules/copilot-instructions.md` to `.github/copilot-instructions.md` (or append it to your existing file).

### Codex, Windsurf, Cline, Aider and other agents
Copy `rules/AGENTS.md` into your project's `AGENTS.md` (or the file your tool reads). For the full knowledge base, keep the repository next to your project and point the agent at `SKILL.md`.

## Use it

Ask the way you normally would. The skill triggers on UI work and on accessibility terms. Some examples:

- "Design a settings screen for our iOS and Android app." → tokens checked, patterns chosen, annotations included.
- "Build a filter bottom sheet in React Native." → focus moves in, the background is hidden from screen readers on both platforms, Escape/back closes it, results are announced.
- "Our brand blue is #4C8DFF. Make a palette that passes." → contrast pairs for light and dark, with suggestions.
- "Review this checkout flow for accessibility." → findings by tier with WCAG numbers, a CI gate, and a manual test plan.
- "Is our Flutter web app usable with a screen reader?" → checks `ensureSemantics`, semantics on custom widgets, and text scaling.

## Scripts

Node 20+ with no dependencies.

```bash
# Contrast: one pair, every WCAG threshold
node scripts/contrast.mjs "#767676" "#ffffff"
# …nearest passing colour in the same hue
node scripts/contrast.mjs "#999999" "#ffffff" --suggest text
# …every pair in every theme of a token file (exit 1 on failure)
node scripts/contrast.mjs --tokens examples/tokens.example.json

# Static audit (text, json or GitHub annotations)
node scripts/audit.mjs src ios android lib
node scripts/audit.mjs src --format github --fail-on error
node scripts/audit.mjs --list-rules
```

Silence a false positive with a comment on the same or previous line: `a11y-ignore web/img-alt (tracking pixel)`.

**GitHub Actions**
```yaml
- uses: actions/checkout@v4
- uses: actions/checkout@v4
  with: { repository: boringjohn-spec/accessible-everywhere, path: .a11y }
- run: node .a11y/scripts/audit.mjs src --format github --fail-on error
- run: node .a11y/scripts/contrast.mjs --tokens design/tokens.json
```

## What it is not

- **Not a certification.** Automated checks, including these, find about half of accessibility problems at best. The skill always pairs them with a manual test plan and reports what wasn't verified.
- **Not legal advice.** It explains which standards laws usually point to; check your obligations with a qualified person.
- **Not a replacement for disabled users.** Test with real people who use assistive technology whenever you can.

## Sources and credits

This skill was researched from the articles below (selected by the author), the W3C standards, and the official platform documentation. All text here is original writing: ideas are credited and **no passages were copied**. Where a source contained errors (several did), the skill follows the standard or the official documentation, and the corrections are noted in the relevant files.

**Articles**
- Jesse Hausler, "7 Things Every Designer Needs to Know about Accessibility", Salesforce UX (2015). https://medium.com/salesforce-ux/7-things-every-designer-needs-to-know-about-accessibility-64f105f0881b
- Tushar Kumar, "Best Accessibility Tips for Making React Native Apps Work for Everyone" (2025). https://medium.com/@tusharkumardev/best-accessibility-tips-f-or-making-react-native-apps-work-for-everyone-4242c96ee1ae
- Craig Abbott, "Accessibility and font sizes" (2023). https://abbott567.medium.com/accessibility-and-font-sizes-48216468ed0c
- Dinesh, "Unlocking Android Accessibility: Your Ultimate Guide to Inclusive App Development" (2023). https://medium.com/@fierydinesh/unlocking-android-accessibility-your-ultimate-guide-to-inclusive-app-development-dc5422bc8b2a
- Manuel Matuzović, "Writing CSS with Accessibility in Mind" (2017). https://medium.com/@matuzo/writing-css-with-accessibility-in-mind-8514a0007939
- Nikhil Martinez, "Color Contrast Accessibility Testing: Tools, WCAG Ratios & How to Fix Failures" (2026). https://nikhilmartinez.medium.com/color-contrast-accessibility-testing-tools-wcag-ratios-how-to-fix-failures-470c33bd8a8c
- Rohit Gupta, "Accessibility Isn't a Checklist. It's an Architecture Decision", Design Systems Collective (2026). https://www.designsystemscollective.com/accessibility-isnt-a-checklist-it-s-an-architecture-decision-e7c263d37c50
- Mauro Vacchio, "Mobile Accessibility: The Requirement Everyone Says They Respect", OverApp (2026). https://insights.overapp.com/mobile-accessibility-the-requirement-everyone-says-they-respect-41f30978ff68
- Josh Allan, *Accessibility by Default* series (2026): Foundational Principles, Buttons, Links, Form Controls, Dialogs, Tabs/Accordions/Disclosures, Comboboxes, Sliders and Tooltips, Carousels. https://medium.com/@joshhallan
- Geri Coady, "Color Accessibility Workflows", A List Apart (2017), and its reader discussion. https://alistapart.com/article/color-accessibility-workflows/

**Standards and guidance (W3C)**
- WCAG 2.2 and 2.1, Understanding WCAG, What's New in WCAG 2.2, the WCAG 2 Overview. https://www.w3.org/WAI/standards-guidelines/wcag/
- WCAG2ICT (applying WCAG 2.2 to non-web software) and the WCAG2Mobile draft. https://www.w3.org/TR/wcag2ict-22/ · https://www.w3.org/TR/wcag2mobile-22/
- Making Content Usable for People with Cognitive and Learning Disabilities (COGA). https://www.w3.org/TR/coga-usable/
- WAI tutorials: Images, Making Audio and Video Media Accessible; WAI-ARIA Authoring Practices Guide. https://www.w3.org/WAI/

**Platform documentation**
- Apple Human Interface Guidelines: Accessibility, VoiceOver, Typography; SwiftUI accessibility modifiers. https://developer.apple.com/design/human-interface-guidelines/accessibility
- Android Developers: Compose accessibility (semantics, traversal, API defaults, testing), Make apps more accessible, Espresso accessibility checking. https://developer.android.com/develop/ui/compose/accessibility
- React Native: Accessibility and AccessibilityInfo (0.88). https://reactnative.dev/docs/accessibility
- Flutter: Accessibility docs (flutter/website). https://docs.flutter.dev/ui/accessibility
- Tools: axe-core, eslint-plugin-jsx-a11y.

## Contributing

Issues and pull requests are welcome, especially new audit rules (with good and bad fixtures), platform corrections with a link to the official docs, and translations. See [CONTRIBUTING.md](CONTRIBUTING.md).

```bash
npm test          # unit tests and fixtures
npm run validate  # package structure, links, WCAG coverage
npm run check     # everything CI runs
```

## License

[MIT](LICENSE) © 2026 Gaga John
