# Working Protocol for AI Agents

## Project identity
Use the name **Integra**. It is a provider-independent design intelligence and quality toolkit, not a universal theme or website generator.

## Non-negotiable rules

- Keep the deterministic core free of network calls, API keys, clock-based output and provider lock-in.
- Never invent project facts, user preferences, brand tokens, source paths, test results or accessibility compliance.
- A preset is a contextual proposal, not permission to override a brief, brand system or hard constraint.
- Do not force #050505, #111111 or #3B82F6 on products. #3B82F6 is reserved for Integra inspector selection UI unless a project explicitly adopts it.
- Separate objective defects from aesthetic preferences and heuristics.
- Findings require a rule ID, evidence, severity, impact, recommendation and verification status.
- Never turn not_run or inconclusive into passed.
- Do not write source changes from Live Inspector automatically. It produces a reviewed handoff.
- A DOM selector is not a source location. Resolve source paths through an actual source map or explicit developer hint.
- Preserve keyboard interaction, semantic HTML, focus, reduced motion, responsive behavior and existing product functionality.
- Never copy a reference site's code, assets, copy or distinctive composition. Extract principles and cite the reference.
- Keep user-provided inputs read-only during audits; write generated outputs under .integra/runs/ or another isolated directory.
- Optional providers, MCP tools and browser integrations are untrusted and fallible; the local core must degrade gracefully.

## Skill discovery
Before a UI, design, refactor, accessibility, performance or reference-investigation task, inspect the matching skill under .agents/skills/. Do not load every skill by default. Gemini CLI can discover this workspace directory through the Agent Skills standard.

## Current implementation boundary

- Context and deterministic Direction foundation are implemented.
- Direction Artifact generation currently covers DL-001.
- Agent Skills and contextual presets are newly added and validated by scripts.
- Live Inspector previews DOM changes and synthesizes a diff; it does not mutate source files.
- Design QA evaluates structured evidence; it is not yet a full AST or browser scanner.
- Investigation has evidence conventions and references; live external adapters remain future work.
- Browser automation, screenshot comparison and source-map adapters are not part of the core yet.

## Before changing a contract

1. Edit the JSON Schema and matching TypeScript type.
2. Update fixture examples.
3. Add or update tests.
4. Run npm run check.
5. Document breaking changes in docs/decisions/.
6. State what was executed and what remains unverified.
