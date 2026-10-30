export type DirectionConstraintPath =
  | 'project.platform'
  | 'project.language'
  | 'accessibility.target'
  | 'viewport.targets'
  | 'design.tokens'
  | 'design.visualPersonality'
  | 'design.colorPalette'
  | 'design.typography'
  | 'content.required'
  | 'content.prohibitedClaims'
  | 'motion.reducedMotion'
  | 'implementation.stack';

export type DirectionConstraintOperator =
  | 'equals'
  | 'not-equals'
  | 'includes'
  | 'excludes'
  | 'min'
  | 'max'
  | 'one-of'
  | 'none-of';

export type DirectionConstraintScalar = string | number | boolean;
export type DirectionConstraintValue =
  | DirectionConstraintScalar
  | DirectionConstraintScalar[];

export interface StructuredDirectionConstraint {
  id: string;
  path: DirectionConstraintPath;
  operator: DirectionConstraintOperator;
  value: DirectionConstraintValue;
  hard: boolean;
}

export interface ViewportTarget {
  width: number;
  height: number;
}

export type DesignTokenKind =
  | 'color'
  | 'typography'
  | 'spacing'
  | 'radius'
  | 'shadow'
  | 'other';

export interface DirectionDesignToken {
  name: string;
  value: string;
  kind?: DesignTokenKind;
}

export interface DirectionProjectFacts {
  viewports?: ViewportTarget[];
  accessibilityTarget?: string;
  language?: string;
  existingTokens?: DirectionDesignToken[];
  prohibitedClaims?: string[];
  requiredContent?: string[];
}

/**
 * Shared, serializable context consumed by Context and Direction modules.
 * Empty or unknown facts are represented as absent values and missingInformation.
 */
export interface DirectionContextSnapshot {
  projectType?: string;
  audience?: string;
  primaryGoal?: string;
  platform?: string;
  goals: string[];
  constraints: string[];
  preferences: string[];
  stack: string[];
  facts?: DirectionProjectFacts;
  structuredConstraints: StructuredDirectionConstraint[];
  missingInformation: string[];
}

/** Caller-facing input. Null and omitted values both mean not supplied. */
export interface DirectionContextInput {
  projectType?: string | null;
  audience?: string | null;
  primaryGoal?: string | null;
  platform?: string | null;
  goals?: string[] | null;
  constraints?: string[] | null;
  preferences?: string[] | null;
  stack?: string[] | null;
  facts?: {
    viewports?: ViewportTarget[] | null;
    accessibilityTarget?: string | null;
    language?: string | null;
    existingTokens?: DirectionDesignToken[] | null;
    prohibitedClaims?: string[] | null;
    requiredContent?: string[] | null;
  } | null;
  structuredConstraints?: StructuredDirectionConstraint[] | null;
}

export type ContextIssueCode =
  | 'invalid-object'
  | 'unknown-field'
  | 'invalid-type'
  | 'invalid-value'
  | 'limit-exceeded'
  | 'duplicate-id';

export interface ContextValidationIssue {
  code: ContextIssueCode;
  path: string;
  message: string;
}

export interface ContextNormalizationResult {
  context?: DirectionContextSnapshot;
  issues: ContextValidationIssue[];
}
