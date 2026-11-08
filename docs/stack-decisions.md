# Stack decisions and extension points

## Core

| Concern | Choice | Why |
|---|---|---|
| Language | TypeScript strict | Contracts, safe refactoring and maintainable module boundaries |
| Runtime | Node.js 24 | Matches the current toolchain and tests |
| Contracts | JSON Schema + TypeScript | Machine validation and ergonomic implementation types |
| Tests | Vitest | Existing test stack; deterministic unit/contract coverage |
| Browser inspector | Native DOM + Shadow DOM | Framework-neutral overlay with no runtime dependency |
| Presets | Versioned JSON | Portable, diffable and consumable by all agents |
| Agent expertise | Agent Skills / SKILL.md | Progressive disclosure and cross-agent reuse |

## Optional integrations (not core dependencies)

- Vite adapter: expose the inspector in development and resolve source locations from source maps.
- React adapter: provide a small hook/component wrapper only if the vanilla browser API proves awkward.
- Playwright: exercise real browser selection, responsive behavior and live edits.
- axe-core: add repeatable accessibility checks to browser tests.
- AST tooling: use TypeScript compiler API or a focused parser for reliable TSX analysis.
- MCP: expose investigation and quality tools to compatible agents only after local contracts stabilize.

## Why no framework in the core

The core should be usable by agents that build React, Vue, Svelte, Angular, HTML or native wrappers. Making the engine depend on React, Vite, Tailwind or shadcn/ui would reduce reuse and create a dependency surface unrelated to deterministic direction.

## UI implementation guidance

For a future Integra dashboard, React + TypeScript + Vite is a reasonable app shell; Radix primitives and shadcn/ui can supply accessible interaction foundations; Tailwind can be used if the dashboard benefits from it. Keep that dashboard separate from the core. The current Live Inspector is framework-neutral and does not need this stack.

## Provider architecture

Do not introduce an LLM provider abstraction before at least two real providers and a stable use case exist. When needed, providers should implement typed request/response contracts, explicit capability negotiation, timeouts, cancellation, bounded outputs and deterministic fallback. No API key belongs in committed presets or fixtures.
