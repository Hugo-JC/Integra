# Design Intelligence Library v2

The visual knowledge layer is a structured, provenance-aware library for design agents.

## Catalogs
- `visual-sources.json`: explained discovery leads for visual galleries, product interfaces, design systems, typography, color, motion and methodology.
- `asset-sources.json`: asset-provider discovery records; exact assets require separate rights and provenance checks.
- `niche-reference-map.json`: discovery shortlists for all 61 migrated AI Design Engine niches.
- `reference-observations.json`: page-level evidence records; empty until actual inspections are performed.
- `token-systems.json`: semantic starter recipes, not brand overrides or WCAG claims.
- `layout-patterns.json`: task- and mode-aware composition options with prerequisites.
- `design-rules.json` and `anti-patterns.json`: contextual rules and risk hypotheses with verification guidance.
- `examples/index.json`: illustrative decision examples, not templates.

## Knowledge resolver
`src/modules/direction/knowledge/index.ts` exports `buildVisualKnowledgePack()`. It is deterministic and offline-first. It selects explainable candidates; it does not browse, verify current terms, download assets, apply tokens or mutate product source.

## Evidence and licence policy
New sources remain `catalog-only`. A source becomes verified only after a specific page or section is inspected and captured in a reference observation. A gallery thumbnail is not evidence of shipped interaction. Asset licences and API terms must be checked for the exact asset and use.

## Validation
Run `npm run validate:visual-library`, `npm run test -- tests/knowledge-library.test.ts` and `npm run check`.

The validator checks schemas, stable IDs, cross-catalog references, observation provenance and full niche mapping coverage.
