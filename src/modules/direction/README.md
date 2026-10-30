# Direction module

The module currently exposes a small deterministic foundation:

- WCAG 2.2 SC 1.4.3 text-contrast evaluation for supplied opaque hex colors.
- Decision provenance and precedence (brief > rule > AI > default).
- Validation of optional, untrusted AI suggestions as advisory input.
- Shared types for contextual recommendations marked `[R]`.
- A versioned, provider-independent Direction Artifact contract covering all eight direction areas.

The artifact contract is defined in `schemas/direction-artifact.schema.json` and represented by the `DirectionArtifact` TypeScript interface. Missing context is recorded explicitly rather than guessed. Artifact payloads intentionally omit timestamps to preserve deterministic output.

This is not yet the complete Direction Engine. There is no DOM/CSS parser, provider adapter, visual generator or production orchestrator. See [the Phase 2 slice notes](../../../docs/phase-2-direction-slice.md) for scope and limitations.
