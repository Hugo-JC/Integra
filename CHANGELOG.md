# Changelog

## Unreleased — Design Intelligence & Live Inspector

- Imported the AI Design Engine's style catalog, niche presets and reference-source metadata with provenance.
- Added deterministic preset routing with strong/weak matches, ambiguity reporting and explicit fallback confirmation.
- Added a browser-only Live Inspector with blue DOM selection, parent navigation, utility/style previews, reset and DOM diff export.
- Added rendered text contrast audit for WCAG 2.2 SC 1.4.3 AA/AAA; uncertain compositing remains inconclusive.
- Added TypeScript AST-based design QA for common JSX accessibility and token anti-patterns.
- Added six cross-agent skills and dedicated Gemini, Claude, Cursor and GitHub Copilot entry instructions.
- Added design intelligence principles, reference policy, command vocabulary and implementation boundaries.
- Added validators for the imported design library and skill metadata.

## 0.2.0 — Direction Engine foundation

- Moved shared direction context contracts into src/contracts/.
- Added structured project facts and hard/soft constraints.
- Added aggregate Context diagnostics, input bounds, Unicode NFC normalization and stable deduplication.
- Added a minimal constraint-aware decision resolver.
- Added stable source and target paths for decision provenance.
- Added deterministic DL-001 Direction Artifact generation across all eight areas.
- Added canonical serialization and stable artifact identity without timestamps.
- Added GitHub Actions CI for typecheck, tests and fixture validation.
- Corrected the README lockfile instructions.

## 0.1.0 — Initial scaffold

- Integra naming and modular architecture proposal.
- V5 Design Lab specification and five scenario manifests.
- JSON Schemas for scenarios, reports and expected findings.
- TypeScript report/scenario contracts.
- Scoring and detection-metric helpers with unit tests.
- Synthetic HTML and React project fixtures.
- Architecture decisions, safety rules and deployment notes.
