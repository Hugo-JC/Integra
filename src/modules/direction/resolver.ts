import type {
  StructuredDirectionConstraint,
  DirectionConstraintOperator,
} from '../../contracts/direction-context.js';
import type { DesignDecision } from './types.js';
import { resolveDecision } from './provenance.js';

export interface RejectedDecision<T> {
  decision: DesignDecision<T>;
  constraintIds: string[];
  status: 'conflicted' | 'inconclusive';
  reason: string;
}

export interface DecisionResolution<T> {
  status: 'resolved' | 'inconclusive';
  selected?: DesignDecision<T>;
  rejected: RejectedDecision<T>[];
  advisoryConstraintIds: string[];
}

function equalValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function containsValue(candidate: unknown, expected: unknown): boolean | undefined {
  if (Array.isArray(candidate)) {
    return candidate.some((item) => equalValue(item, expected));
  }
  if (typeof candidate === 'string' && typeof expected === 'string') {
    return candidate.includes(expected);
  }
  return undefined;
}

function evaluateOperator(
  operator: DirectionConstraintOperator,
  candidate: unknown,
  expected: unknown,
): boolean | undefined {
  switch (operator) {
    case 'equals':
      return equalValue(candidate, expected);
    case 'not-equals':
      return !equalValue(candidate, expected);
    case 'includes':
      return containsValue(candidate, expected);
    case 'excludes': {
      const included = containsValue(candidate, expected);
      return included === undefined ? undefined : !included;
    }
    case 'min':
      return typeof candidate === 'number' && typeof expected === 'number'
        ? candidate >= expected
        : undefined;
    case 'max':
      return typeof candidate === 'number' && typeof expected === 'number'
        ? candidate <= expected
        : undefined;
    case 'one-of':
      if (!Array.isArray(expected)) return undefined;
      if (Array.isArray(candidate)) {
        return candidate.every((item) => expected.some((option) => equalValue(item, option)));
      }
      return expected.some((option) => equalValue(candidate, option));
    case 'none-of':
      if (!Array.isArray(expected)) return undefined;
      if (Array.isArray(candidate)) {
        return candidate.every((item) => !expected.some((option) => equalValue(item, option)));
      }
      return !expected.some((option) => equalValue(candidate, option));
  }
}

/**
 * Resolves candidates only after checking applicable hard constraints.
 * Free-form text is never interpreted as a machine constraint.
 */
export function resolveDecisionWithConstraints<T>(
  candidates: readonly DesignDecision<T>[],
  constraints: readonly StructuredDirectionConstraint[],
): DecisionResolution<T> {
  const hardConstraints = constraints.filter((constraint) => constraint.hard);
  const advisoryConstraintIds = constraints
    .filter((constraint) => !constraint.hard)
    .map((constraint) => constraint.id);

  if (candidates.length === 0) {
    return { status: 'inconclusive', rejected: [], advisoryConstraintIds };
  }

  const eligible: DesignDecision<T>[] = [];
  const rejected: RejectedDecision<T>[] = [];

  for (const decision of candidates) {
    if (!decision.targetPath) {
      if (hardConstraints.length > 0) {
        rejected.push({
          decision,
          constraintIds: hardConstraints.map((constraint) => constraint.id),
          status: 'inconclusive',
          reason: 'Candidate has no targetPath, so hard constraints cannot be evaluated safely.',
        });
      } else {
        eligible.push(decision);
      }
      continue;
    }

    const applicable = hardConstraints.filter(
      (constraint) => constraint.path === decision.targetPath,
    );
    const conflicts: string[] = [];
    const unresolved: string[] = [];

    for (const constraint of applicable) {
      const result = evaluateOperator(
        constraint.operator,
        decision.value,
        constraint.value,
      );
      if (result === false) conflicts.push(constraint.id);
      if (result === undefined) unresolved.push(constraint.id);
    }

    if (conflicts.length > 0) {
      rejected.push({
        decision,
        constraintIds: conflicts,
        status: 'conflicted',
        reason: 'Candidate violates one or more hard structured constraints.',
      });
    } else if (unresolved.length > 0) {
      rejected.push({
        decision,
        constraintIds: unresolved,
        status: 'inconclusive',
        reason: 'Candidate and hard constraint value types cannot be compared safely.',
      });
    } else {
      eligible.push(decision);
    }
  }

  if (eligible.length === 0) {
    return { status: 'inconclusive', rejected, advisoryConstraintIds };
  }

  return {
    status: 'resolved',
    selected: resolveDecision(eligible),
    rejected,
    advisoryConstraintIds,
  };
}
