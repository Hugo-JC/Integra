# Integra CLI

The Integra CLI installs and manages the canonical Agent Skills and their linked project context.

## Requirements

- Node.js 20 or newer.
- A project directory where you want the skills installed.

## Commands

```sh
npx integra-cli init
npx integra-cli add integra-design-direction
npx integra-cli list
npx integra-cli doctor
npx integra-cli update
npx integra-cli remove integra-design-direction
```

The default target is `.agents/skills/`. Use `--target .claude/skills` to select another relative skill directory.

## Installation contract

- Installs selected `SKILL.md` directories and bundled shared context.
- Records ownership and SHA-256 baselines in `.integra/install-manifest.json`.
- Never overwrites an unmanaged file.
- Never follows symlinks in destination paths.
- Never executes scripts from the bundle.
- `update` only replaces files that still match the previous installer-managed hash.
- `remove` deletes only unchanged files with no remaining skill owners.
- User-modified files are preserved and reported as conflicts.
- `doctor` checks installed files against the recorded baseline.

The bundle includes documentation, presets, reference data, rules, schemas and the command catalog. Repository npm scripts, source modules and runtime tooling are not installed. Skills may mention repository-only commands; those commands remain available only in a full Integra checkout.

## Development

From the repository root:

```sh
npm run distribution:build
npm run distribution:test
```

Packaging runs the resource bundler automatically through the package `prepack` lifecycle.
