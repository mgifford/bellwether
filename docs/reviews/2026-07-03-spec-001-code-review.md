# Review note: spec-001 code review, 2026-07-03

Reviewer: Claude (agent self-review); human review by maintainer pending.
Scope: scripts/snapshot.mjs, scripts/diff-snapshots.mjs,
scripts/validate-snapshots.mjs, schemas/, tests/, CI workflow.

## Verified working

- 7/7 tests pass, covering ID derivation, hash stability under whitespace,
  hash sensitivity to wording, Introduction-section skipping, STAR anchor
  linkage including the deliberately unlinkable case, all five diff classes,
  the insertion-does-not-masquerade-as-rewording property, and migration
  note rendering.
- Committed 2026-06-09 snapshot validates against all three schemas.
- Structural guards fire correctly (section count, implausible totals,
  malformed lastModified).
- Dependency count: 1 (ajv).

## Fixed during review

- Paths were resolved against the process working directory, so the
  pipeline failed when invoked from outside repo root. Now resolved from
  the script location (REPO_ROOT via import.meta.url). Verified by running
  from /tmp. Behaviour from npm scripts unchanged.

## Raised and withdrawn

- Markdown injection of "|" in criterion titles into migration notes:
  titles render in list items, not table cells; pipes are inert there. The
  counts table contains no titles. No change needed.

## Known limitations, logged, not silently changed

1. Snapshot date comes from upstream lastModified, which fetches proved
   unreliable (two different datasets, same date stamp). SHA pinning is the
   accepted follow-up in tasks/spec-001-followups.md; requires a spec-001
   amendment and schema field, so it needs maintainer review first.
2. Re-running the pipeline silently overwrites an existing snapshot
   directory for the same date. For generated artifacts under version
   control this is recoverable, but it conflicts in spirit with "do not
   overwrite existing user work without confirmation." Proposed: refuse to
   overwrite unless --force. Deferred to maintainer decision since it
   changes CLI behaviour.
3. Duplicate criterion text: if two criteria share identical normalized
   title and description, moved-pairing picks the first unmatched match in
   insertion order. Deterministic, but pairing could be positionally
   suboptimal. No such duplicates exist in the 2026-06-09 snapshot
   (verified: 196 unique hashes). Acceptable; revisit only if upstream
   introduces duplicates.
4. STAR anchor regex assumes lowercase kebab-case slugs, which matches all
   current upstream slugs. A future uppercase or underscore slug would
   surface as an unlinked technique in snapshot-meta rather than silently
   mislink, which is the correct failure direction.
5. The one unlinked STAR technique (compatibility-documentation) remains an
   open follow-up.

## Test gap acknowledged

No automated test for the cwd-independence fix (would require spawning a
subprocess; low value relative to cost). Verified manually; noted here per
review requirements.
