import type { EvidenceRecord } from '../../contracts/report.js';
import type {
  DirectionContextSnapshot,
  DirectionConstraintPath,
} from '../../contracts/direction-context.js';

export type DecisionSource = 'brief' | 'rule' | 'ai' | 'default';

export interface DesignDecision<T = unknown> {
  id: string;
  value: T;
  source: DecisionSource;
  reason: string;
  ruleId?: string;
  /** Stable context path used to evaluate structured hard constraints. */
  targetPath?: DirectionConstraintPath;
  /** Stable origin path for brief-derived values, e.g. context.audience. */
  sourcePath?: string;
}

export type RecommendationCategory =
  | 'visual-identity'
  | 'color'
  | 'typography'
  | 'layout'
  | 'components'
  | 'motion'
  | 'accessibility'
  | 'implementation-guidance';

export interface DesignRecommendation {
  id: string;
  category: RecommendationCategory;
  label: '[R]';
  text: string;
  rationale: string;
  evidence?: EvidenceRecord[];
}

export interface AiSuggestion {
  category: RecommendationCategory;
  text: string;
  rationale: string;
  confidence: number;
}

export interface AiSuggestionValidation {
  accepted: AiSuggestion[];
  rejected: Array<{ index: number; reason: string }>;
}

export type DirectionSectionKey =
  | 'visualIdentity'
  | 'colorSystem'
  | 'typography'
  | 'layoutComposition'
  | 'componentPrinciples'
  | 'motionInteraction'
  | 'accessibility'
  | 'implementationGuidance';

export interface DirectionSection {
  summary: string;
  decisions: DesignDecision[];
  recommendations: DesignRecommendation[];
}

/**
 * Provider-independent, serializable output contract for the Direction module.
 * Deliberately excludes timestamps so identical normalized inputs can produce
 * byte-stable artifacts.
 */
export interface DirectionArtifact {
  schemaVersion: '1.1.0';
  artifactId: string;
  engineVersion: string;
  context: DirectionContextSnapshot;
  sections: Record<DirectionSectionKey, DirectionSection>;
}

export type { DirectionContextSnapshot };
