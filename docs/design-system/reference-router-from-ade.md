# Historical Router Import

This document preserves a migrated copy of the original AI Design Engine reference router.

**It is not the current Integra runtime specification.** Use:
- `docs/ai-context-contract.md`
- `docs/ai-guides/preset-reference-escape-routing.md`
- `presets/README.md`
- `references/catalog.json`

Current style-route execution is `npm run design:route -- "<brief>" [--tone calm|loud] [--json]`. The current implementation uses strong niche terms, weak terms only when no strong match exists, longest matching phrase, explicit ambiguity/confirmation and a neutral fallback that requires confirmation. It does not score style keywords after a niche miss.

The migrated ADE reference catalogs are research leads only. Check each source's verification status before claiming inspection. Do not use source-repository command paths as if they were present in Integra.
