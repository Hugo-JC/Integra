---
name: integra-design-direction
description: Create a distinctive, product-specific visual direction (thesis, tokens, composition, states) before UI code. Use for new pages, redesigns, visual personality, token plans and layout decisions; not for pixel-level polish of finished screens.
---

# Integra Design Direction

Turn product intent into a direction another agent can implement without guessing. Start from users, task and constraints, never from a fashionable style. Follow the [AI context contract](../../../docs/ai-context-contract.md) and [preset/reference routing guide](../../../docs/ai-guides/preset-reference-escape-routing.md) whenever presets, references or quality rules influence a decision.

## Use when / not when

- Use: new page or product surface, redesign, "what should this feel like", token plan or hero/layout choice.
- Not: tweaking spacing on a finished screen (use `integra-design-qa` or an active modifier), researching a reference (use `integra-investigation`).

## Inputs to collect (never invent)

Brief, product context, audience, primary job, key action, content hierarchy, data availability, platform, target viewports, brand assets/tokens, accessibility target and stack. Classify each as Fact, Constraint, Preference, Assumption or Unknown. Ask only for information that materially changes the result; otherwise state a reversible assumption.

## Workflow

1. **Inspect:** routes, components, tokens, fonts, assets, screenshots, tests and project docs. Preserve established identity unless redesign is requested.
2. **Thesis:** one sentence ("X for Y, felt as Z") plus 2–4 supporting traits. Adjectives alone are not a direction.
3. **Style route:** run `npm run design:route -- "<brief>" --json`. Strong niche terms precede weak terms; weak-only, ambiguous and fallback results require confirmation. Never invent a tie-break. The `calm|loud` tone changes intensity only, not niche.
4. **Keep preset layers separate:** `npm run direction:presets -- "<brief>"` is advisory niche discovery, not the deterministic style route. Select a structured domain profile from `presets/manifest.json` by primary user task, not style adjective. Read its `aiGuidance`, constraints and acceptance checks.
5. **Composition:** choose a `compositionEscapes` option only when its `when` condition matches and its `contentRequirements` can be met by real or explicitly labelled mock content. Explain why it fits and why another viable option is weaker. If none fits, compose directly from the task; do not force a pattern.
6. **Tokens:** define semantic roles (canvas, surface, text, muted, border, accent, focus, success, warning, danger), type and spacing scales, radius, elevation and motion. Reuse existing tokens first; do not copy a preset's token values blindly.
7. **Responsive composition:** define information order, density, grid and transformation for relevant viewports before decoration.
8. **States:** include hover, focus-visible, active, disabled, loading, empty, error, success and reduced motion where relevant.
9. **Alternatives:** for a consequential structural choice, compare up to two task-valid options and state the trade-off. Do not manufacture variety by randomly cycling archetypes.
10. **References:** for each source, record stable ID, authority, verification status, exact page/section inspected, evidence class, relevance, limitation and adaptation. A URL or title alone is not inspection.
11. **Handoff:** provide thesis, facts/constraints/assumptions/unknowns, route status and candidates, selected domain profile, chosen/rejected composition options, tokens, layout per viewport, component principles, states, accessibility constraints and observable acceptance checks.

## Anti-generic safeguards

Challenge (do not universally ban): purple-blue gradients without rationale, oversized centered hero by default, glassmorphism, pills everywhere, nested cards, icon tiles above every heading and one font for every role. Never invent testimonials, metrics, customer logos, product capabilities, legal claims or compliance status. Integra blue `#3B82F6` belongs to inspector chrome only.

## Output: Direction Brief

1. Thesis and traits.
2. Facts, constraints, preferences, assumptions and unknowns.
3. Style-route result (status, confidence, matched terms, alternatives and confirmation requirement).
4. Domain profile and task-flow rationale.
5. Selected composition escape and rejected alternatives.
6. Tokens, component principles, state and responsive rules.
7. References and evidence limitations.
8. Accessibility and acceptance checks.
9. Approval boundary (what exact changes need user review).

## Signature touch: the "Remove-the-logo test"

Before delivering, answer honestly: if the logo were removed, would this still be recognisably this product? Name the one visual decision that would be wrong for any other brief. If you cannot, the direction is still generic.

## Done when

The primary task is obvious; thesis is falsifiable; each catalog is used for its actual purpose; composition follows available content; tokens are semantic; every default is labelled as a default; mobile and desktop behavior are described; claims are sourced or marked as assumptions.
