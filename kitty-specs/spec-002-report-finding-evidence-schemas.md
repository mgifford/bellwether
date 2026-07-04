# Spec 002: report, finding, evidence, and automated-check-map schemas

- Status: draft for review
- Spec-Kitty feature: bellwether/core-data-schemas
- Depends on: mission.md, GOVERNANCE.md, ADR-0001, ADR-0002, spec-001
- Date: 2026-07-03

## Problem statement

Bellwether has a snapshot pipeline (spec-001) that gives it dated, validated WSG/STAR/impact content, but no schema yet for the thing an evaluator actually produces: a report. Every other planned feature (vital-core importer, manual findings UI, report renderer) needs a stable, schema-validated shape to write into and read from first. `schemas/schema-draft.yaml` already captures this shape in prose form; this spec converts it into real, versioned JSON Schema, resolving the open questions the draft left implicit, without adding scope the mission does not call for.

## User stories

- As the maintainer, I have JSON Schema files for report, finding, and evidence that any future importer, editor, or renderer can validate against, so schema drift is caught at validation time, not at render time.
- As an evaluator, every finding I create or import is forced to carry a testability level, a result status, and at least one evidence object with provenance, so an incomplete finding cannot silently pass through the pipeline.
- As a future contributor building the vital-core importer, I have an `automated_check_map` schema to validate mapping entries against before any of the first 20 mappings (mission task 5) are written.
- As the lead maintainer, a schema or scoring-logic change is visible as a diff against a versioned JSON Schema file, so it falls under GOVERNANCE.md's human-review-before-merge list without extra process.

## Success criteria

- `schemas/report.schema.json`, `schemas/finding.schema.json`, `schemas/evidence.schema.json`, and `schemas/automated-check-map-entry.schema.json` exist, each with `$id`, `title`, and `additionalProperties: false` on every object, matching the repo's existing schema style (see `schemas/snapshot-*.schema.json`).
- `evidence.schema.json` is a discriminated union on `kind` (`automated` | `manual` | `organizational`); each branch requires exactly the fields `schema-draft.yaml` lists for it (`automated`, `manual`, `organizational` sub-objects respectively), enforced via `if`/`then` or `oneOf`, not left to convention.
- `finding.schema.json` requires `testability_level` and `result_status` as independent enums (mission.md core principle 2 and 3, reproduced verbatim from schema-draft.yaml) and requires `evidence` to have `minItems: 1` unless `result_status` is `not-tested` or `not-applicable` (schema-draft.yaml comment, enforced via conditional schema).
- `report.schema.json` requires `wsg_version` and `star_version` (mission.md core principle 5), embeds `schema_version`, and marks `summaries` as a computed/read-only-by-convention block (documented, not hand-entered; enforcement is the renderer's job, not the schema's).
- `automated-check-map-entry.schema.json` requires `false_positive_risks` and `false_negative_risks` as non-empty strings (mission.md open risk: "mapping overreach") and `draft: boolean` defaulting to `true` until GOVERNANCE.md review promotes an entry.
- A sample report JSON file validates against `report.schema.json` end to end (one report, a handful of findings covering automated/manual/organizational evidence kinds and at least one `not-tested` finding with zero evidence items), proving the schemas compose.
- `scripts/validate-snapshots.mjs`-style validation is extended or a new `scripts/validate-report.mjs` is added so CI can validate the sample report on every push.
- Every `enum` value in the four schemas is traceable to a line in `schema-draft.yaml` or to mission.md's core principles; no enum values are invented in this pass.

## Non-goals

