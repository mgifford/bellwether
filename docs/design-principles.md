# Design principles: adoption, motivation, and systems

Status: draft-1, requires human review (report wording and scoring implications).

Bellwether's goal is not a correct report. It is sustained improvement of
digital services. Correct reports that nobody acts on are waste. These
principles govern how reports present information, how scoring behaves, and
how the tool connects to the organizations around it.

## 1. Progress is the product

The strongest motivator in knowledge work is visible progress on meaningful
work (Amabile and Kramer, "The Power of Small Wins", Harvard Business Review,
2011). Design consequences:

- Reports foreground deltas and trends, not absolute state. "Three criteria
  improved since the last evaluation" leads; the full state table follows.
- Every report credits what already passes before listing what fails. Nobody
  starts at zero (endowed progress).
- Show proximity to meaningful thresholds: "two criteria from complete
  coverage of Hosting and Infrastructure" (goal gradient).
- Never present a wall of undifferentiated failure. Group, prioritize, and
  always pair problems with the smallest credible next step.

Corollary: trend signals must be trustworthy. A false regression (for example,
conflating expanded scan scope with real decline) destroys the motivational
value of every future report. Data integrity in trend reporting is a
first-class requirement, not a nicety.

## 2. No single score

Single scores invite score-chasing detached from outcomes and hide evidence
behind false precision. Bellwether shows coverage, completion, and severity
distributions, always with the underlying evidence one step away. This
restates the mission's scoring policy with its behavioral rationale.

## 3. Identity over compliance

Compliance framing produces minimum-effort behavior. Report and interface
language should frame sustainability as craft and stewardship ("teams that
ship lean, durable services") rather than as passing an audit. Plain,
non-moralizing language. No shame mechanics.

## 4. Lessons from the accessibility movement

What moved accessibility over 25 years was procurement, law, and testability,
not guidelines alone. Section 508 mattered because it attached to purchasing;
EN 301 549 mattered because European directives made it citable; ACRs forced
vendors to answer in writing. Sustainability's equivalent hooks are cost
(FinOps), CSRD/ESG disclosure, and procurement clauses. Bellwether's evidence
tables exist to serve those hooks.

What failed in accessibility, and what Bellwether must design against:

- audit-remediate-decay cycles (counter: reopenable reports, trends,
  remediation status tracking)
- compliance theater and checkbox artifacts (counter: evidence provenance,
  documented uncertainty, no automated conformance)
- treating it as end-stage QA (counter: role-based views and upstream
  integration, below)

What worked and is copied here: the W3C Accessibility Maturity Model
(organizational capability, not just page state), ARRM (assigning criteria to
roles), and design-system defaults. The WSG's four role-based sections are
this lesson baked into the standard; Bellwether exploits it by letting a
report be filtered by role so each discipline sees its own criteria.

## 5. KPI alignment: map to owned metrics

Do not invent a sustainability KPI nobody owns. Report language and
remediation recommendations should connect WSG improvements to metrics that
already have owners and budgets:

- page weight, Core Web Vitals -> conversion, SEO, bounce (marketing)
- transfer and compute reduction -> cloud spend (FinOps; cost and carbon
  correlate closely; see the Green Software Foundation SCI)
- fewer dependencies, less JavaScript -> maintenance cost, security surface
  (engineering)
- evidence-grade reporting -> CSRD/ESG disclosure, procurement risk
  (legal, finance)

## 6. Systems, not sites

Quality cannot be inspected into a product; a report is an inspection
artifact, improvement lives upstream. Bellwether's integration points, in
rough order of leverage: procurement templates and contract language, design
system and CMS defaults, CI budgets, definition of done, and content
governance including decommissioning. The finding fields owner,
remediation_status, and related_issue_url are the hooks into ticketing and
process. Assessing organizational capability (a sustainability maturity view)
is a candidate future spec, not a bolt-on.

## 7. Honest framing of impact

Per-site optimization faces a rebound (Jevons) problem: efficiency gains tend
to be consumed by growth. Bellwether's language is stewardship, waste
reduction, and evidence, not planetary-scale claims a report tool cannot
support. Measure what matters; claim only what the evidence carries.
