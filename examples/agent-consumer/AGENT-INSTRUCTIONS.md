# Example instructions for a consuming site agent

Use this file together with the complete Direction Artifact JSON and the project brief. When supplied, also consume the Visual Intelligence Bundle. This is a provider-neutral example, not a prompt that replaces the Agent Integration Contract.

## Task

Implement the supplied brief in the existing project. Use the Integra Direction Artifact as structured design direction. Do not build a new application or replace the project stack unless the brief explicitly requires it.

## Required handling

1. Validate that the artifact uses a schema version you support. If validation fails, stop and report the problem.
2. Read its context, missing-information paths and all eight sections before changing code.
3. If a Visual Intelligence Bundle is supplied, validate its schema/version and confirm its directionArtifactId matches the Direction Artifact. Stop and report a mismatch.
4. Keep evidence scope intact: catalog-only entries are research leads; partial page observations remain partial; do not generalize one page/route/state to an entire product. Knowledge patterns, tokens and assets are candidates, not approved decisions.
5. Preserve explicit brief requirements and obey all applicable hard structured constraints.
6. Keep provenance meaningful: decisions from the brief are requirements, rule decisions are engine guidance, and defaults identify unresolved choices.
7. Treat recommendations marked [R] as optional heuristics. Adopt them when they help this product and explain meaningful deviations.
8. Do not invent product facts, testimonials, metrics, certifications, brand tokens or audience preferences to fill missing information.
9. Preserve the project's existing framework, dependencies and conventions unless a change is necessary and justified.
10. Build responsive behavior and interaction states from the actual brief and viewport targets.
11. Implement accessibility foundations, including semantic structure, keyboard operation, visible focus and reduced-motion support where relevant. Do not claim WCAG conformance without testing evidence.
12. Keep the primary product goal visible. Do not add decorative sections, cards or effects merely to make the page look fuller.

## Completion report

Return a JSON object that conforms to schemas/direction-consumption-report.schema.json.

Include one outcome for every decision and recommendation ID, exactly once. Mark outcomes accurately:

- applied / adopted when followed;
- adapted when changed, with a reason;
- not-applied or deferred when omitted, with a reason.

List blockers and unresolved missing-information paths. Include evidence references where available. When a Bundle was provided, note which knowledge candidates materially influenced the implementation and which were rejected/adapted, preserving their IDs and evidence scope where practical. Your report describes your own implementation work; it does not certify that the result passes accessibility, visual QA or the Design Lab evaluation.

From the Integra repository checkout, validate the report against the exact artifact:

~~~bash
npm run direction:consumption:validate -- --artifact direction.json --report consumption-report.json
~~~

A passed result proves schema and ID coverage only. It does not verify code, screenshots, behavior, accessibility or visual quality.
