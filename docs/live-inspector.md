# Live Inspector

Integra Live Inspector is a development-only DOM inspection and temporary preview tool. The Vite adapter boots the canonical v2 API from the module entry point.

## Vite

Register `integraLiveInspectorPlugin()` in `vite.config.ts`. The plugin declares `apply: 'serve'`, so production builds do not inject the inspector. Keep it on trusted local development origins and never weaken production CSP to enable it.

## Programmatic use

```ts
import { createIntegraInspector } from './src/modules/live-inspector';

const inspector = createIntegraInspector({
  title: 'Integra Live Inspector',
  sourceHint: 'src/components/Hero.tsx', // optional, user-provided and unverified
});

const changes = inspector.getChangeSets();
const prompt = inspector.getPrompt();
inspector.stop(); // restores temporary DOM previews by default
```

The older `createLiveInspector()` API remains available for compatibility. New integrations should use `createIntegraInspector()`, which is also the API injected by the Vite adapter.

## Current capabilities

- Hover highlight and click-to-select, isolated in Shadow DOM.
- Temporary preview of text/background colors, border radius, padding and existing classes.
- Best-effort unique DOM selector and accessible-name snapshot.
- Contrast estimate for supported solid colors; inconclusive cases are explicitly reported.
- Exact class/style delta and a structured prompt handoff.
- Scroll, viewport resize and observed element-size changes reposition the highlight.
- Teardown removes listeners/observers and restores original class/style attributes by default.

## Safety and limitations

- No source files are written, no AI provider is contacted, and no source path is inferred from a selector or class name.
- A source hint is metadata supplied by the caller, not verified source mapping.
- User-provided labels are rendered as text; accent colors are validated before use in CSS.
- Invalid `ignoreSelector` values fail with a clear configuration error.
- Gradients, images, pseudo-elements, filters, opacity and complex compositing can make contrast inconclusive. A displayed ratio is not a complete WCAG audit.
- The Advanced Inspector and Quick Canvas interfaces are planned to share one preview engine; the current phase establishes the canonical core and adapter, not the final dual-mode UI.
