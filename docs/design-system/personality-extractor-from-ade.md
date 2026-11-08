# Historical Personality Extractor Import

This document preserves a migrated concept from the original AI Design Engine. It is not the current routing contract.

Use `docs/ai-context-contract.md` and `docs/ai-guides/preset-reference-escape-routing.md`.

Current Integra decisions are separate:
- product niche and style candidate: `routeDesignPreset()`;
- product task and workflow: one of the structured profiles under `presets/manifest.json`;
- visual tone: optional `calm` or `loud` CLI adjustment to intensity only;
- composition: a conditional `compositionEscapes` choice supported by the available content;
- reference use: source authority, verification status and evidence, not the source's visual popularity.

The CLI does not accept `balanced` as a tone override, and tone never changes the niche. Old commands and fixed accent percentages in this imported source are not current Integra behavior.
