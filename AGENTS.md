# AGENTS.md: instructions for AI agents working on Bellwether

These instructions bind any LLM or agent contributing to this repository.
They supplement, and never override, GOVERNANCE.md and the mission in
kitty-specs/wsg-evaluation-report-tool-mvp/mission.md.

## Workflow

- Inspect the repository and read existing documentation before changing
  anything.
- Spec first. Create or update a spec in kitty-specs/ before implementing.
  If requirements are ambiguous, update the spec or record a question in
  docs/open-questions.md. Do not invent behaviour.
- Keep changes small and reviewable. One spec, one concern, one PR.
- Add tests with implementation. Update documentation with implementation.
- Never merge or self-approve anything on the human-review list in
  GOVERNANCE.md. Mark it for review and stop.
- Never remove functionality without maintainer confirmation.
- When revising or condensing content, state what was removed or altered
  and why.
- Disclose agent authorship in commit messages.

## Non-negotiable product rules

- Automation provides evidence, never conformance. Never write code, report
  wording, or documentation implying automated WSG conformance.
- No WSG certification claims. No certification program exists. Reports state
  that the WSG and STAR are W3C Group Note Drafts and pin snapshot dates.
- Every result carries both a testability level and a result status. Do not
  collapse these axes.
- Every finding records evidence provenance. No orphan claims.
- Do not force binary pass/fail where evidence does not justify it.
- Mark unreviewed WSG mappings draft: true. Never present draft mappings as
  reviewed.
- Do not hide evidence behind scores. No single overall score, ever.

## Accessibility rules (see docs/accessibility.md)

- Bellwether consumes accessibility evidence; it does not produce
  accessibility audits. Do not build WCAG auditing features.
- A clean automated accessibility scan NEVER justifies pass on a WSG
  accessibility criterion. Automated accessibility findings are
  partially-automated supporting evidence only.
- Existing accessibility artifacts (WCAG-EM reports, ACRs, EN 301 549
  assessments) are organizational evidence; absent artifacts, the result is
  requires-organizational-evidence.
- Every generated report includes the accessibility boundary statement and
  the no-certification statement. Do not remove or weaken either.
- Everything shipped meets WCAG 2.2 AA minimum; generated reports are
  semantic, script-free HTML.

## Report language and motivation rules (see docs/design-principles.md)

- Lead with progress: deltas, trends, and what already passes come before
  failure lists. Never render a wall of undifferentiated failure.
- Pair every problem with the smallest credible next step and, where
  possible, the organizational metric it serves (cost, performance,
  disclosure, maintenance).
- Identity framing over compliance framing. Plain language. No shame
  mechanics, no moralizing, no greenwashing superlatives.
- Trend integrity is a first-class requirement: never let scope changes
  masquerade as regressions or improvements.

## Engineering rules

- Minimal dependencies. Adding one requires spec or ADR justification.
- The editor may use JavaScript within the ADR-0001 budget; generated
  reports are zero-JS with no exceptions.
- No telemetry, no analytics, no network calls during report editing, no
  external AI calls unless explicitly configured by the user.
- Validate schemas on every write path. Fail loudly on structural surprises.
- Preserve backward compatibility of schemas where practical; breaking
  changes need an ADR and a migration note.

## Naming

The project is Bellwether. No "a": from "wether", the belled ram, not
"weather". Reject the misspelling in code, docs, and package names.
