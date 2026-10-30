import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Direction CLI executable workflow', () => {
  it('generates a file and validates it through the public npm commands', () => {
    const workspace = mkdtempSync(join(tmpdir(), 'integra-direction-cli-'));
    const artifactPath = join(workspace, 'direction.json');
    const tsxCli = resolve(process.cwd(), 'node_modules/tsx/dist/cli.mjs');
    const generateScript = resolve(process.cwd(), 'scripts/direction-generate.ts');
    const validateScript = resolve(process.cwd(), 'scripts/direction-validate.ts');

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
});
