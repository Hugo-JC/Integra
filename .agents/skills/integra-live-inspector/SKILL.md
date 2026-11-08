---
name: integra-live-inspector
description: Inspect a local development DOM element, preview allowlisted visual changes, estimate contrast, export a structured review handoff and preserve source-code approval boundaries.
---

# Integra Live Inspector

## Safety contract
- Local development only; never inject into production or weaken production CSP.
- Use the canonical `createIntegraInspector()` API through the Vite development adapter.
- DOM edits are temporary previews. The inspector never writes source files and never contacts an AI provider.
- A selector, class name or DOM ancestry is not a source-code path.
- A source hint is caller-provided and unverified; never present it as discovered fact.
- Source changes require a separate, exact-diff review and explicit user approval. Preview acceptance is not source-edit approval.

## Workflow
1. Confirm the app is running in a trusted local development environment.
2. Start the documented Vite dev server. The plugin is development-only (`apply: 'serve'`).
3. Hover to inspect and click to lock a target. Ignore the inspector UI and `[data-integra-ignore]`.
4. Preview only supported colors, radius, padding and existing classes. Do not inject arbitrary CSS, HTML or JavaScript.
5. Review the contrast estimate and its limitations. Gradients, images, opacity, pseudo-elements and complex compositing may be inconclusive.
6. Export the structured change sets and prompt handoff. Treat selectors as DOM locators only.
7. Inspect the real repository and resolve the source component from evidence; do not guess paths.
8. Present the exact proposed source diff, affected files, behavior-preservation notes and verification plan.
9. Wait for explicit approval of that exact diff before changing source files.
10. Run typecheck, tests, responsive and accessibility checks; report actual results.

Destroying the inspector restores temporary class/style changes by default. No commit, push, PR or merge is implied by inspection or review approval.
