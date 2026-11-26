# Accessibility review: <what was reviewed>

**Scope:** … (screens, components, files, flows) · **Platforms:** … · **Target:** WCAG 2.2 AA + platform standards · **Date:** …

## Summary
- **Required (WCAG A/AA):** N issues (blocks release)
- **Platform:** N issues
- **Recommended:** N suggestions
- **Biggest risk in one sentence:** … (e.g. "Screen reader users can't complete checkout: the payment button has no name and the error summary isn't announced.")

## How this was checked
- Automated: … (tool, version, states covered)
- Manual: … (assistive tech, devices, flows)
- **Not verified:** … (anything you couldn't test, e.g. "TalkBack on a real device", "captions accuracy")

## Findings (Required first)

### 1. <short title>
- **Tier:** Required · **WCAG:** 4.1.2 Name, Role, Value (A) · **Platform:** iOS
- **Where:** `CheckoutView.swift:42` / Checkout → Payment
- **Who is blocked:** VoiceOver users hear "button" with no name and can't tell it pays.
- **Evidence:** … (audit output, screenshot, what the screen reader said)
- **Fix:** `.accessibilityLabel("Pay £24.99")`, or use a `Button("Pay £24.99")` with visible text.
- **Reference:** references/components/button.md

### 2. …

## What works well
- … (keep this short, but say it: it tells the team what to keep doing)

## Next steps
1. Fix Required items; re-run `scripts/audit.mjs` and the manual checks for those flows.
2. Add the CI gate: …
3. Schedule the manual pass on: …

> This review reports what was checked and found. It is not a certification of WCAG conformance and not legal advice.
