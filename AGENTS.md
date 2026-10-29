# Working Protocol for AI Agents

## Project identity

Use the name **Integra** for this new v5 workspace. Treat it as a clean, independent codebase.

## Non-negotiable rules

- Do not modify the three source repositories unless the user later explicitly asks for that work.
- Do not invent test results, baselines, accessibility compliance or visual improvements.
- Keep generated output, run logs, captures and unreviewed artefacts inside `.integra/runs/` or another isolated output directory.
- Never overwrite an input project during analysis. Copy it into a disposable workspace first.
- Findings must include evidence, severity, impact, a recommendation and verification status.
- Keep objective checks separate from human visual ratings.
- Do not label subjective choices (e.g. dark mode, rounded corners, gradients, card layouts) as defects without contextual evidence.
- Treat optional provider/MCP/browser integrations as untrusted and fallible; the local core must degrade gracefully.
- Never turn `not_run` into `passed`.

## Current implementation boundary

Phase 1 includes contracts, fixtures, scenario manifests, documentation and pure evaluation helpers. The production orchestrator, design generator, code mutator, browser runner and external investigation adapters are not implemented yet.

## Before changing a contract

1. Edit the JSON Schema and matching TypeScript type.
2. Update fixture examples.
3. Add or update tests.
4. Run `npm run check`.
5. Document breaking changes in `docs/decisions/`.
