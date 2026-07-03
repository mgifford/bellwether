# Bellwether

A local-first evaluation report and evidence tool for the [W3C Web Sustainability Guidelines (WSG)](https://www.w3.org/TR/web-sustainability-guidelines/), conceptually parallel to the [WCAG-EM Report Tool](https://www.w3.org/WAI/eval/report-tool/) and aligned with the [STAR](https://w3c.github.io/sustainableweb-wsg/star.html) evaluation methodology.

A bellwether is the sheep that leads the flock and signals where things are heading. This tool does not fix your site or certify anything. It helps an evaluator assemble honest evidence about where a digital service is heading on sustainability.

## Core principle

**Automation provides evidence, never conformance.** Most of the WSG (governance, procurement, content strategy, AI responsibility, lifecycle management) cannot be determined by a scanner. Every result in a Bellwether report carries both a testability level and a result status, and every finding records where its evidence came from.

The WSG and STAR are W3C Group Note Drafts. Every report pins dated snapshots of both, and this tool never claims or implies WSG certification. No certification program exists.

## Status

Early development. Currently implemented (spec-001): the WSG/STAR/impact snapshot pipeline that converts upstream [w3c/sustainableweb-wsg](https://github.com/w3c/sustainableweb-wsg) data into dated, identifier-stable, schema-validated snapshots, plus a diff tool that generates migration notes between snapshots. A monthly GitHub Actions workflow re-cuts the snapshot and opens a PR for review when upstream changes.

```
npm install
npm test
npm run snapshot            # fetch upstream and cut a snapshot
npm run diff -- <old> <new> # generate a migration note between snapshots
```

## Project documents

- Mission: `kitty-specs/wsg-evaluation-report-tool-mvp/mission.md`
- Governance: `GOVERNANCE.md`
- Decisions: `adr/`
- Specifications: `kitty-specs/`
- Snapshot documentation: `docs/snapshots.md`

## Related projects

- [vital-core](https://github.com/mgifford/vital-core): the reference automated scanner whose output Bellwether will import as evidence.

## License

AGPL-3.0-or-later. See ADR-0002. Using Bellwether to produce reports imposes no obligations on your reports or your organization.
