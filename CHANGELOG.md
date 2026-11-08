# Changelog

## Unreleased

### Design intelligence
- Added eight provider-neutral Agent Skills for direction, UI generation, refactoring, design QA, live inspection, reference investigation, accessibility and performance.
- Added Gemini CLI project guidance and skill discovery.
- Added nine contextual, validated design presets.
- Added design quality standard, evidence-first investigation method and design command vocabulary.
- Migrated the legacy AI Design Engine's niche profiles, style systems, rules, anti-patterns, archetypes, component catalog, playbook and curated references into a provenance-marked knowledge library.

### Live Inspector
- Added an opt-in browser inspector using native DOM APIs and Shadow DOM.
- Added pointer selection and blue Integra overlay (#3B82F6).
- Added temporary class, color, border-radius and padding previews.
- Added precise class/style diffs and a coding-agent handoff prompt.
- Added a WCAG AA contrast estimate for simple opaque/composited CSS backgrounds.
- Source persistence and source-map resolution remain out of scope; DOM selectors are not source paths.

### Quality
- Added deterministic P0–P3 findings from explicitly supplied observations.
- Added evidence record normalization with source, confidence and limitations.
- Added unit tests and validation scripts for skills and presets.
- Retained Direction Artifact generation and validation for DL-001.

## 0.2.0 — Direction Engine foundation

- Added shared direction context, structured facts and constraints.
- Added deterministic DL-001 Direction Artifact generation and canonical serialization.
- Added four-layer artifact validation and CI.
- Added Agent Integration Contract, consumption report and experiment protocol.

## 0.1.0 — Initial scaffold

- Added modular architecture, Design Lab specification, scenarios, schemas, fixtures and initial tests.
