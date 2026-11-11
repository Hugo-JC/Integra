import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { normalizeDirectionContext } from '../src/modules/context/index.js';
import {
  buildVisualIntelligenceBundle,
  serializeVisualIntelligenceBundle,
  validateVisualIntelligenceBundle,
  VisualIntelligenceBundleError,
  type VisualIntelligenceRequest,
} from '../src/modules/direction/index.js';
import { generateProductLandingDirection } from '../src/modules/direction/product-landing.js';
import type { DirectionContextInput } from '../src/contracts/direction-context.js';

const readJson = (path: string): unknown => JSON.parse(
  readFileSync(resolve(process.cwd(), path), 'utf8'),
);
const briefFixture = readJson('fixtures/brief-data/DL-001.json') as {
  directionContext: DirectionContextInput;
};
const taskFixture = readJson('fixtures/contracts/visual-intelligence-bundle.dl001.json') as {
  scenarioId: string;
  primaryTask: string;
  mode: 'persuade' | 'operate' | 'read' | 'experience';
};
const directionArtifact = generateProductLandingDirection(
  normalizeDirectionContext(briefFixture.directionContext),
).artifact;
const baseRequest: VisualIntelligenceRequest = {
  directionArtifact,
  primaryTask: taskFixture.primaryTask,
  mode: taskFixture.mode,
};

