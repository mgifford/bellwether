# Spec 001: WSG and STAR snapshot pipeline

- Status: draft for review
- Spec-Kitty feature: bellwether/snapshot-pipeline
- Depends on: mission.md, ADR-0001, ADR-0002
- Date: 2026-07-02

## Problem statement

Bellwether renders all evaluation content (guidelines, success criteria, STAR techniques and tests) from data, never from hard-coded UI text. The upstream source, w3c/sustainableweb-wsg, publishes guidelines.json and star.json, but both are living drafts with no stable success criterion identifiers. Bellwether needs a build script that converts a dated upstream state into pinned, validated, identifier-stable snapshot files, and detects structural drift between snapshots so existing reports never silently point at the wrong criterion.

## User stories

- As the maintainer, I run one command to produce a new dated snapshot from upstream and see a diff report of what changed since the previous snapshot.
- As an evaluator, my report pins a snapshot date, and reopening the report months later shows exactly the criteria text I evaluated against.
- As a contributor, I can trace every criterion in the app to a line in an upstream file at a specific commit.

## Success criteria

- `npm run snapshot` fetches upstream guidelines.json and star.json (or reads local copies for offline builds), emits versioned files under /src/data/wsg/<date>/, and validates them against snapshot schemas.
- Every success criterion receives a derived ID: `<section>.<guideline>.<criterion>` positional form (e.g. 2.1.1) plus a `content_hash` (SHA-256 of normalized title + description).
- A diff command compares two snapshots and classifies each criterion as unchanged, reworded (same position, hash changed), moved (same hash, position changed), added, or removed.
- The diff output is a human-readable Markdown migration note committed alongside the snapshot.
- Snapshot counts are asserted against expected totals and fail loudly on structural surprises (e.g. a new section).
- STAR techniques are linked to criteria where upstream provides the linkage; unlinked techniques are listed in the migration note.

## Non-goals

- No transformation of guideline prose (no summarizing, no rewording).
- No automatic acceptance of upstream changes into existing reports; migration is a documented, human-reviewed step.
- No scraping of the ReSpec HTML; upstream JSON only.

## Assumptions

- Upstream keeps publishing guidelines.json and star.json at stable raw URLs (verified 2026-07-02: guidelines.json lastModified 2026-06-09; 72 guidelines, 201 criteria; star.json present).
- Positional order in upstream JSON is meaningful and stable within a snapshot.
- Assumption to verify during implementation: star.json entries reference guideline/criterion anchors we can join on. If not, linkage becomes a maintained mapping file, marked draft, and this spec is amended first.

## Data model changes

New files per snapshot under /src/data/wsg/<YYYY-MM-DD>/:

- wsg-guidelines.json: sections -> guidelines -> criteria, each criterion carrying id, position, title, description, resources, tags, url, content_hash
- star-techniques.json: technique id, title, criteria refs, tests
- snapshot-meta.json: upstream commit or lastModified, fetch datetime, tool version, counts
- migration-<prev>-to-<new>.md: generated diff note

New schemas: snapshot-guidelines.schema.json, snapshot-star.schema.json, snapshot-meta.schema.json.

## User interface requirements

None (build tooling). Console output must be plain text, no color-only signaling, meaningful exit codes.

## Accessibility requirements

Migration notes are semantic Markdown (headings, lists, tables with headers) since they become repo documentation read by humans and assistive technology.

## Sustainability requirements

- Fetch upstream at most once per invocation; support --local to reuse downloaded files.
- Snapshots are committed, so CI and contributors never re-fetch upstream for normal builds.
- No dependencies beyond Node built-ins plus a JSON Schema validator (ajv proposed); anything more requires spec amendment.

## Security and privacy requirements

- Fetch only from raw.githubusercontent.com/w3c/sustainableweb-wsg over HTTPS.
- No telemetry, no other network calls.
- Validate before write; malformed upstream data must fail the build, not produce a partial snapshot.

## Testing plan

- Unit: ID derivation, normalization, content hashing, diff classification (unchanged/reworded/moved/added/removed), including the insertion-shifts-everything case.
- Fixture-based: a reduced fake upstream pair (before/after) exercising every diff class.
- Schema validation of emitted files in CI.
- Snapshot count assertions against snapshot-meta.

## Documentation requirements

- docs/snapshots.md: how to cut a snapshot, how to read a migration note, what reworded vs moved means for existing reports.
- README section stating that Bellwether pins WSG/STAR snapshot dates and why (both are W3C Group Note Drafts).

## Acceptance criteria

- Running the pipeline against upstream today produces a valid 2026-06-09-derived snapshot with 72 guidelines and 201 criteria, all schema-valid, all with unique IDs and hashes.
- The diff tool, run against fixtures, classifies all five change types correctly.
- Tests pass; docs written; human review of the emitted snapshot completed (WSG interpretation surface: none, structure only, but first-snapshot review is required once).
