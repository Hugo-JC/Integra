import type { DirectionContextSnapshot } from '../direction/types.js';
import type { DirectionContextInput } from './types.js';

const SCALAR_FIELDS = ['projectType', 'audience', 'primaryGoal', 'platform'] as const;
const ARRAY_FIELDS = ['goals', 'constraints', 'preferences', 'stack'] as const;
const ALLOWED_FIELDS = new Set<string>([...SCALAR_FIELDS, ...ARRAY_FIELDS]);

function normalizeText(value: string, field: string): string {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (normalized.length === 0) {
    throw new TypeError(`Context field "${field}" must not be empty.`);
  }
  return normalized;
}

function normalizeStringList(value: unknown, field: string): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new TypeError(`Context field "${field}" must be an array of strings.`);
  }

  const result: string[] = [];
  const seen = new Set<string>();
  value.forEach((item: unknown, index: number) => {
    if (typeof item !== 'string') {
      throw new TypeError(`Context field "${field}" item ${index} must be a string.`);
    }
    const normalized = normalizeText(item, `${field}[${index}]`);
    const key = normalized.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(normalized);
    }
  });
  return result;
}

/**
 * Normalizes caller-provided direction context without inferring missing facts.
 * Whitespace is collapsed, list duplicates are removed case-insensitively,
 * and absent fields are reported in missingInformation in a stable order.
 */
export function normalizeDirectionContext(input: unknown): DirectionContextSnapshot {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('Direction context must be an object.');
  }

  const source = input as Record<string, unknown>;
  for (const key of Object.keys(source)) {
    if (!ALLOWED_FIELDS.has(key)) {
      throw new TypeError(`Unknown direction context field "${key}".`);
    }
  }

  const context: DirectionContextSnapshot = {
    goals: normalizeStringList(source.goals, 'goals'),
    constraints: normalizeStringList(source.constraints, 'constraints'),
    preferences: normalizeStringList(source.preferences, 'preferences'),
    stack: normalizeStringList(source.stack, 'stack'),
    missingInformation: [],
  };

  for (const field of SCALAR_FIELDS) {
    const value = source[field];
    if (value === undefined || value === '') {
      context.missingInformation.push(field);
      continue;
    }
    if (typeof value !== 'string') {
      throw new TypeError(`Context field "${field}" must be a string.`);
    }
    context[field] = normalizeText(value, field);
  }

  for (const field of ARRAY_FIELDS) {
    if (source[field] === undefined || (Array.isArray(source[field]) && source[field].length === 0)) {
      context.missingInformation.push(field);
    }
  }

  return context;
}

export type { DirectionContextInput };
