# ADR-009 — Live Inspector as a Local Browser Preview

- Status: accepted
- Date: 2026-11-08

## Decision
Implement a framework-agnostic browser module that selects DOM elements, previews safe class/style edits, displays text contrast status and exports a before/after DOM diff. Keep it local-only by default and separate from the source-mutating agent workflow.

## Rationale
A visual preview reduces the distance between design intent and implementation feedback, while explicit diff export keeps source changes reviewable and avoids hidden filesystem or provider actions.

## Consequences
The inspector does not write source code, infer a file path, or guarantee framework state persistence. A future source adapter must be explicit, permissioned and tested separately.
