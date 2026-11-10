---
name: integra-colorize
description: Introduce or refine strategic color in an existing frontend while preserving product identity. Use when an interface is monochromatic, visually flat, semantically unclear or needs a coherent color system across actions, states, themes and data; not for replacing the brand or inventing a new visual direction.
---

# Integra Colorize

## Mission

Use color as a deliberate system for hierarchy, meaning and atmosphere. Color must help users recognize actions, understand states, navigate content or experience the product's visual world. Do not add color merely to make a screen look more colorful.

This is an enhancement workflow for an existing product. Preserve confirmed brand commitments, established semantic conventions and the approved direction. If the user requests a new visual identity or complete redesign, hand off to `integra-design-direction`.

## When to use

Use when:
- an interface is grayscale or visually flat and needs purposeful color;
- primary and secondary actions are difficult to distinguish;
- selected, active, focus or status states are unclear;
- light/dark themes are inconsistent;
- data visualizations need a more legible and meaningful palette;
- color application is inconsistent across pages or components;
- the user requests a focused palette refinement.

Do not use to replace an established brand palette without authorization, solve information architecture or typography problems with color, add decorative effects without purpose, or claim WCAG conformance from unrendered values.

## 1. Inspect the existing color world

Inspect brand/product documentation, CSS variables, tokens, theme configuration, component variants, logos, illustrations, imagery, representative screens, interaction states, light/dark themes and actual foreground/background combinations.

Classify colors as:
- **Confirmed brand:** explicitly documented or approved by the product owner.
- **Semantic:** assigned to action, focus, selection, success, warning, error or information.
- **Incidental:** one-off or legacy values with no established role.
- **Unverified:** inferred from a screenshot or asset but not confirmed.
- **Requested:** explicit user constraints that take precedence.

If context is incomplete, do not infer a new brand. State what is known and choose a conservative, reversible treatment.

## 2. Identify the surface mode and color's job

Choose the mode for this surface, not the whole company:

- **Persuade:** color may carry brand voice and own larger regions when the direction supports it. Protect the primary conversion action from decorative competition.
- **Operate:** use color primarily for action, selection, state, wayfinding and hierarchy. Keep long working sessions comfortable; avoid persistent unnecessary saturation.
- **Read:** preserve reading comfort; use color sparingly for links, structure, callouts and meaningful emphasis.
- **Experience:** color may contribute strongly to atmosphere when it supports the artifact and intended emotional response.

State the mode and intended job of color before changing implementation.

## 3. Choose a strategy before editing

Describe emotional temperature (warm, cool, neutral, earthy, high-energy or another context-grounded direction), dominant hue relationship, contrast range, intended focal point, dosage (restrained, balanced or immersive), semantic distinctions and theme coverage.

Do not use fixed color percentages. A small accent may be enough in an Operate interface; a Persuade or Experience surface may justify a larger colored field. The brief and content decide.

## 4. Build roles, not a bag of swatches

Define only the roles the product needs:
- **Canvas and surfaces:** page, raised, inverse and overlay surfaces.
- **Text:** primary, secondary, muted, inverse and link.
- **Action:** primary, secondary, hover, pressed and disabled.
- **Focus and selection:** focus ring, selected surface and selected border.
- **Borders:** subtle, strong, divider and input.
- **Status:** success, warning, danger and information, with subtle/strong variants when justified.
- **Data:** categorical palettes, sequential scales and diverging scales when needed.

Prefer semantic tokens. Keep primitive values separate from semantic aliases and component-specific tokens. Use the project's existing color-space conventions. For new web palettes, OKLCH can help tune lightness and chroma predictably; do not convert solely for novelty or where tooling cannot support it.

Never assume one hue universally means success, warning or danger. Preserve established product and platform conventions unless evidence supports a change.

## 5. Apply at system scale

- Give the strongest color a clear role or intentional region; do not scatter accents randomly.
- Reserve primary-action emphasis for the action itself, not decoration.
- Tint neutrals only when this creates genuine cohesion. Neutral gray can be intentional.
- On colored surfaces, derive readable secondary text from the actual background; avoid generic washed-out gray.
- Keep semantic meaning consistent across components and themes.
- Do not use color as the only distinction for status, selection or chart data. Add labels, shape, patterns, icons or position.
- Treat dark mode as its own composition. Design surface elevation and contrast explicitly; never mechanically invert the light palette.
- Avoid chains of translucent overlays when they make rendered contrast unpredictable.
- For charts, ensure categories remain distinguishable in grayscale or with non-color cues where practical.

## 6. Verify perception and accessibility

Check meaningful combinations in normal, hover, active, focus-visible, selected and disabled states; across light and dark themes; on text, controls, icons, focus indicators, badges, charts, error/empty/loading and dense-content states.

Use actual computed/rendered foreground and background colors whenever possible. Record foreground, background, contrast ratio, text size/weight, applicable criterion, viewport/theme/state, measurement source and limitations.

WCAG AA reference thresholds:
- normal text: 4.5:1;
- large text: 3:1;
- meaningful non-text UI components and graphical objects: 3:1 where applicable.

Do not claim a pass for gradients, images, transparency or compositing unless the actual rendered pair or relevant sampling region has been measured. Otherwise classify as `not_run` or `inconclusive`.

Consider common color-vision deficiencies and low-contrast environments. Verify that color-dependent information also has a textual or structural cue. Simulation is an additional review lens, not proof of accessibility.

## 7. Refine ramps and themes

When deriving ramps:
- vary lightness according to intended surface hierarchy;
- reduce chroma near white and black where gamut or perception requires it;
- check adjacent steps for distinguishability;
- avoid numerically uniform increments that look perceptually uneven;
- test every intended theme and relevant state.

Use explicit solid values when alpha would make results context-dependent. Respect the project's color space and browser support.

## 8. Keep the change scoped

Prefer the smallest coherent set of token and component changes. Do not change typography, layout, content, imagery or information architecture unless it is necessary for color semantics and included in the authorized scope.

If the request is analysis-only, return a strategy and token proposal without editing. For source edits, follow the project's approval boundary and show the exact intended scope before mutation.

## Deliverable: Color Strategy

1. Target and surface mode.
2. Existing color inventory: confirmed brand, semantic, incidental and unknown.
3. Problem statement: what color currently fails to communicate.
4. Strategy: temperature, hue relationship, contrast range and dosage.
5. Semantic token table: role, current value, proposed value, theme and usage.
6. Component/state mapping with examples.
7. Contrast evidence and untested combinations.
8. Responsive/theme implications and non-color cues.
9. Exact changes made or proposed, with rollback considerations.
10. Verification status and next handoff.

## Signature: color receipts

For each introduced or materially changed color, state:
- **Role:** what meaning or atmosphere it carries.
- **Placement:** where it appears.
- **Reason:** why this product needs it.
- **Proof:** how it was checked for hierarchy and contrast.

If a color has no stable role, meaningful atmospheric function or testable purpose, do not add it.

## Handoff

- Multi-screen palette or token governance: `integra-design-system`.
- Criterion-level accessibility checks: `integra-accessibility-audit`.
- Independent final review: `integra-design-qa`.
- New visual world: `integra-design-direction`.

## Attribution

This file is a modified Integra adaptation informed by the color strategy principles in Impeccable's `colorize` reference. The adapted guidance retains the upstream Apache-2.0 license obligations; see [third-party notices](../../../docs/third-party-notices.md) and [the license text](../../../licenses/IMPECCABLE-APACHE-2.0.txt).

Reference: https://github.com/pbakaus/impeccable/blob/main/skill/reference/colorize.md
Impeccable project: https://github.com/pbakaus/impeccable
