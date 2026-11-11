# Integra Live Workbench

A development-only browser workbench for fast DOM inspection, visual preview and source handoff. It uses the canonical inspector API, a blue interaction system and a dependency-free Shadow DOM overlay.

## Fastest way to open
1. Register the Vite plugin once.
2. Start or reuse the app's normal development server.
3. Open the local app URL.
4. Press **Alt + Shift + I** to toggle Live.
5. Press **Escape** to close and restore temporary previews.

```ts
import { defineConfig } from 'vite';
import { integraLiveInspectorPlugin } from './src/modules/live-inspector/vite-plugin';
export default defineConfig({ plugins: [integraLiveInspectorPlugin()] });
```

The adapter uses `apply: 'serve'`; production builds do not inject it. It does not start a second server.

## Modes
- **Quick Canvas:** element picking, dimensions, common visual adjustments and one-click reset.
- **Inspector:** classes, text/surface colors, radius, padding, contrast estimate and diff export.
- **Structured review package:** use **Exportar JSON** or `controller.getReviewPackage()` to capture the current viewport, active mode, connected target diffs, detached-target count, evidence limits and approval boundary.
- Blue `#3B82F6` belongs to inspector chrome only.

## Performance
Pointer geometry is coalesced to one animation-frame callback. Scroll, resize and viewport updates share a geometry scheduler. No polling timer, external API, React dependency or full-page scan is required. Shadow DOM isolates the overlay. Teardown cancels frames, disconnects observers, removes listeners and restores original attributes.

## Boundaries
Local development only. No source writes, AI-provider calls, CSP weakening or arbitrary HTML/JS injection. DOM selectors are not source mappings; source hints are user-provided and unverified. Review package confidence is intentionally low until each target is resolved against the actual source. Contrast is an estimate, not a complete WCAG audit.
