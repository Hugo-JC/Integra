import type {
  ContextNormalizationResult,
  ContextValidationIssue,
  DirectionContextInput,
  DirectionContextSnapshot,
  DirectionConstraintOperator,
  DirectionConstraintPath,
  DirectionConstraintScalar,
  DirectionConstraintValue,
  DirectionDesignToken,
  DesignTokenKind,
  StructuredDirectionConstraint,
  ViewportTarget,
} from '../../contracts/direction-context.js';

const MAX_TEXT_LENGTH = 2_000;
const MAX_LIST_ITEMS = 100;
const MAX_VIEWPORTS = 20;

const FIELD_KINDS = {
  projectType: 'scalar',
  audience: 'scalar',
  primaryGoal: 'scalar',
  platform: 'scalar',
  goals: 'list',
  constraints: 'list',
  preferences: 'list',
  stack: 'list',
  facts: 'facts',
  structuredConstraints: 'structured-constraints',
} as const satisfies Record<keyof DirectionContextInput, string>;

const SCALAR_FIELDS = ['projectType', 'audience', 'primaryGoal', 'platform'] as const;
const LIST_FIELDS = ['goals', 'constraints', 'preferences', 'stack'] as const;
const FACT_FIELDS = [
  'viewports',
  'accessibilityTarget',
  'language',
  'existingTokens',
  'prohibitedClaims',
  'requiredContent',
] as const satisfies readonly (keyof NonNullable<DirectionContextInput['facts']>)[];

type ClassifiedContextField =
  | (typeof SCALAR_FIELDS)[number]
  | (typeof LIST_FIELDS)[number]
  | 'facts'
  | 'structuredConstraints';
type UnclassifiedContextField = Exclude<keyof DirectionContextInput, ClassifiedContextField>;
const contextFieldClassificationIsExhaustive: UnclassifiedContextField extends never ? true : never = true;
type UnclassifiedFactField = Exclude<
  keyof NonNullable<DirectionContextInput['facts']>,
  (typeof FACT_FIELDS)[number]
>;
const factFieldClassificationIsExhaustive: UnclassifiedFactField extends never ? true : never = true;

const CONSTRAINT_PATHS = new Set<DirectionConstraintPath>([
  'project.platform',
  'project.language',
  'accessibility.target',
  'viewport.targets',
  'design.tokens',
  'design.visualPersonality',
  'design.colorPalette',
  'design.typography',
  'content.required',
  'content.prohibitedClaims',
  'motion.reducedMotion',
  'implementation.stack',
]);

const CONSTRAINT_OPERATORS = new Set<DirectionConstraintOperator>([
  'equals',
  'not-equals',
  'includes',
  'excludes',
  'min',
  'max',
  'one-of',
  'none-of',
]);

const TOKEN_KINDS = new Set<DesignTokenKind>([
  'color',
  'typography',
  'spacing',
  'radius',
  'shadow',
  'other',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function addIssue(
  issues: ContextValidationIssue[],
  code: ContextValidationIssue['code'],
  path: string,
  message: string,
): void {
  issues.push({ code, path, message });
}

function reportUnknownKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  basePath: string,
  issues: ContextValidationIssue[],
): void {
  const allowedSet = new Set(allowed);
  Object.keys(value).sort().forEach((key) => {
    if (!allowedSet.has(key)) {
      addIssue(
        issues,
        'unknown-field',
        basePath ? basePath + '.' + key : key,
        'Unknown field.',
      );
    }
  });
}

function normalizeText(
  value: unknown,
  path: string,
  issues: ContextValidationIssue[],
): string | undefined {
  if (typeof value !== 'string') {
    addIssue(issues, 'invalid-type', path, 'Expected a string.');
    return undefined;
  }

  const normalized = value.normalize('NFC').trim().replace(/\s+/gu, ' ');
  if (normalized.length === 0) return undefined;
  if (normalized.length > MAX_TEXT_LENGTH) {
    addIssue(
      issues,
      'limit-exceeded',
      path,
      'Text must not exceed ' + MAX_TEXT_LENGTH + ' characters.',
    );
    return undefined;
  }
  return normalized;
}

function normalizeStringList(
  value: unknown,
  path: string,
  issues: ContextValidationIssue[],
): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    addIssue(issues, 'invalid-type', path, 'Expected an array of strings.');
    return [];
  }

  if (value.length > MAX_LIST_ITEMS) {
    addIssue(
      issues,
      'limit-exceeded',
      path,
      'List must not exceed ' + MAX_LIST_ITEMS + ' items.',
    );
  }

  const result: string[] = [];
  const seen = new Set<string>();
  value.slice(0, MAX_LIST_ITEMS).forEach((item: unknown, index: number) => {
    if (typeof item !== 'string') {
      addIssue(issues, 'invalid-type', path + '[' + index + ']', 'Expected a string.');
      return;
    }

    const normalized = normalizeText(item, path + '[' + index + ']', issues);
    if (!normalized) return;

    const key = normalized.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(normalized);
    }
  });
  return result;
}

