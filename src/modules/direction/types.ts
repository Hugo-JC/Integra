import type { EvidenceRecord } from '../../contracts/report.js';

export type DecisionSource = 'brief' | 'rule' | 'ai' | 'default';

export interface DesignDecision<T = unknown> {
  id: string;
  value: T;
  source: DecisionSource;
  reason: string;
  ruleId?: string;
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

export interface DirectionContextSnapshot {
  projectType?: string;
  audience?: string;
  primaryGoal?: string;
  platform?: string;
  goals: string[];
  constraints: string[];
  preferences: string[];
  stack: string[];
  missingInformation: string[];
}

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
  schemaVersion: '1.0.0';
  artifactId: string;
  engineVersion: string;
  context: DirectionContextSnapshot;
  sections: Record<DirectionSectionKey, DirectionSection>;
}
