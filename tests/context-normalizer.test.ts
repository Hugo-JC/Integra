import { describe, expect, it } from 'vitest';
import {
  ContextValidationError,
  normalizeDirectionContext,
  normalizeDirectionContextDetailed,
} from '../src/modules/context/index.js';
import type { DirectionContextInput } from '../src/contracts/direction-context.js';

describe('normalizeDirectionContext', () => {
  it('normalizes whitespace, Unicode and preserves first-seen list order', () => {
    const result = normalizeDirectionContext({
      projectType: '  Product   landing page ',
      audience: ' Founders ',
      primaryGoal: ' Explain   the product ',
      platform: ' Web ',
      goals: [' Convert visitors ', 'convert VISITORS', 'Build trust'],
      constraints: [' Mobile first '],
      preferences: [' Calm   visual tone '],
      stack: [' React ', 'TypeScript'],
      structuredConstraints: [],
    });

    expect(result.projectType).toBe('Product landing page');
    expect(result.goals).toEqual(['Convert visitors', 'Build trust']);
    expect(result.missingInformation).toContain('facts.viewports');
    expect(result.missingInformation).toContain('facts.language');
  });

  it('normalizes Unicode to NFC before case-insensitive deduplication', () => {
    const result = normalizeDirectionContext({
      goals: ['Café', 'Cafe\u0301'],
    });
    expect(result.goals).toEqual(['Café']);
  });

  it('treats null, absent and whitespace-only values as missing', () => {
    const result = normalizeDirectionContext({
      projectType: null,
      audience: '   ',
      goals: [' ', ''],
      constraints: null,
      preferences: [],
      stack: undefined,
      structuredConstraints: [],
      facts: {
        language: null,
        viewports: [],
      },
    });

    expect(result.missingInformation).toContain('projectType');
    expect(result.missingInformation).toContain('audience');
    expect(result.missingInformation).toContain('goals');
    expect(result.missingInformation).toContain('constraints');
    expect(result.missingInformation).toContain('facts.language');
    expect(result.missingInformation).toContain('facts.viewports');
  });

  it('reports missing information without inventing values', () => {
    const result = normalizeDirectionContext({} as DirectionContextInput);
    expect(result).toEqual({
      goals: [],
      constraints: [],
      preferences: [],
      stack: [],
      structuredConstraints: [],
      missingInformation: [
        'projectType', 'audience', 'primaryGoal', 'platform',
        'goals', 'constraints', 'preferences', 'stack',
        'facts.viewports', 'facts.accessibilityTarget', 'facts.language',
        'facts.existingTokens', 'facts.prohibitedClaims', 'facts.requiredContent',
      ],
    });
  });

  it('normalizes structured facts and applies deterministic deduplication', () => {
    const result = normalizeDirectionContext({
      facts: {
        viewports: [
          { width: 1440, height: 900 },
          { width: 1440, height: 900 },
          { width: 390, height: 844 },
        ],
        existingTokens: [
          { name: 'brand-primary', value: '#123456', kind: 'color' },
          { name: 'BRAND-PRIMARY', value: '#123456', kind: 'color' },
        ],
        requiredContent: ['Primary action', 'primary ACTION'],
        prohibitedClaims: ['Testimonials'],
      },
      structuredConstraints: [{
        id: 'required-action',
        path: 'content.required',
        operator: 'includes',
        value: 'Primary action',
        hard: true,
      }],
    });

    expect(result.facts?.viewports).toEqual([
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]);
    expect(result.facts?.existingTokens).toHaveLength(1);
    expect(result.facts?.requiredContent).toEqual(['Primary action']);
    expect(result.structuredConstraints).toHaveLength(1);
  });

  it('aggregates unknown keys and malformed values with machine-readable paths', () => {
    const result = normalizeDirectionContextDetailed({
      audince: 'Founders',
      audience: 42,
      goals: 'Convert visitors',
      facts: {
        viewports: [{ width: -1, height: 900 }],
        extra: true,
      },
    });

    expect(result.context).toBeDefined();
    expect(result.issues.map((issue) => issue.code)).toEqual([
      'unknown-field',
      'invalid-type',
      'invalid-type',
      'unknown-field',
      'invalid-value',
    ]);
    expect(result.issues.map((issue) => issue.path)).toContain('audince');
    expect(result.issues.map((issue) => issue.path)).toContain('facts.extra');
  });

  it('throws one aggregate error through the strict typed API', () => {
    try {
      normalizeDirectionContext({
        audience: 42,
        goals: 'wrong',
      } as unknown as DirectionContextInput);
      throw new Error('Expected ContextValidationError.');
    } catch (error) {
      expect(error).toBeInstanceOf(ContextValidationError);
      expect((error as ContextValidationError).issues).toHaveLength(2);
    }
  });

  it('reports empty structured constraint values instead of silently dropping them', () => {
    const result = normalizeDirectionContextDetailed({
      structuredConstraints: [{
        id: 'empty-value',
        path: 'design.colorPalette',
        operator: 'equals',
        value: '   ',
        hard: true,
      }],
    });
    expect(result.issues.some((issue) => issue.path === 'structuredConstraints[0].value')).toBe(true);
  });

  it('rejects excessive input sizes', () => {
    const result = normalizeDirectionContextDetailed({
      goals: Array.from({ length: 101 }, (_, index) => 'Goal ' + index),
    });
    expect(result.issues.some((issue) => issue.code === 'limit-exceeded')).toBe(true);
  });

  it('is idempotent for an already normalized context', () => {
    const first = normalizeDirectionContext({
      projectType: 'Landing page',
      goals: ['Explain product'],
      facts: { viewports: [{ width: 390, height: 844 }] },
      structuredConstraints: [],
    });
    const { missingInformation: _missingInformation, ...roundTripInput } = first;
    const second = normalizeDirectionContext(roundTripInput);
    expect(second).toEqual(first);
  });
});
