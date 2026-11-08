---
name: integra-live-inspector
description: Use when inspecting a locally running UI, selecting DOM elements, previewing style changes, auditing text contrast and generating an exact diff for an AI agent.
---

# Integra Live Inspector

## Start
Use the exported `startIntegraInspector()` from `src/modules/live-inspector/index.ts` in a local development-only entry point. The inspector is localhost-only by default. Do not enable remote hosts unless the preview is trusted and explicitly approved.

## Interaction model
1. Hover outlines and the element badge use Integra blue `#3B82F6`.
2. Click locks the target and prevents the underlying click action.
3. Use **↑ Pai** to move to the containing element when a nested wrapper is selected.
4. Preview Tailwind classes, text/background color, font size, padding and radius in the live DOM.
5. Run the contrast check after color or typography edits.
6. Reset the selected element or destroy the inspector to restore tracked class/style attributes.
7. Copy the DOM diff and send it to the implementation agent for source-level review.

## Diff integrity
The diff must preserve exact original and updated class/style attributes and a best-effort DOM selector. A selector is not a source file path. Only treat `data-integra-file` as a source hint when the application deliberately provides it.

## Safety and correctness
- Preview is not source mutation. Never claim a source file was edited.
- Do not inject the inspector into production or weaken CSP to make it run.
- Never send DOM content or patches to a remote provider without user approval.
- React/Vue/Svelte may re-render and overwrite preview styles; apply durable fixes in the source component.
- A contrast result is inconclusive when compositing cannot be established reliably.
- Destroy the inspector before finishing and verify the page returns to its original state.
