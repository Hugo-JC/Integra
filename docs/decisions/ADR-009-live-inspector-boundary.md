# ADR-009: Live Inspector as a development-only adapter

- Status: accepted
- Date: 2026-11-08

## Decision
Implement Live Inspector as a browser-side preview and patch handoff, integrated through a Vite plugin restricted to `apply: 'serve'`. Use Shadow DOM to isolate panel styles, blue selection chrome (#3B82F6), temporary DOM changes and a serializable patch contract.

## Explicit non-goals
The inspector does not write files, modify framework state, resolve source maps, inject into production or claim WCAG conformance. Its contrast estimate is limited to solid colors.

## Rationale
The boundary enables fast local feedback while source mutation and verification stay under the developer or coding agent's normal review and test workflow.
