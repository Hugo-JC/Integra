---
name: integra-design-direction
description: Create a distinctive, product-specific visual direction (thesis, tokens, composition, states) before any UI code. Use for new pages, redesigns, visual personality, token plans and layout decisions; not for pixel-level polish of finished screens.
---

# Integra Design Direction

Turn product intent into a direction another agent can implement without guessing. Start from users, task and constraints, never from a fashionable style. Follow `docs/ai-context-contract.md` whenever presets, references or quality rules influence a decision.

## Use when / not when
- Use: new page or product surface, redesign, "what should this feel like", token plan, hero/layout choice.
- Not: tweaking spacing on a finished screen (use `integra-design-qa` or a modifier), researching a reference (use `integra-investigation`).

## Inputs to collect (never invent)
Brief, audience, primary job, key action, content hierarchy, platform, target viewports, brand assets/tokens, accessibility target, stack. Classify each as Fact, Constraint, Preference, Assumption or Unknown. Ask only for what materially changes the result; otherwise state a reversible assumption.

## Workflow
1. **Inspect** routes, components, tokens, fonts, assets, screenshots and docs. Preserve established identity unless redesign is requested.
2. **Thesis**: one sentence ("X for Y, felt as Z") plus 2-4 supporting traits. Adjectives alone are not a direction.
3. **Preset candidates**: run `npm run design:route -- "<brief>" --json` or `npm run direction:presets -- "<brief>"`. Justify each match from the brief, check variant conditions, resolve pattern IDs (H1, F3...) via `layout-archetypes.md`, reject mismatches. Weak/ambiguous/fallback result = a question, not an instruction.
4. **Tokens**: semantic roles (canvas, surface, text, muted, border, accent, focus, success, warning, danger), type roles and scale, spacing rhythm, radius, elevation, motion. Reuse existing tokens first.
5. **Composition**: information order, density, grid, responsive transformation per viewport, before decoration.
6. **States**: hover, focus-visible, active, disabled, loading, empty, error, success, reduced motion.
7. **Alternatives**: for consequential choices compare two plausible directions and state the trade-off.
8. **References**: per reference, record ID, observed principle, relevance, limitation. A URL alone is not an inspection.

## Anti-generic safeguards
Challenge (do not ban): purple-blue gradients without rationale, oversized centered hero by default, glassmorphism, pills everywhere, nested cards, icon tiles above every heading, one font for every role. Never invent testimonials, metrics, logos or compliance claims. Integra blue `#3B82F6` belongs to inspector chrome only.

## Output: Direction Brief
1. Thesis and traits  2. Facts / constraints / assumptions / unknowns  3. Preset decision (selected, rejected, why)  4. Tokens  5. Composition per viewport  6. Component principles and states  7. Accessibility constraints  8. Acceptance checks (observable)  9. Approval boundary (what needs user review)

## Signature touch: the "Remove-the-logo test"
Before delivering, answer honestly: if the logo were removed, would this still be recognisably this product? Name the one visual decision that would be wrong for any other brief. If you cannot, the direction is still generic.

## Done when
Primary task is obvious; thesis is falsifiable; tokens are semantic; every default is labelled as default; mobile and desktop behaviour are described; claims are sourced or marked as assumptions.
