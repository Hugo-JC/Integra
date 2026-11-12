import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { resolveRunOutputPath, writeRunOutput } from '../src/cli/run-output.js';

const temporaryDirectories: string[] = [];

async function createWorkspace(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'integra-run-output-'));
  temporaryDirectories.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((path) =>
    rm(path, { recursive: true, force: true }),
  ));
});

describe('safe generated run output', () => {
  it('resolves relative and absolute output paths inside .integra/runs', async () => {
    const root = await createWorkspace();
    const relativeTarget = resolveRunOutputPath(root, '.integra/runs/direction/output.json');
    const absoluteTarget = resolveRunOutputPath(root, relativeTarget);
    expect(absoluteTarget).toBe(relativeTarget);
  });

  it('rejects output paths outside .integra/runs', async () => {
    const root = await createWorkspace();
    expect(() => resolveRunOutputPath(root, 'src/generated.json')).toThrow(/inside .integra\/runs/);
    expect(() => resolveRunOutputPath(root, '../outside.json')).toThrow(/inside .integra\/runs/);
    expect(() => resolveRunOutputPath(root, '.integra/runs')).toThrow(/inside .integra\/runs/);
  });

  it('creates nested run directories and atomically replaces a prior output', async () => {
    const root = await createWorkspace();
    const output = '.integra/runs/direction/DL-001.json';
    const first = await writeRunOutput(root, output, '{"run":1}');
    const second = await writeRunOutput(root, output, '{"run":2}');
    expect(second).toBe(first);
    expect(await readFile(second, 'utf8')).toBe('{"run":2}');
  });

  it('does not allow generated output to overwrite the input artifact', async () => {
    const root = await createWorkspace();
    const input = '.integra/runs/direction/source.json';
    await mkdir(join(root, '.integra', 'runs', 'direction'), { recursive: true });
    await writeFile(resolve(root, input), '{"source":true}');
    await expect(writeRunOutput(root, input, '{"overwrite":true}', [input]))
      .rejects.toThrow(/cannot overwrite one of its input files/);
    expect(await readFile(resolve(root, input), 'utf8')).toBe('{"source":true}');
  });

  it('rejects a symlinked output directory', async () => {
    const root = await createWorkspace();
    const outside = join(root, 'outside');
    await mkdir(outside);
    await mkdir(join(root, '.integra'), { recursive: true });
    await symlink(outside, join(root, '.integra', 'runs'), process.platform === 'win32' ? 'junction' : 'dir');
    await expect(writeRunOutput(root, '.integra/runs/escape.json', '{}'))
      .rejects.toThrow(/symlink or non-directory component/);
  });
});
