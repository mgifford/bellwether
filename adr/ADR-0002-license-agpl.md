# ADR-0002: License Bellwether under AGPL-3.0

- Status: accepted
- Date: 2026-07-02
- Deciders: Mike Gifford (lead maintainer)
- Spec reference: kitty-specs/wsg-evaluation-report-tool-mvp/mission.md

## Decision

Bellwether is licensed AGPL-3.0-or-later.

## Rationale

Matches vital-core, keeping the two projects license-compatible for shared schemas or code later. AGPL guarantees that anyone offering Bellwether as a hosted service must publish their modifications, protecting the commons the tool depends on.

## Alternatives considered

Apache-2.0 / MIT. Argued for by the agent on procurement grounds: permissive licenses face fewer objections in government and enterprise evaluation, which aligns with the maintainer's commercially-supported-open-source-as-COTS advocacy. Rejected by the maintainer: Bellwether is local-first with user-owned data files, so the "legal review friction" cost is low (organizations run it, they do not link it into products), while the SaaS-capture protection is worth having.

## Accessibility impact

None.

## Sustainability impact

None direct. Indirectly positive if AGPL keeps improvements public.

## Performance impact

None.

## Privacy impact

None. AGPL's network clause reinforces the no-hidden-service posture.

## Maintenance cost

Low. Contributor license clarity via DCO or CLA to be decided in CONTRIBUTING.md; DCO proposed.

## Risks

Some public-sector legal teams flag AGPL regardless of usage mode; mitigated by documentation stating plainly that using Bellwether to produce reports imposes no obligations on the reports or the evaluated organization.

## Review status

Human review required: yes. Reviewed by: Mike Gifford. Date: 2026-07-02.
