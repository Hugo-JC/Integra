# ADR-009: Framework-neutral Live Inspector

- Status: Accepted
- Date: 2026-11-08

## Decision

Implement the first Live Inspector as an opt-in browser module using native DOM APIs and Shadow DOM. Keep it outside the Node-only deterministic engine.

## Rationale

The feature needs pointer selection, live preview and DOM measurement, but does not need React to work. Shadow DOM protects the inspector UI from host-page styles. A browser module avoids adding runtime dependencies to the core.

## Consequences

- Live edits remain temporary DOM changes.
- The module emits an explicit change-set and a source-refactoring prompt.
- Source paths are never inferred from CSS selectors.
- A future Vite/dev-server adapter can resolve source maps separately.
- Browser tests and source persistence are later milestones, not claims of this implementation.
