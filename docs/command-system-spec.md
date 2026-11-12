# Integra Command System — Specification

**Status:** Hybrid command manifest, schema validation, deterministic routing and review-only plan are implemented on main; host adapters and command execution remain future work.  
**Decision:** Hybrid command interface.  
**Default execution mode:** Review before source mutation.

## 1. Product intent

The Command System is the user-facing entry point to Integra's existing design intelligence and portable skills. It must make the toolkit feel coherent without turning every verb into a separate agent, duplicating skill instructions, or claiming a slash-command runtime exists on hosts that do not support one.

The canonical command catalog is `commands/manifest.json`. `commands/vocabulary.json` remains a legacy vocabulary input during migration; it is not the runtime contract.

## 2. Hybrid interaction model

### Orchestrator

`/integra` is the single entry point for broad or multi-step requests. It:

1. Parses the user's goal and explicit constraints.
2. Inspects repository guidance, current project state and relevant existing artifacts.
3. Chooses only the necessary specialized workflows.
4. Produces a short plan with expected outputs and risks.
5. Runs read-only analysis and preparation where possible.
6. Presents a review package before any source mutation.
7. Reports exactly what ran, what did not run and what remains uncertain.

The orchestrator is a router and coordinator, not a replacement for the specialist skills.

### Namespaced commands

Specialized commands use `/integra:<name>`, for example `/integra:direction`, `/integra:visual-intelligence`, `/integra:generate`, `/integra:critique` and `/integra:live`.

Namespacing avoids collisions with host commands and makes the Integra command family discoverable. Bare aliases may be generated only by host adapters that explicitly support them and only when they do not conflict with native commands.

### Modifiers

Modifiers such as `polish`, `bolder`, `quieter`, `colorize`, `typeset`, `layout`, `animate`, `adapt`, `harden`, `distill` and `extract` refine the current task. They are not separate agents and should not trigger a full workflow unless the request requires it.

A modifier must inherit the current target, brief, constraints and approval state. If no target exists, ask one concise clarifying question or route through `/integra`.

## 3. Command contract

Every manifest entry defines:

- Stable `id` and invocation string.
- Kind: `orchestrator`, `workflow` or `modifier`.
- Human-readable intent.
- Existing skill references (zero or more).
- Expected output artifact types.
- Source-mutation policy.

The manifest, JSON Schema and TypeScript validator are now part of the command contract. Phase 1 includes explicit and natural-language request routing, ambiguity handling, modifier inheritance, routing fixtures and a review-only execution plan. The visual-intelligence workflow packages a validated Direction Artifact with the offline knowledge resolver; it does not invoke an external agent. This remains a pure routing core: it is not a shell parser, agent executor or proof that every host exposes native slash commands.

## 4. Routing rules

1. Prefer the narrowest workflow that fully satisfies the request.
2. Reuse existing skills; do not copy their full procedures into command definitions.
3. Use multiple skills only when their responsibilities are genuinely distinct.
4. Separate investigation/evidence, design decisions, implementation and QA.
5. Preserve project-specific instructions and stack choices.
6. If a requested capability is unavailable in the current host, explain the fallback rather than silently skipping it.
7. Do not claim that a skill was loaded or an agent was delegated unless the host confirms it.

## 5. Cross-agent compatibility

The manifest is host-agnostic. Adapters translate it into the formats supported by each host:

- Codex: project guidance and available skill discovery.
- Gemini CLI: `GEMINI.md` routing and readable skill files.
- Claude Code: host-specific command/skill files only where supported by the installed version.
- Cursor: project rules and readable skill guidance.

Adapters must be generated from the manifest or validated against it. Do not hand-maintain conflicting command catalogs in several places. Keep the Markdown skill files canonical.

A plain-language fallback must remain available: users can say “Integra, audit this page” even when the host has no slash-command UI.

## 6. Approval and source mutation

The default policy is **review**.

- Reading, searching, inspecting and generating a proposal are allowed within the user's authorization.
- Browser/DOM preview may temporarily change the local page, but must be reversible and isolated.
- Writing application source files requires explicit approval of the proposed change set.
- Approval is scoped to the displayed files and diff. Materially different follow-up edits require a new review.
- A command name, generated patch, successful test or accepted visual preview is not approval.
- Never commit, push, open a PR or merge unless separately requested.
- After approval, apply the smallest coherent diff, run relevant checks and report their actual results.

## 7. Standard result envelope

Each workflow should return a consistent summary:

- `status`: `completed`, `partial`, `blocked` or `not_run`.
- `intent`: interpreted goal.
- `inputs`: files, URLs, runtime context or user constraints used.
- `outputs`: artifact paths or structured results.
- `findings`: evidence, severity, impact and recommendation.
- `proposedChanges`: exact files and change summary, if any.
- `approvalRequired`: boolean.
- `verification`: commands/checks with `passed`, `failed`, `not_run` or `inconclusive`.
- `limitations`: missing host capabilities or uncertain evidence.

Do not convert `not_run` or `inconclusive` into `passed`.

## 8. Acceptance criteria

- Manifest parses and validates against its schema.
- Every referenced skill path exists.
- Command IDs and invocation strings are unique.
- Modifiers are distinguishable from workflows.
- A routing test confirms a broad request selects `/integra`, while a focused request selects the narrow command.
- A host without slash-command support can still route natural-language requests.
- A dry run produces a plan without modifying source files.
- A source-writing workflow stops at review until explicit approval.
- Existing `commands/vocabulary.json` consumers remain compatible during migration.


## Phase 1 implementation boundary

The core resolves an invocation or prepares a route and review plan. It does not invoke agents, execute commands, mutate application source or perform host-specific command registration. A host adapter may translate the canonical manifest later, but must preserve the same routing and approval semantics.
