import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Ajv2020 } from 'ajv/dist/2020.js';
import type {
  DirectionArtifact,
  DirectionSection,
} from '../src/modules/direction/types.js';
import { describe, expect, it } from 'vitest';

const schema = JSON.parse(
  readFileSync(resolve(process.cwd(), 'schemas/direction-artifact.schema.json'), 'utf8'),
);
const ajv = new Ajv2020({ allErrors: true, strict: true });
const validate = ajv.compile(schema);

const section: DirectionSection = {
  summary: 'A concise direction summary.',
  decisions: [{
    id: 'visual-tone',
    value: 'confident and calm',
    source: 'brief',
    reason: 'Explicitly requested in the brief.',
  }],
  recommendations: [{
    id: 'hierarchy',
    category: 'typography',
    label: '[R]',
    text: 'Use a clear type scale.',
    rationale: 'The interface contains several information levels.',
  }],
};

const validArtifact: DirectionArtifact = {
  schemaVersion: '1.0.0',
  artifactId: 'direction-dl-001',
  engineVersion: '0.2.0',
  context: {
    projectType: 'product landing page',
    goals: ['Explain the product clearly'],
    constraints: ['Must support mobile layouts'],
    preferences: ['Confident visual tone'],
    stack: ['React', 'TypeScript'],
    missingInformation: [],
  },
  sections: {
    visualIdentity: section,
    colorSystem: section,
    typography: section,
    layoutComposition: section,
    componentPrinciples: section,
    motionInteraction: section,
    accessibility: section,
    implementationGuidance: section,
  },
};

describe('Direction Artifact schema', () => {
  it('accepts a complete provider-independent artifact', () => {
    expect(validate(validArtifact), JSON.stringify(validate.errors)).toBe(true);
  });

  it('requires all eight direction areas', () => {
    const incomplete = structuredClone(validArtifact);
    delete (incomplete.sections as Record<string, unknown>).accessibility;
    expect(validate(incomplete)).toBe(false);
  });

  it('rejects unknown decision provenance', () => {
    const invalid = structuredClone(validArtifact);
    (invalid.sections.visualIdentity.decisions[0] as { source: string }).source = 'provider';
    expect(validate(invalid)).toBe(false);
  });

  it('keeps heuristic recommendations explicitly marked [R]', () => {
    const invalid = structuredClone(validArtifact);
    (invalid.sections.typography.recommendations[0] as { label: string }).label = 'WCAG';
    expect(validate(invalid)).toBe(false);
  });

  it('allows incomplete context to be reported instead of fabricated', () => {
    const incompleteContext = structuredClone(validArtifact);
    incompleteContext.context.missingInformation = ['Target audience'];
    delete incompleteContext.context.audience;
    expect(validate(incompleteContext)).toBe(true);
  });
});
