import { Ajv2020 } from 'ajv/dist/2020.js';
import type {
  CheckResult,
  Finding,
  VerificationStatus,
} from '../../contracts/report.js';
import directionArtifactSchema from '../../../schemas/direction-artifact.schema.json' with { type: 'json' };
import { resolveDecisionWithConstraints } from './resolver.js';
import type {
  DirectionArtifact,
  DirectionSectionKey,
  RecommendationCategory,
} from './types.js';

export interface DirectionArtifactValidationResult {
  status: VerificationStatus;
  checks: {
    structural: CheckResult;
    semantic: CheckResult;
    constraints: CheckResult;
    consistency: CheckResult;
  };
  findings: Finding[];
}

const SECTION_CATEGORIES: Record<DirectionSectionKey, RecommendationCategory> = {
  visualIdentity: 'visual-identity',
  colorSystem: 'color',
  typography: 'typography',
  layoutComposition: 'layout',
  componentPrinciples: 'components',
  motionInteraction: 'motion',
  accessibility: 'accessibility',
  implementationGuidance: 'implementation-guidance',
};

const ajv = new Ajv2020({ allErrors: true, strict: true });
const validateSchema = ajv.compile(directionArtifactSchema);

function check(
  id: string,
  status: VerificationStatus,
  description: string,
  expected?: unknown,
  actual?: unknown,
): CheckResult {
  return { id, status, description, expected, actual };
}

function finding(
  id: string,
  severity: Finding['severity'],
  description: string,
  verificationStatus: Finding['verificationStatus'],
  recommendation: string,
): Finding {
  return {
    id,
    category: 'direction.validation',
    severity,
    description,
    recommendation,
    evidence: [],
    verificationStatus,
  };
}

function getContextPath(context: unknown, sourcePath: string): unknown {
  if (!sourcePath.startsWith('context.')) return undefined;
  return sourcePath.slice('context.'.length).split('.').reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object' || Array.isArray(current)) return undefined;
    return (current as Record<string, unknown>)[key];
  }, context);
}

