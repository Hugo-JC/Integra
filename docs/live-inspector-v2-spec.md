# Live Inspector v2 — Product and Technical Specification

**Status:** Quick Canvas and Inspector shell implemented in the workbench branch; preview history and structured review package remain planned.

## Product intent
Reduce the distance between identifying a UI issue and preparing a precise code change. Live is local-development inspection and reversible preview, not a production editor or automatic source mutator.

## Two modes, one session
**Quick Canvas (default):** blue element outline, compact badge, dimensions/display/font summary, quick radius/padding/accent preview, one-click reset and switch to Inspector. It is not a freeform drag/drop editor.

**Inspector:** element identity, selector, accessible name, classes, visual controls, contrast estimate, diff export and source handoff. Both modes share one selection and preview lifecycle.

## Performance contract
- Pointer events are coalesced through requestAnimationFrame.
- Scroll/resize/visual viewport/ResizeObserver work shares a scheduled pass.
- No polling timers, repeated full-DOM scans or external runtime dependencies.
- Shadow DOM isolates workbench chrome.
- Teardown cancels frames, disconnects observers and removes listeners.
- Vite adapter uses `apply: 'serve'`; production builds never inject it.

## Safety and accessibility
Keyboard shortcut must not intercept editable controls. Escape restores and closes. Controls need accessible names and visible focus. Respect reduced motion and high contrast. Never weaken production CSP. Contrast is an estimate, not a complete WCAG audit.

## Source handoff
Preview is a proposal. The refactor workflow inspects actual source, presents an exact diff and obtains approval before editing.

## Roadmap
1. Typed operation history with undo/redo and grouped transactions.
2. DOM navigator and richer computed-property groups.
3. Versioned JSON review package with viewport and confidence metadata.
4. Optional real-browser multi-viewport adapter.