function normalizeViewports(
  value: unknown,
  issues: ContextValidationIssue[],
): ViewportTarget[] {
  const path = 'facts.viewports';
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    addIssue(issues, 'invalid-type', path, 'Expected an array of viewport objects.');
    return [];
  }
  if (value.length > MAX_VIEWPORTS) {
    addIssue(
      issues,
      'limit-exceeded',
      path,
      'Viewport list must not exceed ' + MAX_VIEWPORTS + ' items.',
    );
  }

  const result: ViewportTarget[] = [];
  const seen = new Set<string>();
  value.slice(0, MAX_VIEWPORTS).forEach((item: unknown, index: number) => {
    const itemPath = path + '[' + index + ']';
    if (!isRecord(item)) {
      addIssue(issues, 'invalid-type', itemPath, 'Expected a viewport object.');
      return;
    }
    reportUnknownKeys(item, ['width', 'height'], itemPath, issues);
    const { width, height } = item;
    if (
      typeof width !== 'number' ||
      !Number.isInteger(width) ||
      width < 1 ||
      width > 10_000
    ) {
      addIssue(issues, 'invalid-value', itemPath + '.width', 'Width must be an integer from 1 to 10000.');
      return;
    }
    if (
      typeof height !== 'number' ||
      !Number.isInteger(height) ||
      height < 1 ||
      height > 10_000
    ) {
      addIssue(issues, 'invalid-value', itemPath + '.height', 'Height must be an integer from 1 to 10000.');
      return;
    }
    const key = width + 'x' + height;
    if (!seen.has(key)) {
      seen.add(key);
      result.push({ width, height });
    }
  });
  return result;
}

function normalizeTokens(
  value: unknown,
  issues: ContextValidationIssue[],
): DirectionDesignToken[] {
  const path = 'facts.existingTokens';
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    addIssue(issues, 'invalid-type', path, 'Expected an array of design tokens.');
    return [];
  }
  if (value.length > MAX_LIST_ITEMS) {
    addIssue(issues, 'limit-exceeded', path, 'Token list must not exceed ' + MAX_LIST_ITEMS + ' items.');
  }

  const result: DirectionDesignToken[] = [];
  const seen = new Set<string>();
  value.slice(0, MAX_LIST_ITEMS).forEach((item: unknown, index: number) => {
    const itemPath = path + '[' + index + ']';
    if (!isRecord(item)) {
      addIssue(issues, 'invalid-type', itemPath, 'Expected a design token object.');
      return;
    }
    reportUnknownKeys(item, ['name', 'value', 'kind'], itemPath, issues);
    const name = normalizeText(item.name, itemPath + '.name', issues);
    const tokenValue = normalizeText(item.value, itemPath + '.value', issues);
    let kind: DesignTokenKind | undefined;
    if (item.kind !== undefined && item.kind !== null) {
      if (typeof item.kind !== 'string' || !TOKEN_KINDS.has(item.kind as DesignTokenKind)) {
        addIssue(issues, 'invalid-value', itemPath + '.kind', 'Unknown design token kind.');
        return;
      }
      kind = item.kind as DesignTokenKind;
    }
    if (!name || !tokenValue) return;
    const key = (kind ?? 'unspecified') + ':' + name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(kind ? { name, value: tokenValue, kind } : { name, value: tokenValue });
    }
  });
  return result;
}

