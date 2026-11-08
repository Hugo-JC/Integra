# Integra Presets

Presets are structured guidance for product context and design decisions. They are not universal templates and they are not all used by the same runtime.

## Three distinct layers

1. **Deterministic style route:** `data/design-library/local-presets.json` and `data/design-library/design-styles.json`. Runtime: `routeDesignPreset()`. Resolves product niche to a candidate style/token set with explicit confidence and confirmation states.
2. **Advisory niche discovery:** `presets/catalog.json` and `presets/design-styles-v3.json`. Runtime: `matchDirectionPresets()`. Returns fuzzy discovery candidates from migrated knowledge. It does not select the final style or override the deterministic route.
3. **Structured product profiles:** `presets/manifest.json` and the nine files listed in it. Provide user flow, content priorities, unknowns, anti-patterns, acceptance checks and conditional composition escapes. They do not decide the visual style.

Read [the canonical AI routing guide](../docs/ai-guides/preset-reference-escape-routing.md) before combining these layers. The shared [AI Context Contract](../docs/ai-context-contract.md) defines precedence, uncertainty and evidence rules.

## Structured profile fields

Each profile includes:
- `designIntent`: purpose, audience needs, personality and visual thesis.
- `visualDirection`: density, surfaces, color roles, typography and motion.
- `layout`: default structural hypothesis, responsive strategy and content priority.
- `components`: preferred patterns, important states and context-specific risks.
- `accessibility`: keyboard, focus, contrast and reduced-motion requirements.
- `aiGuidance`: the primary task flow, priorities, facts to confirm, default anti-patterns and acceptance checks.
- `compositionEscapes`: three conditional alternatives. Every alternative states when it fits, how it composes the page, what real content it requires and what to avoid.

A composition escape is eligible only when its condition matches the user's task and the required content/behavior exists or is explicitly labelled mock content. Do not invent facts to satisfy a pattern.

## Commands

- `npm run design:route -- "brief" [--tone calm|loud] [--json]` — deterministic visual style route.
- `npm run direction:presets -- "brief"` — advisory niche discovery.
- `npm run validate:presets` — schema, reference integrity and profile structure checks.

## Changes to a preset

Update its schema and fixture/test coverage when changing the contract. Keep reference IDs synchronized with `references/catalog.json`. Do not mark a reference verified unless a specific page/section has been inspected and the verification fields are populated.
