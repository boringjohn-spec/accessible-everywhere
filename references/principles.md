# Principles

These are the ideas behind every rule in this skill. When a rule doesn't cover a case, reason from these.

## Who you are designing for

Think in terms of what people do, not diagnoses. One product has to work for all of these at once:

| People who… | Use | What breaks for them |
|---|---|---|
| can't see the screen | a screen reader (VoiceOver, TalkBack, NVDA, JAWS, Narrator, Orca), braille display | unlabelled controls, fake buttons, images without text, visual-only order, silent updates |
| see partly | zoom, large text, magnifier, high contrast, dark mode, Smart Invert | low contrast, fixed text sizes, clipped layouts, colour-only meaning, content off to the side |
| can't tell some colours apart (about 1 in 12 men, 1 in 200 women) | nothing special, or colour filters | red vs green status, colour-only links, chart series by colour |
| can't use a mouse or touch precisely | keyboard, switch (Switch Access, Switch Control), voice (Voice Control, Voice Access, Dragon), head or eye pointer, AssistiveTouch | small targets, drag-only or gesture-only actions, hover-only controls, no focus indicator, labels that don't match what they say aloud |
| are Deaf or hard of hearing | captions, transcripts, visual alerts | audio-only information, uncaptioned video, sound-only alerts |
| get dizzy or ill from motion, or have seizures | Reduce Motion, Dim Flashing Lights | parallax, zooming transitions, autoplay, flashing |
| find reading, memory, attention or numbers hard | plain layouts, autofill, password managers, reading tools | jargon, long blocks of text, timeouts, puzzles at login, re-typing, surprises |
| are older, tired, in sunlight, one-handed, on a slow phone | everything above, sometimes | everything above |

Many people use more than one of these, and many don't think of themselves as disabled. Temporary and situational needs (a broken arm, glare, a noisy train) follow the same rules.

## 1. Native first, accessibility properties last

Platform controls (`<button>`, `<input>`, SwiftUI `Button`, Compose `Button`, Flutter `ElevatedButton`) already expose a name, role, state, keyboard and focus behaviour to every assistive technology, and they keep working when the platform changes. A `div` or `View` with a tap handler exposes nothing. Rebuilding a control means rebuilding all of that, forever.

Accessibility properties (ARIA, `accessibilityLabel`, `contentDescription`, `Semantics`) are for restoring meaning that the visual design removed, such as the name of an icon-only button. They are not a way to turn a generic element into a control. "No ARIA is better than bad ARIA": a wrong role or a stale state is worse than none, because it lies to the user.

## 2. Choose the right pattern before you build it

Many accessibility failures are design failures that no code can fix. A menu with edit and delete buttons in each row is no longer a menu; it has no keyboard model a screen reader can explain. A carousel that rotates by itself takes control away from everyone. A swipe-only delete has no equivalent for a switch user.

Before building, ask: does a simpler or more standard pattern do the job? (`<select>` instead of a custom combobox, a list instead of a carousel, a visible button instead of a hover action.) Each component file in this skill starts with "use it when / don't".

## 3. The visual component isn't the whole component

A slider isn't accessible because it looks like a slider. A component is made of: what it looks like, what it's called (name), what it is (role), what state it's in, how it's operated without a pointer, where focus goes, and what gets announced when it changes. All of those are part of the design, so all of them belong in the design spec and the definition of done.

## 4. Build it in once: tokens, components, pipeline

Checklists find problems after they exist. Architecture stops them being made:
- **Tokens:** colour pairs that already pass, a type scale that already scales, target sizes and focus rings defined once.
- **Components:** shared components that already have the right semantics, keyboard model and focus behaviour, so no team rebuilds them.
- **Pipeline:** automated checks in CI that block a merge, not a release.
- **People:** a short manual test with real assistive technology, because automation finds about half at best.

## 5. Calculate, don't remember

Contrast is maths, not a feeling. Published articles quote hex values that are wrong: #959595 is widely given as the lightest grey for large text on white, but it measures 2.995:1, just under 3:1 (the real limit is #949494, 3.03:1). Use the WCAG formula in `scripts/contrast.mjs`, check every theme and state, and measure text over images at its worst point.

## 6. Adding properties can make things worse

Real mistakes from real tutorials:
- A `contentDescription` on a button that already has visible text replaces the text, says "button" twice, and stops voice users activating it by its visible name.
- Hiding real content (a special offer) from assistive technology because someone thought it was "not important".
- `aria-hidden="true"` on something that can still take keyboard focus, so a keyboard user lands on something the screen reader can't see.
- Hints on every button, which get read every time on Android because users can't turn them off there.

Rule: label only what has no name, hide only what is truly decorative or truly inert, and test what you added.

## 7. The user's settings win

People set text size, contrast, bold text, reduced motion, reduced transparency, dark mode, captions and autoplay once, in their system settings, and expect every app to follow. Fixed text sizes, `user-scalable=no`, `allowFontScaling={false}`, clamped text scalers and ignored reduced-motion settings all override a choice the person already made.

## 8. Every special interaction needs a plain alternative

Gestures, drags, long presses, shakes, hovers, timers and sounds are fine as shortcuts. They are not fine as the only way. The alternative is usually simple: a visible button, an item in the actions menu (custom accessibility actions on every mobile platform), a tap-to-place, visible text, a haptic or visual cue, or more time.

## 9. Automation is evidence, not a verdict

Static audits and runtime checkers catch missing names, low contrast, small targets and broken ARIA. They can't tell whether a label makes sense, whether focus order matches the visual order, whether an announcement is useful or noisy, or whether a flow can be completed. Every review hands over a manual test plan, and every report marks what was not verified.

## Trade-offs

- **Required beats Platform beats Recommended.** Never trade a Required item for a Recommended one.
- **When accessibility and a visual idea conflict, look for the third option**, not the compromise. A low-contrast "subtle" label can be smaller but darker; a hover-only action can be a lighter always-visible icon that darkens on hover.
- **More contrast is not always better.** Very bright pure white fields at maximum contrast can hurt people with light sensitivity. Aim for AA everywhere, AAA for body text where it fits, and support the system's increased-contrast and dark modes.
- **Don't remove features to "be accessible".** A dialog, a chart or a gesture can be accessible. Build it properly instead of deleting it.

## Sources

Hausler (Salesforce UX, 2015); Matuzović (2017); Gupta (Design Systems Collective, 2026); Allan, *Accessibility by Default* series (2026); Coady (A List Apart, 2017) and reader comments from W3C Low Vision Task Force work; W3C WCAG 2.2 and Understanding documents; Apple Human Interface Guidelines; Android Developers. Full list in the README.
