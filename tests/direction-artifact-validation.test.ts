import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { normalizeDirectionContext } from '../src/modules/context/index.js';
import {
  generateProductLandingDirection,
  validateDirectionArtifact,
} from '../src/modules/direction/index.js';
import type { DirectionArtifact } from '../src/modules/direction/types.js';
import type { DirectionContextInput } from '../src/contracts/direction-context.js';

const fixture = JSON.parse(
  readFileSync(resolve(process.cwd(), 'fixtures/brief-data/DL-001.json'), 'utf8'),
) as { directionContext: DirectionContextInput };

function createArtifact(): DirectionArtifact {
  return generateProductLandingDirection(
    normalizeDirectionContext(fixture.directionContext),
  ).artifact;
}

describe('validateDirectionArtifact', () => {
  it('passes all four layers for the generated DL-001 artifact', () => {
    const result = validateDirectionArtifact(createArtifact());
    expect(result.status).toBe('passed');
    expect(Object.values(result.checks).map((item) => item.status))
      .toEqual(['passed', 'passed', 'passed', 'passed']);
    expect(result.findings).toHaveLength(0);
  });

  it('does not run deeper layers when structural validation fails', () => {
    const invalid = createArtifact() as unknown as Record<string, unknown>;
    delete invalid.schemaVersion;
    const result = validateDirectionArtifact(invalid);
    expect(result.status).toBe('failed');
    expect(result.checks.structural.status).toBe('failed');
    expect(result.checks.semantic.status).toBe('not_run');
    expect(result.checks.constraints.status).toBe('not_run');
    expect(result.checks.consistency.status).toBe('not_run');
  });

  it('rejects duplicate decision and recommendation identifiers', () => {
    const artifact = createArtifact();
    artifact.sections.colorSystem.decisions.push({
      ...artifact.sections.visualIdentity.decisions[0],
    });
    artifact.sections.colorSystem.recommendations[0].id =
      artifact.sections.visualIdentity.recommendations[0].id;
    const result = validateDirectionArtifact(artifact);
    expect(result.checks.semantic.status).toBe('failed');
    expect(result.findings.some((item) => item.id === 'direction-semantic-invalid')).toBe(true);
  });

  it('rejects recommendations placed in the wrong direction area', () => {
    const artifact = createArtifact();
    artifact.sections.colorSystem.recommendations[0].category = 'typography';
    const result = validateDirectionArtifact(artifact);
    expect(result.checks.semantic.status).toBe('failed');
  });

  it('fails when a decision violates a hard structured constraint', () => {
    const artifact = createArtifact();
    artifact.context.structuredConstraints.push({
      id: 'blocked-palette',
      path: 'design.colorPalette',
      operator: 'equals',
      value: 'a-different-palette',
      hard: true,
    });
    const result = validateDirectionArtifact(artifact);
    expect(result.checks.constraints.status).toBe('failed');
    expect(result.status).toBe('failed');
  });

  it('returns inconclusive when a hard constraint has no decision to evaluate', () => {
    const artifact = createArtifact();
    artifact.context.structuredConstraints.push({
      id: 'required-platform',
      path: 'project.platform',
      operator: 'equals',
      value: 'web',
      hard: true,
    });
    const result = validateDirectionArtifact(artifact);
    expect(result.checks.constraints.status).toBe('inconclusive');
    expect(result.status).toBe('inconclusive');
  });

  it('rejects brief provenance that points to missing normalized context', () => {
    const artifact = createArtifact();
    const decision = artifact.sections.layoutComposition.decisions[0];
    decision.sourcePath = 'context.facts.language';
    const result = validateDirectionArtifact(artifact);
    expect(result.checks.consistency.status).toBe('failed');
  });
});
