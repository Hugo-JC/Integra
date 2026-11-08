# Integra Live Inspector

The Live Inspector is a development-only, browser-side DOM preview tool. It is intentionally separate from the deterministic direction engine.

## Activation (Vite / React example)

Add this to a development-only entrypoint:

~~~ts
if (import.meta.env.DEV && import.meta.env.VITE_INTEGRA_LIVE === 'true') {
  void import('./modules/live-inspector/index.js').then(({ startIntegraInspector }) => {
    startIntegraInspector();
  });
}
~~~

Start Vite with `VITE_INTEGRA_LIVE=true`. Use the actual relative import path for your entrypoint.

## Workflow
1. Hover a target. The selection outline and badge use Integra blue `#3B82F6`.
2. Click to lock the element. The click is intercepted so the underlying control does not activate.
3. Edit Tailwind classes, text/background colors, font size, padding or border radius.
4. Use **↑ Pai** to select the containing DOM node when a nested element is too small.
5. Review the selected text's WCAG contrast status. The audit checks WCAG 2.2 SC 1.4.3 (AA) and reports the stricter SC 1.4.6 (AAA) threshold separately. It reports inconclusive when the effective background cannot be established safely.
6. Reset the selected element, copy the before/after DOM diff, then ask the implementation agent to apply and verify a source-level change.
7. Destroy the inspector or reload the page to leave preview mode.

Keyboard shortcut: `Alt+Shift+I` toggles element picking; `Escape` pauses picking.

## Diff format
The clipboard report contains:
- Best-effort DOM selector.
- Component hint.
- Optional `data-integra-file` source hint.
- Exact original and updated class attributes.
- Exact original and updated style attributes.
- Reminder that preview does not write source.

## Boundaries
- Localhost only by default. `allowRemote: true` is an explicit opt-in for a trusted preview.
- Does not edit files, invoke shell commands, send content to providers or call an agent.
- React, Vue and Svelte can overwrite DOM previews on their next render; durable changes belong in source.
- A DOM selector is not a source path. Add `data-integra-file` only when the application can supply a truthful hint.
- Inline styles may be blocked by a strict Content Security Policy. Do not weaken CSP in production to enable the inspector.
- Remove the activation snippet or keep its environment flag disabled in production.
