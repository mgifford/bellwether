# Mission: Bellwether, a WSG Evaluation Report Tool (MVP)

Status: Approved 2026-07-03 by Mike Gifford (lead maintainer). Production code may proceed in the task order below.

## Problem statement

There is no equivalent of the W3C WAI WCAG-EM Report Tool for the Web Sustainability Guidelines (WSG). Evaluators who want to assess a website or digital service against the WSG have scanners (Lighthouse, axe-core, CO2.js, vital-core) that produce evidence, but no structured way to combine automated evidence with manual evaluation, organizational documentation, evaluator judgement, and documented uncertainty into a defensible, accessible, exportable report.

Automation cannot determine most of the WSG. The Business Strategy and Product Management section alone contains 27 guidelines (procurement, governance, AI responsibility, end-of-life planning) that no scanner can assess. A tool that pretends otherwise produces greenwashing, which WSG section 1.4.3 explicitly warns against.

## Product definition

A local-first, static-first reporting and evidence tool for WSG evaluations.

Decided (2026-07-02):
- Interface model: the WCAG-EM Report Tool's stepwise report-builder pattern (define scope, explore, audit, report) is the UI reference. We copy the interaction model, not the methodology.
- Content and methodology: WSG success criteria and STAR techniques/tests, loaded from dated, versioned snapshots. Every report pins wsg_version and star_version (both are drafts; the date is part of the record).
- The editor is a JavaScript application, built cautiously (progressive enhancement where practical, accessible widgets, JS budget tracked per release). Zero-JS applies to generated reports only. See ADR-0001.
- Ingests automated scan output (vital-core first) as evidence, never as verdicts. vital-core owns continuous crawling and scanning; Bellwether never crawls. Import is via vital-core's published artifacts (API or WebMCP server where available, static run JSON as fallback) rather than a one-off file drop, so a report can be refreshed against current scan data without re-uploading.
- Every result carries both a testability level and a result status.

## Non-goals

- Not a scanner. Scanning stays in vital-core and similar tools.
- Not a certification system. The tool never issues or implies WSG certification. WSG is a W3C Group Note Draft; W3C states it is inappropriate to cite it as other than a work in progress.
- Not a scoring product. Optional coverage and completion indicators only; evidence is always primary.
- Not a hosted service. No accounts, no server-side database, no telemetry.
- Not a WSG interpretation authority. Mappings are versioned data, marked draft until reviewed, with a documented interpretation process.

## Users and user stories

evaluator:
  - As a sustainability evaluator, I create a report, define scope, import a vital-core run, map findings to WSG success criteria, add manual findings, and export an accessible HTML report.
  - As an evaluator, I record what I could not test and why, so the report is honest about coverage.
accessibility_auditor:
  - As an auditor working across WCAG and WSG, I record accessibility findings as sustainability evidence (WSG treats accessibility as a non-negotiable) without duplicating my WCAG-EM work.
public_sector_manager:
  - As a program manager, I read a report that distinguishes automated evidence from evaluator judgement from organizational documentation, and use it in procurement or remediation planning.
  - As a leader without time to read raw scan output, I see which trends and patterns recur across pages and technologies (e.g., a specific third-party script or an aging platform showing up repeatedly across findings), so I know what to prioritize: reducing third-party tooling, retiring legacy codebases, or funding a specific remediation.
organization:
  - As a team, we reopen a report next quarter, re-import fresh scan data, and track what changed.

## Methodology anchor

