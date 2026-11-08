# Gemini CLI instructions for Integra

Integra is a product-contextual design direction and quality toolkit. Read `AGENTS.md` and `CORE.md`, then select the relevant canonical portable skill under `.agents/skills/<skill-name>/SKILL.md`.

## AI context, presets and evidence

- Read `docs/ai-context-contract.md` before using presets, references or quality rules.
- Read `docs/ai-guides/preset-reference-escape-routing.md` when deciding between style routes, product profiles, references and composition alternatives.
- Presets are contextual candidates, not mandatory themes.
- The deterministic niche-to-style router, advisory migrated niche catalog and structured product profiles have different roles. Do not mix their outputs.
- Choose composition alternatives by task and available content; do not default to split hero + three feature cards.
- A reference URL is not proof that its current page was inspected.
- Heuristic matches require evidence before being reported as confirmed findings.

## Skill routing

- Canonical workspace skills: `.agents/skills/*/SKILL.md`.
- New direction: `integra-design-direction`.
- New component: `integra-ui-generator`.
- Existing TSX refactor: `integra-refactor-agent`.
- Design review: `integra-design-qa`.
- Accessibility: `integra-accessibility-audit`.
- External references: `integra-investigation` and `integra-reference-investigator`.
- Tokens/components: `integra-design-system`.
- Local DOM preview: `integra-live-inspector`.

## Project constraints

- Keep the deterministic core offline and provider-agnostic.
- Preserve product identity. Integra blue #3B82F6 belongs to inspector chrome only.
- Never invent facts, metrics, endorsements, customer proof or test results.
- Keep objective findings separate from visual preferences.
- Live Inspector previews are temporary and do not write source files.
- Source edits require approval of the exact proposed diff; commits, pushes, PRs and merges need separate authorization.
- Run `npm run check` before reporting a code change complete. If the environment cannot run it, report that limitation.
