---
name: integra-design-direction
description: Define a distinctive, product-specific visual direction before implementation. Use for new surfaces, redesigns, visual identity, design theses, composition, experience archetypes and token plans; not for isolated polish or external-reference research.
---

# Integra Design Direction

## Mission

Translate product intent into an original visual system that another agent can implement consistently. Design direction is a set of explicit decisions with rationale and constraints—not a moodboard, adjective list or copied reference.

## When to use

Use for a new page or product surface, redesign, visual personality, design thesis, experience archetype, composition strategy or token direction.

Do not use for:
- isolated finishing adjustments (`integra-design-qa` or an active modifier);
- user/task and information architecture (`integra-ux-shape`);
- detailed reference investigation (`integra-investigation` or `integra-reference-investigator`);
- implementation (`integra-ui-generator`);
- token/component governance across an existing system (`integra-design-system`).

## Inputs: inspect, don't invent

Collect product purpose, audience, primary task, business constraints, content hierarchy, available assets, current product identity, stack, platforms, viewports, data constraints, accessibility target and existing tokens.

Label each input Fact, Constraint, Preference, Assumption or Unknown. Ask only when the missing answer changes the design direction materially; otherwise state a reversible assumption.

## Procedure

1. **Read the incumbent world.** Inspect PRODUCT.md (or equivalent product truth), DESIGN.md (or approved visual-system documentation), the scoped brief, existing screens, routes, CSS, components, fonts, imagery, tokens and relevant tests. Follow docs/product-context-contract.md when available. A missing DESIGN.md does not mean the project has no design system; inspect the implementation before proposing tokens.
2. **Choose surface mode.** Determine what the visitor is trying to do on this surface:
   - **Persuade:** decide or act; commonly marketing, campaigns and pricing.
   - **Operate:** complete a task; commonly product UI, dashboards, editors and admin.
   - **Read:** understand content; commonly docs, articles and help.
   - **Experience:** explore or appreciate the artifact; commonly portfolios, galleries and showcases.
   Choose mode per surface, not per company. A product's documentation is Read; its marketing page is Persuade.
3. **Write a thesis.** Use one sentence describing what the product is for, who it serves and how the experience should feel. Add two to four observable traits. Avoid generic adjectives without a visible expression.
4. **Run the deterministic style route when available.** Use `npm run design:route -- "<brief>" --json` only in a checkout where the script exists. Preserve status, confidence, matched terms and ambiguity. Weak, ambiguous or fallback matches are suggestions that require confirmation, not instructions.
5. **Keep catalog layers separate.** Use niche discovery as advisory evidence. Select structured domain profiles by primary user task, not style adjective. Experience archetypes are composition references, not universal templates. A preset never overrides explicit product constraints or the Direction Artifact.
6. **Define hierarchy and composition.** Decide primary content, primary action, supporting regions, density, alignment, grid behavior, image role, navigation, and responsive transformation. Select a composition option only when its content requirements can be met.
7. **Define visual language.** Specify semantic colors, type roles, spacing, radius, elevation, borders, icon style, imagery and motion. Reuse existing tokens and preserve confirmed brand commitments.
8. **Define states and motion intent.** Include hover, focus-visible, active, selected, disabled, loading, empty, error and success. State where motion communicates feedback or continuity, where static feedback is preferable, and how reduced-motion is preserved. Hand detailed timing, choreography and implementation to `integra-animate` when motion is a material part of the task.
9. **Define responsive behavior.** Explain what changes at narrow, medium and wide widths: ordering, visibility, navigation, density, controls and overflow. Do not merely scale desktop down.
10. **Evaluate alternatives.** For consequential choices, compare at most two viable alternatives and name the trade-off. Avoid fake variety.
11. **Record evidence and provenance.** A URL or catalog title is not inspection. Record exact source/section, access date, evidence type, confidence, limitations and how the principle is adapted.
12. **Prepare an implementation handoff.** Make every design decision actionable: token role, component behavior, layout rule, responsive behavior and acceptance condition.

## Design safeguards

- The user's explicit brand and product constraints win over generic design preferences.
- Refinement preserves the incumbent identity; redesign may replace its visual world only when requested.
- Do not default to the same centered hero, three-card grid, pill controls, glass cards, gradients or icon tiles.
- Do not ban those patterns categorically; justify them with task, content and product context.
- Never fabricate product metrics, customer logos, testimonials, features or claims.
- Do not use the Integra inspector blue as a universal brand accent.
- Use references to extract principles, not copy code, text, assets or distinctive compositions.

## Direction Brief

Deliver:
1. thesis, surface mode and intended audience;
2. facts, constraints, preferences, assumptions and unknowns;
3. visual traits with concrete manifestations;
4. style route and confidence, if used;
5. selected domain profile/archetype and why it fits;
6. hierarchy and composition;
7. semantic token plan and type roles;
8. responsive transformations, interaction states and motion intent;
9. accessibility constraints and evidence needs;
10. implementation acceptance checks and approval boundary.

## Signature test: remove the logo

If the logo vanished, what visible product-specific decisions would still make the experience distinctive? Name at least one. If none exists, the direction is still generic.

## Done when

A developer can implement the direction without guessing, the primary user task remains obvious, responsive and failure states are described, and every uncertain claim is labelled.
