---
name: integra-design-system
description: Create, document, audit or evolve a product design system: semantic tokens, component contracts, variants, themes, states, governance and migrations. Use when patterns must remain consistent across multiple screens; never impose a universal Integra theme.
---

# Integra Design System Engineering

## Mission

Turn repeated visual and behavioral decisions into a maintainable system that product teams can adopt without losing product identity. A design system is not just a palette or component gallery: it includes token semantics, component behavior, usage rules, governance, accessibility and migration strategy.

## Inspect before abstracting

Inventory:
- CSS variables, design tokens, theme providers and configuration;
- typography, spacing, color, radius, elevation, borders and motion;
- existing components, variants, composition patterns and usage frequency;
- duplicated values versus intentional exceptions;
- component states and accessibility contracts;
- package boundaries, framework constraints and ownership.

Do not infer reuse from visual similarity alone. Two controls that look similar but behave differently may need distinct APIs.

## Token architecture

Separate:
1. **Primitive tokens:** raw values such as color, size and duration.
2. **Semantic tokens:** role-based aliases such as `surface.canvas`, `text.primary`, `action.primary` and `status.error`.
3. **Component tokens:** scoped values only when a stable component need exists.
4. **Theme mappings:** semantic roles mapped to primitives for each theme.

Use the project's existing color space and conventions. For a new web palette, OKLCH may improve perceptual tuning, but do not convert formats merely for fashion or without tooling support.

Token groups should cover relevant roles: canvas/surface/elevated, text, border, action, focus, selection, status, data visualization, type, spacing, radius, elevation and motion.

## Component contracts

For each shared component define:
- purpose and non-goals;
- semantic element and accessible name;
- props and allowed values;
- variants tied to real differences in meaning or behavior;
- states and transitions;
- keyboard and focus behavior;
- responsive constraints;
- loading, empty, error and success behavior;
- examples and anti-examples.

Prefer composition over an expanding collection of boolean props. Do not abstract a one-off component without a credible reuse or maintenance benefit.

## Themes and accessibility

- Treat light and dark themes as separately composed systems.
- Do not mechanically invert colors.
- Preserve state semantics and brand commitments across themes.
- Define contrast expectations for text and non-text UI.
- Include focus-visible, disabled, hover, selected and error states.
- Add non-color cues when color communicates status or data.
- Verify actual rendered combinations rather than trusting token names.

## Governance and migration

Document token ownership, naming, deprecation, versioning and allowed values. Search all references before removing or renaming tokens. Provide migration notes and compatibility shims where necessary. Avoid breaking public component APIs without an approved migration plan.

## Output

- Token inventory (name, role, primitive mapping, theme, owner and status).
- Component inventory and API contracts.
- Duplicates, exceptions and extraction candidates.
- Accessibility and state coverage.
- Migration/deprecation plan.
- Tests or validation commands actually run.

## Signature: token receipts

For each new or changed token state: **why it exists**, **where it is consumed**, **what it replaces**, and **how it is validated**.

## Done when

Tokens express stable roles, component APIs reflect real behavior, themes are independently verified, exceptions are documented and migration is safe.
