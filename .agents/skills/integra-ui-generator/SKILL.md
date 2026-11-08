---
name: integra-ui-generator
description: Generate production-ready React + TypeScript UI (components, screens, forms, tables, dialogs, empty states) from a product need and an approved direction. Use when building new interface code; not for refactoring existing components or reviewing finished work.
---

# Integra UI Generator

Build interface code that is semantic, accessible, responsive and specific to the product, in the project's own stack. Read the [AI context contract](../../../docs/ai-context-contract.md) and [preset/reference routing guide](../../../docs/ai-guides/preset-reference-escape-routing.md) when presets, references or composition alternatives affect implementation.

## Use when / not when

- Use: new component or screen from a brief or Direction Artifact.
- Not: restructuring existing code (`integra-refactor-agent`), auditing (`integra-design-qa`), choosing the full product direction (`integra-design-direction`).

## Before the first line of JSX

1. Name the component's job, user, data, primary action and states.
2. Inspect stack, tokens, component library and nearby components; match conventions.
3. Reuse installed systems (shadcn/ui, Radix) when present; add a dependency only for a concrete need.
4. If a Direction Artifact exists, read all eight sections and obey hard constraints; [R] items are advisory.
5. Read the relevant structured product profile's `aiGuidance` and candidate `compositionEscapes`. The domain profile informs task flow; it does not override the deterministic style route or Direction Artifact.
6. Choose composition only when its `when` condition matches and its `contentRequirements` can be satisfied with real or explicitly labelled demo content. Record the selected escape ID and rationale.
7. Ask only about facts that block implementation; otherwise state assumptions in one line.

## Build rules

- Native semantic elements first; ARIA only where native semantics fall short.
- Hierarchy through order, type, spacing and contrast before decoration.
- Semantic tokens, not one-off values; no arbitrary hex when tokens exist.
- One primary action per local context; secondary actions visibly quieter.
- Cover loading, empty, error, disabled, hover, active and focus-visible. Empty states explain and offer a next step.
- Responsive from content pressure, not by shrinking desktop; no horizontal overflow at the supplied viewports.
- Motion communicates state; prefer transform/opacity; honor `prefers-reduced-motion`.
- Never fabricate metrics, testimonials, logos, reviews, stock, schedules, legal claims or product capabilities; label demo data as fictional.
- Strict TypeScript: typed props, discriminated unions for states, no `any`.
- Do not default to a marketing hero, three-card grid, KPI strip, decorative gradient or glass card. Do not ban a pattern universally; justify it by the product task and real content.
- If no composition escape fits, create a neutral task-first structure rather than forcing an archetype.

## Deliverable

Complete code, types, token additions when necessary, a regression test where behavior exists, and a short note: selected profile/escape, assumptions, states covered, and what was NOT verified.

## Signature touch: "State gallery"

Ship a tiny story/fixture (or test) that renders every state of the component side by side. If a state cannot be shown, it is not done.

## Visual gate

Check narrow mobile and desktop. Remove gratuitous gradients, oversized headings, nested cards, excessive rounding, repeated icons and purposeless shadows. Run `npm run design:qa -- src/ --json` when the script and target exist; report the output honestly and never claim it passed if it was not run.
