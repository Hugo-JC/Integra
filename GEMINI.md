# Gemini CLI instructions for Integra

Integra is a product-contextual design direction and quality toolkit. Read `AGENTS.md` and `CORE.md`, then choose the relevant portable Agent Skill under `.agents/skills/<skill-name>/SKILL.md`.

## AI context and evidence\n- Read `docs/ai-context-contract.md` before using presets, references or quality rules.\n- Presets are contextual candidates, not mandatory themes.\n- A reference URL is not proof that its current content was inspected.\n- Heuristic matches require evidence before being reported as confirmed findings.\n\n## Skill routing
- Canonical workspace skills: `.agents/skills/*/SKILL.md`.
- New direction: `integra-design-direction`.
- New component: `integra-ui-generator`.
- Existing TSX refactor: `integra-refactor-agent`.
- Design review: `integra-design-qa`.
- Accessibility: `integra-accessibility-audit`.
- External references: `integra-investigation`.
- Tokens/components: `integra-design-system`.
- Local DOM preview: `integra-live-inspector`.

## Project constraints
- Keep the deterministic core offline and provider-agnostic.
- Preserve product identity. Integra blue #3B82F6 belongs to inspector chrome only.
- Never invent facts, metrics, endorsements or test results.
- Keep objective findings separate from visual preferences.
- Live Inspector does not write source files; it exports a preview diff.
- Run `npm run check` before reporting a code change complete. If unavailable, say so.
