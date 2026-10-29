export interface ScoredCriterion {
  id: string;
  weight: number;
  score: number | null;
}

export interface DetectionMetrics {
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number | null;
  recall: number | null;
  f1: number | null;
  falseDiscoveryRate: number | null;
}

function assertCount(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer`);
  }
}

/**
 * Calculates a weighted score only when every criterion is scored.
 * Returns null for incomplete evaluation so missing scores cannot look like success.
 */
export function calculateWeightedScore(criteria: readonly ScoredCriterion[]): number | null {
  if (criteria.length === 0) throw new Error('At least one criterion is required');

  const totalWeight = criteria.reduce((total, criterion) => {
    if (!Number.isInteger(criterion.weight) || criterion.weight < 1 || criterion.weight > 100) {
      throw new RangeError(`Invalid weight for criterion ${criterion.id}`);
    }
    if (criterion.score !== null && (!Number.isFinite(criterion.score) || criterion.score < 0 || criterion.score > 100)) {
      throw new RangeError(`Invalid score for criterion ${criterion.id}`);
    }
    return total + criterion.weight;
  }, 0);

  if (totalWeight !== 100) throw new Error(`Criterion weights must sum to 100 (received ${totalWeight})`);
  if (criteria.some((criterion) => criterion.score === null)) return null;

  const weightedTotal = criteria.reduce((total, criterion) => total + (criterion.score as number) * criterion.weight, 0);
  return Math.round((weightedTotal / 100) * 100) / 100;
}

/**
 * Calculates counts-based detection metrics for an annotated reference set.
 * Undefined denominators return null; falseDiscoveryRate is not the same as statistical FPR.
 */
export function calculateDetectionMetrics(
  truePositives: number,
  falsePositives: number,
  falseNegatives: number,
): DetectionMetrics {
  assertCount('truePositives', truePositives);
  assertCount('falsePositives', falsePositives);
  assertCount('falseNegatives', falseNegatives);

  const precisionDenominator = truePositives + falsePositives;
  const recallDenominator = truePositives + falseNegatives;
  const precision = precisionDenominator === 0 ? null : truePositives / precisionDenominator;
  const recall = recallDenominator === 0 ? null : truePositives / recallDenominator;
  const f1 = precision === null || recall === null || precision + recall === 0
    ? (precision === 0 && recall === 0 ? 0 : null)
    : (2 * precision * recall) / (precision + recall);
  const falseDiscoveryRate = precisionDenominator === 0 ? null : falsePositives / precisionDenominator;

  return { truePositives, falsePositives, falseNegatives, precision, recall, f1, falseDiscoveryRate };
}

export interface GateInput {
  score: number | null;
  minimumScore: number;
  hardGateFailures?: number;
  unresolvedRequiredChecks?: number;
  runtimeError?: boolean;
}

/** Applies hard gates before score; missing required evidence never produces a pass. */
export function determineGateStatus(input: GateInput): 'passed' | 'failed' | 'inconclusive' | 'error' {
  if (input.runtimeError) return 'error';
  if ((input.hardGateFailures ?? 0) > 0) return 'failed';
  if (input.score !== null && (!Number.isFinite(input.score) || input.score < 0 || input.score > 100)) {
    throw new RangeError('score must be null or between 0 and 100');
  }
  if (!Number.isInteger(input.minimumScore) || input.minimumScore < 0 || input.minimumScore > 100) {
    throw new RangeError('minimumScore must be an integer from 0 to 100');
  }
  if (input.unresolvedRequiredChecks !== undefined && (!Number.isInteger(input.unresolvedRequiredChecks) || input.unresolvedRequiredChecks < 0)) {
    throw new RangeError('unresolvedRequiredChecks must be a non-negative integer');
  }
  if ((input.unresolvedRequiredChecks ?? 0) > 0 || input.score === null) return 'inconclusive';
  if (input.score < input.minimumScore) return 'failed';
  return 'passed';
}
