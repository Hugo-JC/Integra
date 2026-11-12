import { describe, expect, it } from "vitest";
import brief from "../fixtures/brief-data/DL-001.json" with { type: "json" };
import { generateDirectionFromInput } from "../src/cli/direction.js";
import { validateDirectionConsumptionReport } from "../src/cli/direction-consumption.js";
import type { DirectionArtifact } from "../src/modules/direction/types.js";
import type { DirectionConsumptionReport } from "../src/contracts/direction-consumption.js";

function buildFixture() {
  const generated = generateDirectionFromInput(brief, "DL-001");
  const artifact = generated.generation.artifact as DirectionArtifact;
  const report: DirectionConsumptionReport = {
    schemaVersion: "1.0.0",
    artifactId: artifact.artifactId,
    engineVersion: artifact.engineVersion,
    implementationStatus: "partial",
    decisions: Object.values(artifact.sections).flatMap((section) =>
      section.decisions.map((decision) => ({ decisionId: decision.id, status: "applied" as const })),
    ),
    recommendations: Object.values(artifact.sections).flatMap((section) =>
      section.recommendations.map((recommendation) => ({
        recommendationId: recommendation.id,
        status: "adopted" as const,
      })),
    ),
    blockers: [],
    unresolvedMissingInformation: [],
    evidence: [],
    notes: ["Test fixture only; this is not evidence of a real implementation."],
  };
  return { artifact, report };
}

describe("Direction Consumption Report validation", () => {
  it("accepts a schema-valid report with exact one-to-one outcome coverage", () => {
    const { artifact, report } = buildFixture();
    const result = validateDirectionConsumptionReport(artifact, report);

    expect(result).toMatchObject({
      status: "passed",
      errors: [],
      coverage: {
        expectedDecisions: report.decisions.length,
        reportedDecisions: report.decisions.length,
        expectedRecommendations: report.recommendations.length,
        reportedRecommendations: report.recommendations.length,
      },
    });
  });

  it("rejects missing decision and recommendation outcomes", () => {
    const { artifact, report } = buildFixture();
    report.decisions.pop();
    report.recommendations.pop();

    const result = validateDirectionConsumptionReport(artifact, report);
    expect(result.status).toBe("failed");
    expect(result.errors.some((error) => error.startsWith("Decision outcomes is missing"))).toBe(true);
    expect(result.errors.some((error) => error.startsWith("Recommendation outcomes is missing"))).toBe(true);
  });

  it("rejects duplicate and unknown outcomes", () => {
    const { artifact, report } = buildFixture();
    const firstDecision = report.decisions[0]!;
    report.decisions.push(firstDecision, { decisionId: "unknown-decision", status: "applied" });

    const result = validateDirectionConsumptionReport(artifact, report);
    expect(result.status).toBe("failed");
    expect(result.errors.some((error) => error.includes("duplicate outcome"))).toBe(true);
    expect(result.errors.some((error) => error.includes("unknown ID"))).toBe(true);
  });

  it("rejects a report linked to a different artifact", () => {
    const { artifact, report } = buildFixture();
    report.artifactId = "different-artifact";
    const result = validateDirectionConsumptionReport(artifact, report);
    expect(result.status).toBe("failed");
    expect(result.errors).toContain("Report artifactId does not match the supplied Direction Artifact.");
  });

  it("does not validate coverage against an invalid Direction Artifact", () => {
    const { report } = buildFixture();
    const result = validateDirectionConsumptionReport({}, report);
    expect(result.status).toBe("failed");
    expect(result.errors[0]).toContain("Direction Artifact validation must pass");
  });
});
