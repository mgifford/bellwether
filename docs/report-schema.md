# Report, finding, and evidence schemas

Bellwether reports are user-owned JSON files validated against the schemas
in `schemas/`: `report.schema.json`, `finding.schema.json`,
`evidence.schema.json`, and `automated-check-map-entry.schema.json` (spec-002).
A worked example lives at `src/data/samples/sample-report.json`.

## Shape

A report pins `wsg_version` and `star_version` to a dated snapshot (see
`docs/snapshots.md`) and contains a list of findings. Each finding evaluates
one WSG success criterion (`wsg_ref`, e.g. `2.1.1`) and carries one or more
pieces of evidence.

## testability_level vs result_status

These are independent axes on every finding (mission.md core principles 2
and 3):

- `testability_level` describes *how* a criterion can be evaluated at all
  (automatically-tested, partially-automated, manual-review-required,
  organizational-evidence-required, not-evaluated, not-applicable,
  cannot-determine).
- `result_status` describes *what was found* (pass, needs-improvement, fail,
  not-applicable, not-tested, cannot-determine,
  requires-organizational-evidence).

A criterion can be `manual-review-required` (testability) and still `pass`
(result), or be `automatically-tested` (testability) and still
`cannot-determine` (result, e.g. a scan that errored). The schema does not
couple these two fields; keeping them orthogonal is what stops "automated"
from silently becoming a stand-in for "passing."

## Evidence is a discriminated union

Every evidence object has a `kind`: `automated`, `manual`, or
`organizational`. Each kind requires its own sub-object with full
provenance (see `evidence.schema.json`). A finding needs at least one
evidence object unless its `result_status` is `not-tested` or
`not-applicable` — a finding cannot claim `pass` or `fail` with zero
evidence attached.

## Computed vs hand-entered fields

`summaries` (by_guideline, by_section, ppp roll-ups) is computed from
findings, never hand-entered directly into a report file. The schema
accepts any object shape here on purpose; enforcing that it was actually
computed (not typed by a human) is the renderer's job, not the schema's
(mission.md non-goal: "not a scoring product").

## conformance_language_policy_ack

A report cannot validate with `conformance_language_policy_ack: false`.
This field exists so the eventual report renderer has a machine-checkable
signal that GOVERNANCE.md's conformance language policy was acknowledged
before generating report text.

## automated-check-map-entry

Maps one automated scanner check (e.g. a vital-core rule) to a WSG success
criterion. Every entry starts `draft: true`. If `star_technique` is absent
or `null`, `star_absence_rationale` is required — a mapping can never cite
"no STAR technique" without saying why (mission.md open risk: mapping
overreach). No entries are populated yet; that is mission task 5, which
depends on the vital-core importer spec (task 4).
