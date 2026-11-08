---
name: integra-ui-generator
description: Generate production-ready React + TypeScript UI (components, screens, forms, tables, dialogs, empty states) from a product need and an approved direction. Use when building new interface code; not for refactoring existing components or reviewing finished work.
---

# Integra UI Generator

Build interface code that is semantic, accessible, responsive and specific to the product, in the project's own stack.

## Use when / not when
- Use: new component or screen from a brief or Direction Artifact.
- Not: restructuring existing code (`integra-refactor-agent`), auditing (`integra-design-qa`), choosing the direction (`integra-design-direction`).

## Before the first line of JSX
1. Name the component's job, user, data, primary action and states.
2. Inspect stack, tokens, component library and nearby components; match conventions.
3. Reuse installed systems (shadcn/ui, Radix) when present; add a dependency only for a concrete need.
4. If a Direction Artifact exists, read all eight sections and obey hard constraints; [R] items are advisory.
5. Ask only about facts that block implementation; otherwise state assumptions in one line.

## Build rules
- Native semantic elements first; ARIA only where native semantics fall short.
- Hierarchy through order, type, spacing and contrast before decoration.
- Semantic tokens, not one-off values; no arbitrary hex when tokens exist.
- One primary action per local context; secondary actions visibly quieter.
- Cover loading, empty, error, disabled, hover, active, focus-visible. Empty states explain and offer a next step.
- Responsive from content pressure, not by shrinking desktop; no horizontal overflow at the supplied viewports.
- Motion communicates state; prefer transform/opacity; honour `prefers-reduced-motion`.
- Never fabricate metrics, testimonials, logos or reviews; label demo data as fictional.
- Strict TypeScript: typed props, discriminated unions for states, no `any`.

## Deliverable
Complete code, types, token additions, a regression test where behaviour exists, and a short note: assumptions, states covered, what was NOT verified.

## Signature touch: "State gallery"
Ship a tiny story/fixture (or test) that renders every state of the component side by side. If a state cannot be shown, it is not done.

## Visual gate
Check narrow mobile and desktop. Remove gratuitous gradients, oversized headings, nested cards, excessive rounding, repeated icons and purposeless shadows. Run `npm run design:qa -- src/ --json` and report the output honestly.
