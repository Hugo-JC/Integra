import { Ajv2020 } from "ajv/dist/2020.js";
import type { ValidateFunction } from "ajv";
import type { FormatsPlugin } from "ajv-formats";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { normalizeDirectionContextDetailed } from "../src/modules/context/index.js";
import { generateProductLandingDirection, validateDirectionArtifact } from "../src/modules/direction/index.js";

const addFormats: FormatsPlugin = createRequire(import.meta.url)("ajv-formats");
const root = process.cwd();
const readJson = (filePath: string): unknown =>
  JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
const ajv = new Ajv2020({
  allErrors: true,
  strict: true,
  allowUnionTypes: true,
});
const reportSchema = readJson("schemas/report.schema.json");
const scenarioSchema = readJson("schemas/scenario.schema.json");
const findingsSchema = readJson("schemas/expected-findings.schema.json");
const directionSchema = readJson("schemas/direction-artifact.schema.json");
const consumptionSchema = readJson("schemas/direction-consumption-report.schema.json");
const experimentSchema = readJson("schemas/design-experiment.schema.json");
addFormats(ajv);
const validateReport = ajv.compile(reportSchema as object);
const validateScenario = ajv.compile(scenarioSchema as object);
const validateFindings = ajv.compile(findingsSchema as object);
const validateDirection = ajv.compile(directionSchema as object);
const validateConsumption = ajv.compile(consumptionSchema as object);
ajv.compile(experimentSchema as object);

function assertValid(
  label: string,
  value: unknown,
  validator: ValidateFunction,
): void {
  if (!validator(value)) {
    const details = (validator.errors ?? [])
      .map((error) => (error.instancePath || "/") + " " + error.message)
      .join("\n");
    throw new Error(label + " is invalid:\n" + details);
  }
}

const index = readJson("scenarios/index.json") as {
  scenarioManifests?: unknown;
};
if (!Array.isArray(index.scenarioManifests))
  throw new Error("scenarios/index.json must contain scenarioManifests[]");
if (index.scenarioManifests.length !== 5)
  throw new Error(
    "Expected exactly 5 scenarios, received " + index.scenarioManifests.length,
  );

const ids = new Set<string>();
for (const manifestPath of index.scenarioManifests) {
  if (
    typeof manifestPath !== "string" ||
    manifestPath.includes("..") ||
    path.isAbsolute(manifestPath)
  ) {
    throw new Error("Unsafe manifest path: " + String(manifestPath));
  }
  const manifest = readJson(manifestPath) as {
    id: string;
    briefPath: string;
    fixturePaths?: string[];
    evaluation: { criteria: { weight: number }[] };
  };
  assertValid(manifestPath, manifest, validateScenario);
  if (ids.has(manifest.id))
    throw new Error("Duplicate scenario ID: " + manifest.id);
  ids.add(manifest.id);
  const weightSum = manifest.evaluation.criteria.reduce(
    (sum, item) => sum + item.weight,
    0,
  );
  if (weightSum !== 100)
    throw new Error(
      manifest.id + " criterion weights must sum to 100; received " + weightSum,
    );
  const referencedPaths = [
    manifest.briefPath,
    ...(manifest.fixturePaths ?? []),
  ];
  for (const relativePath of referencedPaths) {
    if (relativePath.includes("..") || path.isAbsolute(relativePath))
      throw new Error(manifest.id + " contains unsafe path: " + relativePath);
    if (!fs.existsSync(path.join(root, relativePath)))
      throw new Error(
        manifest.id + " references missing file: " + relativePath,
      );
  }
}

for (const filePath of [
  "fixtures/expected-findings/DL-004.json",
  "fixtures/expected-findings/DL-005.json",
]) {
  assertValid(filePath, readJson(filePath), validateFindings);
}
assertValid(
  "fixtures/reports/example-inconclusive.json",
  readJson("fixtures/reports/example-inconclusive.json"),
  validateReport,
);
assertValid(
  "Example Direction Consumption Report",
  readJson("fixtures/contracts/direction-consumption-report.example.json"),
  validateConsumption,
);

const dl001 = readJson("fixtures/brief-data/DL-001.json") as {
  directionContext?: unknown;
};
const contextResult = normalizeDirectionContextDetailed(dl001.directionContext);
if (!contextResult.context || contextResult.issues.length > 0) {
  const details = contextResult.issues
    .map((issue) => issue.path + " [" + issue.code + "] " + issue.message)
    .join("\n");
  throw new Error("DL-001 directionContext is invalid:\n" + details);
}
const directionResult = generateProductLandingDirection(contextResult.context);
assertValid("Generated DL-001 Direction Artifact", directionResult.artifact, validateDirection);
const directionValidation = validateDirectionArtifact(directionResult.artifact);
if (directionValidation.status !== "passed") {
  const details = Object.values(directionValidation.checks)
    .map((check) => check.id + ": " + check.status + " — " + check.description)
    .join("\n");
  throw new Error("DL-001 Direction Artifact validation did not pass:\n" + details);
}
if (directionResult.diagnostics.length > 0) {
  throw new Error(
    "DL-001 Direction Engine has unresolved hard constraints: " +
    directionResult.diagnostics.map((item) => item.decisionId).join(", "),
  );
}

console.log(
  "Integra fixtures valid: " + ids.size + " scenarios, 6 schemas compiled, all referenced paths exist.",
);
console.log(
  "DL-001 deterministic Direction Artifact generated and passed all four validation layers (8 sections).",
);
console.log(
  "Example Direction Consumption Report validates against its versioned contract.",
);
console.log(
  "Note: this validates contracts and direction definitions, not generated UI quality or the React fixture build.",
);
