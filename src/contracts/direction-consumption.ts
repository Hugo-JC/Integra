/**
 * Agent-reported implementation outcomes for a Direction Artifact.
 *
 * These values describe what a consuming agent says it did. They are not
 * independent evidence that the resulting interface is correct or accessible.
 */
export type DirectionImplementationStatus = 'completed' | 'partial' | 'blocked';
export type DecisionImplementationStatus = 'applied' | 'adapted' | 'not-applied';
export type RecommendationImplementationStatus =
  | 'adopted'
  | 'adapted'
  | 'deferred'
  | 'not-applied';

export interface DirectionDecisionOutcome {
  decisionId: string;
  status: DecisionImplementationStatus;
  reason?: string;
}

export interface DirectionRecommendationOutcome {
  recommendationId: string;
  status: RecommendationImplementationStatus;
  reason?: string;
}

export type DirectionImplementationEvidenceKind =
  | 'source-file'
  | 'screenshot'
  | 'test'
  | 'url'
  | 'other';

export interface DirectionImplementationEvidence {
  kind: DirectionImplementationEvidenceKind;
  reference: string;
  description: string;
  relatedId?: string;
}

export interface DirectionConsumptionReport {
  schemaVersion: '1.0.0';
  artifactId: string;
  engineVersion: string;
  implementationStatus: DirectionImplementationStatus;
  decisions: DirectionDecisionOutcome[];
  recommendations: DirectionRecommendationOutcome[];
  blockers: string[];
  unresolvedMissingInformation: string[];
  evidence: DirectionImplementationEvidence[];
  notes: string[];
}
