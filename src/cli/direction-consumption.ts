import { Ajv2020 } from "ajv/dist/2020.js";
import directionConsumptionSchema from "../../schemas/direction-consumption-report.schema.json" with { type: "json" };
import { validateDirectionArtifact } from "../modules/direction/artifact-validation.js";
import type { DirectionArtifact } from "../modules/direction/types.js";
import type { DirectionConsumptionReport } from "../contracts/direction-consumption.js";

export interface DirectionConsumptionValidationResult {
  status: "passed" | "failed";
  errors: string[];
  coverage: {
    expectedDecisions: number;
    reportedDecisions: number;
    expectedRecommendations: number;
    reportedRecommendations: number;
  };
}

const ajv = new Ajv2020({ allErrors: true, strict: true });
const validateSchema = ajv.compile<DirectionConsumptionReport>(directionConsumptionSchema);

function describeSchemaErrors(): string[] {
  return (validateSchema.errors ?? []).map((error) =>
    (error.instancePath || "/") + " " + (error.message ?? "schema violation"),
  );
}

function collectUniqueIds(
  values: readonly { id: string }[],
  label: string,
  errors: string[],
): Set<string> {
  const ids = new Set<string>();
  for (const value of values) {
    if (ids.has(value.id)) errors.push(label + " contains duplicate ID: " + value.id);
    ids.add(value.id);
  }
  return ids;
}

function compareCoverage(
  expected: Set<string>,
  actual: readonly { decisionId?: string; recommendationId?: string }[],
  key: "decisionId" | "recommendationId",
  label: string,
  errors: string[],
): void {
  const seen = new Set<string>();
  for (const outcome of actual) {
    const id = outcome[key]!;
    if (seen.has(id)) errors.push(label + " contains duplicate outcome: " + id);
    seen.add(id);
    if (!expected.has(id)) errors.push(label + " contains unknown ID: " + id);
  }
  for (const id of expected) {
    if (!seen.has(id)) errors.push(label + " is missing outcome for: " + id);
  }
}

/**
 * Validates both the report schema and one-to-one outcome coverage against the
 * supplied Direction Artifact. The result validates reporting completeness,
 * not the truth or quality of the implementation described by the agent.
 */
export function validateDirectionConsumptionReport(
  artifactInput: unknown,
  reportInput: unknown,
): DirectionConsumptionValidationResult {
  const errors: string[] = [];
  const emptyCoverage = {
    expectedDecisions: 0,
    reportedDecisions: 0,
    expectedRecommendations: 0,
    reportedRecommendations: 0,
  };

  const artifactValidation = validateDirectionArtifact(artifactInput);
  if (artifactValidation.status !== "passed") {
    errors.push("Direction Artifact validation must pass before report coverage can be checked.");
    return { status: "failed", errors, coverage: emptyCoverage };
  }

  if (!validateSchema(reportInput)) {
    errors.push(...describeSchemaErrors());
    return { status: "failed", errors, coverage: emptyCoverage };
  }

  const artifact = artifactInput as DirectionArtifact;
  const report = reportInput as DirectionConsumptionReport;
  if (report.artifactId !== artifact.artifactId) {
    errors.push("Report artifactId does not match the supplied Direction Artifact.");
  }

  const decisionValues = Object.values(artifact.sections).flatMap((section) => section.decisions);
  const recommendationValues = Object.values(artifact.sections).flatMap((section) => section.recommendations);
  const expectedDecisionIds = collectUniqueIds(decisionValues, "Direction Artifact decisions", errors);
  const expectedRecommendationIds = collectUniqueIds(recommendationValues, "Direction Artifact recommendations", errors);

  compareCoverage(expectedDecisionIds, report.decisions, "decisionId", "Decision outcomes", errors);
  compareCoverage(expectedRecommendationIds, report.recommendations, "recommendationId", "Recommendation outcomes", errors);

  return {
    status: errors.length ? "failed" : "passed",
    errors,
    coverage: {
      expectedDecisions: expectedDecisionIds.size,
      reportedDecisions: report.decisions.length,
      expectedRecommendations: expectedRecommendationIds.size,
      reportedRecommendations: report.recommendations.length,
    },
  };
}
