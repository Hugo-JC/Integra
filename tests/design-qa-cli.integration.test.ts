import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("Design QA CLI", () => {
  const tsxCli = resolve(process.cwd(), "node_modules/tsx/dist/cli.mjs");
  const script = resolve(process.cwd(), "scripts/design-qa.ts");

  it("emits a versioned JSON report for a caller-supplied directory", () => {
    const workspace = mkdtempSync(join(tmpdir(), "integra-design-qa-"));
    const sourceRoot = join(workspace, "src");
    mkdirSync(sourceRoot);
    writeFileSync(join(sourceRoot, "App.tsx"), '<img src="hero.png" />', "utf8");

    try {
      const run = spawnSync(process.execPath, [tsxCli, script, sourceRoot, "--json"], {
        cwd: workspace,
        encoding: "utf8",
      });
      expect(run.status).toBe(0);
      const report = JSON.parse(run.stdout) as {
        schemaVersion: string;
        summary: { scannedSourceFiles: number };
        findings: Array<{ ruleId: string; verificationStatus: string; location: { file: string } }>;
      };
      expect(report.schemaVersion).toBe("1.0.0");
      expect(report.summary.scannedSourceFiles).toBe(1);
      expect(report.findings[0]).toMatchObject({
        ruleId: "a11y.image-alt",
        verificationStatus: "heuristic",
        location: { file: "src/App.tsx" },
      });
    } finally {
      rmSync(workspace, { recursive: true, force: true });
    }
  }, 60_000);

  it("uses a non-zero strict exit for P1 signals", () => {
    const workspace = mkdtempSync(join(tmpdir(), "integra-design-qa-strict-"));
    const sourceRoot = join(workspace, "src");
    mkdirSync(sourceRoot);
    writeFileSync(join(sourceRoot, "App.tsx"), '<img src="hero.png" />', "utf8");

    try {
      const run = spawnSync(process.execPath, [tsxCli, script, sourceRoot, "--json", "--strict"], {
        cwd: workspace,
        encoding: "utf8",
      });
      expect(run.status).toBe(2);
      expect(JSON.parse(run.stdout).findings).toHaveLength(1);
    } finally {
      rmSync(workspace, { recursive: true, force: true });
    }
  }, 60_000);

  it("reports an invalid scan root without crashing the host", () => {
    const workspace = mkdtempSync(join(tmpdir(), "integra-design-qa-invalid-"));
    try {
      const run = spawnSync(process.execPath, [tsxCli, script, join(workspace, "missing")], {
        cwd: workspace,
        encoding: "utf8",
      });
      expect(run.status).toBe(1);
      expect(run.stderr).toContain("not a directory");
    } finally {
      rmSync(workspace, { recursive: true, force: true });
    }
  }, 60_000);
});
