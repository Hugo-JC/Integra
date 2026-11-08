import designStyles from '../../../../data/design-library/design-styles.json' with { type: 'json' };
import localPresets from '../../../../data/design-library/local-presets.json' with { type: 'json' };
import type { DesignPresetRoute, DesignStyle, DesignTone, NichePreset } from './types.js';

const styles = designStyles.styles as Record<string, DesignStyle>;
const presets = localPresets.presets as NichePreset[];

export function normalizeDesignQuery(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-PT').replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim().replace(/\s+/g, ' ');
}

function containsPhrase(query: string, phrase: string): boolean {
  const normalized = normalizeDesignQuery(phrase);
  return normalized.length > 0 && ` ${query} `.includes(` ${normalized} `);
}

function matchesFor(query: string, field: 'match_terms' | 'weak_terms') {
  return presets.flatMap((preset) => {
    const matches = (preset[field] ?? []).filter((term) => containsPhrase(query, term))
      .sort((a, b) => b.length - a.length);
    return matches.length ? [{ preset, matches }] : [];
  });
}

function withTone(style: DesignStyle, tone?: DesignTone): DesignStyle {
  return tone ? { ...style, intensity: tone } : style;
}

/** Route only on explicit whole-phrase matches. Weak matches and ties require confirmation. */
export function routeDesignPreset(query: string, options: { tone?: DesignTone } = {}): DesignPresetRoute {
  if (typeof query !== 'string' || !query.trim()) throw new TypeError('A non-empty design brief is required.');
  const normalizedQuery = normalizeDesignQuery(query);
  const strong = matchesFor(normalizedQuery, 'match_terms');
  const weak = strong.length ? [] : matchesFor(normalizedQuery, 'weak_terms');
  const matches = strong.length ? strong : weak;
  const fallbackStyleId = (localPresets.fallback as { style_id: string }).style_id;

  if (!matches.length) {
    const style = styles[fallbackStyleId];
    if (!style) throw new Error(`Missing fallback style: ${fallbackStyleId}`);
    return {
      status: 'fallback', confidence: 'low', query, normalizedQuery,
      styleId: fallbackStyleId, style: withTone(style, options.tone),
      matchedTerms: [], alternatives: [],
      reason: 'No niche term matched. Confirm or replace this neutral fallback before applying it.',
      requiresConfirmation: true,
    };
  }

  const score = (entry: (typeof matches)[number]) => entry.matches[0].length;
  const best = Math.max(...matches.map(score));
  const winners = [...new Map(matches.filter((item) => score(item) === best)
    .map((item) => [item.preset.id, item])).values()];
  const chosen = winners[0];
  const variant = chosen.preset.variants?.find((candidate) =>
    candidate.when_any.some((term) => containsPhrase(normalizedQuery, term)));
  const styleId = variant?.style_id ?? chosen.preset.style_id;
  const style = styles[styleId];
  if (!style) throw new Error(`Preset ${chosen.preset.id} references missing style ${styleId}`);
  const alternatives = [...new Set(matches.map((item) => item.preset.id))]
    .filter((id) => id !== chosen.preset.id);
  const ambiguous = winners.length > 1;
  const weakOnly = strong.length === 0;
  return {
    status: ambiguous ? 'ambiguous' : 'matched',
    confidence: ambiguous || weakOnly ? 'low' : alternatives.length ? 'medium' : 'high',
    query, normalizedQuery, presetId: chosen.preset.id, styleId,
    style: withTone(style, options.tone), matchedTerms: chosen.matches,
    alternatives, selectedVariant: variant?.style_id,
    reason: ambiguous ? 'Equally specific presets matched; choose one explicitly.'
      : weakOnly ? 'Only a generic term matched; confirm the product niche.'
      : alternatives.length ? 'The strongest specific match won; alternatives are retained.'
      : 'A unique, specific niche term matched.',
    requiresConfirmation: ambiguous || weakOnly,
  };
}

export function getDesignStyle(id: string): DesignStyle | undefined { return styles[id]; }
export function listDesignPresets(): readonly NichePreset[] { return presets; }
export function listDesignStyles(): Readonly<Record<string, DesignStyle>> { return styles; }
