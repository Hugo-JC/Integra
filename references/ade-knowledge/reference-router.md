# Reference and Preset Router — historical import

**This file is an archive pointer, not an executable router specification.** The canonical current rules are:

- `docs/ai-context-contract.md`
- `docs/ai-guides/preset-reference-escape-routing.md`
- `presets/README.md`
- `src/modules/direction/presets/router.ts`

## Current runtime behavior

The current deterministic style route is `routeDesignPreset()`, exposed by:

```bash
npm run design:route -- "Landing page para uma cafetaria" --json
```

It:
1. normalizes case, diacritics and punctuation and matches complete phrases;
2. checks `match_terms` first and `weak_terms` only when no strong term matched;
3. uses the longest matching phrase within the active tier;
4. reports equally specific competing presets as `ambiguous`, low confidence and requiring confirmation;
5. reports weak-only matches as low confidence and requiring confirmation;
6. returns a provisional `clean_editorial` fallback with confirmation required when there is no match;
7. applies the first matching `when_any` variant condition from the chosen preset.

The runtime does **not** score the `keywords` from `design-styles.json` when no niche matches. Do not use the old tie-break rule that selected the first preset or the style whose description "felt right".

## Three different catalogs

- `data/design-library/local-presets.json` + `design-styles.json`: deterministic niche-to-style route and its tokens.
- `presets/catalog.json`: advisory discovery over migrated niche knowledge. A returned candidate is not a confirmed match.
- `presets/manifest.json` + its nine structured domain profiles: task flows, content priority, constraints, anti-patterns, acceptance checks and composition alternatives. This layer does not select the visual style.

The historical data below this directory may be consulted for provenance or a research lead. It does not override these current sources.

## Reference selection

Select one to three sources for a specific unresolved question. Prefer normative standards for requirements, official docs for technical behavior and directly inspected product pages for observed UI behavior. A source catalog entry, URL, title or screenshot alone cannot prove hidden behavior or current live content.

Record source ID, verification status, exact page/section inspected, access date, evidence class, confidence, limitation and an original adaptation. Extract a principle, not a copy of the source's layout, code, assets, copy or brand identity.

Do not use old paths such as `node tools/route.js`, `--context --refs` or former source-repository command names in Integra.
