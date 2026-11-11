import { describe, expect, it } from 'vitest';
import { Ajv2020 } from 'ajv/dist/2020.js';
import reviewPackageSchema from '../../schemas/live-inspector-review-package.schema.json' with { type: 'json' };
import { createLiveInspectorReviewPackage } from '../../src/modules/live-inspector/review-package.js';
import type { LiveElementChangeSet } from '../../src/modules/live-inspector/types.js';

const changes: LiveElementChangeSet[] = [{
  schemaVersion: '1.0.0',
  target: {
    selector: '#primary-action',
    tagName: 'BUTTON',
    accessibleName: 'Try demo',
    originalClasses: 'button button-primary',
    componentHint: 'src/components/Hero.tsx (unverified hint)',
  },
  originalClasses: 'button button-primary',
  updatedClasses: 'button button-primary is-preview',
  addedClasses: ['is-preview'],
  removedClasses: [],
  styleChanges: [{ property: 'background-color', before: 'rgb(20, 20, 20)', after: 'rgb(30, 64, 175)' }],
  evidence: {
    contrastRatio: 5.12,
    contrastRequired: 4.5,
    contrastPass: true,
    contrastNote: 'Runtime estimate from computed styles.',
  },
}];

const ajv = new Ajv2020({ allErrors: true, strict: true });
const validateReviewPackage = ajv.compile(reviewPackageSchema);

const baseInput = {
  capturedAt: '2026-11-11T16:00:00.000Z',
  page: { origin: 'http://localhost:5173', pathname: '/landing' },
  viewport: { width: 1440, height: 900, devicePixelRatio: 1 },
  mode: 'advanced' as const,
  changes,
  staleTargetCount: 0,
  prompt: 'Review the source-level implementation for this preview.',
};

describe('Live Inspector structured review package', () => {
  it('preserves the viewport, mode, target changes and review boundary', () => {
    const result = createLiveInspectorReviewPackage(baseInput);
    expect(result).toMatchObject({
      schemaVersion: '1.1.0',
      page: baseInput.page,
      viewport: baseInput.viewport,
      mode: 'advanced',
      targetCount: 1,
      staleTargetCount: 0,
      sourceMapping: { status: 'unresolved', confidence: 'low' },
      approval: {
        sourceMutation: 'none',
        requiredBeforeSourceChanges: true,
        scope: 'exact-proposed-diff',
      },
    });
    expect(result.changes).toEqual(changes);
    expect(result.prompt).toContain('source-level implementation');
  });

  it('conforms to the published JSON Schema', () => {
    const result = createLiveInspectorReviewPackage(baseInput);
    expect(validateReviewPackage(result)).toBe(true);
  });

  it('records detached targets and warns that their previews were excluded', () => {
    const result = createLiveInspectorReviewPackage({
      ...baseInput,
      staleTargetCount: 2,
    });
    expect(result).toMatchObject({ targetCount: 1, staleTargetCount: 2 });
    expect(result.limitations.some((item) => item.includes('Detached DOM targets were excluded'))).toBe(true);
  });

  it('rejects negative or fractional stale target counts', () => {
    expect(() => createLiveInspectorReviewPackage({
      ...baseInput,
      staleTargetCount: -1,
    })).toThrow(RangeError);
    expect(() => createLiveInspectorReviewPackage({
      ...baseInput,
      staleTargetCount: 1.5,
    })).toThrow(RangeError);
  });

  it('marks an empty package instead of inventing review targets', () => {
    const result = createLiveInspectorReviewPackage({ ...baseInput, changes: [], prompt: '' });
    expect(result.targetCount).toBe(0);
    expect(result.changes).toEqual([]);
  });

  it('rejects timestamps that are not canonical ISO strings', () => {
    expect(() => createLiveInspectorReviewPackage({ ...baseInput, capturedAt: 'yesterday' }))
      .toThrow(/ISO 8601/);
  });

  it('rejects incomplete page and viewport metadata', () => {
    expect(() => createLiveInspectorReviewPackage({
      ...baseInput,
      page: { origin: '', pathname: 'landing' },
    })).toThrow(/origin and an absolute pathname/);
    expect(() => createLiveInspectorReviewPackage({
      ...baseInput,
      viewport: { width: 0, height: 900, devicePixelRatio: 1 },
    })).toThrow(RangeError);
  });

  it('rejects unsupported inspector modes', () => {
    expect(() => createLiveInspectorReviewPackage({
      ...baseInput,
      mode: 'canvas' as unknown as 'advanced',
    })).toThrow(/mode must be quick or advanced/);
  });
});
