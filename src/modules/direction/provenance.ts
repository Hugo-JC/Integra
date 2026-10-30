import type { DesignDecision, DecisionSource } from './types.js';

const SOURCE_PRIORITY: Record<DecisionSource, number> = {
  brief: 4,
  rule: 3,
  ai: 2,
  default: 1,
};

/** Resolves competing values without allowing AI or defaults to override a brief or rule. */
export function resolveDecision<T>(candidates: readonly DesignDecision<T>[]): DesignDecision<T> {
  if (candidates.length === 0) throw new Error('At least one decision candidate is required.');

  return candidates.reduce((current, candidate) => {
    const currentPriority = SOURCE_PRIORITY[current.source];
    const candidatePriority = SOURCE_PRIORITY[candidate.source];
    if (candidatePriority > currentPriority) return candidate;
    // Preserve input order for equal precedence to keep resolution deterministic.
    return current;
  });
}

export function createDefaultDecision<T>(
  id: string,
  value: T,
  reason: string,
): DesignDecision<T> {
  return { id, value, source: 'default', reason };
}
