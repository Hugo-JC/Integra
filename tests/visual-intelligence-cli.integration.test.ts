import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Direction to Visual Intelligence CLI workflow', () => {
  const tsxCli = resolve(process.cwd(), 'node_modules/tsx/dist/cli.mjs');
  const directionScript = resolve(process.cwd(), 'scripts/direction-generate.ts');
  const bundleScript = resolve(process.cwd(), 'scripts/visual-intelligence-generate.ts');
  const fixturePath = resolve(process.cwd(), 'fixtures/brief-data/DL-001.json');

  it('generates a validated Direction Artifact and hands it to the Bundle CLI in an isolated workspace', () => {
    const workspace = mkdtempSync(join(tmpdir(), 'integra-visual-pilot-'));
    const directionRelative = '.integra/runs/direction/DL-001.json';
    const bundleRelative = '.integra/runs/visual-intelligence/DL-001.json';
    const directionPath = join(workspace, ...directionRelative.split('/'));
    const bundlePath = join(workspace, ...bundleRelative.split('/'));

    try {
      execFileSync(
        process.execPath,
        [tsxCli, directionScript, '--input', fixturePath, '--out', directionRelative],
        { cwd: workspace, stdio: 'pipe' },
      );

      const bundleRun = spawnSync(
        process.execPath,
        [
          tsxCli, bundleScript,
          '--artifact', directionRelative,
          '--task', 'Help users understand the product and explore its project workspace',
          '--mode', 'operate',
          '--niche-id', 'saas-developer-ai',
          '--query', 'task-first hierarchy compact navigation responsive layout',
          '--out', bundleRelative,
        ],
        { cwd: workspace, encoding: 'utf8' },
      );
      expect(bundleRun.status).toBe(0);
      expect(bundleRun.stderr).toContain('schema 1.1.0');
      expect(bundleRun.stderr).toContain('validation passed');

      const direction = JSON.parse(readFileSync(directionPath, 'utf8')) as {
        schemaVersion: string;
        artifactId: string;
      };
      const bundle = JSON.parse(readFileSync(bundlePath, 'utf8')) as {
        schemaVersion: string;
        directionArtifactId: string;
        knowledge: { observations: Array<{ verificationStatus: string }> };
      };

      expect(direction.schemaVersion).toBe('1.1.0');
      expect(bundle.schemaVersion).toBe('1.1.0');
      expect(bundle.directionArtifactId).toBe(direction.artifactId);
      expect(bundle.knowledge.observations).toHaveLength(2);
      expect(bundle.knowledge.observations.every((item) => item.verificationStatus === 'partial')).toBe(true);
    } finally {
      rmSync(workspace, { recursive: true, force: true });
    }
  }, 60_000);

  it('does not let the Bundle CLI overwrite its Direction Artifact input', () => {
    const workspace = mkdtempSync(join(tmpdir(), 'integra-visual-input-'));
    const directionRelative = '.integra/runs/direction/DL-001.json';
    const directionPath = join(workspace, ...directionRelative.split('/'));

    try {
      execFileSync(
        process.execPath,
        [tsxCli, directionScript, '--input', fixturePath, '--out', directionRelative],
        { cwd: workspace, stdio: 'pipe' },
      );
      const before = readFileSync(directionPath, 'utf8');
      const result = spawnSync(
        process.execPath,
        [
          tsxCli, bundleScript,
          '--artifact', directionRelative,
          '--task', 'Help users understand this product',
          '--out', directionRelative,
        ],
        { cwd: workspace, encoding: 'utf8' },
      );

      expect(result.status).toBe(1);
      expect(result.stderr).toContain('cannot overwrite one of its input files');
      expect(readFileSync(directionPath, 'utf8')).toBe(before);
    } finally {
      rmSync(workspace, { recursive: true, force: true });
    }
  }, 60_000);
});
