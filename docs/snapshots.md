# WSG and STAR snapshots

Bellwether renders all evaluation content from dated snapshots of the upstream
[w3c/sustainableweb-wsg](https://github.com/w3c/sustainableweb-wsg) data files
(`guidelines.json`, `star.json`, `impact.json`). Both the WSG and STAR are
living W3C Group Note Drafts; reports pin the snapshot date they were
evaluated against so the criteria text an evaluator saw is exactly
reproducible later.

## Cutting a snapshot

```
npm run snapshot                       # fetch upstream main
npm run snapshot:local -- <dir>        # use local guidelines.json/star.json/impact.json
```

Output lands in `src/data/wsg/<date>/`:

- `wsg-guidelines.json`: sections, guidelines, and success criteria with
  derived IDs and content hashes
- `star-techniques.json`: STAR techniques linked to guidelines
- `wsg-impact.json`: WSG impact ratings (people/planet/prosperity/timeframe
  and points) linked to guidelines by URL
- `snapshot-meta.json`: upstream provenance, fetch time, counts

All four are validated against the schemas in `schemas/` before writing; a
structurally surprising upstream (wrong section count, implausible totals)
fails the build rather than producing a wrong snapshot.

## Monthly automation

`.github/workflows/snapshot.yml` runs on the 1st of every month (and on
manual dispatch), cuts a fresh snapshot, and opens a pull request only if
upstream data changed. Per GOVERNANCE.md, schema/data changes require human
review before merge — the workflow never merges automatically.

## Derived identifiers

Upstream success criteria have no stable IDs. Bellwether derives positional
IDs of the form `section.guideline.criterion` (for example `2.1.1`) and stores
a `content_hash` (SHA-256 of normalized title and description) per criterion.

## Diffing snapshots and migrating reports

```
npm run diff -- src/data/wsg/<old> src/data/wsg/<new> src/data/wsg/<new>/migration-<old>-to-<new>.md
```

The diff classifies every criterion:

- unchanged: same ID, same hash
- reworded: same ID, hash changed; re-check that recorded findings still apply
- moved: same hash at a new ID (an insertion shifted positions); findings must
  be re-pointed to the new ID
- added: new criterion; consider whether existing reports should evaluate it
- removed: gone upstream; each affected finding needs an explicit decision

Migrating an existing report to a new snapshot is a human-reviewed step guided
by the generated migration note. Nothing migrates automatically.

## Known upstream volatility

During initial development, two fetches of upstream `main` hours apart, both
reporting `lastModified: 2026-06-09`, returned different guideline and
criterion counts. Upstream `lastModified` is not a reliable change signal.
Follow-up task: pin fetches to a commit SHA and record it in snapshot-meta.
