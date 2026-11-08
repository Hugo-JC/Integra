# Integra Design Intelligence — Quality Principles

These rules combine the original AI Design Engine knowledge base with a more explicit, testable workflow. They are guidance for agents, not a universal visual theme.

## 1. Product clarity before decoration
- State the product's purpose and primary action in the first meaningful viewport.
- Prefer specific product language and real content over generic filler.
- Each page section must support a user need, product proof or decision.
- Remove decorative sections that compete with the primary task.

## 2. Contextual visual identity
- Derive visual personality from audience, product category, positioning, content and brand.
- Use niche presets as starting hypotheses. Confirm weak or ambiguous matches.
- Do not force dark mode, monochrome, blue accents, gradients, glass, bento cards or rounded surfaces.
- Keep a recognisable visual idea across the page without flattening every component into the same card.

## 3. Typography and hierarchy
- Define a deliberate type scale with clear roles for display, heading, body, metadata and controls.
- Prefer readable line lengths, stable line-height and restrained tracking.
- Avoid using size alone to create hierarchy; use weight, spacing, contrast and grouping.
- Do not use low-contrast grey for important body copy or controls.

## 4. Layout and rhythm
- Use a spacing scale and align related content to consistent layout rails.
- Choose page archetypes based on content and task, not fashion.
- Keep important actions visible and predictable.
- Avoid arbitrary nested containers and card grids with no information hierarchy.

## 5. Components and interaction
- Use semantic native controls where possible.
- Define hover, active, focus-visible, disabled, loading, empty, error and success states.
- Make clickable areas and their affordances clear.
- Never make interaction depend only on color, hover or animation.

## 6. Color and tokens
- Define semantic roles: canvas, surface, elevated surface, text, muted text, border, accent, success, warning and danger.
- Use project tokens when they exist; document brand exceptions.
- Avoid arbitrary hex utility classes where semantic tokens are available.
- Test text contrast against actual composited backgrounds.

## 7. Motion and feedback
- Motion must communicate state, continuity or hierarchy.
- Respect `prefers-reduced-motion`; provide a no-motion equivalent.
- Avoid long, blocking transitions and animation that delays core tasks.
- Prefer subtle, consistent timing over isolated spectacle.

## 8. Responsive behavior
- Reflow based on content pressure, not device names alone.
- Test narrow widths, zoom, long words, translated labels and dynamic content.
- Avoid fixed widths that cause clipping or horizontal scroll.
- Keep touch targets and keyboard behavior usable.

## 9. Accessibility
- Give images appropriate alternative text; decorative images use `alt=""`.
- Give controls accessible names and form inputs labels/instructions.
- Preserve visible focus and keyboard operation.
- Use landmarks and a logical heading hierarchy.
- Use WCAG 2.2 AA as a measurable floor; AAA is a stronger target where appropriate.

## 10. Performance and implementation discipline
- Avoid unnecessary dependencies, wrappers, effects and duplicated state.
- Do not apply memoization without a reason or measurable issue.
- Use correct image dimensions, formats and loading behavior.
- Avoid layout shifts and expensive animations on large surfaces.

## 11. Evidence and provenance
Every recommendation is one of:
- **Requirement:** explicitly requested or required by a standard.
- **Fact:** verified in the source project or product context.
- **Heuristic [R]:** a reasoned recommendation that may be overridden.
- **Assumption:** an uncertain input requiring confirmation.

Never claim a visual, accessibility or performance improvement without verification.

## Escape hatches
A rule may be overridden when brand, content, task or product constraints justify it. Record the reason. Contextual variety is a quality feature; the goal is not to make every product look like Integra.
