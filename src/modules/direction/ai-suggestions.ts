import type { AiSuggestion, AiSuggestionValidation, RecommendationCategory } from './types.js';

const CATEGORIES = new Set<RecommendationCategory>([
  'visual-identity',
  'color',
  'typography',
  'layout',
  'components',
  'motion',
  'accessibility',
  'implementation-guidance',
]);

const MAX_SUGGESTIONS = 50;
const MAX_TEXT_LENGTH = 500;

/**
 * Validates untrusted provider output and applies an optional deterministic compatibility
 * predicate. This function never applies suggestions to a design or relaxes brief constraints.
 */
export function validateAiSuggestions(
  payload: unknown,
  isCompatible: (suggestion: AiSuggestion) => boolean = () => true,
): AiSuggestionValidation {
  if (!Array.isArray(payload)) {
    throw new TypeError('AI suggestions must be provided as an array.');
  }
  if (payload.length > MAX_SUGGESTIONS) {
    throw new RangeError(`AI suggestions cannot exceed ${MAX_SUGGESTIONS} items.`);
  }

  const accepted: AiSuggestion[] = [];
  const rejected: AiSuggestionValidation['rejected'] = [];

  payload.forEach((item: unknown, index: number) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      rejected.push({ index, reason: 'Suggestion must be an object.' });
      return;
    }

    const candidate = item as Record<string, unknown>;
    const { category, text, rationale, confidence } = candidate;
    if (typeof category !== 'string' || !CATEGORIES.has(category as RecommendationCategory)) {
      rejected.push({ index, reason: 'Unknown recommendation category.' });
      return;
    }
    if (typeof text !== 'string' || text.trim().length === 0 || text.length > MAX_TEXT_LENGTH) {
      rejected.push({ index, reason: `text must contain 1-${MAX_TEXT_LENGTH} characters.` });
      return;
    }
    if (typeof rationale !== 'string' || rationale.trim().length === 0 || rationale.length > MAX_TEXT_LENGTH) {
      rejected.push({ index, reason: `rationale must contain 1-${MAX_TEXT_LENGTH} characters.` });
      return;
    }
    if (typeof confidence !== 'number' || !Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
      rejected.push({ index, reason: 'confidence must be a finite number from 0 to 1.' });
      return;
    }

    const suggestion: AiSuggestion = {
      category: category as RecommendationCategory,
      text,
      rationale,
      confidence,
    };

    try {
      if (!isCompatible(suggestion)) {
        rejected.push({ index, reason: 'Suggestion conflicts with deterministic brief constraints.' });
        return;
      }
    } catch {
      rejected.push({ index, reason: 'Compatibility validation failed; suggestion was rejected.' });
      return;
    }

    accepted.push(suggestion);
  });

  return { accepted, rejected };
}
