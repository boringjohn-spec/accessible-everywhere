# Cognitive accessibility and plain language

People with learning disabilities, dyslexia, ADHD, autism, brain injury, dementia, anxiety or low literacy, and anyone tired, stressed or using a second language, need interfaces that are clear, predictable and forgiving. WCAG covers only part of this. W3C's **COGA** guidance ("Making Content Usable for People with Cognitive and Learning Disabilities") fills the rest. Most of it is design and wording, so it belongs in Design mode.

**Tiering:** items marked **R** are WCAG 2.2 A/AA (Required). Everything else is **Recommended**. Recommended items don't block shipping, but they make the product better for everyone.

## 1. Make it clear what things are and how to use them
- Each screen states its purpose in its title or heading. (R: 2.4.2, 2.4.6)
- Use familiar patterns and platform conventions instead of novel ones.
- **Controls look like controls; non-controls don't look clickable.** No flat text buttons that look like labels; no underlined text that isn't a link.
- Same things look and work the same everywhere. (R: 3.2.4 on sites)
- In multi-step tasks, show the step, what's done and what's left.
- Put controls next to what they affect. Avoid nested scrolling areas.
- Use familiar icons, one meaning each, with text labels for anything important.

## 2. Help people find what they need
- The most important tasks are the most prominent.
- **Critical actions and safety information are visible without scrolling, hovering or opening menus.**
- Clear, labelled sections with headings. (R: 1.3.1)
- Search tolerates typos and suggests results.
- Help is in the same place on every screen. (R: 3.2.6)

## 3. Use clear content
- Common words; explain jargon the first time; no unexplained abbreviations.
- Present tense and active voice; no double negatives; literal language (explain idioms).
- **Short sentences and paragraphs, one idea each.** Split paragraphs over ~50 words; numbered steps for anything with 3+ steps; one instruction per line.
- A short summary at the top of long content.
- Plenty of white space; no text over busy backgrounds.
- Numbers: give the meaning, not just the figure ("You'll pay £12 a month, about £144 a year").
- Button labels say what happens ("Pay £24.99", "Delete 3 files"), not "Submit" or "OK".

## 4. Help people avoid and fix mistakes
- **Nothing moves or changes unexpectedly.** Show loading states; don't shift layouts under people's fingers. (R: 3.2.1, 3.2.2)
- **Back always works and never loses data.**
- **Show fees and costs at the start**, not at the last step.
- Ask for as little as possible; accept many formats (spaces, dashes, +44, lowercase).
- Clear visible labels and instructions **before** the field. (R: 3.3.2)
- Specific error messages with the fix. (R: 3.3.1, 3.3.3)
- Review and confirm before anything irreversible; offer undo. (R: 3.3.4 for legal, financial and data)
- **Avoid timeouts; save progress.** If a timeout is unavoidable, say how long at the start and let people extend it. (R: 2.2.1)
- **Feedback for every action**, visible and announced: saved, sent, failed. (R: 4.1.3 for status messages)
- Explain privacy and security risks in plain words before asking for personal data.

## 5. Help people focus
- Limit interruptions: no surprise pop-ups, modals or auto-playing media. (R: 2.2.2 for moving content)
- Short critical paths: required steps only; move optional things out of the way.
- **About five main choices per screen**; put the rest behind "More".
- Before a task, say how long it takes and what people need (ID, card, documents).

## 6. Don't rely on memory
- **Login without memory tests or puzzles**: password managers, paste, passkeys, magic links, OTP autofill. (R: 3.3.8)
- Don't make people re-enter information. (R: 3.3.7)
- Each step shows what people need to continue (don't make them remember a code from three screens ago, or do maths).

## 7. Provide help
- Human help is easy to find and reach.
- Explain results, costs and risks before people commit.
- Help text next to unusual controls.
- Reminders only when people ask for them.

## 8. Support personalisation
- Respect system settings: text size, spacing, contrast, reduced motion. (R: 1.4.4, 1.4.12 web)
- **Don't block** password managers, spell check, translation, text-to-speech, reader modes or autofill.
- Let people hide non-essential features; offer a simpler mode where it makes sense (iOS **Assistive Access** is a model: core features, one task per screen, double confirmation for destructive actions).

## Writing checklist (for any UI copy)
- [ ] Says what happens next ("Save draft", not "Submit")
- [ ] One idea per sentence; under ~20 words where possible
- [ ] No jargon, idioms or unexplained abbreviations
- [ ] Errors say what's wrong and how to fix it, kindly
- [ ] Numbers and dates in local, familiar formats
- [ ] Instructions before the action, not only in errors

Wording craft (voice, tone, microcopy) belongs to a writing skill if one is available; this file sets the accessibility requirements that wording must meet.

## Sources
W3C COGA "Making Content Usable for People with Cognitive and Learning Disabilities" (Working Group Note, 2021) and WCAG 2 Supplemental Guidance; WCAG 2.2; Apple HIG (cognitive, Assistive Access).
