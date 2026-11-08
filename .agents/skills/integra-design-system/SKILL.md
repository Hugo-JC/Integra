---
name: integra-design-system
description: Create, document or evolve a product design system (semantic tokens, components, variants, states and usage guidance). Use for token audits, component APIs and migration notes; never impose a visual theme across products.
---

# Integra Design System Engineering

## Workflow
1. Audit existing components, CSS variables and repeated values before adding anything (spacing, radius, color, type inventory).
2. Primitive values vs semantic aliases; map light/dark themes to shared roles and test each theme as its own contrast system.
3. Scales for type, spacing, radius, elevation, motion, sized to the product's density.
4. Component APIs from real use cases; variants only where behavior or meaning differs.
5. States per component: default, hover, active, focus-visible, disabled, loading, error, selected.
6. Constraints: contrast, target size, keyboard, reduced motion.
7. Usage and anti-usage examples; migration notes and deprecations.
8. Test token references and deprecated values.

## Rules
Respect existing tokens; derive missing ones from brand and context. Never enforce one theme (no global `#050505`/`#111111`). Ownership and allowed values documented for each token.

## Output
Token table (name, role, value, theme, owner), component inventory, extraction candidates (`/integra:extract`), migration plan.

## Signature touch: "Token receipts"
For each new token, one line: **why it exists**, **where it is used**, **what it replaces**. A token with no replacement and no second use is premature.
