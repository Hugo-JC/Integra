import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parsePilotPrepareArgs } from "../src/cli/pilot.js";
import { writeRunOutput } from "../src/cli/run-output.js";
import { generateDirectionFromInput } from "../src/cli/direction.js";
import {
  buildVisualIntelligenceBundle,
  serializeDirectionArtifact,
  serializeVisualIntelligenceBundle,
} from "../src/modules/direction/index.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const scenario = "DL-001";
const productTask = "Explain the product value proposition and invite visitors to try a demo";

const PILOT_README = [
  "# DL-001 — First Agent Pilot",
  "",
  "This folder is a reproducible manual comparison pack. It does not run an external agent, deploy a site or claim that the generated design is good.",
  "",
  "## Package contents",
  "- brief.json and brief.md: canonical synthetic brief.",
  "- TASK-PROMPT.md: identical task prompt for both conditions.",
  "- direction.json: validated Integra Direction Artifact.",
  "- bundle.json: validated Visual Intelligence Bundle 1.1.0.",
  "- GUIDED-AGENT-INSTRUCTIONS.md: instructions for the guided condition only.",
  "- acceptance-criteria.json: criteria shared by both runs.",
  "- manifest.json: input/artifact hashes and generation metadata.",
  "",
  "## Paired run protocol",
  "1. Record agent provider, name/version, model, tool permissions, temperature/seed (if exposed), date and host.",
  "2. Create two clean workspaces from the same base project snapshot. If there is no starter project, use the same empty-directory/setup procedure in both.",
  "3. Baseline: give the agent brief.md and TASK-PROMPT.md only. Do not provide direction.json, bundle.json or the guided instructions.",
  "4. Integra-guided: reset to a second clean copy of the same base snapshot. Give it the same brief.md and TASK-PROMPT.md, plus direction.json, bundle.json and GUIDED-AGENT-INSTRUCTIONS.md.",
  "5. Keep model, agent version, permissions, dependencies, task wording and time budget identical. Do not feed outputs from one run into the other.",
  "6. Capture at least 1440×900 and 390×844. Save each implementation, logs and screenshots in separate baseline/ and integra-guided/ folders.",
  "7. Evaluate both against acceptance-criteria.json without seeing which run is guided, where practical. Record pass, fail or inconclusive with evidence. Agent self-report is not independent evidence.",
  "8. Compare gains, regressions, inconclusive checks and time/cost differences. Do not invent a composite score.",
  "",
  "## Controls",
  "- All Orbit Desk content is synthetic. Do not present testimonials, customer counts, certifications or unprovided commercial results as facts.",
  "- The two viewports are minimum checks, not full responsive coverage.",
  "- Source scanning is not a browser test. Bundle consumption is not implementation proof, accessibility proof or visual QA.",
  "- Do not alter fixtures/artifacts between paired runs. If a change is required, regenerate the pack and restart both conditions.",
].join("\n");

const TASK_PROMPT = [
  "Create the Orbit Desk product landing page described in the supplied DL-001 brief.",
  "",
  "Build a complete, responsive and usable implementation in the current workspace. Prioritize a clear value proposition, the primary demo action, the three required product capabilities and the intended audience. Preserve the existing project stack and conventions when a starter project exists. Do not add dependencies unless necessary and justified.",
  "",
  "Do not use placeholder copy, fabricate testimonials, customer counts, certifications or commercial outcomes, or rely on external images for essential information. Verify at least 1440×900 and 390×844, and report what was actually built and tested.",
  "",
  "Keep the implementation focused on the product task rather than adding decorative sections without a clear purpose.",
].join("\n");

