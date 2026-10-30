# Example instructions for a consuming site agent

Use this file together with the complete Direction Artifact JSON and the project brief. It is a provider-neutral example, not a prompt that replaces the Agent Integration Contract.

## Task

Implement the supplied brief in the existing project. Use the Integra Direction Artifact as structured design direction. Do not build a new application or replace the project stack unless the brief explicitly requires it.

## Required handling

1. Validate that the artifact uses a schema version you support. If validation fails, stop and report the problem.
2. Read its context, missing-information paths and all eight sections before changing code.
3. Preserve explicit brief requirements and obey all applicable hard structured constraints.
4. Keep provenance meaningful: decisions from the brief are requirements, rule decisions are engine guidance, and defaults identify unresolved choices.
5. Treat recommendations marked [R] as optional heuristics. Adopt them when they help this product and explain meaningful deviations.
6. Do not invent product facts, testimonials, metrics, certifications, brand tokens or audience preferences to fill missing information.
7. Preserve the project's existing framework, dependencies and conventions unless a change is necessary and justified.
8. Build responsive behavior and interaction states from the actual brief and viewport targets.
9. Implement accessibility foundations, including semantic structure, keyboard operation, visible focus and reduced-motion support where relevant. Do not claim WCAG conformance without testing evidence.
10. Keep the primary product goal visible. Do not add decorative sections, cards or effects merely to make the page look fuller.

## Completion report

Return a JSON object that conforms to schemas/direction-consumption-report.schema.json.

Include one outcome for every decision and recommendation ID. Mark outcomes accurately:

- applied / adopted when followed;
- adapted when changed, with a reason;
- not-applied or deferred when omitted, with a reason.

List blockers and unresolved missing-information paths. Include evidence references where available. Your report describes your own implementation work; it does not certify that the result passes accessibility, visual QA or the Design Lab evaluation.
