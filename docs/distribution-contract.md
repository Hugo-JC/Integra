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
