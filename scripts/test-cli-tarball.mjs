import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function runNpm(args, options = {}) {
  const npmCli = process.env.npm_execpath;
  if (!npmCli) throw new Error('Run this smoke test through `npm run distribution:smoke`.');
  const result = spawnSync(process.execPath, [npmCli, ...args], {
    cwd: options.cwd ?? ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error([
      `npm ${args.join(' ')} failed with exit code ${result.status}.`,
      result.stdout,
      result.stderr,
    ].filter(Boolean).join('\n'));
  }
  return result.stdout.trim();
}

const temporaryRoot = await mkdtemp(join(tmpdir(), 'integra-cli-tarball-'));
try {
  const packDirectory = join(temporaryRoot, 'pack');
  const installDirectory = join(temporaryRoot, 'install');
  const projectDirectory = join(temporaryRoot, 'project');
  await Promise.all([mkdir(packDirectory), mkdir(installDirectory), mkdir(projectDirectory)]);

  console.log('Packing the CLI.');
  runNpm(['pack', '--pack-destination', packDirectory], { cwd: join(ROOT, 'packages', 'cli') });
  const tarballs = (await readdir(packDirectory)).filter((name) => name.endsWith('.tgz'));
  assert.equal(tarballs.length, 1, 'npm pack must produce exactly one tarball.');
  const tarballPath = join(packDirectory, tarballs[0]);

  console.log('Installing the tarball offline into a temporary prefix.');
  runNpm([
    'install',
    '--prefix', installDirectory,
    '--no-save',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    '--offline',
    tarballPath,
  ]);

  const installedCli = join(installDirectory, 'node_modules', 'integra-cli', 'bin', 'integra.js');
  const runCli = (args) => {
    const result = spawnSync(process.execPath, [installedCli, ...args], {
      cwd: projectDirectory,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    if (result.error) throw result.error;
    if (result.status !== 0) {
      throw new Error([
        `Installed integra ${args.join(' ')} failed with exit code ${result.status}.`,
        result.stdout,
        result.stderr,
      ].filter(Boolean).join('\n'));
    }
    return result.stdout.trim();
  };

  const initOutput = runCli(['init']);
  assert.match(initOutput, /Installed|already installed/i);
  const doctorOutput = runCli(['doctor']);
  assert.match(doctorOutput, /healthy|verified|OK/i);
  await readFile(join(projectDirectory, '.agents', 'skills', 'integra', 'SKILL.md'), 'utf8');
  await readFile(join(projectDirectory, 'docs', 'ai-context-contract.md'), 'utf8');
  await readFile(join(projectDirectory, '.integra', 'install-manifest.json'), 'utf8');

  console.log(`Tarball smoke passed: ${tarballs[0]} installed offline into an isolated project and verified.`);
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
