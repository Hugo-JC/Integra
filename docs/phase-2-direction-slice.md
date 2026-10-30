# Phase 2 — deterministic Direction foundation

This slice moves the Direction Engine from contracts and isolated helpers to its first deterministic scenario output. It does not claim to implement the complete hybrid engine.

## Included

- Shared Context contracts in src/contracts/direction-context.ts.
- Structured facts for viewports, accessibility target, language, existing design tokens, prohibited claims and required content.
- Structured constraints with stable path, operator, value and hard/soft classification.
- Context normalizer with aggregate machine-readable diagnostics, null/empty handling, NFC normalization, stable deduplication and bounded input sizes.
- Minimal decision resolver that applies hard constraints before the existing source precedence.
- Stable sourcePath and targetPath metadata for decisions.
- Deterministic Direction Artifact generation for all eight areas of scenario DL-001.
- Canonical JSON serialization and stable artifact identity without timestamps.
- GitHub Actions checks for typecheck, tests and fixture validation.

## Direction generation boundary

The DL-001 generator consumes a normalized context snapshot. It does not read files, parse Markdown, call an AI provider, create a React application or mutate an external project. It does not invent missing brand colors, visual preferences, locale, stack or accessibility conformance claims.

The artifact provides implementation direction to a consuming site-creation agent. It does not prove that the resulting website is visually or functionally correct.

## Explicit next work

- Complete four-layer artifact validation (structural, semantic, constraints and consistency).
- Add the next deterministic scenario slice only when its structured facts and scenario-specific rules are understood.
- Add the provider-neutral AI candidate boundary after the resolver and hard-constraint semantics are stable.
- Compare an agent run with the artifact against a baseline run without it.
