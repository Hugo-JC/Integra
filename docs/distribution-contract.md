# Distribution contract

**Status:** implemented distribution foundation and CLI MVP (initial release candidate).

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

## Implemented distribution tooling

The initial CLI implementation lives in `packages/cli`, independently from the private repository package.

- `scripts/build-distribution.mjs` creates a resource-closed bundle from canonical skills and shared context directories.
- The bundler validates skill frontmatter and local Markdown links, rejects symlinks, and records SHA-256 hashes and file sizes.
- The CLI exposes `init`, `add`, `list`, `doctor`, `update` and `remove`.
- Installation state lives in `.integra/install-manifest.json` and records package version, expected hashes, managed paths and skill ownership.
- Shared context files are reference-counted so removing one skill does not remove resources still used by another.
- Updates preserve local modifications; removal deletes only unchanged installer-managed files.
- Installation does not execute scripts, install dependencies or claim that a host has activated a skill.

The root package remains private. The npm candidate is `packages/cli` (package name `integra-cli`); it has not been published, and package-name availability has not been verified.

## Remaining validation boundaries

This is an initial CLI MVP, not yet a public release. CI tests exercise the bundler and installer against temporary projects. Before publishing, validate npm package contents with `npm pack --dry-run`, run end-to-end tests on Windows/macOS/Linux, verify the package name and registry metadata, and test discovery in each supported agent host/version.

Repository npm scripts and source runtime modules are intentionally not bundled. Skills that mention those commands still require a full Integra checkout for that functionality.

## Current resource inventory

This inventory records dependencies explicitly referenced by the current skill instructions. It is a starting point for packaging, not a claim that every transitive runtime dependency has been closed.

| Skill | Explicit repository dependencies |
|---|---|
| `integra` | The specialist skill directories it routes to; include those skills in an orchestration bundle. |
| `integra-design-direction` | `docs/ai-context-contract.md`, `docs/ai-guides/preset-reference-escape-routing.md`, `presets/manifest.json`; `design:route` and `direction:presets` npm scripts. |
| `integra-investigation` | `docs/ai-context-contract.md`, `docs/reference-investigation.md`, `docs/ai-guides/preset-reference-escape-routing.md`. |
| `integra-reference-investigator` | `docs/ai-context-contract.md`, `docs/ai-guides/preset-reference-escape-routing.md`. |
| `integra-ui-generator` | `docs/ai-context-contract.md`, `docs/ai-guides/preset-reference-escape-routing.md`; optional `design:qa` npm script. |
| `integra-ux-shape` | `docs/ai-context-contract.md`. |
| `integra-accessibility-audit` | Optional `design:qa` npm script. |
| `integra-direction` (legacy alias) | `design:route` npm script. |
| `integra-refactor-agent` | `typecheck` npm script. |

Other specialist instructions currently have no explicit relative Markdown resource links or npm-script references. That does not prove they have no contextual or host-level requirements.

### Packaging implications

- A bundle containing `integra` must include the specialist skills that are advertised by its routing table, or clearly report unavailable routes.
- A skill that references repository documentation must either carry those documents in its package-relative structure or be installed in a declared full-context layout.
- A skill that recommends `npm run ...` must not imply that the command is available in an arbitrary consumer project. The installer must either supply the required Integra tooling in a supported package mode or mark that command as repository-only guidance.
- `npm run` references are guidance, not permission to execute scripts during installation or skill invocation.

The inventory should be regenerated or re-reviewed whenever a skill's links, commands or referenced data change.
