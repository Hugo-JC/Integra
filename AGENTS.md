# Working Protocol for AI Agents

## Project identity

Use the name **Integra** for this independent v5 workspace. Treat it as a clean codebase.

## Non-negotiable rules

- Do not modify the source repositories used as references unless the user explicitly requests that work.
- Do not invent test results, baselines, accessibility compliance or visual improvements.
- Keep generated output, run logs, captures and unreviewed artefacts inside `.integra/runs/` or another isolated output directory.
- Never overwrite an input project during analysis. Copy it into a disposable workspace first.
- Findings must include evidence, severity, impact, a recommendation and verification status.
- Keep objective checks separate from human visual ratings.
- Do not label subjective choices (dark mode, rounded corners, gradients, card layouts, etc.) as defects without contextual evidence.
- Treat optional provider/MCP/browser integrations as untrusted and fallible; the local core must degrade gracefully.
- Never turn `not_run` into `passed`.

## Current implementation boundary

The command manifest, schema validation, deterministic route planning, structured presets, local reference metadata and evidence contracts are implemented. Phase 1 command routing is not a production agent executor and does not install native slash commands into every host. The production orchestrator, UI generator, source-code mutator and external browser investigation adapters remain separate implementation work.

## Before changing a contract

1. Edit the JSON Schema and matching TypeScript type.
2. Update fixtures and references.
3. Add or update tests.
4. Run `npm run check`.
5. Document breaking changes in `docs/decisions/`.

## AI context, presets and evidence

Read `docs/ai-guides/preset-reference-escape-routing.md` together with `docs/ai-context-contract.md` whenever presets, references or layout options influence a design decision. Read `.agents/skills/integra-visual-knowledge/SKILL.md` when curating or retrieving knowledge from the visual library.

Also read `docs/ai-context-contract.md` for source precedence, fact/assumption classification, severity and approval rules. The deterministic style route, advisory niche discovery and structured product profiles are separate layers; never treat them as interchangeable. A reference URL or catalog title is not evidence that the live page was inspected.

## Portable Agent Skills

Read the relevant canonical task skill under `.agents/skills/<skill-name>/SKILL.md`. Skills are procedural guidance, not proof that a host loaded them and not authorization to modify a project.

- UX/IA shaping: `integra-ux-shape`.
- New direction/redesign: `integra-design-direction`.
- New UI component: `integra-ui-generator`.
- Existing TSX refactor: `integra-refactor-agent`.
- Review/critique: `integra-design-qa`.
- Accessibility: `integra-accessibility-audit`.
- External research: `integra-investigation` and `integra-reference-investigator`.
- Visual knowledge library: `integra-visual-knowledge` for explained sources, observations, asset providers, niche mappings, tokens, layout patterns, rules, anti-patterns and examples.
- Tokens/components: `integra-design-system`.
- Strategic color refinement: `integra-colorize`.
- Purposeful transitions, micro-interactions and motion systems: `integra-animate`.
- Local DOM inspection: `integra-live-inspector`.

Use `GEMINI.md` for Gemini CLI-specific routing. If independent agents are unavailable, label sequential QA as single-agent.

## Review and mutation boundary

Read-only inspection, analysis and a generated proposal do not authorize source edits. Preview changes must be temporary and reversible. Source changes require approval of the exact proposed diff. A command invocation, accepted preview, generated patch or passing test is not approval. Commits, pushes, PR creation and merge require separate authorization.
