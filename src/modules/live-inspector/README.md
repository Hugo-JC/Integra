# Integra Live Inspector

A temporary browser inspector for local development. It selects DOM nodes, previews a small set of styles/classes, estimates text contrast and exports an exact handoff. It never writes project files.

## Vite setup

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { integraLiveInspectorPlugin } from './src/modules/live-inspector/vite-plugin';

export default defineConfig({
  plugins: [integraLiveInspectorPlugin()]
});
```

The plugin uses Vite's `apply: 'serve'` boundary. Override `entry` when the module is hosted elsewhere. Toggle with Alt+Shift+I; Escape deactivates. The UI is isolated in Shadow DOM; selection chrome defaults to Integra blue #3B82F6.

## Source hints

Add `data-integra-source="src/components/Example.tsx"` to a development element when a stable source hint is available. This is only a hint; DOM-to-source mapping is not inferred.

## Programmatic use

```ts
import { createLiveInspector } from './src/modules/live-inspector';

const inspector = createLiveInspector();
const patch = inspector.getPatch();
const prompt = inspector.toPrompt();
```

The contrast calculator covers solid hex/rgb colors. Gradients, image backgrounds, alpha compositing, filters and overlays need rendered analysis. Contrast results are estimates—not a WCAG audit. Review the patch before applying it to source code.
