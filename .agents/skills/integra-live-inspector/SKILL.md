---
name: integra-live-inspector
description: Inspect a local development DOM element, preview style changes, estimate contrast, export an exact diff and prepare an AI refactoring handoff.
---

# Integra Live Inspector & Diff Handoff

## Principles
- Local development only; never inject into production or weaken production CSP.
- Integra blue (#3B82F6) is selection chrome only, never the inspected product's theme.
- DOM changes are temporary previews. The inspector does not write source files.
- Export exact differences, not vague styling instructions.

## Workflow
1. Confirm local dev environment and authorization.
2. Start the documented Vite dev server. Toggle with Alt+Shift+I; Escape deactivates.
3. Hover to inspect and click to lock. Ignore the inspector UI and [data-integra-ignore].
4. Preview background, text color, radius, padding and existing utility classes.
5. Review contrast estimate. It is not reliable for gradients, opacity, images, filters or complex compositing.
6. Export getPatch() or toPrompt(); use data-integra-source as a source hint when available.
7. Locate the real component; never infer a file path from a DOM class.
8. Apply only the reviewed delta with the refactor skill. Preserve behavior, semantics, tokens and responsive behavior.
9. Run typecheck, tests and browser/accessibility checks.

The handoff includes target element, source hint, original/updated classes, exact CSS changes, contrast estimate and acceptance checks. Browser preview is not proof of WCAG conformance or a source-code edit.
