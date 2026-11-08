# Integra Live Inspector

Browser-only visual inspection utility for local development.

## What it does

- Selects rendered elements with pointer hover and click.
- Uses the Integra electric-blue selection outline (#3B82F6), isolated in a Shadow DOM.
- Temporarily edits classes, foreground/background colors, border radius and padding.
- Reports exact class additions/removals and inline-style deltas.
- Estimates text contrast from computed text color and the nearest opaque ancestor background.
- Produces a structured diff and a source-refactoring prompt.
- Exposes changes through a callback; it does not call an AI provider or write source files.

## Non-goals and limits

A DOM selector is not a TSX source location. Provide sourceHint only when it is known, or resolve the source with a framework/dev-server adapter. The contrast result is inconclusive for transparent, gradient, image-backed and layered backgrounds. Verify rendered states manually before treating an estimate as a WCAG result.

All changes are temporary in-memory DOM changes. Call stop() to restore the original class/style attributes. Pass { restore: false } only when intentionally keeping the preview until the page is reloaded.

## Usage

~~~ts
import { createIntegraInspector } from './modules/live-inspector/index.js';

let inspector: ReturnType<typeof createIntegraInspector> | undefined;

if (import.meta.env.DEV) {
  inspector = createIntegraInspector({
    sourceHint: 'src/App.tsx', // optional; use only when this path is known
    onApply: (changes, prompt) => {
      console.info('Integra DOM diff', changes);
      console.info(prompt);
    },
  });
}

inspector?.stop();
~~~

The snippet is an integration example for a browser app with a development-only environment flag. Do not ship the inspector in production.
