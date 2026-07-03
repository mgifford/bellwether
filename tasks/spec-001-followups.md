# Spec-001 follow-up tasks

- [ ] Pin upstream fetches to a commit SHA (api.github.com resolve main -> sha,
      fetch raw at sha, record sha in snapshot-meta). Rationale: two fetches of
      main hours apart on 2026-07-02/03, both lastModified 2026-06-09, returned
      different counts (72/201 vs 71/196 guidelines/criteria). lastModified is
      not a reliable change signal. Requires spec-001 amendment (upstream
      provenance field) and human review of the schema change.
- [ ] Investigate the one unlinked STAR technique (compatibility-documentation)
      and decide whether it needs a maintained draft linkage.
