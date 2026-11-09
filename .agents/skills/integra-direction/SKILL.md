---
name: integra-direction
description: Legacy compatibility alias for integra-design-direction. Use only when an existing project, command or user explicitly references the old name; defer all direction work to the canonical integra-design-direction workflow.
---

# Integra Direction — legacy alias

This skill name is retained for backwards compatibility only.

The canonical workflow is `integra-design-direction`. When this alias is invoked:

1. Preserve the user's original request and target.
2. Read or invoke `integra-design-direction` when that skill is available.
3. Do not create a second direction process or conflicting design rules.
4. If the canonical skill cannot be loaded, use its locally available project guidance and disclose the limitation.
5. Do not change project source merely because the alias was invoked.

This file intentionally stays short so the canonical skill remains the single source of truth.
