---
name: integra-live-inspector
description: Uses Integra's browser Live Inspector to select rendered elements, preview class and style edits, inspect contrast, compute exact DOM diffs and prepare a source-refactoring handoff for a coding agent.
---

# Integra Live Inspector

## Preconditions
- The target is a local development environment the user owns or is authorized to test.
- The inspector is enabled only in development.
- The user understands preview edits are temporary DOM mutations.
- Do not use the inspector on production pages or weaken a production Content Security Policy.

## Workflow
1. Start the approved local app with the inspector enabled.
2. Hover to inspect and click to lock a DOM element.
3. Record its selector, tag, accessible name and any developer-supplied source hint.
4. Preview class names, text/background colors, border radius and padding.
5. Review the computed contrast estimate. Treat transparent, layered, image, gradient and pseudo-element backgrounds as inconclusive.
6. Generate the change set and handoff prompt.
7. Resolve the DOM selector to the real source component using source maps or repository search. Never invent the TSX path or component name.
8. Apply only the required source change, preserving the product's tokens and behavior.
9. Run tests and verify responsive, keyboard, focus and reduced-motion states.
10. Restore or reload the page to clear preview mutations.

## Diff rules
- Preserve the exact original and updated class strings.
- Report added and removed class tokens separately.
- Report changed inline style properties and before/after values.
- Keep selectors as runtime evidence; they are not source locations.
- Do not silently normalize or drop unrelated classes.
- Do not send code or data to a remote model automatically.

## Output
Provide the DOM diff, generated prompt, source mapping result, code files changed and verification status. Make clear which values are runtime measurements and which are assumptions.
