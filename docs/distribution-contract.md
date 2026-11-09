# Distribution contract

**Status:** initial contract for the Integra distribution foundation.

## Canonical source

- Canonical Agent Skills live in `.agents/skills/<skill-name>/`.
- The `integra` skill is the orchestration entry point.
- `commands/manifest.json` remains the machine-readable command catalog.
- The source repository is not itself the installable package.

## Resource closure

A distributable skill is not only its `SKILL.md`. The installer must preserve every resource reachable from that file and every project-level dependency the skill explicitly requires.

For the current repository, several specialist skills link to files under root-level `docs/`, and some describe repository commands or read data from `presets/` and `data/`. Copying only `.agents/skills/<name>/` is therefore not a complete Integra installation.

Until a self-contained bundle is generated, distribution must use one of these explicit modes:

1. **Full Integra context:** install the selected skill directories together with the documented root-level context directories and preserve their relative locations.
2. **Self-contained skill:** package the skill with all required references and scripts inside its own directory, then rewrite links to remain within that skill.

Never silently install a partial skill while reporting a complete installation.

## Path safety

An installer must:

- resolve paths relative to the skill directory or declared package root;
- reject absolute paths and traversal outside the package root;
- reject symlinks whose resolved targets escape the package root;
- validate all destinations before writing;
- never execute packaged scripts during installation;
- preserve user-owned files and report conflicts.

## Host adapters

Use `.agents/skills/` for hosts that discover the shared Agent Skills directory. Use explicit host adapters only where a host requires a different location. Adapters must copy the canonical skill contents; they must not maintain divergent hand-edited versions.

Host discovery is not proof of activation. Compatibility claims require tests in the actual host and version.

## Lifecycle metadata

A future installer manifest should record:

- schema version and Integra release;
- selected skills and host targets;
- installed relative paths;
- file hashes and ownership status;
- source revision or release identifier;
- conflicts and locally modified files.

Updates must compare the installed baseline, new release and current local file. Removal may delete only files that are still identified as installer-managed; user changes must be preserved or explicitly reviewed.

## Non-goals of this foundation

This document does not claim that an npm package, installer, update engine, host activation test or security scanner has already been implemented. Those are separate milestones.

## Current resource inventory

This inventory records dependencies explicitly referenced by the current skill instructions. It is an instruction-level inventory, not proof that every transitive runtime dependency, host permission or project context is available.

| Skill | Explicit dependencies or optional capabilities |
|---|---|
| `integra` | Routes to named specialist skills; an orchestration bundle must include the specialist directories it advertises. |
| `integra-design-direction` | Optional repository commands `design:route` and `direction:presets`; use only after confirming they exist in the current checkout. |
| `integra-ui-generator` | Existing project stack, dependencies, tokens and components; optional repository Design QA when available. |
| `integra-refactor-agent` | Project tests, typecheck and local conventions; commands vary by project. |
| `integra-design-qa` | Browser/rendered-page access and project checks when available; otherwise disclose untested dimensions. |
| `integra-accessibility-audit` | Browser and assistive-technology checks when available; automated tools are optional evidence. |
| `integra-performance-audit` | Profilers, browser measurements or field data when available. |
| `integra-investigation` | Access to external sources when research is requested; no local package dependency. |
| `integra-reference-investigator` | Authorized access to a reference page, repository or supplied artifact. |
| `integra-design-system` | Existing tokens, component source and theme configuration in the target project. |
| `integra-colorize` | Existing brand/tokens and rendered color pairs for measured contrast; no mandatory external script. |
| `integra-live-inspector` | Integra Live Inspector module and documented Vite development adapter; local development only. |
| `integra-ux-shape` | Product, task, route and data context supplied or observable in the target project. |
| `integra-direction` (legacy alias) | Defers to `integra-design-direction`; no separate runtime dependency. |

The current canonical skill files keep their procedural guidance inside each skill directory and do not link to root-level `docs/` resources. Some workflows still describe optional capabilities that exist only in a full Integra checkout. A standalone installer must distinguish portable instruction from available executable tooling.

## Packaging implications

- A bundle containing `integra` must include the specialist skills advertised by its routing table, or clearly report unavailable routes.
- A copied specialist skill should remain understandable without root-level Integra documentation; optional tooling must be described as optional and checked before use.
- A Skill that recommends a repository command must not imply that command exists in an arbitrary consumer project.
- Installation must never execute packaged scripts merely because a Skill documents them.
- Host capability, browser access, project dependencies and external research access are runtime capabilities, not files that the skill installer can guarantee.

Re-review this inventory whenever a skill adds a required reference, script, asset or host capability.
