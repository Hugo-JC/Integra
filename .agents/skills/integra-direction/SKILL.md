---
name: integra-direction
description: Use when a project or UI needs a contextual visual direction, design tokens, layout principles or implementation brief before code changes.
---

# Integra Direction

## Goal
Turn product intent into a specific, coherent and implementable design direction. Do not default to a house aesthetic.

## Workflow
1. Read the user's brief, existing product UI, brand assets, constraints and current implementation.
2. Separate facts, explicit requirements, preferences, assumptions and missing information.
3. Run `npm run design:route -- "<brief>" --json` when the design library is available.
4. Treat `fallback`, `ambiguous` or low-confidence results as questions to resolve, not silent instructions.
5. Select a direction that fits the product, audience, content, device and existing brand.
6. Define semantic color, type, spacing, radius, elevation, motion and interaction tokens.
7. Describe page hierarchy, key components, responsive behavior, states and accessibility.
8. Record rationale and source provenance for important decisions.

## Non-negotiables
- Never force the library's example palette on an unrelated product.
- Never copy a reference website or its distinctive composition. Extract principles and patterns.
- Preserve explicit brand and product requirements unless the user approves a change.
- Prefer semantic tokens over one-off classes; justify exceptions.
- Do not invent product claims, testimonials, metrics or content.
- Include loading, empty, error, success, disabled and focus states where applicable.
- WCAG checks are objective gates; visual taste remains contextual.

## Deliverable
Return a compact direction brief with: product intent, audience, visual personality, tokens, composition, component principles, responsive rules, accessibility and implementation constraints.
