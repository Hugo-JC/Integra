# Visual knowledge curation contract

## Source classification
Choose the category that describes what the source actually is: official standard, platform guidance, design system, product example, product UI library, full-site gallery, section gallery, methodology, asset provider, font library, color tool or motion-learning resource. Popularity is not authority.

## Evidence state machine
- `catalog-only`: URL/name/description are discovery metadata; no page-level inspection is claimed.
- `partial`: a page or state was inspected, but it does not answer the complete question.
- `verified`: exact page/section, date, evidence type, viewport/state and limitations are recorded.
- `stale`: a previously useful entry needs rechecking.
- `deprecated`: retained for migration or historic lookup.

A source's verification state and an observation's confidence are separate. High confidence does not imply broad scope.

## Observation record
Distinguish directly visible facts, official documented behavior, interpretation/inference, unknown states, adaptation proposal and evidence needed to validate adaptation.

## Quality gates
- Stable unique IDs; all cross-references resolve.
- Canonical URLs and redirects recorded.
- No external assets without rights/provenance.
- Token recipes are starter guidance and never override product tokens.
- Patterns include content prerequisites and responsive behavior.
- Rules include triggers, exceptions and verification.
- Anti-patterns remain hypotheses until evidence supports findings.
- Examples explain trade-offs and acceptance checks.