function normalizeConstraintValue(
  value: unknown,
  path: string,
  issues: ContextValidationIssue[],
): DirectionConstraintValue | undefined {
  const normalizeScalar = (item: unknown, itemPath: string): DirectionConstraintScalar | undefined => {
    if (typeof item === 'string') {
      const normalized = normalizeText(item, itemPath, issues);
      if (!normalized) {
        addIssue(issues, 'invalid-value', itemPath, 'Constraint string values must not be empty.');
      }
      return normalized;
    }
    if (typeof item === 'number' && Number.isFinite(item)) return item;
    if (typeof item === 'boolean') return item;
    addIssue(issues, 'invalid-type', itemPath, 'Expected a string, finite number, or boolean.');
    return undefined;
  };

  if (Array.isArray(value)) {
    if (value.length === 0 || value.length > MAX_LIST_ITEMS) {
      addIssue(issues, 'invalid-value', path, 'Constraint arrays must contain 1-' + MAX_LIST_ITEMS + ' values.');
      return undefined;
    }
    const values: DirectionConstraintScalar[] = [];
    value.forEach((item, index) => {
      const normalized = normalizeScalar(item, path + '[' + index + ']');
      if (normalized !== undefined) values.push(normalized);
    });
    return values.length === value.length ? values : undefined;
  }
  return normalizeScalar(value, path);
}

function normalizeStructuredConstraints(
  value: unknown,
  issues: ContextValidationIssue[],
): StructuredDirectionConstraint[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    addIssue(issues, 'invalid-type', 'structuredConstraints', 'Expected an array of structured constraints.');
    return [];
  }
  if (value.length > MAX_LIST_ITEMS) {
    addIssue(issues, 'limit-exceeded', 'structuredConstraints', 'Constraint list must not exceed ' + MAX_LIST_ITEMS + ' items.');
  }

  const result: StructuredDirectionConstraint[] = [];
  const ids = new Set<string>();
  value.slice(0, MAX_LIST_ITEMS).forEach((item: unknown, index: number) => {
    const path = 'structuredConstraints[' + index + ']';
    if (!isRecord(item)) {
      addIssue(issues, 'invalid-type', path, 'Expected a constraint object.');
      return;
    }
    reportUnknownKeys(item, ['id', 'path', 'operator', 'value', 'hard'], path, issues);

    const id = normalizeText(item.id, path + '.id', issues);
    if (!id) {
      addIssue(issues, 'invalid-value', path + '.id', 'Constraint ID must not be empty.');
      return;
    }
    if (ids.has(id)) {
      addIssue(issues, 'duplicate-id', path + '.id', 'Constraint IDs must be unique.');
      return;
    }

    if (typeof item.path !== 'string' || !CONSTRAINT_PATHS.has(item.path as DirectionConstraintPath)) {
      addIssue(issues, 'invalid-value', path + '.path', 'Unknown constraint target path.');
      return;
    }
    if (typeof item.operator !== 'string' || !CONSTRAINT_OPERATORS.has(item.operator as DirectionConstraintOperator)) {
      addIssue(issues, 'invalid-value', path + '.operator', 'Unknown constraint operator.');
      return;
    }
    if (typeof item.hard !== 'boolean') {
      addIssue(issues, 'invalid-type', path + '.hard', 'Expected a boolean.');
      return;
    }

    const operator = item.operator as DirectionConstraintOperator;
    const constraintValue = normalizeConstraintValue(item.value, path + '.value', issues);
    if (constraintValue === undefined) return;
    if ((operator === 'min' || operator === 'max') && typeof constraintValue !== 'number') {
      addIssue(issues, 'invalid-value', path + '.value', 'min and max operators require a numeric value.');
      return;
    }
    if ((operator === 'one-of' || operator === 'none-of') && !Array.isArray(constraintValue)) {
      addIssue(issues, 'invalid-value', path + '.value', 'one-of and none-of operators require an array value.');
      return;
    }
    if ((operator === 'includes' || operator === 'excludes') && Array.isArray(constraintValue)) {
      addIssue(issues, 'invalid-value', path + '.value', 'includes and excludes require a scalar value.');
      return;
    }

    ids.add(id);
    result.push({
      id,
      path: item.path as DirectionConstraintPath,
      operator,
      value: constraintValue,
      hard: item.hard,
    });
  });
  return result;
}

