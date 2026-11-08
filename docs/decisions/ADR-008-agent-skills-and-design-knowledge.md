# ADR-008: Portable skills and migrated design knowledge

- Status: accepted
- Date: 2026-11-08

## Context
Integra must support multiple coding agents and reuse the AI Design Engine knowledge without coupling the core to one vendor.

## Decision
Use `.agents/skills/` as the canonical portable skill location; add `GEMINI.md` and `AGENTS.md` as host/project routing instructions. Migrate predecessor presets and reference guides with source attribution. Expose deterministic offline preset matching; matches remain advisory and subordinate to brief facts and hard constraints.

## Consequences
Skills are ordinary Markdown and require no provider SDK. Source data remains attributable. Automatic loading must be verified against each host's current documentation.
