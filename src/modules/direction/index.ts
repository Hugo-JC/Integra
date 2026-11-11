export * from './presets/index.js';
export { validateDirectionArtifact } from './artifact-validation.js';
export type { DirectionArtifactValidationResult } from './artifact-validation.js';
export { calculateContrastRatio, evaluateTextContrast } from './contrast.js';
export type { TextContrastInput, TextContrastResult } from './contrast.js';
export { validateAiSuggestions } from './ai-suggestions.js';
export { createDefaultDecision, resolveDecision } from './provenance.js';
export {
  resolveDecisionWithConstraints,
} from './resolver.js';
export type {
  DecisionResolution,
  RejectedDecision,
} from './resolver.js';
export {
  DIRECTION_ENGINE_VERSION,
  generateProductLandingDirection,
  serializeDirectionArtifact,
} from './product-landing.js';
export type {
  DirectionGenerationDiagnostic,
  DirectionGenerationResult,
} from './product-landing.js';
export type {
  AiSuggestion,
  AiSuggestionValidation,
  DecisionSource,
  DesignDecision,
  DesignRecommendation,
  RecommendationCategory,
  DirectionArtifact,
  DirectionSection,
  DirectionSectionKey,
} from './types.js';
export type {
  DirectionContextSnapshot,
  DirectionConstraintPath,
} from '../../contracts/direction-context.js';

export { directionPresetMetadata, getDirectionStyle, listDirectionPresets, matchDirectionPresets } from './preset-catalog.js';
export type { DirectionPresetMatch } from './preset-catalog.js';
export {
  buildVisualIntelligenceBundle,
  serializeVisualIntelligenceBundle,
  validateVisualIntelligenceBundle,
  VISUAL_INTELLIGENCE_BUNDLE_SCHEMA_VERSION,
  VISUAL_INTELLIGENCE_ENGINE_VERSION,
  VisualIntelligenceBundleError,
} from './knowledge/visual-intelligence-bundle.js';
export type {
  VisualIntelligenceBundle,
  VisualIntelligenceBundleErrorCode,
  VisualIntelligenceBundleValidationResult,
  VisualIntelligenceRequest,
  VisualKnowledgePack,
} from './knowledge/visual-intelligence-bundle.js';