function isPopulated(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Validates a Direction Artifact in four ordered layers.
 * Semantic, constraint and consistency checks never run when structural validation fails.
 */
export function validateDirectionArtifact(
  input: unknown,
): DirectionArtifactValidationResult {
  const findings: Finding[] = [];
  const structurallyValid = validateSchema(input);

  if (!structurallyValid) {
    const details = (validateSchema.errors ?? []).map((error) =>
      (error.instancePath || '/') + ' ' + (error.message ?? 'schema violation'),
    );
    findings.push(finding(
      'direction-structural-invalid',
      'major',
      'Direction Artifact does not satisfy its JSON Schema: ' + details.join('; '),
      'failed',
      'Correct the artifact structure and validate it again before running deeper checks.',
    ));
    return {
      status: 'failed',
      checks: {
        structural: check(
          'direction-structural',
          'failed',
          'Validate the artifact against Direction Artifact JSON Schema 1.1.0.',
          'Schema-valid Direction Artifact',
          details,
        ),
        semantic: check('direction-semantic', 'not_run', 'Not run because structural validation failed.'),
        constraints: check('direction-constraints', 'not_run', 'Not run because structural validation failed.'),
        consistency: check('direction-consistency', 'not_run', 'Not run because structural validation failed.'),
      },
      findings,
    };
  }

  const artifact = input as unknown as DirectionArtifact;
  const semanticIssues: string[] = [];
  const decisionIds = new Set<string>();
  const recommendationIds = new Set<string>();

  for (const [sectionKey, section] of Object.entries(artifact.sections) as [
    DirectionSectionKey,
    DirectionArtifact['sections'][DirectionSectionKey],
  ][]) {
    for (const decision of section.decisions) {
      if (decisionIds.has(decision.id)) semanticIssues.push('Duplicate decision id: ' + decision.id);
      decisionIds.add(decision.id);
    }
    for (const recommendation of section.recommendations) {
      if (recommendationIds.has(recommendation.id)) {
        semanticIssues.push('Duplicate recommendation id: ' + recommendation.id);
      }
      recommendationIds.add(recommendation.id);
      if (recommendation.category !== SECTION_CATEGORIES[sectionKey]) {
        semanticIssues.push(
          'Recommendation ' + recommendation.id + ' has category ' + recommendation.category +
          ' in section ' + sectionKey + '.',
        );
      }
    }
  }

  const semanticStatus: VerificationStatus = semanticIssues.length ? 'failed' : 'passed';
  if (semanticIssues.length) {
    findings.push(finding(
      'direction-semantic-invalid',
      'major',
      'Semantic validation failed: ' + semanticIssues.join('; '),
      'failed',
      'Use unique identifiers and keep recommendation categories aligned with their Direction Artifact sections.',
    ));
  }

  const constraintIssues: string[] = [];
  let hasInconclusiveConstraint = false;
  let hasConstraintConflict = false;
  const allDecisions = Object.values(artifact.sections).flatMap((section) => section.decisions);
  const hardConstraints = artifact.context.structuredConstraints.filter((constraint) => constraint.hard);

  for (const constraint of hardConstraints) {
    if (!allDecisions.some((decision) => decision.targetPath === constraint.path)) {
      hasInconclusiveConstraint = true;
      constraintIssues.push(
        'No decision targets hard constraint ' + constraint.id + ' (' + constraint.path + ').',
      );
    }
  }

  for (const decision of allDecisions) {
    const result = resolveDecisionWithConstraints([decision], hardConstraints);
    for (const rejected of result.rejected) {
      const detail = decision.id + ': ' + rejected.reason + ' (' + rejected.constraintIds.join(', ') + ')';
      if (rejected.status === 'conflicted') {
        hasConstraintConflict = true;
        constraintIssues.push(detail);
      }
      else {
        hasInconclusiveConstraint = true;
        constraintIssues.push(detail);
      }
    }
  }

  const constraintStatus: VerificationStatus = constraintIssues.length === 0
    ? 'passed'
    : hasConstraintConflict
      ? 'failed'
      : hasInconclusiveConstraint
        ? 'inconclusive'
        : 'failed';
  if (constraintIssues.length) {
    findings.push(finding(
      'direction-constraints-unresolved',
      constraintStatus === 'failed' ? 'major' : 'minor',
      'Hard-constraint validation ' + constraintStatus + ': ' + constraintIssues.join('; '),
      constraintStatus,
      'Resolve conflicts or add a decision with a targetPath and value that can be checked against every hard constraint.',
    ));
  }

  const consistencyIssues: string[] = [];
  for (const [sectionKey, section] of Object.entries(artifact.sections) as [
    DirectionSectionKey,
    DirectionArtifact['sections'][DirectionSectionKey],
  ][]) {
    for (const decision of section.decisions) {
      if (decision.source === 'brief' && decision.sourcePath) {
        const sourceValue = getContextPath(artifact.context, decision.sourcePath);
        if (!isPopulated(sourceValue)) {
          consistencyIssues.push(
            'Brief decision ' + decision.id + ' points to missing context value ' + decision.sourcePath + '.',
          );
        }
      }
      if (decision.source === 'default' && !decision.reason.trim()) {
        consistencyIssues.push('Default decision ' + decision.id + ' must explain why a default was necessary.');
      }
      if (decision.source === 'rule' && !decision.ruleId) {
        consistencyIssues.push('Rule decision ' + decision.id + ' must identify its rule.');
      }
    }
    if (!section.summary.trim()) {
      consistencyIssues.push('Section ' + sectionKey + ' must have a non-empty summary.');
    }
  }

  const consistencyStatus: VerificationStatus = consistencyIssues.length ? 'failed' : 'passed';
  if (consistencyIssues.length) {
    findings.push(finding(
      'direction-consistency-invalid',
      'major',
      'Consistency validation failed: ' + consistencyIssues.join('; '),
      'failed',
      'Make provenance point to populated normalized context and explain every default decision.',
    ));
  }

  const statuses = [semanticStatus, constraintStatus, consistencyStatus];
  const status: VerificationStatus = statuses.includes('failed')
    ? 'failed'
    : statuses.includes('inconclusive')
      ? 'inconclusive'
      : 'passed';

  return {
    status,
    checks: {
      structural: check(
        'direction-structural',
        'passed',
        'Validate the artifact against Direction Artifact JSON Schema 1.1.0.',
        'Schema-valid Direction Artifact',
        'Valid',
      ),
      semantic: check(
        'direction-semantic',
        semanticStatus,
        'Check unique identifiers and recommendation-to-section category alignment.',
        'Unique IDs and matching categories',
        semanticIssues,
      ),
      constraints: check(
        'direction-constraints',
        constraintStatus,
        'Evaluate every decision against applicable hard structured constraints.',
        'No hard-constraint conflicts',
        constraintIssues,
      ),
      consistency: check(
        'direction-consistency',
        consistencyStatus,
        'Check provenance references and section summaries against normalized context.',
        'Consistent provenance and populated source paths',
        consistencyIssues,
      ),
    },
    findings,
  };
}
