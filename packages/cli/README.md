# Integra CLI

The Integra CLI installs and manages the canonical Agent Skills and the shared context they need.

## Requirements

- Node.js 20 or newer.
- A project directory where you want the skills installed.

## Quick start

Install the default Integra entry point:

```sh
npx integra-cli init
```

Add a focused specialist:

```sh
npx integra-cli add integra-animate
npx integra-cli add integra-colorize
npx integra-cli list
npx integra-cli doctor
```

Update managed skills or remove one:

```sh
npx integra-cli update
npx integra-cli remove integra-animate
```

The default target is `.agents/skills/`. Use `--target .claude/skills` to select another relative skill directory.

## Installation contract

- Installs selected `SKILL.md` directories and bundled shared context.
- Records ownership and SHA-256 baselines in `.integra/install-manifest.json`.
- Never overwrites an unmanaged file.
- Never follows symlinks in destination paths.
- Never executes scripts from the bundle.
- `update` replaces only files that still match the previous installer-managed hash.
- `remove` deletes only unchanged files with no remaining skill owners.
- User-modified files are preserved and reported as conflicts.
- `doctor` checks installed files against the recorded baseline.

The bundle includes documentation, presets, reference data, rules, schemas, the command catalog and required third-party license notices. Repository npm scripts, source modules and runtime tooling are not installed. Skills may mention repository-only commands; those commands remain available only in a full Integra checkout.

Installing a skill does not automatically register a native slash command or guarantee host discovery. Follow the host-specific instructions in [Agent compatibility](../../docs/agent-compatibility.md).

## Licensing

The project package is MIT-licensed. Some adapted skill guidance carries additional third-party license obligations. The distribution bundle includes the Apache-2.0 license text and a precise file-level notice at `resources/licenses/IMPECCABLE-APACHE-2.0.txt` and `resources/docs/third-party-notices.md`.

## Development

From the repository root:

```sh
npm run distribution:build
npm run distribution:test
npm run distribution:pack
npm run distribution:smoke
```

Packaging runs the resource bundler automatically through the package `prepack` lifecycle.
