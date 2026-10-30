import { describe, expect, it } from 'vitest';
import { resolveDecisionWithConstraints } from '../src/modules/direction/index.js';
import type { DesignDecision } from '../src/modules/direction/types.js';
import type { StructuredDirectionConstraint } from '../src/contracts/direction-context.js';

describe('resolveDecisionWithConstraints', () => {
  const hardColorConstraint: StructuredDirectionConstraint = {
    id: 'avoid-red-palette',
    path: 'design.colorPalette',
    operator: 'not-equals',
    value: 'red',
    hard: true,
  };

  it('does not allow an AI candidate to bypass a hard structured constraint', () => {
    const ai: DesignDecision = {
      id: 'ai-red',
      targetPath: 'design.colorPalette',
      value: 'red',
      source: 'ai',
      reason: 'Provider proposal.',
    };
    const rule: DesignDecision = {
      id: 'rule-blue',
      targetPath: 'design.colorPalette',
      value: 'blue',
      source: 'rule',
      reason: 'Compatible deterministic option.',
    };

    const result = resolveDecisionWithConstraints([ai, rule], [hardColorConstraint]);
    expect(result.status).toBe('resolved');
    expect(result.selected).toBe(rule);
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0].constraintIds).toEqual(['avoid-red-palette']);
  });

  it('returns inconclusive when every candidate violates a hard constraint', () => {
    const candidate: DesignDecision = {
      id: 'red',
      targetPath: 'design.colorPalette',
      value: 'red',
      source: 'rule',
      reason: 'Rule candidate.',
    };
    const result = resolveDecisionWithConstraints([candidate], [hardColorConstraint]);
    expect(result.status).toBe('inconclusive');
    expect(result.selected).toBeUndefined();
    expect(result.rejected[0].status).toBe('conflicted');
  });

  it('returns inconclusive when a candidate cannot be checked against hard constraints', () => {
    const candidate: DesignDecision = {
      id: 'unscoped',
      value: 'red',
      source: 'ai',
      reason: 'No target path.',
    };
    const result = resolveDecisionWithConstraints([candidate], [hardColorConstraint]);
    expect(result.status).toBe('inconclusive');
    expect(result.rejected[0].status).toBe('inconclusive');
  });

  it('keeps the existing source precedence after constraint filtering', () => {
    const brief: DesignDecision = {
      id: 'brief',
      targetPath: 'design.colorPalette',
      value: 'blue',
      source: 'brief',
      reason: 'Explicit brief.',
    };
    const rule: DesignDecision = {
      id: 'rule',
      targetPath: 'design.colorPalette',
      value: 'blue',
      source: 'rule',
      reason: 'Deterministic rule.',
    };
    const result = resolveDecisionWithConstraints([rule, brief], []);
    expect(result.selected).toBe(brief);
  });
});