describe('Visual Intelligence Bundle', () => {
  it('assembles the validated direction and explicitly supplied contextual knowledge', () => {
    const bundle = buildVisualIntelligenceBundle({
      ...baseRequest,
      nicheId: 'portfolio-editorial-education',
    });

    expect(bundle.schemaVersion).toBe('1.1.0');
    expect(bundle.task).toMatchObject({
      primaryTask: taskFixture.primaryTask,
      mode: 'persuade',
      nicheId: 'portfolio-editorial-education',
    });
    expect(bundle.direction).toEqual(directionArtifact);
    expect(bundle.directionArtifactId).toBe(directionArtifact.artifactId);
    expect(bundle.knowledge.selection).toMatchObject({
      mode: 'persuade',
      nicheId: 'portfolio-editorial-education',
    });
    expect(validateVisualIntelligenceBundle(bundle)).toEqual({ status: 'passed', errors: [] });
  });

  it('is deterministic in both bundle ID and canonical JSON serialization', () => {
    const first = buildVisualIntelligenceBundle(baseRequest);
    const second = buildVisualIntelligenceBundle(baseRequest);

    expect(second.bundleId).toBe(first.bundleId);
    expect(serializeVisualIntelligenceBundle(second)).toBe(serializeVisualIntelligenceBundle(first));
    expect(serializeVisualIntelligenceBundle(first)).not.toContain('generatedAt');
  });

  it('keeps an omitted niche unmapped instead of inventing one', () => {
    const bundle = buildVisualIntelligenceBundle(baseRequest);

    expect(bundle.task.nicheId).toBeNull();
    expect(bundle.knowledge.selection.nicheId).toBeNull();
    expect(bundle.knowledge.selection.nicheMappingStatus).toBe('unmapped');
  });

  it('keeps an omitted mode explicit and leaves layout results as candidates only', () => {
    const bundle = buildVisualIntelligenceBundle({
      ...baseRequest,
      mode: undefined,
    });

    expect(bundle.task.mode).toBeNull();
    expect(bundle.knowledge.selection.mode).toBeNull();
    expect(bundle.knowledge.layoutPatterns.every((candidate) =>
      !('decision' in candidate) && !('approved' in candidate),
    )).toBe(true);
    expect(bundle.consumerGuidance.candidatePolicy).toBe('review-before-adoption');
  });

  it('passes an explicit mode through to the knowledge resolver filters', () => {
    const bundle = buildVisualIntelligenceBundle({
      ...baseRequest,
      mode: 'read',
      query: 'editorial article typography',
    });

    expect(bundle.knowledge.selection.mode).toBe('read');
    expect(bundle.knowledge.layoutPatterns.every((candidate) => candidate.item.mode === 'read')).toBe(true);
    expect(bundle.knowledge.tokenSystems.every((candidate) =>
      candidate.item.modes.includes('read'),
    )).toBe(true);
  });

  it('preserves catalog-only sources as investigation leads', () => {
    const bundle = buildVisualIntelligenceBundle({
      ...baseRequest,
      nicheId: 'coffee-artisan-food',
    });
    const blueBottle = bundle.knowledge.references.find((candidate) =>
      candidate.item.id === 'blue-bottle',
    );

    expect(blueBottle?.verificationStatus).toBe('catalog-only');
    expect(blueBottle?.item.verificationStatus).toBe('catalog-only');
  });

  it('includes page-scoped observations without upgrading partial documentation to verified evidence', () => {
    const bundle = buildVisualIntelligenceBundle({
      ...baseRequest,
      nicheId: 'saas-developer-ai',
      query: 'task-first hierarchy compact navigation responsive layout',
    });

    expect(bundle.knowledge.schemaVersion).toBe('1.1.0');
    expect(bundle.knowledge.observations).toHaveLength(2);
    expect(bundle.knowledge.observations.every((candidate) =>
      candidate.verificationStatus === 'partial' &&
      candidate.item.verificationStatus === 'partial' &&
      candidate.item.evidenceType === 'official-documentation',
    )).toBe(true);
    expect(bundle.knowledge.references.every((candidate) =>
      candidate.verificationStatus === 'catalog-only',
    )).toBe(true);
  });

  it('keeps knowledge candidates separate from Direction Artifact decisions', () => {
    const bundle = buildVisualIntelligenceBundle(baseRequest);
    const decisions = Object.values(bundle.direction.sections).flatMap((section) => section.decisions);

    expect(bundle.direction).toEqual(directionArtifact);
    expect(bundle.knowledge).not.toHaveProperty('decisions');
    expect(bundle.knowledge.layoutPatterns.every((candidate) => candidate.item.id)).toBe(true);
    expect(decisions).toEqual(Object.values(directionArtifact.sections).flatMap((section) => section.decisions));
  });

  it('rejects invalid Direction Artifacts through the existing validator', () => {
    const invalidArtifact = structuredClone(directionArtifact);
    invalidArtifact.schemaVersion = '0.0.0' as '1.1.0';

    expect(() => buildVisualIntelligenceBundle({
      ...baseRequest,
      directionArtifact: invalidArtifact,
    })).toThrowError(VisualIntelligenceBundleError);
    expect(validateVisualIntelligenceBundle({
      ...buildVisualIntelligenceBundle(baseRequest),
      direction: invalidArtifact,
    }).status).toBe('failed');
  });

  it('rejects a missing or whitespace-only primary task with a typed error', () => {
    expect(() => buildVisualIntelligenceBundle({
      ...baseRequest,
      primaryTask: ' \t ',
    })).toThrowError(expect.objectContaining({
      name: 'VisualIntelligenceBundleError',
      code: 'primary-task-required',
    }));
  });

  it('does not fetch or mutate the supplied artifact or knowledge catalog', () => {
    const before = structuredClone(directionArtifact);
    const baselinePack = buildVisualIntelligenceBundle(baseRequest).knowledge;
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    try {
      buildVisualIntelligenceBundle(baseRequest);
      expect(directionArtifact).toEqual(before);
      expect(buildVisualIntelligenceBundle(baseRequest).knowledge).toEqual(baselinePack);
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it('rejects observation provenance that differs between the candidate and its record', () => {
    const bundle = buildVisualIntelligenceBundle({
      ...baseRequest,
      nicheId: 'saas-developer-ai',
      query: 'task-first hierarchy compact navigation responsive layout',
    });
    const altered = structuredClone(bundle);
    altered.knowledge.observations[0].verificationStatus = 'verified';

    expect(validateVisualIntelligenceBundle(altered).errors).toContain(
      'Observation candidate verificationStatus must match its item.',
    );
  });

  it('rejects changes to bundle relationships or canonical identity', () => {
    const bundle = buildVisualIntelligenceBundle(baseRequest);

    expect(validateVisualIntelligenceBundle({
      ...bundle,
      directionArtifactId: 'different-artifact',
    }).errors).toContain('directionArtifactId must match direction.artifactId.');
    expect(validateVisualIntelligenceBundle({
      ...bundle,
      bundleId: 'visual-intelligence-0000000000000000',
    }).errors).toContain('bundleId does not match the canonical bundle content.');
  });
});