- No populated `automated_check_map` entries (mission task 5; requires the vital-core importer spec, task 4, first).
- No vital-core importer code or import-shape validation (task 4).
- No report renderer, no HTML output, no editor UI (task 6; ADR-0001 already scopes the editor separately).
- No scoring or roll-up computation logic beyond documenting that `summaries` is computed (mission non-goal: "not a scoring product"; GOVERNANCE.md: scoring/roll-up logic requires separate human review when it is actually implemented).
- No redaction/sensitivity enforcement logic; the `sensitivity` field is carried in the schema now (per schema-draft.yaml's stated reason: avoid a later migration) but enforcing it is out of scope until a redaction workflow spec exists (mission.md out_of_scope_for_mvp).
- No change to the WSG/STAR/impact snapshot schemas from spec-001; this spec only adds new schemas alongside them.

## Assumptions

- `schema-draft.yaml`'s shape is correct as a starting point; this spec's job is faithful JSON Schema translation plus resolving ambiguities (listed below), not a redesign.
- JSON Schema draft-07 is used, matching the existing `schemas/snapshot-*.schema.json` files (`"$schema": "http://json-schema.org/draft-07/schema#"`).
- `wsg_ref` in a finding refers to a success-criterion ID in the spec-001 snapshot shape (e.g. `2.1.1`), not the ad hoc `"UX11-2"` style example still present in schema-draft.yaml; this spec corrects that example to match the actual derived ID format, and the point is called out explicitly for maintainer review since it changes an example in the existing draft.
- Ajv (already a dependency per spec-001) is sufficient for validating the discriminated-union and conditional-requirement rules needed here; no new dependency is introduced (sustainability requirement, matching spec-001's dependency discipline).

## Data model changes

New files:

- `schemas/report.schema.json`
- `schemas/finding.schema.json`
- `schemas/evidence.schema.json`
- `schemas/automated-check-map-entry.schema.json`
- `src/data/samples/sample-report.json` (or similar path; exact location to be confirmed against how the eventual editor expects to load user-owned report files) — a schema-valid example report used both as documentation and as a CI fixture.

No changes to `schemas/snapshot-*.schema.json` (spec-001) or `src/data/wsg/` snapshot content.

`schema-draft.yaml` is retained as the human-readable design-notes source (its header already says "to be emitted as JSON Schema... once approved") and is not deleted by this spec; a follow-up note should be added to it once these schemas exist, pointing at the real files, so it does not read as still-pending.

## User interface requirements

None (schema/tooling only, matching spec-001's precedent).

## Accessibility requirements

None directly (no UI). The eventual report renderer's accessibility requirements are spec-006's concern per mission.md's task list; this spec only ensures no schema decision here would force an inaccessible pattern later (e.g. no schema field that only makes sense as a sighted-only visual encoding).

## Sustainability requirements

- No new dependencies.
- Sample report fixture stays small (a handful of findings, not hundreds), consistent with spec-001's "reduced fake data" fixture discipline.

## Security and privacy requirements

- `sensitivity` field is present in the schema (public/internal/restricted) so a redaction workflow can be added later without a breaking migration, per schema-draft.yaml's own stated rationale.
- No network calls introduced by this spec.
- Per GOVERNANCE.md, "exported report formats and data schemas" changes require human review before merge; this spec and its resulting schema files are exactly that review surface.

## Testing plan

- Unit tests validating each schema against: one obviously-valid fixture per schema, and at least one deliberately-invalid fixture per major constraint (missing required field, evidence kind mismatch, empty evidence array on a `pass` finding, non-boolean `draft`).
- The sample report fixture must validate cleanly against `report.schema.json` in CI (extends `npm test` or a dedicated `npm run validate:report`, mirroring spec-001's `npm run validate`).
- Confirm the discriminated-union evidence schema correctly rejects an `automated`-kind evidence object missing `tool_name`, and correctly accepts a `manual`-kind object without any `automated`-only fields.

## Documentation requirements

- `docs/report-schema.md` (new) or an added section in an existing doc: what a report/finding/evidence object looks like, with the sample report as a worked example, and a short explanation of testability_level vs result_status as orthogonal axes (mission.md's core principle 2/3, currently only stated in mission.md prose).
- Update `schema-draft.yaml`'s header comment once the real schemas exist, pointing to them instead of describing them as forthcoming.

## Acceptance criteria

- All four schemas exist, pass `ajv` self-validation (i.e., each schema file is itself valid JSON Schema draft-07), and are cross-checked against `schema-draft.yaml` field-by-field with no silently dropped or added fields beyond the one corrected example noted above.
- The sample report validates against `report.schema.json`.
- Tests pass in CI.
- Docs written.
- Human review completed (GOVERNANCE.md: schema changes are on the human-review-before-merge list) before this spec's status moves from "draft for review" to accepted, and before any dependent work (task 4, the vital-core importer spec) begins.
