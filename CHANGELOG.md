# Changelog

## Unreleased

- Added provider-neutral Direction CLI commands to generate and validate DL-001 artifacts.
- Added an Agent Integration Contract and example consumer instructions.
- Added a versioned Direction Consumption Report contract for agent-reported implementation outcomes.
- Added a paired Design Experiment contract for baseline vs Integra-guided evaluation.
- Added a controlled experiment protocol that preserves shared run controls, hashes, evidence and non-verifiable outcomes.
- Updated architecture, roadmap and README to reflect the merged four-layer artifact validation and the first external-agent milestone.

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
