# ADR-0001: Stepped-wizard editor with disciplined JavaScript; zero-JS reports

- Status: accepted
- Date: 2026-07-02
- Deciders: Mike Gifford (lead maintainer)
- Spec reference: kitty-specs/wsg-evaluation-report-tool-mvp/mission.md

## Decision

The editor is a client-side stepped wizard modeled on the WCAG-EM Report Tool (scope, explore, sample, evaluate, report), requiring JavaScript. Evaluation content is rendered from dated WSG and STAR JSON snapshots. Generated and exported reports contain no JavaScript. Framework choice is deferred to ADR-0002 but constrained to lightweight, static-export-capable options; candidates are Svelte compiled output (the Report Tool's own approach), Preact, or vanilla TS with a small state module.

## Rationale

A stateful, form-heavy evaluation workflow cannot be honestly delivered without JS; the WCAG-EM Report Tool itself is a JS application. What the WSG demands is discipline: small payload, no tracking, no unnecessary dependencies, and reports that work offline, in print, and without script. Splitting the JS policy by artifact (editor vs report) satisfies both usability and the tool's own sustainability requirements.

## Alternatives considered

- Zero-JS editor via server-rendered forms: requires a server, violating local-first and no-account constraints.
- Full SPA framework (React + ecosystem): payload and dependency count unjustified; violates "no bloated client-side framework unless justified."
- Static forms with page-per-step and URL state: fragile for a multi-hundred-field report, poor autosave story.

## Accessibility impact

Positive if constrained: standard HTML form controls, no custom widgets without an ARIA pattern and testing, visible focus, keyboard-complete wizard navigation, step status announced to assistive technology. The wizard pattern is familiar to evaluators from the Report Tool. WCAG 2.2 AA is part of definition of done.

## Sustainability impact

JS budget to be set in the spec (proposal: editor bundle under 150 KB compressed, zero third-party runtime requests, system fonts). Reports: semantic HTML and CSS only.

## Performance impact

Client-only, local-first; no network dependency after load. Snapshot JSON loaded once and cached.

## Privacy impact

No network calls during editing. Report data never leaves the browser except by explicit user export.

## Maintenance cost

Moderate. Framework choice (ADR-0002) is the main driver; snapshot-driven content keeps UI code decoupled from WSG churn.

## Risks

- Budget creep as features accumulate; mitigated by CI bundle-size check.
- Custom widget temptation in the evaluate step (large criterion lists); mitigated by governance human-review rule for accessibility-affecting UI.

## Review status

Human review required: yes. Reviewed by: Mike Gifford. Date: 2026-07-02. Approval also covers the derived success criterion ID scheme (positional section.guideline.criterion IDs plus per-criterion content hash for snapshot diffing), specified in spec-001.
