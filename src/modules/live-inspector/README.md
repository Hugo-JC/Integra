# Integra Live Inspector

A development-only browser inspector for selecting DOM elements, previewing allowlisted styles/classes, estimating contrast and exporting a structured handoff. It never writes project files.

## Vite setup

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { integraLiveInspectorPlugin } from './src/modules/live-inspector/vite-plugin';

export default defineConfig({
  plugins: [integraLiveInspectorPlugin()]
});
```

The plugin uses `apply: 'serve'`; production builds do not inject the inspector. It loads the canonical `createIntegraInspector()` API from the module entry. Toggle capture with Alt+Shift+I and close/restore with Escape.

## Source hints

Add `data-integra-source="src/components/Example.tsx"` to a development element only when a stable hint is known. A source hint is caller-provided metadata, not inferred or verified source mapping.

## Programmatic use

```ts
import { createIntegraInspector } from './src/modules/live-inspector';

const inspector = createIntegraInspector();
const changes = inspector.getChangeSets();
const prompt = inspector.getPrompt();
inspector.stop(); // restores the original class/style attributes by default
```

The legacy `createLiveInspector()` function remains temporarily available for compatibility. New integrations should use `createIntegraInspector()`.

## Current boundaries

- Preview changes are temporary DOM mutations only; source files are never written.
- The inspector UI is isolated in Shadow DOM and excluded from target selection.
- Contrast is only estimated for supported opaque solid colors. Alpha, gradients, images, filters, pseudo-elements and complex compositing are inconclusive.
- DOM selectors are not source paths. Review the actual repository before proposing a source diff.
- Source edits require explicit approval of the exact proposed diff.
