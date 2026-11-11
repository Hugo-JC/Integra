---
name: integra-live-inspector
description: Launch and operate Integra Live Workbench for fast local visual inspection, DOM selection, reversible styling previews, accessibility signals and source-code handoff. Use when a developer asks to open Live mode, inspect a running UI, tune a component visually or prepare an evidence-backed implementation diff.
---

# Integra Live Workbench

## Mission
Reduce the distance between spotting a UI issue and preparing a precise source-code change. Live is a local-development workbench, not a production editor, arbitrary browser automation tool or visual website builder. Blue is Integra's interaction color; use it for selection, focus and active controls without recoloring the inspected product.

## Fast launch
1. Resolve the actual app root, especially in monorepos.
2. Inspect browser tabs, terminal output and common dev-server ports. Reuse a running server; never start a duplicate because a guessed port is busy.
3. For Vite, register `integraLiveInspectorPlugin()`. It is development-only (`apply: 'serve'`). For another framework, use `createIntegraInspector()` only from a known development entrypoint; never invent adapters.
4. Keep activation opt-in and do not load the inspector in production. Add no dependencies to the host application.
5. Open the local app origin, not an inspector/helper origin. If unknown, ask once rather than guessing.
6. Press **Alt + Shift + I** to activate/deactivate Live. Press **Escape** to close and restore previews.
7. If integration is missing, propose the smallest exact Vite config patch and obtain approval before editing configuration.
8. Launch and verify before narrating setup details.

## Modes
**Quick Canvas (default):** blue element outline, compact element badge, dimensions/display/font summary, quick radius/padding/accent preview, one-click reset, Undo/Redo and switch to Inspector. It is not a drag/drop editor and cannot silently move, resize, reorder or replace elements.

**Inspector:** element identity, best-effort selector, accessible name, dimensions, display, typography, existing classes, text/surface colors, radius, padding, contrast estimate and diff export. Read-only computed values must remain distinct from editable controls. A selector is a locator, never a source path.

## Session lifecycle
`inactive` → `picking` → `selected` → `previewing` → `review-ready` → `disposed`. Never silently discard unexported previews when changing selection. If a framework detaches the selected node, mark the preview stale; never apply it to a replacement based only on selector text.

## Performance contract
- Keep the adapter dependency-free and development-only.
- Coalesce pointer geometry reads/writes to at most one `requestAnimationFrame` per frame; never measure layout on every raw pointer event.
- Coalesce scroll, resize, visual viewport and ResizeObserver work through a shared scheduler.
- Observe only selected/highlighted nodes and the document root; disconnect observers on selection changes and teardown.
- No polling loops, timers, repeated full-DOM scans or global mutation observers without measured need.
- Cache selected snapshots/computed values; refresh only on selection or preview changes.
- Use Shadow DOM; render page-provided labels through `textContent`.
- Avoid continuous animation and expensive effects. Respect reduced-motion and high-contrast preferences.
- Teardown cancels frames, disconnects observers, removes listeners and restores original class/style attributes.

## Preview history
Maintain a bounded, session-only history of reversible class/style attribute snapshots. Coalesce consecutive edits to the same target/property; clear redo after a new branch of edits. Undo/Redo must restore exact original-vs-absent attribute states. Keyboard shortcuts must not intercept text inputs, textareas, selects or contenteditable regions. Closing Live restores original attributes by default; history never persists to source files.

## Safe preview boundary
Only use text color, background color, border radius, padding and existing classes. Validate values and keep previews temporary. Never inject arbitrary HTML, JavaScript, remote assets or unreviewed CSS. Never weaken CSP or instrument production/remote pages. Live does not contact an AI provider or write source. `data-integra-source` is user-provided and unverified.

## Accessibility
Keyboard shortcuts must not intercept form controls/contenteditable. Preserve visible focus, Escape behavior and focus restoration. Give icon-only controls accessible names. Honor reduced motion and high contrast. Contrast is an estimate; gradients, images, pseudo-elements, filters, opacity and compositing can make it inconclusive.

## Workflow
1. Confirm local origin, app root and adapter.
2. Launch/activate Live.
3. Select the smallest meaningful target.
4. Record tag, accessible name, selector, viewport and state.
5. Make focused previews; avoid unrelated changes.
6. Review contrast and narrow/wide layouts where relevant.
7. Export the text diff for agent handoff or use **Exportar JSON** / `getReviewPackage()` for the versioned package with viewport, mode, target changes and evidence limitations.
8. Use `integra-refactor-agent` to map the target to actual source; never infer a file from classes or ancestry.
9. Present exact source diff, behavior impact and verification plan.
10. Obtain approval for that diff before editing source.
11. Run checks and inspect the rendered implementation.

## Structured review package
The controller exposes `getReviewPackage()` and the workbench provides **Exportar JSON**. The package records the current origin/path (without query or fragment), viewport and device-pixel ratio, active mode, target diffs, prompt, source-mapping status and approval policy. Source mapping is always `unresolved` with low confidence until the receiving project is inspected. The package is a proposal; it never applies source changes.

## Deliverable
Concise Live Review: local URL/adapter, selected element/viewport, preview changes, contrast evidence/confidence, source mapping status, JSON review package, proposed diff/tests and cleanup state.

## Recovery
If overlay disappears, check HMR first. Reopen the same app URL and reactivate **Alt + Shift + I**. Do not start another server until confirming the existing one is unavailable. Escape closes and restores by default.
