---
name: integra-design-direction
description: Creates contextual visual direction for a product, page or flow. Use before designing a new interface, redesigning a surface, choosing a preset, or translating a brief into design decisions and tokens.
---

# Integra Design Direction

## Goal
Produce a distinctive, usable visual direction grounded in the actual product. Do not pick a preset or palette before understanding the task.

## Workflow
1. Inspect the repository, existing product UI, brand assets, design tokens and framework conventions.
2. Extract known facts: audience, primary job, platform, content density, success action, viewport and constraints.
3. Record missing facts separately. Do not invent brand colors, product metrics, customer proof or user preferences.
4. Choose the closest contextual preset from presets/manifest.json. Explain why it fits and what must be adapted.
5. Define one visual thesis and a clear hierarchy. Include an alternative only when it changes the strategy meaningfully.
6. Define semantic color roles, typography roles, spacing/layout rhythm, surface/elevation, components and motion.
7. Define required states: default, hover, focus, active, disabled, loading, empty, error and success as relevant.
8. Check WCAG 2.2 AA requirements and reduced-motion needs before implementation.
9. Produce a compact Direction Brief that another agent can implement without guessing.

## Required output
- Product and task summary.
- Known facts, assumptions and missing information.
- Chosen preset and rationale.
- Visual thesis.
- Color roles and contrast pairings (not just raw hex values).
- Typography roles and type scale.
- Layout and spacing rules.
- Component patterns and interaction states.
- Responsive behavior.
- Accessibility and motion constraints.
- Risks and verification plan.

## Guardrails
- The Integra blue selection color #3B82F6 belongs to the inspector UI, not every product.
- Never force dark mode, gradients, glass, cards or rounded corners.
- Existing brand and project tokens outrank presets.
- A popular reference is not proof that a pattern fits the current product.
- Keep functional requirements and aesthetics separate.