function normalizeFacts(
  value: unknown,
  issues: ContextValidationIssue[],
): { facts?: DirectionContextSnapshot['facts']; missing: string[] } {
  const missing: string[] = [];
  if (value === undefined || value === null) {
    return { missing: FACT_FIELDS.map((field) => 'facts.' + field) };
  }
  if (!isRecord(value)) {
    addIssue(issues, 'invalid-type', 'facts', 'Expected an object of structured project facts.');
    return { missing: FACT_FIELDS.map((field) => 'facts.' + field) };
  }

  reportUnknownKeys(value, FACT_FIELDS, 'facts', issues);
  const facts: NonNullable<DirectionContextSnapshot['facts']> = {};

  const viewports = normalizeViewports(value.viewports, issues);
  if (viewports.length) facts.viewports = viewports;
  else missing.push('facts.viewports');

  for (const field of ['accessibilityTarget', 'language'] as const) {
    const raw = value[field];
    if (raw === undefined || raw === null) {
      missing.push('facts.' + field);
      continue;
    }
    const normalized = normalizeText(raw, 'facts.' + field, issues);
    if (normalized) facts[field] = normalized;
    else missing.push('facts.' + field);
  }

  const tokens = normalizeTokens(value.existingTokens, issues);
  if (tokens.length) facts.existingTokens = tokens;
  else missing.push('facts.existingTokens');

  for (const field of ['prohibitedClaims', 'requiredContent'] as const) {
    const normalized = normalizeStringList(value[field], 'facts.' + field, issues);
    if (normalized.length) facts[field] = normalized;
    else missing.push('facts.' + field);
  }

  return {
    facts: Object.keys(facts).length ? facts : undefined,
    missing,
  };
}

/**
 * Collects all validation issues while returning a safe, normalized partial context.
 * Unknown fields are reported rather than silently incorporated or ignored.
 */
export function normalizeDirectionContextDetailed(input: unknown): ContextNormalizationResult {
  if (!isRecord(input)) {
    return {
      issues: [{
        code: 'invalid-object',
        path: '$',
        message: 'Direction context must be an object.',
      }],
    };
  }

  const issues: ContextValidationIssue[] = [];
  reportUnknownKeys(input, Object.keys(FIELD_KINDS), '', issues);

  const context: DirectionContextSnapshot = {
    goals: [],
    constraints: [],
    preferences: [],
    stack: [],
    structuredConstraints: [],
    missingInformation: [],
  };

  for (const field of SCALAR_FIELDS) {
    const value = input[field];
    if (value === undefined || value === null) {
      context.missingInformation.push(field);
      continue;
    }
    const normalized = normalizeText(value, field, issues);
    if (normalized) context[field] = normalized;
    else context.missingInformation.push(field);
  }

  for (const field of LIST_FIELDS) {
    const normalized = normalizeStringList(input[field], field, issues);
    context[field] = normalized;
    if (normalized.length === 0) context.missingInformation.push(field);
  }

  const facts = normalizeFacts(input.facts, issues);
  if (facts.facts) context.facts = facts.facts;
  context.missingInformation.push(...facts.missing);

  context.structuredConstraints = normalizeStructuredConstraints(
    input.structuredConstraints,
    issues,
  );

  return { context, issues };
}

export class ContextValidationError extends TypeError {
  readonly issues: ContextValidationIssue[];

  constructor(issues: ContextValidationIssue[]) {
    super(
      'Direction context is invalid: ' +
      issues.map((issue) => issue.path + ' (' + issue.code + ')').join('; '),
    );
    this.name = 'ContextValidationError';
    this.issues = issues;
  }
}

/** Strict typed boundary. Throws one aggregate error if any issue is found. */
export function normalizeDirectionContext(
  input: DirectionContextInput,
): DirectionContextSnapshot {
  const result = normalizeDirectionContextDetailed(input);
  if (result.issues.length || !result.context) {
    throw new ContextValidationError(result.issues);
  }
  return result.context;
}

export type { DirectionContextInput };