const GUIDED_INSTRUCTIONS = [
  "# Integra-guided condition — agent instructions",
  "",
  "Use these instructions only for the Integra-guided run. The baseline condition must not receive this file or the Direction Artifact / Visual Intelligence Bundle.",
  "",
  "## Required sequence",
  "1. Read brief.md and TASK-PROMPT.md.",
  "2. Validate direction.json against the Direction Artifact schema supported by this Integra revision. Stop and report if validation fails.",
  "3. Read every one of the eight Direction Artifact sections. Preserve hard constraints and product facts. Do not elevate defaults or recommendations into user-supplied facts.",
  "4. Validate bundle.json against the Visual Intelligence Bundle schema. If validation is unavailable in the host, disclose that it was not run.",
  "5. Treat catalog-only sources as research leads, partial observations as partial, and token/layout patterns as candidates rather than mandatory decisions.",
  "6. Do not copy reference source code, copy, imagery, branding or distinctive page compositions.",
  "7. Implement the same task and constraints as the baseline run. Preserve the existing stack, if present.",
  "8. Return outcomes for all decision and recommendation IDs in direction.json. Explain adaptations and omissions. This report is agent self-report, not independent quality proof.",
  "",
  "## Implementation expectations",
  "- Make the primary task and content hierarchy obvious.",
  "- Use a product-specific visual thesis; do not default to generic hero/card patterns unless content and task justify them.",
  "- Define reusable semantic tokens consistent with the project.",
  "- Implement responsive transformations, not merely a scaled desktop layout.",
  "- Include visible focus, keyboard-operable controls and reduced-motion alternatives when motion is present.",
  "- Include loading, empty, error or success states where the behavior needs them.",
  "- Do not invent content or claims to make the page appear more complete.",
  "",
  "## Completion report",
  "- Changed files and concise implementation notes.",
  "- All Direction decisions/recommendations with applied/adapted/deferred/not-applied outcomes and reasons.",
  "- Build/test commands and actual results.",
  "- Known limitations and untested states.",
  "- Screenshot references at 1440×900 and 390×844.",
  "- Checks marked not_run or inconclusive.",
  "",
  "Never describe an unrun check as passed.",
].join("\n");

const ACCEPTANCE = {
  schemaVersion: "1.0.0",
  scenarioId: scenario,
  dataKind: "synthetic-demo-data",
  evaluationProtocol: {
    outcomes: ["pass", "fail", "inconclusive"],
    evidenceRequired: true,
    evaluatorShouldBeBlindToCondition: true,
    agentSelfReportIsIndependentEvidence: false,
  },
  requiredContent: [
    { id: "product-name", requirement: "Orbit Desk is named clearly.", evidence: "Rendered page text" },
    { id: "value-proposition", requirement: "A concise value proposition explains the product and who it helps.", evidence: "Rendered page text and hierarchy" },
    { id: "primary-action", requirement: "One primary action clearly invites visitors to try the demo.", evidence: "Rendered control and interaction" },
    { id: "weekly-planning", requirement: "Weekly planning capability is explained.", evidence: "Rendered page content" },
    { id: "tasks", requirement: "Task capability is explained.", evidence: "Rendered page content" },
    { id: "progress", requirement: "Progress-tracking capability is explained.", evidence: "Rendered page content" },
    { id: "audience-fit", requirement: "A statement identifies advanced students, freelancers and small teams.", evidence: "Rendered page content" },
    { id: "trust-without-fabrication", requirement: "No invented testimonials, customer counts or certifications.", evidence: "All visible claims reviewed" },
    { id: "no-placeholder-copy", requirement: "No placeholder or lorem ipsum text remains.", evidence: "Rendered page content" },
    { id: "essential-content-self-contained", requirement: "Essential information does not depend on externally hosted images.", evidence: "Asset and network inspection" },
    { id: "responsive-wide", requirement: "Usable at 1440×900 without horizontal overflow.", evidence: "Browser screenshot and document scroll width" },
    { id: "responsive-mobile", requirement: "Usable at 390×844 without horizontal overflow.", evidence: "Browser screenshot and document scroll width" },
    { id: "keyboard-primary-flow", requirement: "Primary action/navigation are keyboard-operable and show visible focus.", evidence: "Manual keyboard test" },
  ],
  prohibitedClaims: ["testimonials", "customer counts", "certifications", "unprovided commercial results", "fabricated product capabilities"],
  viewports: [
    { width: 1440, height: 900, required: true },
    { width: 390, height: 844, required: true },
  ],
  comparisonDimensions: [
    "content correctness",
    "task clarity",
    "visual distinctiveness and coherence",
    "responsive usability",
    "interaction and keyboard access",
    "implementation reliability",
    "performance and asset behavior",
    "time and tool cost",
  ],
};

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

const HELP = [
  "Integra DL-001 Pilot Pack",
  "",
  "Usage:",
  "  npm run pilot:prepare",
  "  npm run pilot:prepare -- --scenario DL-001 --out .integra/runs/pilots/DL-001",
  "",
  "Creates a manual paired baseline vs Integra-guided agent test pack.",
  "The output path must remain inside .integra/runs/.",
  "",
].join("\n");

