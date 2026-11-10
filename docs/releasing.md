# Releasing `integra-cli`

The root project is private. Publish only the package in `packages/cli`, and do not treat a successful local package check as evidence that npm name ownership or agent-host compatibility has been verified.

## Before release

1. Review the intended package version in `packages/cli/package.json` and confirm `integra-cli` is available to the publishing maintainer:

   ```sh
   npm view integra-cli name version dist-tags --json
   ```

2. From the repository root, install the locked development dependencies and run the complete project check:

   ```sh
   npm ci
   npm run check
   ```

3. Check package contents, package tests and an isolated install of the generated tarball:

   ```sh
   npm run distribution:check
   npm run distribution:smoke
   ```

4. Confirm the GitHub Actions **CLI distribution** matrix is green on Ubuntu, Windows and macOS with Node.js 20 and 24. Separately test skill discovery and activation in each host/version the release notes intend to claim; the package tests do not establish host compatibility.

5. Inspect the final package file list and tarball before publishing:

   ```sh
   npm pack --dry-run ./packages/cli
   npm pack ./packages/cli
   ```

   The second command writes a `.tgz` file in the current directory. Inspect it, then remove that specific generated file when no longer needed.

## Publish

Only a maintainer who has verified package ownership, version, contents and release approval should publish. Publishing is intentionally not automated by this repository's CI.

```sh
npm publish ./packages/cli --access public
```

Do not run the publish command as part of validation. After a maintainer publishes, verify the registry record and installed version:

```sh
npm view integra-cli version dist-tags --json
npm view integra-cli@<version> dist.tarball
```

## Evidence and limits

- CI covers the CLI distribution tests, npm tarball contents and isolated tarball installation across the listed OS/Node matrix when those jobs have actually run.
- `npm run check` is a separate repository-wide gate on the configured quality job.
- Neither check tests host discovery, trust prompts, activation or the quality of generated work.
- npm package-name availability is external registry state and must be checked immediately before release.
