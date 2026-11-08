# Integra instructions for Gemini CLI

@./AGENTS.md

## Gemini workflow
- Discover and read the relevant skill in `.agents/skills/<skill-name>/SKILL.md` before a design task.
- Prefer `integra-direction` before a new screen; use `integra-refactor-agent` for existing components and `integra-design-qa` for independent review.
- Use `npm run design:route -- "<brief>" --json` and do not silently accept low-confidence/fallback routes.
- Use `npm run design:qa -- src/ --json` for deterministic source checks; follow with rendered inspection for visual claims.
- Do not treat Live Inspector previews as committed source edits.
- Keep all generated evidence in `.integra/runs/` and distinguish observed facts from hypotheses.
