# Governance (DRAFT)

Status: draft-1. Sized for a small open source project: one lead maintainer, AI agents operating under AGENTS.md, and invited reviewers. This document avoids process that a project this size cannot actually execute.

## Purpose

Provide a WSG evaluation reporting and evidence tool that never overstates what automation can determine.

## Scope

Report creation, scan-evidence import, manual and organizational evidence capture, WSG mapping data, accessible report generation and export.

## Non-goals

Scanning, certification, scoring-as-product, hosted service, WSG interpretation authority. See mission.md.

## Decision-making

- Day-to-day decisions: lead maintainer.
- Anything on the human-review list below: recorded as an ADR, merged only after the lead maintainer has reviewed it in a separate sitting from authoring (AI-authored ADRs are never self-approved by the agent).
- WSG interpretation disagreements that cannot be resolved locally are raised upstream as issues on w3c/sustainableweb-wsg rather than settled silently in this repository.

## Roles

- Lead maintainer: final decision authority, release authority, WSG interpretation sign-off.
- AI agents: implement against approved specs, propose ADRs and mappings, never merge changes on the human-review list, never remove functionality without maintainer confirmation.
- Reviewers: invited subject-matter review of mappings, accessibility, and report language.

## Changes requiring human review before merge

- WSG interpretation and any automated-to-WSG mapping (including promoting `draft: true` to reviewed)
- scoring or roll-up logic
- conformance language and report wording templates
- accessibility-affecting UI or report output changes
- sustainability-affecting dependency or architecture changes
- privacy-affecting behavior (any network call, any storage change)
- exported report formats and data schemas (versioned; breaking changes need a migration note)

## Conformance language policy

- The tool and its reports never claim WSG certification. No certification program exists.
- Reports state that WSG is a W3C Group Note Draft and identify the pinned `wsg_version`.
- Optional conformance claims, if the evaluator chooses to make one, follow WSG 1.4.2 exactly: date of claim, guidelines title and URI, and the list of success criteria, guidelines, or sections met. The tool generates this block only from findings whose result_status is `pass` with human-entered or human-reviewed evidence; findings whose only evidence is automated are excluded from claim text and listed separately as automated evidence.
- Report templates carry an anti-greenwashing statement aligned with WSG 1.4.3: partial improvement is not achieved sustainability; coverage gaps are enumerated, not hidden.
- Every report also carries an accessibility boundary statement: a Bellwether report is not an accessibility audit and does not establish WCAG, EN 301 549, or Section 508 conformance. See docs/accessibility.md.

## WSG interpretation process

1. Interpretation questions become issues labeled `wsg-interpretation`.
2. Proposed resolution cites the WSG text, STAR, and any upstream discussion.
3. Resolution is recorded in the mapping entry (or an ADR if cross-cutting) with the WSG snapshot it applies to.
4. When a new WSG snapshot lands, all interpretations are rechecked; a migration note lists changed or retired criteria.

## Schema versioning

- Schemas use semver. Reports embed `schema_version` and `wsg_version`.
- Breaking schema changes require an ADR, a migration note, and continued ability to open (read-only at minimum) reports from the previous major version.

## ADRs

Every major decision gets an ADR using adr/ADR-0000-template.md, including: decision, rationale, alternatives, accessibility impact, sustainability impact, performance impact, privacy impact, maintenance cost, risks, review status.

## Contribution and release

- Contributions via PR against an approved spec in kitty-specs/. PRs without a spec reference are declined for feature work; small fixes exempt.
- Releases require: tests pass, schemas validate, sample report regenerates, accessibility smoke check of generated report, changelog entry, human review items cleared.

## License

AGPL-3.0 proposed, matching vital-core. Confirm before first release (open question: AGPL can deter public-sector adoption; MIT/Apache-2.0 vs AGPL is an ADR).
