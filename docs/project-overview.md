# Bellwether project overview

One document explaining what exists, why it exists, and where the reasoning
lives. Written 2026-07-03, covering the repository through spec-001.

## What Bellwether is

A local-first evaluation report and evidence tool for the W3C Web
Sustainability Guidelines (WSG), modeled on the WCAG-EM Report Tool's
stepped-wizard interface and anchored to the STAR evaluation methodology.
Bellwether is not a scanner, not a certification system, and not an
accessibility audit tool. It helps a human evaluator assemble honest,
provenance-tracked evidence: automated scan results, manual findings, and
organizational documentation, into accessible, exportable reports.

The name: a bellwether is the belled ram that leads the flock and signals
where things are heading. The tool signals direction; it does not certify
arrival.

## The core design argument

Most of the WSG cannot be determined by automation. Governance, procurement,
content strategy, AI responsibility, and lifecycle management are
organizational questions. A tool that converts scanner output into
conformance claims is greenwashing infrastructure, which WSG section 1.4.3
warns against explicitly. So every Bellwether result carries two independent
axes: a testability level (how this can be evaluated at all) and a result
status (what the evidence shows), and every finding records where its
evidence came from. Reports pin dated snapshots of the WSG and STAR because
both are living W3C Group Note Drafts.

## What is built so far (spec-001)

The snapshot pipeline, chosen first because everything else depends on
trustworthy, identifier-stable guideline data:

- scripts/snapshot.mjs converts upstream w3c/sustainableweb-wsg data
  (guidelines.json, star.json) into dated snapshots under src/data/wsg/,
  deriving positional success criterion IDs (2.1.1) plus per-criterion
  content hashes, linking STAR techniques to guidelines by anchor, and
  validating everything against JSON Schemas before writing. Structural
  surprises fail the build.
- scripts/diff-snapshots.mjs classifies every criterion between two
  snapshots as unchanged, reworded, moved, added, or removed, and emits a
  human-reviewed Markdown migration note. The hash design exists so an
  inserted criterion cannot masquerade as dozens of reworded ones.
- First real snapshot: 2026-06-09 (4 sections, 71 guidelines, 196 criteria,
  117 STAR techniques). The pipeline already earned its keep: two fetches of
  upstream main hours apart, with identical lastModified stamps, returned
  different data, confirming that date stamps upstream are unreliable and
  SHA pinning is required (tasks/spec-001-followups.md).
- 7 passing tests, CI, one runtime dependency (ajv).

## Where the reasoning lives

- kitty-specs/wsg-evaluation-report-tool-mvp/mission.md: problem, users,
  scope, invariants, the five-step wizard interface pattern, MVP definition.
- kitty-specs/spec-001-wsg-snapshot-pipeline.md: the implemented feature's
  full specification and acceptance criteria.
- GOVERNANCE.md: decision process, human-review list, conformance language
  policy, WSG interpretation process, schema versioning.
- adr/ADR-0001: editor is a JavaScript application within a budget;
  generated reports are zero-JS. ADR-0002: AGPL-3.0, with the rejected
  permissive-license argument preserved.
- docs/design-principles.md: the behavioral design case. Progress is the
  product (visible deltas motivate; walls of red demotivate), no single
  scores, identity over compliance framing, the procurement/law/testability
  lessons from WCAG, Section 508, and EN 301 549, mapping WSG improvements
  to KPIs organizations already own (cost, conversion, disclosure,
  maintenance), and systems-level integration points (procurement templates,
  design systems, CI budgets, content governance).
- docs/accessibility.md: accessibility's three distinct roles here. WSG
  accessibility criteria consume existing accessibility artifacts (WCAG-EM
  reports, ACRs, EN 301 549 assessments) as organizational evidence; a clean
  automated scan never justifies a pass; and every report carries a boundary
  statement that it is not an accessibility audit.
- AGENTS.md: binding instructions for AI agents contributing to the
  repository, encoding all of the above as non-negotiable rules.
- docs/snapshots.md: how to cut, diff, and migrate snapshots.
- docs/reviews/: review notes, including the spec-001 code review.
- docs/open-questions.md: every resolved and outstanding decision, dated.

## What comes next

In dependency order: spec-001 amendment for commit-SHA pinning of upstream
fetches; report, finding, and evidence JSON Schemas promoted from
schemas/schema-draft.yaml; the vital-core importer; the first 20
automated-check-map entries (all draft, each citing a STAR technique or a
rationale for its absence); then the five-step editor per ADR-0001.
