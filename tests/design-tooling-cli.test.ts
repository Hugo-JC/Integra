import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

function runTs(entry: string, ...args: string[]) {
  return spawnSync(process.execPath, ['--import', 'tsx', entry, ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
    timeout: 20_000,
  });
}

describe('design tooling CLIs', () => {
  it('routes a specific brief from the command line', () => {
    const result = runTs('scripts/design-route.ts', 'SaaS developer AI platform', '--json');
    expect(result.status).toBe(0);
    const output = JSON.parse(result.stdout) as { status: string; presetId?: string };
    expect(output.status).toBe('matched');
    expect(output.presetId).toBeTruthy();
  });

  it('scans JSX/TSX sources and emits a machine-readable report', () => {
    const result = runTs('scripts/design-qa.ts', 'src/', '--json');
    expect(result.status).toBe(0);
    const output = JSON.parse(result.stdout) as { scannedFiles: number; findings: unknown[] };
    expect(output.scannedFiles).toBeGreaterThan(0);
    expect(Array.isArray(output.findings)).toBe(true);
  });
});