The evaluation workflow follows STAR (https://w3c.github.io/sustainableweb-wsg/star.html), the WSG supplement containing the evaluation methodology and per-technique implementation tests. Where STAR defines a technique and test for a success criterion, the automated-check-map references the STAR technique ID. Where STAR is silent, mappings are marked `draft: true` and require human review before leaving draft.

The WSG conformance model (spec section 1.4) is the roll-up model: success criterion -> guideline -> section (role-based) -> full. Findings are recorded at the success criterion level. Guideline and section summaries are computed, never entered directly.

## Core principle (restated as invariants)

1. No automated WSG conformance claims. Report language must never state or imply that automation established conformance.
2. Every result carries a testability level, independent of result status:
   - automatically-tested
   - partially-automated
   - manual-review-required
   - organizational-evidence-required
   - not-evaluated
   - not-applicable
   - cannot-determine
3. Every result carries a result status: pass, needs-improvement, fail, not-applicable, not-tested, cannot-determine, requires-organizational-evidence.
4. Every finding records evidence provenance (tool/version/date/config for automated; evaluator/method/date/confidence for manual; document/owner/date for organizational).
5. Reports are pinned to a dated WSG snapshot (`wsg_version`), because WSG is a living draft and criteria will change.

## MVP scope

in_scope:
  - create/edit report metadata and scope (domains, URLs, journeys, exclusions, time period)
  - load WSG guideline and success criterion data from versioned JSON (wsg-guidelines.json)
  - import one vital-core run (runs/latest.json shape, via file, API, or WebMCP where available) via a versioned importer
  - map imported findings to WSG success criteria using automated-check-map.json; accept/reject/edit/annotate
  - add manual findings and organizational evidence with provenance
  - assign result status, severity, impact, confidence, owner, remediation status
  - generate accessible, JS-free, printable HTML report
  - export JSON (schema-validated) and Markdown summary
  - local-first persistence: report is a JSON file the user owns; browser draft storage as convenience only
  - sample report and documentation of automation limits
out_of_scope_for_mvp:
  - additional importers (Lighthouse, Wappalyzer, Green Web Foundation) beyond stubs
  - CSV export, LLM-ready reduced JSON, redaction workflow (schema supports a sensitivity flag now to avoid migration later)
  - multi-report comparison and trend views
  - CLI report generation

## Interface pattern (decided 2026-07-02)

The editor follows the WCAG-EM Report Tool's stepped-wizard pattern, adapted to STAR's evaluation methodology:

1. Define scope (subject, domains, journeys, exclusions, WSG/STAR snapshot dates)
2. Explore the subject (technologies, key templates, user journeys, organizational context)
3. Select sample (representative pages, journeys, and organizational evidence to review)
4. Evaluate (per WSG section: import automated evidence, record manual and organizational findings against success criteria)
5. Report (narrative, summaries, exports)

Content shown at each step (guideline text, success criteria, techniques, tests) comes from the pinned WSG and STAR snapshots, never hard-coded into UI components. Left-hand step navigation, per-step completeness indicators, and save/resume via a user-owned JSON file, matching the Report Tool's mental model so evaluators who know WCAG-EM feel at home.

## Architecture direction (ADR-0001 proposed)

- Static-first, progressive enhancement, TypeScript.
- Editor: JavaScript is required for a stepped, stateful evaluation UI and is acceptable (decided 2026-07-02). Discipline, not abstinence: documented JS budget, no client framework larger than the problem, standard form controls over custom widgets, state serializes to the report JSON at every step so a crash or tab close loses nothing meaningful.
- Generated report: zero JS, no exceptions.
- WSG and STAR data are versioned, dated JSON snapshots in /src/data/wsg.
- Playwright for testing only.
- WSG data, testability map, and check map are versioned JSON in /src/data/wsg, generated from the WSG editor's draft repository (w3c/sustainableweb-wsg) where possible rather than hand-typed.
- Playwright for testing only.

## Relationship to vital-core

- Division of labor: vital-core crawls, scans, and continuously measures (accessibility via axe-core/Alfa, sustainability via co2.js and page-weight/tech-stack signals) and publishes trend data. Bellwether never crawls (non-goal 1) and does not duplicate vital-core's continuous scanning. Bellwether consumes vital-core's output as evidence and adds the layer vital-core does not: structured manual/organizational findings against WSG, and a management-facing view of trends and patterns for prioritization (see public_sector_manager user story).
- vital-core is the reference automated evidence producer. Its published artifacts (runs/latest.json, api/targets.json, per-target issue snapshots) define the first import format; an API or WebMCP interface is preferred over static file drops where vital-core exposes one, so reports can refresh against live scan data (see MVP scope).
- This repository mirrors vital-core's Spec-Kitty conventions (.kittify/, kitty-specs/, CONSTITUTION.md, AGENTS.md) so the two projects share a governance vocabulary.
- No shared code initially; shared schemas are a candidate for a later extraction, decided by ADR.
- Domain/site lists (which sites to scan) belong entirely to vital-core's config/targets.yml. Bellwether's "scope" (MVP scope, in_scope) is per-report and downstream: which of vital-core's already-scanned domains this particular evaluation covers, not a crawl instruction.

## Definition of done (per feature)

- spec updated, tasks completed, tests added and passing
- accessibility review completed (WCAG 2.2 AA minimum)
- sustainability review completed (page weight, JS budget, dependency count recorded)
- schemas validated; sample report regenerates without error
- documentation updated
- human review completed where GOVERNANCE.md requires it

## First implementation tasks (post-approval order)

1. ADR-0001 framework and rendering approach
2. Emit wsg-guidelines.json from the WSG source for the pinned snapshot; validate counts against the spec (4 sections, ~80 guidelines)
3. finding-schema, evidence-schema, report-schema as JSON Schema (draft in /schemas of this proposal)
4. vital-core importer spec (input shape, mapping rules, provenance capture)
5. First 20 automated-check-map entries, all marked draft, each citing a STAR technique or an explicit rationale for its absence
6. Report renderer spec (accessible HTML, print stylesheet, zero JS)
7. Governance docs promoted from draft; interpretation and review process tested on the first 20 mappings

## Open risks

- WSG volatility: the spec is a Group Note Draft updated as recently as 21 May 2026. Mitigation: wsg_version pinning, snapshot-based data files, migration notes per snapshot.
- Mapping overreach: pressure to mark checks "automatically-tested" that are only proxies (e.g., page weight as a proxy for guideline 2.11 media optimization). Mitigation: false-positive/false-negative fields are mandatory in every mapping; reviewers reject mappings without them.
- Scope creep toward scanning: refused by non-goal 1.
- Solo-maintainer governance theater: the governance model below is designed to be executable by one maintainer plus AI agents plus occasional external reviewers, not to imitate a large project.

## Parked (explicitly out of scope for this mission, tracked for later)

- vital-core multi-tenancy: the maintainer currently runs multiple near-duplicate vital-core deployments (e.g. HHS/CMS-focused instances, a Hugging Face Spaces mirror) to cover different site groups, which does not scale as a repo-per-site-group pattern. This is a vital-core architecture/deployment problem, not a Bellwether concern. Needs its own investigation in vital-core before any Bellwether dependency is designed around it.
- LLM-assisted analysis/chatbot: possible future Bellwether or vital-core feature to let evaluators or managers query findings conversationally (candidates: Hugging Face-hosted models, GitHub Copilot). Deferred until a concrete cost model exists; the maintainer is already at capacity on hosted-model credits, so any such feature should default to bounded, low-cost, or local inference (see the maintainer's local-first Ollama routing preference) rather than open-ended hosted LLM calls.
