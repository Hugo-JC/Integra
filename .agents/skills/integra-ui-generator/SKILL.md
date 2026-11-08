---
name: integra-ui-generator
description: Generate polished React and TypeScript interface components from abstract product requests. Use for cards, dashboards, navigation, forms, menus, tables, empty states and dialogs.
---

# Integra UI Generator

## Before JSX
- Determine component job, user, information, primary action and data states.
- Inspect existing stack, tokens, component library and nearby components.
- Reuse installed systems such as shadcn/ui when present; do not install a library for one component.
- Ask only for missing facts that materially block implementation; otherwise state assumptions.

## Build rules
1. Use semantic HTML and the simplest structure that supports the behavior.
2. Establish hierarchy through content order, type, spacing, alignment and contrast before decoration.
3. Use semantic tokens (surface, text, border, accent, focus and status roles) mapped to the project's syntax.
4. Reuse type and spacing scales; avoid arbitrary values when tokens exist.
5. Keep one clear primary action per local context.
6. Never fabricate metrics, testimonials, reviews, customer logos or performance claims.
7. Cover loading, empty, error, disabled, hover, active and focus states where relevant.
8. Make layouts responsive from content constraints, not by shrinking desktop columns.
9. Respect reduced motion; motion must communicate state or feedback.
10. Prefer transform/opacity for simple transitions. Avoid scroll hijacking and expensive effects without clear value.
11. Add ARIA only where native semantics are insufficient.
12. Deliver complete, type-safe code, tests and necessary token additions.

## Visual quality gate
Review narrow mobile and desktop. Remove gratuitous gradients, oversized headings, nested cards, excessive rounding, repeated icons and purposeless shadows. Keep a distinctive concept rather than generic decoration.
