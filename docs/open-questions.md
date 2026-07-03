# Open questions before implementation

Per the agent behaviour rules: where uncertain, document rather than guess. These need answers or explicit deferral before ADR-0001.

questions:
  - id: Q1
    topic: project name and repo
    status: RESOLVED 2026-07-02
    resolution: >
      Name is Bellwether (correct spelling, no "a": from "wether", the
      belled ram, not "weather"). Verified available: github.com/mgifford/
      bellwether and npm bellwether-report. Bare npm "bellwether" is taken;
      use bellwether-report or a scoped package.
    question: >
      Original working name was "wsg-report-tool". Does this live under mgifford/,
      and is there any intent to propose it to the Sustainable Web IG later
      (which would argue for W3C-friendly naming and licensing choices now)?
  - id: Q2
    topic: license
    status: RESOLVED 2026-07-02
    resolution: >
      AGPL-3.0, matching vital-core. Maintainer decision; the procurement
      tradeoff was raised and accepted. Recorded as ADR-0002.
    question: >
      AGPL-3.0 (matching vital-core) or Apache-2.0/MIT? AGPL protects against
      proprietary SaaS capture but measurably deters some government and
      enterprise adoption, which conflicts with your COTS/procurement advocacy.
      This is an ADR either way.
  - id: Q3
    topic: WSG data provenance
    status: RESOLVED 2026-07-02
    resolution: >
      Generate wsg-guidelines.json from w3c/sustainableweb-wsg source data via
      a build script. Verified: the repo publishes guidelines.json (72
      guidelines, 201 success criteria across 4 sections, lastModified
      2026-06-09) and star.json. Known issue: success criteria lack stable IDs
      in the source; the build script must derive positional IDs and include a
      snapshot diff check to detect inserted or reordered criteria between
      snapshots. Migration rule required before the second snapshot lands.
    question: >
      Should wsg-guidelines.json be generated from the w3c/sustainableweb-wsg
      source (ReSpec HTML or its underlying data) with a build script, or
      hand-maintained? Generated is less error-prone but couples us to their
      markup; the spec has no official JSON API yet (the editors note one is
      planned to replace the GRI metrics).
  - id: Q4
    topic: editing UI honesty
    status: RESOLVED 2026-07-02
    resolution: >
      JS is required for the editor and acceptable with caution: documented JS
      budget, progressive enhancement, standard form controls, state persisted
      to user-owned JSON. Generated reports remain zero-JS. See ADR-0001.
    question: >
      The brief says minimal JS and JS-free reports. Reports: agreed, zero JS.
      But the editing tool is a stateful, form-heavy application; the WCAG-EM
      Report Tool itself is a JS app (Svelte). Is a JS-required editor with a
      zero-JS output acceptable, with the tradeoff documented in ADR-0001, or
      is a fully progressive-enhancement editor (server-less form flow, much
      slower to build) a hard requirement?
  - id: Q5
    topic: STAR maturity
    status: RESOLVED 2026-07-02
    resolution: >
      STAR supplies the evaluation content (techniques, tests) shown in the
      editor; the interface pattern comes from the WCAG-EM Report Tool. Both
      WSG and STAR are drafts, so every report pins dated snapshots of each.
      star_technique: null with rationale remains allowed for gaps.
    question: >
      STAR is itself a draft. Where STAR lacks a technique for a criterion we
      want to automate, the map allows star_technique: null with a rationale.
      Acceptable, or should automation be limited strictly to STAR-covered
      criteria for the MVP?
  - id: Q6
    topic: vital-core import surface
    question: >
      First importer targets the published runs/latest.json artifact. Should it
      also read the api/issues-last-week per-target snapshots for accessibility
      instance detail, or is run-level data enough for MVP?
