---
name: integra-ui-generator
description: Generate production-oriented UI components or screens from a brief using contextual presets, semantic tokens and accessible interaction patterns.
---

# Integra UI Generator

## Understand before generating
- Identify the job-to-be-done, primary user, content hierarchy, device context and success action.
- Inspect existing project tokens and components before introducing new ones.
- Use `npm run design:route -- "<brief>" --json` as a suggestion, not as an authority.
- Confirm low-confidence or ambiguous preset routes.

## Design quality
- Establish one clear visual idea; avoid generic dashboard cards, gratuitous gradients, glass effects and excessive rounding.
- Use meaningful typography hierarchy, intentional whitespace and content-first composition.
- Prefer semantic color roles and a restrained, intentional accent.
- Use real product language and plausible content. Never fabricate trust signals.
- Build responsive layouts from content constraints, not arbitrary device labels.
- Include accessible labels, focus, keyboard interactions and reduced-motion behavior.
- Provide coherent loading, empty, error, success and disabled states.
- Make interactions discoverable and give immediate feedback.

## Implementation
- Follow the host project's stack and conventions; do not add dependencies for trivial effects.
- Prefer native HTML and project components; avoid unnecessary wrappers.
- Keep components composable and types explicit.
- Add tests for meaningful interactions and state transitions.
- Use animation only when it clarifies hierarchy or state.

## Final self-check
Explain the chosen direction, key trade-offs, responsive behavior, accessibility decisions and remaining unknowns. Do not say the result is polished or production-ready without actually verifying it.
