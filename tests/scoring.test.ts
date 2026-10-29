import { describe, expect, it } from 'vitest';
import { calculateDetectionMetrics, calculateWeightedScore, determineGateStatus } from '../src/lab/scoring.js';

describe('calculateWeightedScore', () => {
  it('calculates weighted scores without hiding missing values', () => {
    expect(calculateWeightedScore([
      { id: 'a', weight: 60, score: 90 },
      { id: 'b', weight: 40, score: 80 },
    ])).toBe(86);
    expect(calculateWeightedScore([
      { id: 'a', weight: 60, score: 90 },
      { id: 'b', weight: 40, score: null },
    ])).toBeNull();
  });

  it('rejects weights that do not sum to 100 and out-of-range scores', () => {
    expect(() => calculateWeightedScore([{ id: 'a', weight: 99, score: 90 }])).toThrow(/sum to 100/);
    expect(() => calculateWeightedScore([{ id: 'a', weight: 100, score: 101 }])).toThrow(/Invalid score/);
  });
});

describe('calculateDetectionMetrics', () => {
  it('calculates precision, recall, F1 and false discovery rate', () => {
    const result = calculateDetectionMetrics(2, 1, 2);
    expect(result.precision).toBeCloseTo(2 / 3);
    expect(result.recall).toBeCloseTo(1 / 2);
    expect(result.f1).toBeCloseTo(4 / 7);
    expect(result.falseDiscoveryRate).toBeCloseTo(1 / 3);
  });

  it('uses null for undefined denominators', () => {
    const result = calculateDetectionMetrics(0, 0, 0);
    expect(result.precision).toBeNull();
    expect(result.recall).toBeNull();
    expect(result.f1).toBeNull();
    expect(result.falseDiscoveryRate).toBeNull();
  });

  it('rejects negative or non-integer counts', () => {
    expect(() => calculateDetectionMetrics(-1, 0, 0)).toThrow();
    expect(() => calculateDetectionMetrics(1.5, 0, 0)).toThrow();
  });
});

describe('determineGateStatus', () => {
  it('never lets score compensate for hard failures', () => {
    expect(determineGateStatus({ score: 99, minimumScore: 80, hardGateFailures: 1 })).toBe('failed');
  });

  it('does not pass when required checks are unresolved', () => {
    expect(determineGateStatus({ score: 95, minimumScore: 80, unresolvedRequiredChecks: 1 })).toBe('inconclusive');
    expect(determineGateStatus({ score: null, minimumScore: 80 })).toBe('inconclusive');
  });

  it('handles pass, score failure and runtime error separately', () => {
    expect(determineGateStatus({ score: 91, minimumScore: 80 })).toBe('passed');
    expect(determineGateStatus({ score: 79, minimumScore: 80 })).toBe('failed');
    expect(determineGateStatus({ score: 91, minimumScore: 80, runtimeError: true })).toBe('error');
  });
});
