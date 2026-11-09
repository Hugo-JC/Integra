# Integra Command System

The canonical definitions live in [`commands/manifest.json`](../commands/manifest.json). This index does not install native slash commands in the host agent.

| Invocation | Kind | Purpose |
|---|---|---|
| `/integra` | Orchestrator | Coordinate broad, unknown or multi-stage requests. |
| `/integra:shape` | Workflow | Clarify users, tasks, flows and information architecture. |
| `/integra:direction` | Workflow | Define visual thesis, design principles and tokens. |
| `/integra:investigate` | Workflow | Research references and record evidence. |
| `/integra:generate` | Workflow | Implement one specified component or screen. |
| `/integra:refactor` | Workflow | Improve existing code while preserving behavior. |
| `/integra:critique` | Workflow | Review clarity, hierarchy and visual consistency. |
| `/integra:audit` | Workflow | Review broad quality dimensions. |
| `/integra:accessibility` | Workflow | Perform focused accessibility review. |
| `/integra:system` | Workflow | Inventory tokens, components and repeated patterns. |
| `/integra:live` | Workflow | Inspect a local page and create a reversible DOM preview. |
| `/integra:colorize` | Modifier | Introduce strategic semantic color while preserving the active target, identity and constraints. |
| `/integra:polish` … `/integra:extract` | Modifier | Refine the active workflow without replacing its target or constraints. |

## Routing

- Exact namespaced invocation takes precedence.
- Broad requests route to the orchestrator.
- A focused workflow is selected only by a unique longest whole-phrase trigger.
- Equal-specificity matches are ambiguous; never choose randomly.
- Modifiers inherit the active workflow. With no active target, ask one focused question.
- Unknown requests remain with the orchestrator.
- Agents without native slash-command support must retain natural-language routing.

## Review boundary

The default mode is **review**. Read-only inspection and analysis are permitted within the user's request. DOM previews are temporary. Writing source files requires explicit approval of the exact proposed diff. Invocation, preview acceptance, a generated patch or passing test is not approval. Commits, pushes, PR creation and merge require separate authorization.
