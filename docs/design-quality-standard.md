# Integra Design Quality Standard

This standard is the common decision framework for Direction, UI generation, Refactoring and Design QA.

## 1. Order of decisions

Resolve decisions in this order:

1. Product purpose, user task and business constraints.
2. Explicit user requirements, brand assets and existing design tokens.
3. Accessibility, platform and legal/technical constraints.
4. Content structure, information architecture and interaction model.
5. Contextual preset and visual direction.
6. Component styling, motion and micro-detail.
7. Optional polish after behavior and hierarchy work.

Aesthetic novelty never overrides usability or explicit constraints.

## 2. Design brief minimum

Before creating a substantial screen, identify what is known and what is missing:

- product type and primary user;
- primary job-to-be-done and success action;
- content and data density;
- platform, target viewports and input modes;
- brand personality and existing assets/tokens;
- critical states (loading, empty, error, success, disabled);
- accessibility target and reduced-motion requirements;
- implementation stack and constraints.

Do not ask for information that can be responsibly inferred from the supplied project. Do not invent missing facts; record assumptions or missing information.

## 3. Visual direction

A good direction has a clear visual thesis, not a list of fashionable effects. Define:

- one primary visual idea;
- hierarchy and reading order;
- typography roles and scale;
- semantic color roles, contrast pairings and states;
- spacing rhythm and layout density;
- component shape, border and elevation logic;
- imagery / illustration role;
- motion purpose and interaction feedback.

Avoid applying a preset literally. Adapt it to the product's actual content and existing identity. Offer alternatives only when they represent meaningfully different directions.

## 4. Layout and spacing

- Establish a layout grid from content, viewport and interaction needs.
- Keep spacing on a documented scale; 4px increments are a starting convention, not a universal law.
- Use whitespace to show grouping and hierarchy, not to inflate a page.
- Prefer one clear primary action per decision area.
- Avoid nested cards when spacing, dividers or typography communicate the relationship better.
- Treat density as a product choice: dashboards, editors and tables often need more information per viewport than marketing pages.
- Validate at narrow, typical and wide viewports; do not simply shrink desktop.

## 5. Typography

- Assign roles (display, heading, body, label, data, code) before choosing font sizes.
- Choose fonts for legibility, language coverage, product personality and loading cost.
- Use a consistent type scale with deliberate exceptions.
- Keep long-form line length comfortable; avoid low-contrast small labels as the primary source of meaning.
- Do not default to Inter or a geometric sans for every project.
- Use tabular numerals for comparable data where it improves scanning.

## 6. Color and theming

- Start with semantic roles: canvas, surface, elevated surface, text, muted text, border, accent, focus, success, warning and danger.
- Respect existing tokens. Derive missing tokens from brand/context rather than applying a fixed Integra palette.
- Evaluate text over the actual composited background. Gradients, transparency, images and overlays need rendered-state checking.
- Never use color alone to convey status.
- Test light/dark themes as separate contrast systems, not simple inversion.
- Accent share, hue and saturation are contextual recommendations, not automatic defect rules.

## 7. Components and interaction

- Prefer native semantic elements and established project primitives.
- Every interactive control needs a clear name, role, state and keyboard behavior.
- Use focus-visible indicators; never remove outlines without a stronger replacement.
- Preserve hit area, disabled/loading/error states and feedback.
- Avoid generic icon tiles, arbitrary pills, unnecessary borders and card-in-card repetition.
- Do not use animation to conceal slow operations or make essential content harder to reach.

## 8. Motion

- Motion must communicate causality, state change, spatial relationship or feedback.
- Keep small state transitions short and consistent; longer movement needs a clear narrative purpose.
- Respect prefers-reduced-motion and provide non-motion equivalents.
- Avoid continuous decorative motion, scroll hijacking and layout shifts.
- Do not animate large surfaces when a subtle opacity/transform transition communicates the change.

## 9. Responsive behavior

- Design from content constraints and component behavior, not named device widths alone.
- Check overflow, tables, navigation, dialogs, forms, touch targets and sticky elements.
- Prefer responsive reflow and prioritization over horizontal scaling.
- Test keyboard, touch and pointer where applicable.

## 10. Evidence and findings

Every QA finding must contain:
- stable rule ID;
- location or selector;
- severity P0–P3;
- direct evidence or an explicit heuristic label;
- user impact;
- specific recommendation;
- verification status: verified, heuristic, inconclusive or not_run.

P0 means a critical blocker. P1 means a serious usability/accessibility/functionality issue. P2 means a meaningful quality issue. P3 means a polish opportunity. Severity is not a visual score.

## 11. AI anti-pattern policy

The following are signals to inspect, not universal bans:
- identical hero + feature grid + testimonials structure on unrelated products;
- generic purple/blue gradient without product rationale;
- repeated rounded cards and shadows for every content group;
- one font family for all typographic roles by default;
- decorative icon tiles that add no meaning;
- low-contrast secondary text and tiny labels;
- arbitrary spacing and inconsistent radii;
- fake product metrics, fabricated testimonials or invented customer logos;
- empty visual decoration with no semantic or interaction purpose.

A signal becomes a defect only with context and evidence. A valid brand choice must not be penalized merely for matching a common pattern.

## 12. Definition of done

A design is not done because it looks polished in one screenshot. Verify:
- primary task and content hierarchy;
- responsive states;
- keyboard and focus behavior;
- contrast and non-color state communication;
- loading, empty, error and success states;
- interaction feedback;
- reduced motion;
- runtime errors and performance regressions;
- source changes and tests;
- remaining unknowns and evidence limitations.
