# ADR-007 — Shared direction context and structured constraints

- Status: Accepted
- Date: 2026-10-30

## Context

The first Context normalizer reused DirectionContextSnapshot from the Direction module. That made a shared input contract depend on a capability that will consume it. In addition, free-form constraint strings are useful for humans but cannot safely drive deterministic conflict resolution through keyword matching.

The Direction Engine needs explicit facts such as target viewports, accessibility target, content language, existing tokens, required content and prohibited claims. It also needs a machine-readable way to compare a candidate decision with a stated constraint.

## Decision

1. Move DirectionContextSnapshot and its related input/fact/constraint types into src/contracts/direction-context.ts.
2. Keep human-readable goals, constraints, preferences and stack lists. Do not reinterpret their prose as machine rules.
3. Add optional structured facts for viewports, accessibility target, language, existing tokens, prohibited claims and required content.
4. Add structured constraints with a stable path, explicit operator, scalar or scalar-list value, and a hard flag.
5. Apply hard constraints only to decisions with a matching targetPath. An unscoped decision cannot be considered compatible while hard constraints are present. Unsupported comparisons remain inconclusive.
6. Keep the existing precedence among compatible candidates: brief > rule > ai > default.
7. Treat absent, null and whitespace-only values as missing. Report malformed types, unknown keys, invalid structured values and size-limit violations through machine-readable diagnostics.
8. Add sourcePath to brief-derived decisions so provenance points to the normalized context the engine actually consumed.
9. Version the additive Direction Artifact contract as 1.1.0.

## Consequences

- Context and Direction depend on a shared contract rather than on one another's internal types.
- The deterministic core does not guess the meaning of free-form prose.
- Hard constraints are enforceable for structured decisions and cannot be bypassed by AI candidates that use the resolver.
- A candidate without enough structure to evaluate a relevant hard constraint is inconclusive, not implicitly accepted.
- Adding context fields requires updates to the shared TypeScript contract, JSON Schema where serialized, fixtures, tests and this decision record when the architecture changes.

## Out of scope

This ADR does not define a generic rule DSL, solver, Markdown parser, provider registry, prompt template system or semantic interpretation of free-form AI recommendations.
