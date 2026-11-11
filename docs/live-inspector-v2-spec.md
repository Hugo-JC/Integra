# Live Inspector v2 — Product and Technical Specification

**Status:** Quick Canvas, Inspector mode, reversible preview history and viewport-aware structured review package are implemented. DOM navigator, richer computed-property groups and multi-viewport browser adapter remain planned.

## Product intent
Reduce the distance between identifying a UI issue and preparing a precise code change. Live is local-development inspection and reversible preview, not a production editor or automatic source mutator.

## Two modes, one session
**Quick Canvas (default):** blue element outline, compact badge, dimensions/display/font summary, quick radius/padding/accent preview, one-click reset and switch to Inspector. It is not a freeform drag/drop editor.

**Inspector:** element identity, selector, accessible name, classes, visual controls, contrast estimate, diff export and source handoff. Both modes share one selection and preview lifecycle.

## Performance contract
- Pointer events are coalesced through requestAnimationFrame.
- Scroll/resize/visual viewport/ResizeObserver work shares a scheduled pass.
- A bounded MutationObserver watches only direct child-list changes along the selected element's ancestor chain; it does not scan the full DOM or observe the whole document subtree.
- No polling timers, repeated full-DOM scans or external runtime dependencies.
- Shadow DOM isolates workbench chrome.
- Teardown cancels frames, disconnects observers and removes listeners.
- Vite adapter uses `apply: 'serve'`; production builds never inject it.

## Safety and accessibility
Keyboard shortcut must not intercept editable controls. Escape restores and closes. Controls need accessible names and visible focus. Respect reduced motion and high contrast. Never weaken production CSP. Contrast is an estimate, not a complete WCAG audit.

## Source handoff
Preview is a proposal. The refactor workflow inspects actual source, presents an exact diff and obtains approval before editing.

## Structured review package
The controller exposes `getReviewPackage()` and the workbench provides **Exportar JSON**. The versioned package records a timestamp, origin/path (without query or fragment), viewport dimensions and device-pixel ratio, active mode, connected target diffs, detached-target count, and the implementation prompt. Detached DOM nodes are excluded from the exported changes and reported explicitly. Source mapping is explicitly `unresolved` with low confidence; component hints are unverified. The package states that source mutation is `none` and requires approval for any exact source diff. It does not claim the preview is a verified implementation or a complete accessibility audit.

## Roadmap
1. DOM navigator and richer computed-property groups.
2. Optional real-browser multi-viewport adapter.
