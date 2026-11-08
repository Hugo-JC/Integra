---
name: integra-live-inspector
description: Inspect a local development DOM element, preview temporary style changes, estimate contrast and export an exact diff for an AI source-code handoff. Use only on trusted local dev servers; previews never write source files.
---

# Integra Live Inspector & Diff Handoff

## Principles
- Local development only; never inject into production or weaken CSP.
- Integra blue `#3B82F6` is selection chrome only, never the inspected product's theme.
- DOM changes are temporary previews; the inspector writes no files.
- Export exact differences, not vague styling instructions.
- Preview acceptance is **not** source-edit approval.

## Workflow
1. Confirm local dev environment and authorization.
2. Start the Vite dev server with `integraLiveInspectorPlugin()`; toggle with Alt+Shift+I, Escape deactivates.
3. Hover to inspect, click to lock; ignore inspector UI and `[data-integra-ignore]`.
4. Preview background, text color, radius, padding and utility classes.
5. Read the contrast estimate: solid colors only. Gradients, opacity, images, filters, pseudo-elements = unreliable; verify on the render.
6. Export `getPatch()` or `toPrompt()`; use `data-integra-source` as a hint only.
7. Locate the real component by reading the repo; never infer a file path from a CSS class.
8. Hand off to `integra-refactor-agent`: present the exact diff, get approval, apply only that delta.
9. Run typecheck, tests, browser and accessibility checks.

## Handoff contents
Target selector, tag, accessible name, source hint (marked unverified), original/updated classes, exact CSS deltas, contrast estimate with limitations, viewport, acceptance checks.

## Signature touch: "Revert-proof preview"
Before exporting, confirm Reset restores classes and inline styles exactly. State this in the handoff; a preview that cannot be undone is not a safe proposal.
