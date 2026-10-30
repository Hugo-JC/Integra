import { describe, expect, it } from 'vitest';
import { normalizeDirectionContext } from '../src/modules/context/index.js';

describe('normalizeDirectionContext', () => {
  it('normalizes whitespace and preserves first-seen list order', () => {
    const result = normalizeDirectionContext({
      projectType: '  Product   landing page ',
      audience: ' Founders ',
      primaryGoal: ' Explain   the product ',
      platform: ' Web ',
      goals: [' Convert visitors ', 'convert VISITORS', 'Build trust'],
      constraints: [' Mobile first '],
      preferences: [' Calm   visual tone '],
      stack: [' React ', 'TypeScript'],
    });

    expect(result).toEqual({
      projectType: 'Product landing page',
      audience: 'Founders',
      primaryGoal: 'Explain the product',
      platform: 'Web',
      goals: ['Convert visitors', 'Build trust'],
      constraints: ['Mobile first'],
      preferences: ['Calm visual tone'],
      stack: ['React', 'TypeScript'],
      missingInformation: [],
    });
  });

  it('reports missing information without inventing values', () => {
    expect(normalizeDirectionContext({})).toEqual({
      goals: [],
      constraints: [],
      preferences: [],
      stack: [],
      missingInformation: [
        'projectType', 'audience', 'primaryGoal', 'platform',
        'goals', 'constraints', 'preferences', 'stack',
      ],
    });
  });

  it('tracks absent lists independently from supplied values', () => {
    const result = normalizeDirectionContext({ goals: ['Ship a prototype'] });
    expect(result.missingInformation).not.toContain('goals');
    expect(result.missingInformation).toContain('constraints');
    expect(result.goals).toEqual(['Ship a prototype']);
  });

  it('rejects non-object input and unknown keys', () => {
    expect(() => normalizeDirectionContext(null)).toThrow('must be an object');
    expect(() => normalizeDirectionContext({ audince: 'Founders' })).toThrow('Unknown direction context field');
  });

  it('rejects malformed scalar and list values', () => {
    expect(() => normalizeDirectionContext({ audience: 42 })).toThrow('must be a string');
    expect(() => normalizeDirectionContext({ goals: 'Convert visitors' })).toThrow('must be an array');
    expect(() => normalizeDirectionContext({ stack: ['React', 7] })).toThrow('must be a string');
    expect(() => normalizeDirectionContext({ platform: '   ' })).toThrow('must not be empty');
  });
});
