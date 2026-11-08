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


## AI context and evidence\n\nRead `docs/ai-context-contract.md` before using presets, references or design-quality rules. Presets are candidates, reference URLs are not proof of inspection, and heuristic matches require evidence before becoming findings.\n\n## Portable Agent Skills
Read the relevant task skill under `.agents/skills/<skill-name>/SKILL.md` before work; use `GEMINI.md` for Gemini CLI routing.

- New direction/redesign: `integra-design-direction`.
- New UI component: `integra-ui-generator`.
- Existing TSX refactor: `integra-refactor-agent`.
- Review/critique: `integra-design-qa`.
- Accessibility: `integra-accessibility-audit`.
- External references: `integra-investigation`.
- Tokens/components: `integra-design-system`.
- Local DOM inspection: `integra-live-inspector`.

Skills are guidance, not authorization to edit a project. If independent agents are unavailable, label sequential QA as single-agent.
