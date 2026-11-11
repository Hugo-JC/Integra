# Direction module

The module currently exposes a small deterministic foundation:

- WCAG 2.2 SC 1.4.3 text-contrast evaluation for supplied opaque hex colors.
- Decision provenance and precedence (brief > rule > AI > default).
- Validation of optional, untrusted AI suggestions as advisory input.
- Shared types for contextual recommendations marked `[R]`.
- A versioned, provider-independent Direction Artifact contract covering all eight direction areas.
- An offline Visual Intelligence Bundle handoff that preserves the Direction Artifact and adds task context plus unapproved Visual Knowledge candidates.

The artifact contract is defined in `schemas/direction-artifact.schema.json` and represented by the `DirectionArtifact` TypeScript interface. Missing context is recorded explicitly rather than guessed. Artifact payloads intentionally omit timestamps to preserve deterministic output.

This is not yet the complete Direction Engine. There is no DOM/CSS parser, provider adapter, visual generator or production orchestrator. See [the Phase 2 slice notes](../../../docs/phase-2-direction-slice.md) for scope and limitations.

`buildVisualIntelligenceBundle()` in `knowledge/visual-intelligence-bundle.ts` reuses the existing Direction Artifact validator and `buildVisualKnowledgePack()`. The Bundle has its own schema version (`1.0.0`); the Direction Artifact remains `1.1.0`. Bundle IDs use the shared canonical JSON/hash helper and exclude timestamps. A missing mode or niche stays missing, and all retrieved material remains candidate guidance. The current Knowledge Pack has no page-observation collection; catalogued sources remain investigation leads. The bundle builder is pure and offline; it does not inspect URLs, apply recommendations or inspect/modify a receiving project.
