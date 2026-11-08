# ADR-011: Hybrid Command System

- **Status:** Accepted
- **Date:** 2026-11-08

## Context

Integra already has portable specialist skills and a task vocabulary, but the vocabulary is not an executable command contract. Users need one coherent entry point without duplicating skills or colliding with commands provided by coding-agent hosts.

## Decision

Adopt a hybrid model:

- `/integra` is the top-level orchestrator for broad and multi-step work.
- `/integra:<name>` exposes focused workflows and modifiers.
- A host adapter may provide shorter aliases only when supported and collision-free.
- `commands/manifest.json` is the canonical catalog; specialist Markdown skills remain the source of detailed procedures.
- Natural-language routing remains supported on hosts without native slash commands.

All source mutations use review-first approval.

## Consequences

The manifest needs schema validation, skill-reference checks, fixtures and host compatibility tests. Integra must not claim native slash-command support where the host does not provide it.
