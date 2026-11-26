# Accessibility test plan: <product / release>

**Target:** WCAG 2.2 AA + platform standards · **Date:** … · **Tester(s):** …

## Scope
| Flow | Screens / pages | Platforms |
|---|---|---|
| Sign up | … | iOS, Android, web |
| Core task | … | … |
| Checkout / submit | … | … |
| Settings | … | … |

## Environments
| Platform | Device / browser | OS version | Assistive tech + version |
|---|---|---|---|
| iOS | iPhone … | iOS … | VoiceOver, Voice Control, Full Keyboard Access |
| Android | Pixel … | Android … | TalkBack …, Switch Access, Voice Access |
| Web (desktop) | Chrome / Firefox / Safari | Windows / macOS | NVDA …, VoiceOver |
| Web (mobile) | Safari / Chrome | iOS / Android | VoiceOver, TalkBack |

## Automated (CI)
- [ ] Static: `node scripts/audit.mjs <paths> --fail-on error` (+ eslint-plugin-jsx-a11y / Android Lint)
- [ ] Tokens: `node scripts/contrast.mjs --tokens <file>`
- [ ] Runtime: axe (web) / `performAccessibilityAudit` (iOS) / `enableAccessibilityChecks()` (Compose) / `meetsGuideline` (Flutter)
- [ ] States covered: default, error, empty, loading, dialog open, dark mode, narrow width, large text

## Manual (per flow) — see references/testing/manual-scripts.md
| Check | iOS | Android | Web |
|---|---|---|---|
| Screen reader: titles, names, roles, states, order, announcements | ☐ | ☐ | ☐ |
| Keyboard / Full Keyboard Access: reach, order, visible focus, no traps | ☐ | ☐ | ☐ |
| Switch access: every action reachable | ☐ | ☐ | — |
| Voice control: say visible labels | ☐ | ☐ | ☐ |
| Largest text / 200%–400% zoom: nothing clipped | ☐ | ☐ | ☐ |
| Greyscale: states distinguishable | ☐ | ☐ | ☐ |
| Increased contrast / forced colours | ☐ | ☐ | ☐ |
| Reduced motion | ☐ | ☐ | ☐ |
| Rotation | ☐ | ☐ | — |
| Media: captions, transcripts | ☐ | ☐ | ☐ |
| Gestures have alternatives | ☐ | ☐ | ☐ |
| Timeouts warn and extend | ☐ | ☐ | ☐ |

## Exit criteria
- No open **Required** (WCAG A/AA) findings, or each has an owner, a date and a documented workaround.
- **Platform** findings triaged.
- Untested items listed as **Not verified** in the report.