async function main(): Promise<void> {
  const options = parsePilotPrepareArgs(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(HELP);
    return;
  }

  const briefJsonPath = resolve(projectRoot, "fixtures/brief-data/DL-001.json");
  const briefMarkdownPath = resolve(projectRoot, "scenarios/DL-001-product-landing/brief.md");
  const sourceInstructionsPath = resolve(projectRoot, "examples/agent-consumer/AGENT-INSTRUCTIONS.md");
  const [briefJson, briefMarkdown, sourceInstructions] = await Promise.all([
    readFile(briefJsonPath, "utf8"),
    readFile(briefMarkdownPath, "utf8"),
    readFile(sourceInstructionsPath, "utf8"),
  ]);

  const generation = generateDirectionFromInput(JSON.parse(briefJson) as unknown, scenario);
  if (generation.validation.status !== "passed" || generation.generation.diagnostics.length > 0) {
    throw new Error("DL-001 Direction Artifact did not pass all validation layers; pilot pack was not written.");
  }

  const direction = generation.generation.artifact;
  const bundle = buildVisualIntelligenceBundle({
    directionArtifact: direction,
    primaryTask: "Explain the product value proposition and invite visitors to try a demo",
    mode: "persuade",
    query: "product landing page clear value proposition primary demo action audience section responsive hierarchy",
  });

  const files: Record<string, string> = {
    "brief.json": briefJson.trimEnd() + "\n",
    "brief.md": briefMarkdown.trimEnd() + "\n",
    "TASK-PROMPT.md": TASK_PROMPT.trim() + "\n",
    "direction.json": serializeDirectionArtifact(direction),
    "bundle.json": serializeVisualIntelligenceBundle(bundle),
    "GUIDED-AGENT-INSTRUCTIONS.md": GUIDED_INSTRUCTIONS.trim() + "\n",
    "acceptance-criteria.json": JSON.stringify(ACCEPTANCE, null, 2) + "\n",
    "README.md": PILOT_README.trim() + "\n",
  };

  const manifest = {
    schemaVersion: "1.0.0",
    scenarioId: scenario,
    preparedAt: new Date().toISOString(),
    engineVersion: direction.engineVersion,
    directionArtifactId: direction.artifactId,
    directionSchemaVersion: direction.schemaVersion,
    bundleId: bundle.bundleId,
    bundleSchemaVersion: bundle.schemaVersion,
    inputs: {
      briefJsonSha256: sha256(briefJson),
      briefMarkdownSha256: sha256(briefMarkdown),
      agentInstructionsSha256: sha256(sourceInstructions),
      taskPromptSha256: sha256(files["TASK-PROMPT.md"]!),
    },
    outputs: Object.fromEntries(
      Object.entries(files).map(([name, content]) => [
        name,
        { sha256: sha256(content), bytes: Buffer.byteLength(content) },
      ]),
    ),
    integrity: {
      allGeneratedFilesValidatedBeforeWrite: true,
      directionValidation: generation.validation.status,
      bundleValidation: "passed",
      agentExecution: "not-run",
      browserVerification: "not-run",
    },
    limitations: [
      "This command prepares artifacts only; it does not invoke an external agent.",
      "Generated direction and bundle quality must be evaluated through the paired pilot.",
      "Screenshots, runtime behavior, browser checks and agent completion are not generated or verified by this command.",
      "All Orbit Desk scenario content is synthetic and must not be represented as real business evidence.",
    ],
  };
  files["manifest.json"] = JSON.stringify(manifest, null, 2) + "\n";

  const outputPaths: string[] = [];
  for (const [name, content] of Object.entries(files)) {
    const target = await writeRunOutput(
      process.cwd(),
      options.outputPath.replace(/\/+$/, "") + "/" + name,
      content,
      [briefJsonPath, briefMarkdownPath, sourceInstructionsPath],
    );
    outputPaths.push(target);
  }

  process.stdout.write(
    "DL-001 pilot pack prepared · " + outputPaths.length + " files · Direction " +
    direction.schemaVersion + " · Bundle " + bundle.schemaVersion + "\n",
  );
  process.stdout.write("Output: " + resolve(process.cwd(), options.outputPath) + "\n");
  process.stdout.write("Agent execution: not run · Browser verification: not run\n");
}

main().catch((error: unknown) => {
  process.stderr.write(
    "Pilot preparation failed: " + (error instanceof Error ? error.message : String(error)) + "\n",
  );
  process.exitCode = 1;
});
