import { execFileSync, spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Direction CLI executable workflow', () => {
  const tsxCli = resolve(process.cwd(), 'node_modules/tsx/dist/cli.mjs');
  const generateScript = resolve(process.cwd(), 'scripts/direction-generate.ts');
  const validateScript = resolve(process.cwd(), 'scripts/direction-validate.ts');

  it('generates a file and validates it through the public npm commands', () => {
    const workspace = mkdtempSync(join(tmpdir(), 'integra-direction-cli-'));
    const artifactPath = join(workspace, 'direction.json');

    try {
      execFileSync(process.execPath, [tsxCli, generateScript, '--out', artifactPath], {
        cwd: process.cwd(),
        stdio: 'pipe',
      });

      const artifact = JSON.parse(readFileSync(artifactPath, 'utf8')) as {
        schemaVersion: string;
        sections: Record<string, unknown>;
      };
      expect(artifact.schemaVersion).toBe('1.1.0');
      expect(Object.keys(artifact.sections)).toHaveLength(8);

      const validationOutput = execFileSync(
        process.execPath,
        [tsxCli, validateScript, '--input', artifactPath],
        { cwd: process.cwd(), encoding: 'utf8' },
      );
      expect(JSON.parse(validationOutput).status).toBe('passed');
    } finally {
      rmSync(workspace, { recursive: true, force: true });
    }
  });

  it('does not export an artifact when a hard constraint leaves a generation diagnostic', () => {
    const workspace = mkdtempSync(join(tmpdir(), 'integra-direction-conflict-'));
    const inputPath = join(workspace, 'conflicted-brief.json');
    const artifactPath = join(workspace, 'must-not-exist.json');
    const fixture = JSON.parse(
      readFileSync(resolve(process.cwd(), 'fixtures/brief-data/DL-001.json'), 'utf8'),
    ) as { directionContext: Record<string, unknown> };

    fixture.directionContext.structuredConstraints = [{
      id: 'block-color-decision',
      path: 'design.colorPalette',
      operator: 'equals',
      value: 'not-the-generated-palette',
      hard: true,
    }];
    writeFileSync(inputPath, JSON.stringify(fixture), 'utf8');

    try {
      const run = spawnSync(
        process.execPath,
        [tsxCli, generateScript, '--input', inputPath, '--out', artifactPath],
        { cwd: process.cwd(), encoding: 'utf8' },
      );
      expect(run.status).toBe(2);
      expect(run.stderr).toContain('No output was written');
      expect(existsSync(artifactPath)).toBe(false);
    } finally {
      rmSync(workspace, { recursive: true, force: true });
    }
  });
});
