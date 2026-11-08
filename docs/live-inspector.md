# Live Inspector

## Purpose

Integra Live Inspector connects a running browser view with a source-code refactoring workflow. It selects rendered elements, previews safe style changes, computes a precise DOM diff and produces a prompt that an AI coding agent can apply to the real component.

It is intentionally a separate browser module. The deterministic Direction core remains independent of DOM and browser APIs.

## Implemented in this branch

- Pointer hover highlight and click-to-select.
- Blue selection border and badge (#3B82F6).
- Shadow DOM isolation for the inspector UI.
- Temporary editing of class names, text/background colors, border radius and padding.
- Exact class additions/removals and inline-style deltas.
- Stable best-effort DOM selector.
- Accessible-name/text preview.
- WCAG AA contrast estimate for opaque, simple foreground/background colors.
- Structured change set and AI handoff prompt.
- Optional callback for an external orchestrator; no remote request is made by default.

## Integration

Add the runtime only to a local development entry point. For Vite + React, the integration can be guarded by the development flag:

~~~ts
import { createIntegraInspector } from './modules/live-inspector/index.js';

if (import.meta.env.DEV) {
  const inspector = createIntegraInspector({
    // This is a manually supplied hint, not an automatic source-map result.
    sourceHint: 'src/App.tsx',
    onApply: (changes, prompt) => {
      // Send the result to your coding agent through your own approved workflow.
      console.info(changes);
      console.info(prompt);
    },
  });

  window.addEventListener('beforeunload', () => inspector.stop());
}
~~~

For non-Vite apps, call the factory from any development-only browser entry point. The source package does not require React or Vite.

## Interaction flow

1. Start the app locally with the inspector enabled.
2. Hover the page; the blue outline follows the element under the pointer.
3. Click to lock/select the element. The panel exposes editable fields.
4. Preview classes, colors, radius and padding. These affect the live DOM only.
5. Select more elements if needed; changes are tracked independently.
6. Generate the diff and prompt. Review the output before giving it to an agent.
7. The agent locates the real source component, applies the source edit and runs project checks.
8. Stop the inspector and reload/restore the page before treating the source implementation as complete.

## Change-set contract

Each selected element records selector and tag, accessible name or text excerpt, optional source hint, original and updated classes, added and removed class tokens, changed inline style values, and optional contrast evidence.

A selector is not a source-code location. React component names, TSX paths and line numbers require a real source-map/dev-server adapter or an explicit developer-provided hint. The core does not guess them.

## Accessibility behavior

The contrast helper uses WCAG relative luminance and AA thresholds for normal and large text. It only reports a measurement when it can resolve an opaque foreground and background color. If the selected element uses transparent overlays, images, gradients, blend modes, pseudo-elements or layered surfaces, the result is marked inconclusive or must be independently verified. It does not certify a complete page or full WCAG conformance.

The inspector itself is keyboard-operable through native inputs and buttons; the first release does not yet include a full keyboard element picker. This is a known limitation to address before broad team rollout.

## Safety and non-goals

- Never expose this tool on production pages.
- Do not weaken Content Security Policy for production to run it.
- Do not inject code into sites the developer does not own or have permission to test.
- The inspector does not write files, commit changes, call a model, or run shell commands.
- Do not automatically trust an AI-produced diff. Review source paths, behavior and tests.
- Temporary DOM changes are not durable source edits.
