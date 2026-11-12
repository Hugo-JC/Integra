# Agent Integration Contract

## Purpose

This contract defines how an external site-creation agent consumes an Integra Direction Artifact and reports what it did with that direction. It is provider-agnostic: the consumer may be Claude Code, Codex, Cursor, a custom agent or another implementation system.

Integra supplies direction and constraints. The receiving agent remains responsible for implementation. Integra does not generate or mutate the receiving project in this integration slice.

## Inputs

The consumer receives:

1. The complete Direction Artifact JSON, unchanged.
2. The project brief and the project workspace.
3. The agent's existing implementation instructions and tool permissions.

The artifact uses schema version 1.1.0. Consumers should validate it against schemas/direction-artifact.schema.json before acting. An unknown schema version, invalid structure or unsupported mandatory constraint must be surfaced instead of silently ignored.

## Interpretation order

1. Read context and missing-information paths.
2. Read all eight sections and their summaries.
3. Apply explicit brief-derived decisions and hard structured constraints.
4. Apply rule-derived decisions where they do not conflict with the brief or hard constraints.
5. Treat AI-derived and default decisions according to their provenance; defaults explain what remains undecided, not a hidden user requirement.
6. Consider recommendations marked [R] as advisory design heuristics. They are not mandatory acceptance criteria unless the brief independently makes them mandatory.

Hard structured constraints are gates, not suggestions. A consumer must not knowingly choose an implementation that violates one. If a constraint cannot be evaluated from available project information, report the uncertainty rather than claiming compliance.

The provenance precedence between compatible candidates remains brief > rule > ai > default. This precedence does not permit a candidate to bypass a hard constraint.

## The eight direction areas

| Section | Consumer responsibility |
|---|---|
| visualIdentity | Translate the product, audience and supplied preferences into a recognizable visual direction. Do not impose a generic theme. |
| colorSystem | Preserve supplied tokens. Where tokens are absent, propose semantic roles without presenting invented colors as existing brand decisions. |
| typography | Establish a useful hierarchy and readable text roles. |
| layoutComposition | Prioritize the primary goal and preserve required content at supplied viewports. |
| componentPrinciples | Select patterns from content and interaction needs; do not add components merely to fill space. |
| motionInteraction | Use motion for meaningful state or feedback and preserve reduced-motion behavior. |
| accessibility | Implement semantic and keyboard-accessible foundations; do not claim WCAG conformance without appropriate verification. |
| implementationGuidance | Respect the supplied stack and project boundaries. Do not add frameworks or dependencies without a reason. |

## Missing information

missingInformation is explicit uncertainty. The consumer must not fill it with fabricated facts, brand claims, product capabilities, certifications, testimonials, metrics or preferences.

When a missing value materially blocks implementation, ask the project owner or mark the choice as an implementation assumption in the handoff. A default decision is not evidence that the user approved that choice.

## Implementation handoff

After implementation, the consumer should return a DirectionConsumptionReport conforming to schemas/direction-consumption-report.schema.json.

The report must:

- identify the exact artifactId and engineVersion;
- report every decision by decisionId as applied, adapted or not-applied;
- report every recommendation by recommendationId as adopted, adapted, deferred or not-applied;
- explain every adapted, deferred or not-applied item;
- list blockers and unresolved missing-information paths;
- attach useful source, screenshot, test or URL references when available.

The report is an agent's account of its own work. It is not independent verification, proof of accessibility, or a pass from the Design Lab. Findings must be evaluated separately.

## Consumer acceptance checklist

- [ ] Exact Direction Artifact schema version is supported and the artifact validates.
- [ ] All eight sections were read.
- [ ] Hard constraints were not knowingly violated.
- [ ] Provenance and [R] advisory semantics were preserved.
- [ ] Missing information was not silently invented.
- [ ] Unsupported claims and unapproved dependencies were not introduced.
- [ ] Every decision and recommendation has an outcome in the consumption report.
- [ ] Deviations and blockers include reasons.
- [ ] Verification claims are limited to evidence actually collected.

## Compatibility policy

The artifact schema and consumption-report schema are independently versioned. A change to either contract requires a schema update, TypeScript contract update, tests and migration notes. Consumers should reject unsupported major contract changes and preserve unknown optional metadata only when their parser explicitly supports doing so.

## Visual Intelligence Bundle 1.1.0

The optional `VisualIntelligenceBundle` packages an existing Direction Artifact with caller-supplied task context and the result of the offline `buildVisualKnowledgePack()` resolver, including scoped page-observation candidates. Its schema is `schemas/visual-intelligence-bundle.schema.json`; the nested Direction Artifact remains unchanged at schema `1.1.0`. The bundle ID is derived from canonical JSON and does not include a timestamp.

Create and validate a bundle through the public Direction module exports:

```ts
import {
  buildVisualIntelligenceBundle,
  serializeVisualIntelligenceBundle,
  validateVisualIntelligenceBundle,
} from './src/modules/direction/index.js';

const bundle = buildVisualIntelligenceBundle({
  directionArtifact,
  primaryTask: 'Explain the product value and invite visitors to try a demo',
  mode: 'persuade',
});
const validation = validateVisualIntelligenceBundle(bundle);
const json = serializeVisualIntelligenceBundle(bundle);
```

`primaryTask` is required. `mode` and `nicheId` are optional; an omitted value remains `null`, and the builder does not infer a niche or mode. An explicit `query` replaces the primary task as the retrieval query; otherwise the primary task is used. `knowledge.observations` contains only relevant page-level records and preserves each record's `evidenceType`, `confidence` and `verificationStatus`. A `partial` observation is evidence only for its documented page and scope; it is not a verified live-product finding. A supplied mode is passed to the existing resolver so its token and layout filters remain authoritative.

Consumers should:

1. Read the project brief and the nested Direction Artifact before the knowledge candidates.
2. Preserve the existing source-of-truth order and all hard constraints in `docs/ai-context-contract.md`.
3. Treat catalog-only sources as research leads; treat an observation as evidence only for its recorded page, state and scope.
4. Select token and layout candidates only when they fit the task; explain adoption, adaptation or rejection and preserve existing product tokens.
5. Keep rules and anti-patterns as review prompts until evidence from the target interface supports a finding.
6. Do not copy reference layouts, assets, content, components or identity.
7. Record unknowns, trade-offs, assumptions and acceptance checks. Consuming the bundle is not implementation verification or a QA pass.

This bundle does not change `DirectionConsumptionReport`, crawl or inspect references, verify licences, apply tokens, call an AI/provider, or write to the receiving project. Those capabilities remain out of scope.

The Knowledge Pack keeps source leads and page observations separate. A source may remain `catalog-only` while one specific page observation is `partial`; never upgrade the whole source based on that record.

For a repository checkout, the bundle can also be generated from a validated Direction Artifact file:

```sh
npm run visual-intelligence:generate -- --artifact .integra/runs/direction/DL-001.json --task "Explain the product value and invite visitors to try a demo" --mode persuade --niche-id saas-developer-ai --stdout
```

Use `--out <path>` instead of `--stdout` to write the JSON bundle to a run-output file. The command reads the artifact and writes only the requested bundle output; it does not modify application source. `--tag`, `--asset-type` and `--query` are optional retrieval controls. The receiving agent must still review all candidates and verify its implementation independently. Validate an existing bundle with `npm run visual-intelligence:validate -- --input <bundle.json>`; schema or semantic failures return a non-zero exit code.
