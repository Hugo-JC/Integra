---
name: integra-live-inspector
description: Inspect a trusted local development page, select DOM elements, preview reversible allowlisted visual changes and export a structured handoff. Use for live visual iteration; never treat DOM previews as source edits or use in production.
---

# Integra Live Inspector

## Purpose and limits

Use the running browser page to understand the rendered element and evaluate temporary alternatives. The inspector is a DOM-level preview tool, not a source editor, browser automation guarantee or proof of final application behavior.

## Safety contract

- Use only a trusted local development environment and the documented Vite development adapter.
- Never inject the inspector into production or weaken production CSP.
- Use the canonical `createIntegraInspector()` API; do not invent APIs or arbitrary console snippets.
- Temporary preview changes are allowlisted and reversible.
- Never inject arbitrary HTML, JavaScript, remote scripts or unreviewed CSS.
- The inspector does not write source files or contact an AI provider.
- A DOM selector, class, element ancestry or React component label is not proof of a source file.
- A caller-provided source hint remains unverified until matched to the repository.
- Preview acceptance is not approval to modify source.

## Workflow

1. Confirm the page is local, in development mode and within the user's authorized scope.
2. Start the project's documented dev server only when authorized and the command is known.
3. Inspect the element's role, content, parent context, computed styles, viewport and relevant states.
4. Ignore inspector chrome and elements explicitly marked `[data-integra-ignore]`.
5. Preview only supported color, radius, padding and existing-class operations.
6. Record before/after values and the exact target selector. Note when framework re-rendering may reset the preview.
7. Inspect contrast output critically. Gradients, images, transparency, pseudo-elements and complex compositing may be inconclusive.
8. Export the structured change set and prompt handoff. Keep DOM locators distinct from source locations.
9. Search the real repository and resolve the responsible source component from evidence; never guess a path from a selector.
10. If a persistent change is requested, prepare a source diff, explain behavior impact and tests, then obtain approval for that exact diff.
11. After approved source changes, run relevant checks and compare the actual rendered result again.

## Output

Provide the inspected target, viewport and state; preview operations; contrast/evidence limitations; source mapping status; and next-step diff or test plan.

## Restoration

Destroying the inspector restores temporary classes/styles by default. Do not promise persistence through framework renders. No commit, push, PR or merge is implied.
