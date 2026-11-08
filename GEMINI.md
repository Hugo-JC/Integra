# Integra — Gemini CLI Project Guide

Integra is a provider-independent design intelligence engine. It directs and evaluates interfaces; it does not impose one visual theme.

## Skill loading

Use workspace Agent Skills in .agents/skills/. Activate only the skill matching the task:

- visual direction / product brief: integra-design-direction
- new component or UI: integra-ui-generator
- existing TSX component cleanup: integra-refactor-agent
- visual and structural review: integra-design-qa
- browser selection and DOM handoff: integra-live-inspector
- research and reference analysis: integra-reference-investigator
- accessibility: integra-a11y-audit
- performance: integra-performance-audit

The Agent Skills specification is provider-neutral. Keep these skills usable without Gemini-only instructions.

## Design behavior

- Read product context before selecting a preset.
- Preserve explicit product requirements, existing brand tokens and framework conventions.
- Do not reuse a favorite layout, font, palette or component structure across unrelated products.
- Do not turn trends or subjective preferences into blocking rules.
- Design for real content, real states, keyboard input, reduced motion, responsive layouts and empty/error/loading states.
- Use references to extract principles, never to clone code or assets.
- Prefer the smallest justified dependency surface. Do not add React, Tailwind, shadcn/ui or a provider dependency to the Integra core.

## Live Inspector boundary

The current inspector is a development-only browser overlay. It reports DOM selectors and precise in-memory deltas. It cannot infer a TSX file path from a selector. Do not invent source paths. Apply generated diffs to source only after locating the actual component and checking tests.

## Verification

Run npm run check after code changes. Be explicit about whether a real browser run, screenshot comparison or manual accessibility pass was performed. Do not claim WCAG conformance from a partial contrast estimate.
