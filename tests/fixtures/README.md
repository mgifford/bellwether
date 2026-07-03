# Test fixtures

Reduced fake upstream data exercising every diff class (spec-001):

- `upstream-before.json` / `upstream-after.json`: four sections, one guideline
  each. Between them: one criterion unchanged (2.1.1, 5.1.1), one reworded
  (2.1.2), one inserted at 3.1.1 shifting the old criterion to 3.1.2 (added +
  moved), one deleted (4.1.2).
- `star-fixture.json`: two techniques; one links to a guideline via its
  applicability anchor, one is deliberately unlinkable.
- `impact-fixture.json`: two impact ratings; one links to `upstream-before.json`'s
  ux-guideline by URL, one is deliberately unlinkable.
