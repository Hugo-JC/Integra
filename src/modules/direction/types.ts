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
  | 'accessibility';

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
