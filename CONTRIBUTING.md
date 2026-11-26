# Contributing

Thanks for helping make AI-built interfaces usable by more people.

## Ground rules
- **Cite the standard or the official docs.** Every rule should trace to a WCAG 2.2 criterion, a W3C note, or the platform owner's documentation (Apple, Android, React Native, Flutter). Blog posts are welcome as context, but not as the authority for code; several turned out to be wrong during research.
- **Original wording only.** Paraphrase and credit; don't paste passages from articles or specs.
- **Tier everything:** Required (WCAG 2.2 A/AA), Platform (platform owner's standard) or Recommended (AAA, cognitive guidance, best practice).
- **Cover the platforms.** A component change should say what it means on web, iOS, Android, React Native and Flutter, or explain why a platform doesn't apply.

## Adding an audit rule
1. Add it to the right file in `scripts/rules/` with `id`, `title`, `severity` (error / warn / info), `tier`, `sc`, `fix`, `ref` and a `check()` function.
2. Add a **bad** example to `tests/fixtures/bad/<platform>/` that triggers it, and make sure `tests/fixtures/good/` stays clean.
3. Keep false positives low: prefer `warn` or `info` when the heuristic can be wrong, and document the `a11y-ignore` escape hatch in the fix text if needed.
4. Run `npm run check`.

## Editing the portable rules
Edit `rules/AGENTS.md`, then run `npm run build` to regenerate the Cursor and Copilot files. CI fails if they're out of date.

## Before opening a pull request
```bash
npm run check
```
This runs the generated-files check, package validation (links, components, WCAG coverage, rule references), the unit tests, and the audit on the good fixtures.
