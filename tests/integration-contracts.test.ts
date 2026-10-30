import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Ajv2020 } from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

const readJson = (path: string): unknown => JSON.parse(
  readFileSync(resolve(process.cwd(), path), 'utf8'),
);

const consumptionSchema = readJson('schemas/direction-consumption-report.schema.json');
const experimentSchema = readJson('schemas/design-experiment.schema.json');
const exampleConsumption = readJson(
  'fixtures/contracts/direction-consumption-report.example.json',
);
const ajv = new Ajv2020({ allErrors: true, strict: true });
const validateConsumption = ajv.compile(consumptionSchema as object);
const validateExperiment = ajv.compile(experimentSchema as object);
const hash = 'a'.repeat(64);

function validExperiment(): Record<string, unknown> {
  return {
    schemaVersion: '1.0.0',
    experimentId: 'dl001-agent-pilot',
    scenarioId: 'DL-001',
    briefSha256: hash,
    controls: {
      agentId: 'site-agent',
      agentVersion: '1.0.0',
      modelId: 'model-under-test',
      modelVersion: 'snapshot-under-test',
      configurationSha256: hash,
    },
    runs: {
      baseline: {
        outputPath: 'runs/baseline/site',
        outputSha256: hash,
        evidence: [{
          id: 'baseline-desktop',
          kind: 'screenshot',
          path: 'runs/baseline/desktop.png',
          sha256: hash,
          description: 'Desktop viewport capture.',
        }],
      },
      integraGuided: {
        outputPath: 'runs/guided/site',
        outputSha256: hash,
        evidence: [{
          id: 'guided-desktop',
          kind: 'screenshot',
          path: 'runs/guided/desktop.png',
          sha256: hash,
          description: 'Desktop viewport capture.',
        }],
        directionArtifact: {
          artifactId: 'direction-dl001-example',
          schemaVersion: '1.1.0',
          path: 'runs/guided/direction.json',
          sha256: hash,
        },
      },
    },
    evaluation: {
      criteria: [{
        criterion: 'product-focus',
        baseline: { status: 'partial', note: 'Evidence-backed evaluation note.' },
        integraGuided: { status: 'pass', note: 'Evidence-backed evaluation note.' },
        baselineEvidenceIds: ['baseline-desktop'],
        integraGuidedEvidenceIds: ['guided-desktop'],
      }],
      summary: 'Paired evaluation summary with no unsupported aggregate score.',
    },
    limitations: ['Illustrative data used only to test the contract.'],
  };
}

describe('agent integration contracts', () => {
  it('validates the illustrative agent consumption report', () => {
    expect(validateConsumption(exampleConsumption), JSON.stringify(validateConsumption.errors))
      .toBe(true);
  });

  it('requires explanations when a decision is adapted or not applied', () => {
    const report = structuredClone(exampleConsumption) as {
      decisions: Array<Record<string, unknown>>;
    };
    report.decisions.push({ decisionId: 'typography-hierarchy', status: 'not-applied' });
    expect(validateConsumption(report)).toBe(false);
    expect(validateConsumption.errors?.some((error) => error.keyword === 'required')).toBe(true);
  });

  it('rejects unsupported consumption states and undeclared fields', () => {
    const report = structuredClone(exampleConsumption) as Record<string, unknown>;
    report.unexpected = true;
    expect(validateConsumption(report)).toBe(false);
  });

  it('validates a paired experiment with shared controls and a guided artifact reference', () => {
    expect(validateExperiment(validExperiment()), JSON.stringify(validateExperiment.errors))
      .toBe(true);
  });

  it('requires the Integra-guided run to identify the exact Direction Artifact', () => {
    const experiment = validExperiment();
    const runs = experiment.runs as Record<string, Record<string, unknown>>;
    delete runs.integraGuided.directionArtifact;
    expect(validateExperiment(experiment)).toBe(false);
  });

  it('rejects invalid hashes', () => {
    const experiment = validExperiment();
    experiment.briefSha256 = 'not-a-sha';
    expect(validateExperiment(experiment)).toBe(false);
  });
});
