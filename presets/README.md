# Preset library

- `ai-design-engine-v3.json`: source local niche preset catalog from the predecessor.
- `design-styles-v3.json`: source style/token definitions.
- `catalog.json`: normalized runtime data consumed by the offline matcher.
- `experience-patterns.json`: contextual product archetypes.

Try: `npm run direction:presets -- "analytics dashboard for SaaS"`.

Matches are recommendations. Agents must compare them with the current brief, existing tokens, hard constraints and product context before applying a direction.
