import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Ajv2020 } from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';
import { normalizeDirectionContext } from '../src/modules/context/index.js';
import {
  generateProductLandingDirection,
  serializeDirectionArtifact,
} from '../src/modules/direction/index.js';
import type { DirectionContextInput } from '../src/contracts/direction-context.js';

const fixture = JSON.parse(
  readFileSync(resolve(process.cwd(), 'fixtures/brief-data/DL-001.json'), 'utf8'),
) as { directionContext: DirectionContextInput };
const schema = JSON.parse(
  readFileSync(resolve(process.cwd(), 'schemas/direction-artifact.schema.json'), 'utf8'),
);
const validate = new Ajv2020({ allErrors: true, strict: true }).compile(schema);
const context = normalizeDirectionContext(fixture.directionContext);

describe('DL-001 deterministic Direction Engine', () => {
  it('produces all eight direction areas and a schema-valid artifact', () => {
    const result = generateProductLandingDirection(context);
    expect(Object.keys(result.artifact.sections)).toHaveLength(8);
    expect(validate(result.artifact), JSON.stringify(validate.errors)).toBe(true);
    expect(result.artifact.schemaVersion).toBe('1.1.0');
    expect(result.artifact.context.facts?.viewports).toEqual([
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]);
  });

  it('preserves prohibited claims and required content in the decisions', () => {
    const { artifact } = generateProductLandingDirection(context);
    const componentDecisions = artifact.sections.componentPrinciples.decisions;
    expect(componentDecisions.find((decision) => decision.id === 'required-content')?.value)
      .toContain('no-fabricated-testimonials');
    expect(componentDecisions.find((decision) => decision.id === 'prohibited-claims')?.value)
      .toContain('testimonials');
  });

  it('does not invent visual preferences, brand colors, language or stack', () => {
    const { artifact } = generateProductLandingDirection(context);
    expect(artifact.sections.visualIdentity.decisions[0].source).toBe('default');
    expect(artifact.sections.colorSystem.decisions[0].source).toBe('default');
    expect(artifact.sections.implementationGuidance.decisions[1].value)
      .toContain('Language not specified');
    expect(artifact.sections.implementationGuidance.decisions[0].value)
      .toContain('receiving agent');
    expect(artifact.context.missingInformation).toContain('facts.language');
    expect(artifact.context.missingInformation).toContain('facts.existingTokens');
  });

  it('produces byte-identical canonical JSON for identical normalized input', () => {
    const first = generateProductLandingDirection(context);
    const second = generateProductLandingDirection(context);
    expect(first.artifact.artifactId).toBe(second.artifact.artifactId);
    expect(serializeDirectionArtifact(first.artifact))
      .toBe(serializeDirectionArtifact(second.artifact));
    expect(serializeDirectionArtifact(first.artifact)).not.toContain('generatedAt');
  });

  it('withholds a decision when a hard context constraint conflicts', () => {
    const constrained = normalizeDirectionContext({
      ...fixture.directionContext,
      structuredConstraints: [{
        id: 'do-not-use-any-palette',
        path: 'design.colorPalette',
        operator: 'equals',
        value: 'blocked-palette',
        hard: true,
      }],
    });
    const result = generateProductLandingDirection(constrained);
    expect(result.artifact.sections.colorSystem.decisions).toHaveLength(0);
    expect(result.diagnostics.some((item) => item.code === 'hard-constraint-conflict')).toBe(true);
  });
});
