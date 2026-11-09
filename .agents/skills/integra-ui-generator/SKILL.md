---
name: integra-ui-generator
description: Build new production-oriented frontend screens, components and interactions from a product brief and approved direction. Use for new UI implementation; not for refactoring existing components or reviewing completed interfaces.
---

# Integra UI Generator

## Mission

Translate an approved product and visual direction into working interface code that fits the existing stack. Deliver functional, accessible and responsive UI—not an isolated visual mockup disconnected from the application.

## Preconditions and scope

Identify the component/screen responsibility, user task, primary action, data contract, neighboring components, framework, language, build system, package constraints, tokens, installed component libraries, supported viewports/input modes, relevant states and approval status.

If the direction is missing, do not invent a complete brand system by default. State a reversible implementation assumption or route to `integra-design-direction` when the choice is consequential.

## Inspect before building

1. Read project instructions and existing code conventions.
2. Find reusable components and verify their actual APIs before using them.
3. Check available dependencies before proposing a new one.
4. Read relevant Direction Artifact sections and distinguish hard constraints from advisory recommendations.
5. Use domain profiles for task flow and structured composition only when their conditions and real-content requirements match.
6. Inspect existing routes, state management, data fetching and error handling before adding parallel mechanisms.
7. Confirm scripts in the current `package.json`; never assume a repository command exists because a Skill mentions it.

## Build procedure

1. Model component purpose, inputs, outputs, events and states.
2. Define semantic structure before styling.
3. Use native HTML and platform conventions first; add ARIA only where necessary.
4. Reuse semantic tokens and established component APIs.
5. Choose layout from content and task priority, not a default marketing template.
6. Implement the primary action and all consequential states.
7. Include loading, empty, validation, disabled, success and recoverable error paths as appropriate.
8. Ensure keyboard operation, visible focus, accessible names and non-color state cues.
9. Design responsive behavior from content pressure and input mode; do not just shrink desktop.
10. Use motion only to communicate state or continuity; respect `prefers-reduced-motion`.
11. Use typed props and explicit state models. Avoid `any` and fabricated data.
12. Label demo/mock data clearly and never invent product claims, users, reviews, stock or metrics.

## Visual craft

- Establish hierarchy through order, type, spacing and deliberate color roles.
- Use a strong visual decision when the product and surface mode support it; do not confuse distinction with decoration.
- Avoid automatic hero + KPI + three cards + gradient composition.
- Avoid nested surfaces, repeated icons and arbitrary rounded containers unless they improve grouping or affordance.
- Do not impose the Integra inspector color as the product's accent.
- If no archetype fits, compose directly from task requirements.

## Verification

When available, run focused tests and typecheck; run repository Design QA; inspect narrow and wide rendered layouts; test real interaction states; run accessibility checks on actual output; verify network/asset failures and browser console issues.

If a tool is unavailable, provide a manual verification plan and mark the check `not_run`. Never call generated code production-ready solely because it compiles.

## Deliverable

Complete implementation in requested files, types and tests where behavior warrants them; summary of reused components/tokens, assumptions, states covered, commands run, visual/accessibility checks and remaining limitations.

## Signature: state gallery

Create a story, fixture or test that makes consequential states observable. If a state cannot be demonstrated, explain how it is verified.

## Done when

The UI fits the project, the primary task works, states are covered, responsive and keyboard behavior are considered, no fabricated content is presented as real, and verification status is honest.
