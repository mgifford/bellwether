# Contributing to Bellwether

Bellwether follows a spec-first workflow (Spec-Kitty). Feature work starts with a specification in `kitty-specs/`, not with code. Pull requests for features must reference an approved spec; small fixes are exempt.

## Ground rules

- Read `GOVERNANCE.md`. Changes touching WSG interpretation, mappings, scoring, conformance language, report wording, accessibility, sustainability, privacy, or schemas require human review before merge.
- Automation provides evidence, never conformance. Contributions that blur this are declined.
- Accessibility (WCAG 2.2 AA) and sustainability review are part of the definition of done, not optional extras.
- Do not add dependencies without spec or ADR justification.
- Mark draft WSG mappings as draft. Never invent interpretations silently; open an issue labeled `wsg-interpretation`.

## Developer certificate of origin

Contributions are accepted under the Developer Certificate of Origin (DCO). Sign off your commits: `git commit -s`.

## Tests

`npm test` must pass. New behaviour needs new tests in `tests/`.
