import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("DL-001 pilot pack CLI", () => {
  const tsxCli = resolve(process.cwd(), "node_modules/tsx/dist/cli.mjs");
  const script = resolve(process.cwd(), "scripts/pilot-prepare.ts");

  it("prepares a complete, hashed pilot pack with validated core artifacts", () => {
    const workspace = mkdtempSync(join(tmpdir(), "integra-dl001-pilot-"));
    const output = ".integra/runs/pilots/DL-001";
    const target = join(workspace, ...output.split("/"));

    try {
      const run = spawnSync(process.execPath, [tsxCli, script], {
        cwd: workspace,
        encoding: "utf8",
      });
      expect(run.status, run.stderr).toBe(0);
      expect(run.stdout).toContain("9 files");
      expect(run.stdout).toContain("Agent execution: not run");

      const requiredFiles = [
        "README.md",
        "brief.json",
        "brief.md",
        "TASK-PROMPT.md",
        "direction.json",
        "bundle.json",
        "GUIDED-AGENT-INSTRUCTIONS.md",
        "acceptance-criteria.json",
        "manifest.json",
      ];
      for (const name of requiredFiles) expect(existsSync(join(target, name))).toBe(true);

      const manifest = JSON.parse(readFileSync(join(target, "manifest.json"), "utf8"));
      const direction = JSON.parse(readFileSync(join(target, "direction.json"), "utf8"));
      const bundle = JSON.parse(readFileSync(join(target, "bundle.json"), "utf8"));
      const acceptance = JSON.parse(readFileSync(join(target, "acceptance-criteria.json"), "utf8"));

      expect(manifest).toMatchObject({
        schemaVersion: "1.0.0",
        scenarioId: "DL-001",
        directionSchemaVersion: "1.1.0",
        bundleSchemaVersion: "1.1.0",
        integrity: {
          directionValidation: "passed",
          bundleValidation: "passed",
          agentExecution: "not-run",
          browserVerification: "not-run",
        },
      });
      expect(bundle.directionArtifactId).toBe(direction.artifactId);
      expect(acceptance.viewports).toEqual([
        { width: 1440, height: 900, required: true },
        { width: 390, height: 844, required: true },
      ]);
      expect(acceptance.requiredContent).toHaveLength(13);

      const briefText = readFileSync(join(target, "brief.json"), "utf8");
      expect(manifest.inputs.briefJsonSha256).toBe(
        createHash("sha256").update(briefText, "utf8").digest("hex"),
      );
    } finally {
      rmSync(workspace, { recursive: true, force: true });
    }
  }, 60_000);

  it("refuses output paths outside the isolated run directory", () => {
    const workspace = mkdtempSync(join(tmpdir(), "integra-dl001-pilot-path-"));
    try {
      const run = spawnSync(
        process.execPath,
        [tsxCli, script, "--out", ".integra/runs/../../outside"],
        { cwd: workspace, encoding: "utf8" },
      );
      expect(run.status).toBe(1);
      expect(run.stderr).toContain("Generated files must stay inside .integra/runs/");
      expect(existsSync(join(workspace, "outside"))).toBe(false);
    } finally {
      rmSync(workspace, { recursive: true, force: true });
    }
  }, 60_000);
});
