# Forms, errors and login

> A form asks for as little as possible, tells people what's needed before they start, never asks twice, catches mistakes kindly and specifically, lets people check before anything is final, and never makes logging in a memory test.

Field-level rules are in [text-field.md](text-field.md) and [choice-controls.md](choice-controls.md). This file covers the whole form.

## Contract
| # | Requirement | Tier | SC |
|---|---|---|---|
| 1 | Every field labelled; related fields grouped and named (fieldset/legend, headings) | Required | 1.3.1, 3.3.2 |
| 2 | Required fields indicated in text (and programmatically) | Required | 3.3.2 |
| 3 | Errors: say which field, what's wrong, how to fix it; tied to the field; announced | Required | 3.3.1, 3.3.3, 4.1.3 |
| 4 | Legal, financial and data-changing submissions are reversible, checked, or confirmed with a review step | Required | 3.3.4 |
| 5 | Information given earlier in the same process is filled in or selectable (shipping = billing) | Required | 3.3.7 |
| 6 | Login: no memory, transcription or puzzle test without an alternative or help; **paste and password managers allowed** | Required | 3.3.8 |
| 7 | Time limits can be turned off, extended or warned about (≥ 20 seconds to extend) | Required | 2.2.1 |
| 8 | Input purpose declared for personal data | Required | 1.3.5 |
| 9 | Help (contact, chat, FAQ) in the same place on every step | Required | 3.2.6 |
| 10 | Changing a field never submits or navigates by itself | Required | 3.2.2 |
| 11 | Show the number of steps, where you are, and what's needed before starting (documents, time) | Recommended | (cognitive) |
| 12 | Show fees and costs at the start, not at the last step | Recommended | (cognitive) |

## Validation pattern

1. **Validate on submit** (and optionally on leaving a field). Don't validate on every keystroke, and don't show errors on fields people haven't reached.
2. **Don't disable Submit until the form is valid.** People can't tell what's wrong. Let them press it and show errors.
3. On a failed submit:
   - **Short form:** move focus to the first invalid field; its error is read with it.
   - **Long form:** show an **error summary** at the top (heading "There are 2 problems", a list of links to each field), move focus to it, and show each error next to its field too.
4. Each error: icon + text + field styling; text tied to the field (`aria-describedby` / native error API); `aria-invalid="true"` on web.
5. Keep what people typed. Never clear a form on error.
6. While submitting: keep the button in place, show progress, announce "Sending…" and then the result (`role="status"` / announcement). Prevent double submits without hiding the button.

```html
<div class="error-summary" role="alert" tabindex="-1" aria-labelledby="err-title">
  <h2 id="err-title">There are 2 problems</h2>
  <ul>
    <li><a href="#email">Enter an email address like name@example.com</a></li>
    <li><a href="#postcode">Enter a postcode</a></li>
  </ul>
</div>
```

## Error patterns per platform
| Platform | Show and announce an error |
|---|---|
| Web | Inline message tied with `aria-describedby`, `aria-invalid="true"`, error summary with links (above), focus moved on submit |
| iOS | Visible error text under the field; include it in the field's `accessibilityValue` or hint; post `AccessibilityNotification.Announcement(…)`; move VoiceOver focus to the first invalid field with `@AccessibilityFocusState` |
| Android | Compose `isError` + `supportingText` + `semantics { error("…") }`; Views `TextInputLayout.setError()` (announced); request focus on the first invalid field |
| React Native | Visible text; `accessibilityLiveRegion="polite"` (Android) **and** `AccessibilityInfo.announceForAccessibility()` (iOS); `sendAccessibilityEvent(ref, 'focus')` to move focus |
| Flutter | `InputDecoration(errorText: …)` (announced with the field); `SemanticsService.announce()` for form-level messages; `FocusNode.requestFocus()` on the first invalid field |

## Login and account security (3.3.8)

Do:
- Support **password managers**: `autocomplete="username"` / `"current-password"` / `"new-password"`; iOS `textContentType(.username / .password / .newPassword)` with associated domains; Android `autofillHints`; React Native `textContentType` + `autoComplete`; Flutter `AutofillGroup` + `autofillHints`.
- **Allow paste** everywhere, including passwords and verification codes.
- Offer at least one option without a memory test: **passkeys**, a **magic link**, sign in with an identity provider, or a code that **autofills** (`autocomplete="one-time-code"`, iOS `.oneTimeCode`, Android SMS Retriever / `autofillHints` for SMS OTP).
- Offer **show password**.
- If you need a bot check, use one that doesn't need a puzzle (invisible risk scoring, an email link), or offer a non-visual, non-cognitive alternative.

Don't:
- Ask people to retype a code character by character into separate boxes that block paste.
- Use "type the characters in the image" CAPTCHAs or "pick all the traffic lights" without an alternative.
- Ask for specific characters of a password ("enter the 3rd and 7th letters").
- Time out a code entry without a way to get more time or a new code.

## Multi-step flows
- Show progress ("Step 2 of 4: Delivery") as text, with the current step marked (`aria-current="step"`).
- Each step has its own heading and title; focus moves to it on arrival.
- **Back never loses data.**
- Review page before payment or anything irreversible, with "Change" links to each section.
- Session timeouts: warn before expiry with an "I need more time" button; save progress.

## Common mistakes
- Disabled submit button with no explanation.
- Errors only in a toast or only at the top of the page.
- Red borders without text.
- Clearing fields after an error.
- Re-asking for an address or email already given.
- Blocking paste in passwords or OTP fields; separate OTP boxes that break autofill.
- Surprise fees on the last step.

## Test it
- Submit empty: focus goes to the summary or first error; each error is read with its field.
- Fill with a password manager and with autofill; paste a password and a code.
- Screen reader through a multi-step flow: step name and progress announced on each step.
- Timeouts: wait for the warning; extend with one action.
- Automated: axe `label`, `autocomplete-valid`, `aria-valid-attr-value`; jsx-a11y `autocomplete-valid`, `label-has-associated-control`.

## Sources
WCAG 2.2 (1.3.5, 2.2.1, 3.2.2, 3.2.6, 3.3.1–3.3.4, 3.3.7, 3.3.8) and What's New in 2.2; W3C COGA (objectives 4 and 6); Allan (2026); Hausler (2015); Android Compose semantics; Apple HIG; React Native; Flutter.
