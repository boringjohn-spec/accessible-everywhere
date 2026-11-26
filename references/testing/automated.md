# Automated testing (the pipeline layer)

Automation stops regressions and catches the mechanical failures (missing names, contrast, small targets, broken ARIA, missing labels) before a person looks. It **can't** judge whether a label makes sense, whether order matches meaning, or whether a flow can be completed: Deque says axe-core finds about **57%** of WCAG issues on average, and that's one of the best tools. Treat results as evidence, and always add a manual pass ([manual-scripts.md](manual-scripts.md)).

## The gate per stack
| Stack | Static (on every commit) | Runtime / UI tests (in CI) | On device / manual tools |
|---|---|---|---|
| **Web (React)** | `eslint-plugin-jsx-a11y` (`flatConfigs.recommended` or `strict`) | `@axe-core/playwright` on key pages and states; `jest-axe` / `vitest-axe` for components (no contrast in JSDOM) | Lighthouse, WAVE, Accessibility Insights, browser accessibility tree |
| **Web (Vue / Svelte / Angular)** | `eslint-plugin-vuejs-accessibility`; Svelte compiler warnings; Angular ESLint template a11y rules | axe-core via Playwright or Cypress (`cypress-axe`) | same |
| **iOS** | SwiftLint custom rules (optional) | XCUITest `try app.performAccessibilityAudit()` (Xcode 15+, iOS 17+) | Accessibility Inspector audit; VoiceOver on device |
| **Android (Compose)** | Android Lint | `ui-test-junit4-accessibility` + `composeTestRule.enableAccessibilityChecks()` (Compose 1.8+) | Accessibility Scanner; TalkBack |
| **Android (Views)** | Android Lint | Espresso `AccessibilityChecks.enable().setRunChecksFromRootView(true)` | Accessibility Scanner; TalkBack |
| **React Native** | `scripts/audit.mjs` React Native rules | React Native Testing Library queries by role and name; native Espresso/XCUITest audits on the built app | Accessibility Inspector, Accessibility Scanner, VoiceOver, TalkBack |
| **Flutter** | `scripts/audit.mjs` Flutter rules | widget tests with `meetsGuideline(androidTapTargetGuideline / iOSTapTargetGuideline / labeledTapTargetGuideline / textContrastGuideline)` | Accessibility Scanner, Accessibility Inspector, Chrome DevTools (web) |
| **Design tokens** | `node scripts/contrast.mjs --tokens tokens.json` | — | — |
| **Any** | `node scripts/audit.mjs <paths> --fail-on error` | — | — |

## Snippets

**Playwright + axe (web)**
```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('checkout has no detectable WCAG A/AA violations', async ({ page }) => {
  await page.goto('/checkout');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```
Test **states**, not just pages: open menus and dialogs, error states, dark mode, mobile width.

**XCUITest (iOS 17+)**
```swift
func testAccessibilityAudit() throws {
  let app = XCUIApplication()
  app.launch()
  try app.performAccessibilityAudit()
}
```

**Compose (1.8+)**
```kotlin
@get:Rule val composeTestRule = createAndroidComposeRule<ComponentActivity>()

@Test fun checkoutIsAccessible() {
  composeTestRule.enableAccessibilityChecks()
  composeTestRule.setContent { CheckoutScreen() }
  composeTestRule.onRoot().tryPerformAccessibilityChecks()
}
```

**Espresso (Views)**
```kotlin
init { AccessibilityChecks.enable().setRunChecksFromRootView(true) }
```

**Flutter**
```dart
testWidgets('a11y guidelines', (tester) async {
  final handle = tester.ensureSemantics();
  await tester.pumpWidget(const MyApp());
  await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
  await expectLater(tester, meetsGuideline(iOSTapTargetGuideline));
  await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
  await expectLater(tester, meetsGuideline(textContrastGuideline));
  handle.dispose();
});
```

**GitHub Actions (this skill's scripts)**
```yaml
- run: node path/to/accessible-everywhere/scripts/audit.mjs src --fail-on error --format github
- run: node path/to/accessible-everywhere/scripts/contrast.mjs --tokens design/tokens.json
```

## Rules for using results
- **Suppress narrowly.** Suppress a specific check on a specific element with a reason and an owner, never a whole rule.
- **Zero violations ≠ accessible.** Report it as "no detectable violations in the tested states".
- **Test the states that matter**: errors, empty, loading, open overlays, dark mode, large text, narrow widths.
- **Fail the build on Required issues**; warn on Platform and Recommended ones.

## Sources
axe-core README (57% figure, usage); eslint-plugin-jsx-a11y README; Android Developers (Espresso accessibility checking, Compose accessibility testing); Flutter accessibility testing docs; Apple XCTest (performAccessibilityAudit); Gupta (2026, pipeline layer).
