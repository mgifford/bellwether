# How Bellwether treats accessibility

Status: draft-1, requires human review (WSG interpretation surface).

Accessibility is part of the WSG and also its own large discipline with
mature standards (WCAG 2.2, EN 301 549, Section 508), its own evaluation
methodology (WCAG-EM), and its own conformance artifacts (ACRs/VPATs).
Bellwether must engage with accessibility without pretending to replace any
of that. Accessibility appears in Bellwether in three distinct roles, and
they must never be conflated.

## Role 1: Accessibility as WSG content. Reference, do not duplicate.

The WSG contains accessibility-related success criteria. For these,
Bellwether is a consumer of accessibility evidence, not a producer of
accessibility audits.

The bridge model: existing accessibility conformance artifacts are
organizational evidence for WSG accessibility criteria.

- A completed WCAG-EM evaluation, an ACR/VPAT, or an EN 301 549 assessment is
  attached as organizational evidence with document name, owner, date,
  summary, and a confidence level reflecting its age and scope.
- The evaluator judges whether that artifact supports pass, needs-improvement,
  or fail for the WSG criterion. Stale or narrow artifacts justify lower
  confidence, not silence.
- Where no such artifact exists, the honest result is
  requires-organizational-evidence, and the remediation recommendation is to
  commission or perform a proper accessibility evaluation, not to substitute
  a scan.

## Role 2: Automated accessibility signals. Supporting evidence only.

Imported axe-core, Alfa, or similar findings (for example from vital-core)
are automated evidence with partially-automated testability, never more.
Automated tools detect only a minority of WCAG failures. Hard rules:

- An absence of automated violations never justifies pass on a WSG
  accessibility criterion by itself.
- Automated violations may support needs-improvement or fail, with the
  evaluator confirming relevance and severity.
- Mappings from automated accessibility rules to WSG criteria carry explicit
  false-negative risk statements ("clean scan does not mean accessible").

## Role 3: Accessibility of Bellwether itself. Non-negotiable.

WCAG 2.2 AA minimum for the editor; generated reports are semantic,
script-free HTML usable with assistive technology, keyboard, print, and
offline. Accessibility review is part of the definition of done
(GOVERNANCE.md). This role is a build quality, not report content.

## Boundary statement in every report

Every generated report includes, alongside the no-certification statement:

> This report is not an accessibility audit and does not establish WCAG,
> EN 301 549, or Section 508 conformance. Accessibility evidence herein
> summarizes or references separate accessibility evaluation work.

This prevents a Bellwether report being misread in procurement as covering
two obligations when it covers one.

## Division of labor summary

| Question | Answered by |
| --- | --- |
| Is this service accessible? | WCAG-EM evaluation, ACR, EN 301 549 assessment |
| Does the organization manage accessibility as part of sustainable practice? | Bellwether, using those artifacts as evidence |
| Did automated tools find accessibility defects? | Scanners (vital-core), imported as supporting evidence |
| Is Bellwether itself accessible? | Bellwether's own definition of done |
