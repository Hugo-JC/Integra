# Live Inspector

Integra Live Inspector is a development-only DOM preview and AI handoff tool.

- Hover highlights an element with a blue (#3B82F6) outline and concise element badge.
- Click locks the target and opens an isolated panel.
- Background, text color, radius, padding and class names can be previewed.
- The contrast estimate uses foreground and nearest opaque solid background.
- getPatch() returns exact class/style changes; toPrompt() creates a handoff for a coding agent.
- destroy() restores the previous inline styles and class attribute by default.

## Vite

Register integraLiveInspectorPlugin() in vite.config.ts. The plugin declares apply: 'serve', so production builds do not inject it. Keep the inspector on trusted local development origins and never weaken production CSP to enable it.

## Limits

This is not a source-code editor or a source map resolver. It does not persist changes, run arbitrary snippets, modify React state or infer component file paths. Use data-integra-source as an optional hint. Complex color composition, gradients, images and filters are outside the contrast calculator's model. Validate with browser-based accessibility tools and manual checks.
