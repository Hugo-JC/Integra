# ADR-012: Dual-Mode Live Inspector with Review Gate

- **Status:** Accepted
- **Date:** 2026-11-08

## Context

The current Live Inspector provides a useful temporary DOM preview and prompt/diff handoff, but it is limited in navigation, edit history and breadth of inspection. Users need both a detailed diagnostic panel and a faster visual workflow.

## Decision

Build one inspection engine with two synchronized experiences:

- Advanced Inspector for DOM navigation, computed properties, token hints and accessibility evidence.
- Quick Canvas for contextual selection and fast visual previews.

All changes remain temporary in the browser. Source-code changes are prepared by the refactor workflow and require explicit user approval of the exact diff.

## Consequences

The implementation must first consolidate the existing Inspector entry points, harden configuration and overlay behavior, then introduce a typed preview history before adding the richer UI. No automatic source mutation, commit, push or merge is included.
