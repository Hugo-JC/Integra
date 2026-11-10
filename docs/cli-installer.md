# Integra CLI installer

The distributable CLI lives in `packages/cli`; the repository root remains private and is not published.

## Resource bundling

`scripts/build-distribution.mjs` creates a deterministic resource bundle from canonical `.agents/skills/` and the shared context roots: `docs/`, `presets/`, `data/`, `references/`, `rules/`, `commands/` and `schemas/`.

The bundler rejects symlinks, validates skill frontmatter and confirms every local Markdown link in a skill resolves to a file included in the bundle. Each file receives a SHA-256 hash and byte size in `bundle.json`. Per-file and total-size limits protect package size.

The package `prepack` lifecycle builds resources before npm creates the tarball. Generated `packages/cli/resources/` output is not committed.

For local package validation, `npm run distribution:check` runs the CLI tests and inspects the npm package contents. `npm run distribution:smoke` packs the CLI, installs that tarball offline into a temporary prefix, then runs `init` and `doctor` in a separate temporary project. Both temporary directories are removed when the smoke test finishes.

## CLI contract

| Command | Behavior |
|---|---|
| `integra init` | Install all bundled skills. |
| `integra add <skill...>` | Install selected skills. |
| `integra list` | List available and installed skills. |
| `integra doctor` | Verify bundle and installation integrity. |
| `integra update` | Update managed files only when current hashes match the previous baseline. |
| `integra remove <skill...>` | Remove selected skills without deleting modified or shared files. |

The default target is `.agents/skills/`; `--target` selects another relative skill directory. Absolute paths, traversal, symlink components and non-file destination collisions are rejected.

## Lifecycle state

`.integra/install-manifest.json` records schema/package versions, selected skills, expected hashes, managed file hashes, source paths and owners. Shared context files are reference-counted across installed skills. Removing one skill cannot remove context still used by another.

## Deliberate limits

- Installation does not execute scripts or install project dependencies.
- Repository npm scripts and source runtime modules are not included.
- The CLI does not claim that a host has loaded or activated a skill.
- Host-specific directories are caller-selected through `--target`; discovery is not guaranteed for every host/version.
- This is an initial npm package candidate. No package has been published; registry name availability must be checked as part of release preparation.
