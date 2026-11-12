import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import brief from "../fixtures/brief-data/DL-001.json" with { type: "json" };
import { generateDirectionFromInput } from "../src/cli/direction.js";
import type { DirectionArtifact } from "../src/modules/direction/types.js";

describe("Direction Consumption CLI", () => {
  const tsxCli = resolve(process.cwd(), "node_modules/tsx/dist/cli.mjs");
  const script = resolve(process.cwd(), "scripts/direction-consumption-validate.ts");

  it("validates a complete consumption report against its Direction Artifact", () => {
    const workspace = mkdtempSync(join(tmpdir(), "integra-consumption-cli-"));
    const artifact = generateDirectionFromInput(brief, "DL-001").generation.artifact as DirectionArtifact;
    const artifactPath = join(workspace, "direction.json");
    const reportPath = join(workspace, "report.json");
    const report = {
      schemaVersion: "1.0.0",
      artifactId: artifact.artifactId,
      engineVersion: artifact.engineVersion,
      implementationStatus: "partial",
      decisions: Object.values(artifact.sections).flatMap((section) =>
        section.decisions.map((item) => ({ decisionId: item.id, status: "applied" })),
      ),
      recommendations: Object.values(artifact.sections).flatMap((section) =>
        section.recommendations.map((item) => ({ recommendationId: item.id, status: "adopted" })),
      ),
      blockers: [],
      unresolvedMissingInformation: [],
      evidence: [],
      notes: ["CLI integration fixture; not a real implementation report."],
    };

    writeFileSync(artifactPath, JSON.stringify(artifact), "utf8");
    writeFileSync(reportPath, JSON.stringify(report), "utf8");
    try {
      const run = spawnSync(process.execPath, [
        tsxCli, script, "--artifact", artifactPath, "--report", reportPath,
      ], { cwd: workspace, encoding: "utf8" });
      expect(run.status, run.stderr).toBe(0);
      expect(JSON.parse(run.stdout)).toMatchObject({
        status: "passed",
        coverage: {
          expectedDecisions: report.decisions.length,
          reportedDecisions: report.decisions.length,
          expectedRecommendations: report.recommendations.length,
          reportedRecommendations: report.recommendations.length,
        },
      });
    } finally {
      rmSync(workspace, { recursive: true, force: true });
    }
  }, 60_000);

  it("returns a failing exit status when an outcome is missing", () => {
    const workspace = mkdtempSync(join(tmpdir(), "integra-consumption-missing-"));
    const artifact = generateDirectionFromInput(brief, "DL-001").generation.artifact as DirectionArtifact;
    const artifactPath = join(workspace, "direction.json");
    const reportPath = join(workspace, "report.json");
    const report = {
      schemaVersion: "1.0.0",
      artifactId: artifact.artifactId,
      engineVersion: artifact.engineVersion,
      implementationStatus: "partial",
      decisions: Object.values(artifact.sections).flatMap((section) =>
        section.decisions.map((item) => ({ decisionId: item.id, status: "applied" })),
      ),
      recommendations: Object.values(artifact.sections).flatMap((section) =>
        section.recommendations.map((item) => ({ recommendationId: item.id, status: "adopted" })),
      ),
      blockers: [],
      unresolvedMissingInformation: [],
      evidence: [],
      notes: ["Test fixture."],
    };
    report.decisions.pop();
    writeFileSync(artifactPath, JSON.stringify(artifact), "utf8");
    writeFileSync(reportPath, JSON.stringify(report), "utf8");

    try {
      const run = spawnSync(process.execPath, [
        tsxCli, script, "--artifact", artifactPath, "--report", reportPath,
      ], { cwd: workspace, encoding: "utf8" });
      expect(run.status).toBe(1);
      expect(JSON.parse(run.stdout).errors.some((item: string) => item.includes("is missing outcome for"))).toBe(true);
    } finally {
      rmSync(workspace, { recursive: true, force: true });
    }
  }, 60_000);
});
