# ADR-008 — Contextual Design Intelligence Library

- Status: accepted
- Date: 2026-11-08

## Decision
Migrate the AI Design Engine's structured styles, niche presets and reference sources into Integra as a data library, and preserve its design rules, anti-patterns, playbook, archetypes and reference guidance as attributed documentation.

Add a deterministic router that ranks exact whole-phrase matches, prioritizes strong niche terms over generic terms, surfaces alternatives and requires confirmation for weak or ambiguous results.

## Rationale
The previous ADE already contains valuable niche knowledge. Duplicating every rule into the core would make changes difficult to audit. A data-driven catalog plus documented principles keeps it reusable and provider-independent.

## Consequences
Presets are suggestions, not mandatory themes. The resolver must not invent a niche on fallback. Source attribution and reference restrictions remain visible.
