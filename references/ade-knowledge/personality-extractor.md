# Personality and Tone Extraction — historical import

**Canonical rules:** `docs/ai-context-contract.md` and `docs/ai-guides/preset-reference-escape-routing.md`.

## Separate product niche from visual tone

- **Niche** identifies what the product/service is and the task it supports. It is resolved by the current deterministic route in `data/design-library/local-presets.json`.
- **Tone** describes the expressive intensity requested by the user. It can influence the accepted style direction but must never change the product niche or override existing design tokens.
- **Domain profile** is a separate decision: choose one of the nine structured `presets/*.json` profiles by primary user task and content, not by visual adjective.
- **Composition escape** is another separate decision: select it by task and available content, not by visual tone alone.

## Current route and CLI

```bash
npm run design:route -- "Landing page para um estúdio de tatuagem" --json
npm run design:route -- "Landing page para uma cafetaria" --tone calm --json
npm run design:route -- "Developer dashboard" --tone loud
```

The CLI accepts `calm` and `loud`. A style can have a stored default `balanced` intensity, but `balanced` is not a supported CLI tone override.

The route checks strong niche terms before weak terms. Equally strong matches and weak-only matches require confirmation. With no match it returns a provisional neutral `clean_editorial` fallback and also requires confirmation. It does not select a style by guessing from keywords.

## Application rules

1. Respect explicit user instructions, verified project behavior and existing approved tokens before applying a preset.
2. Explain why the niche route fits the actual product and primary task.
3. Treat style colors, fonts, radii and accent values as candidates; validate them against the project, language, platform and accessibility.
4. If the user requests a specific color or font, account for it without silently damaging contrast or consistency.
5. Distinguish product/brand imagery from UI accent roles; do not apply arbitrary percentage quotas.
6. Use a structured domain profile to understand the user flow, important content, states, unknowns and acceptance checks.
7. Choose a composition alternative only when its condition and content requirements are met.
8. Record uncertainty. Never let "premium", "modern", "aggressive", "minimal" or another style adjective replace the product niche.

## Provenance

This file preserves selected concepts from the original AI Design Engine. Old commands such as `node tools/route.js`, `node tools/lint-repo.js` and old paths are not current Integra commands.
