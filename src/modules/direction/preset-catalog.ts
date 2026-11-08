import presetCatalog from '../../../presets/catalog.json' with { type: 'json' };
import styleCatalog from '../../../presets/design-styles-v3.json' with { type: 'json' };

export type PresetMatchQuality = 'exact' | 'token-overlap' | 'none';
export interface DirectionPresetMatch {
  id: string;
  styleId?: string;
  score: number;
  matchQuality: PresetMatchQuality;
  matchedTerms: string[];
  matchReasons: string[];
  variantCandidates: string[];
  variantAmbiguous: boolean;
  principles: string[];
  patterns: Record<string, unknown>;
  sources: Array<{ name?: string; url?: string; patternCues: string[] }>;
}
type Preset = {
  id: string;
  matchTerms: string[];
  styleId?: string;
  variants?: Array<{ when_any: string[]; style_id: string }>;
  patterns: Record<string, unknown>;
  principles: string[];
  sources: Array<{ name?: string; url?: string; patternCues: string[] }>;
};
const presets = presetCatalog.presets as unknown as Preset[];

function normalize(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('en-US').replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim().replace(/\s+/g, ' ');
}
function containsPhrase(query: string, phrase: string): boolean {
  const normalized = normalize(phrase);
  return normalized.length > 0 && ` ${query} `.includes(` ${normalized} `);
}
function matchTerm(query: string, queryWords: Set<string>, rawTerm: string):
  { kind: 'exact' | 'token-overlap'; score: number; reason: string } | null {
  const term = normalize(rawTerm);
  if (term.length < 3) return null;
  if (containsPhrase(query, term)) {
    return { kind: 'exact', score: 4 + Math.min(term.length / 40, 1), reason: `Exact phrase: "${rawTerm}"` };
  }
  const tokens = [...new Set(term.split(' ').filter((word) => word.length >= 3))];
  const overlap = tokens.filter((word) => queryWords.has(word));
  const required = tokens.length <= 1 ? 1 : Math.max(2, Math.ceil(tokens.length / 2));
  if (overlap.length < required) return null;
  const ratio = overlap.length / Math.max(tokens.length, 1);
  return {
    kind: 'token-overlap',
    score: 0.5 + ratio,
    reason: `Partial token overlap (${overlap.length}/${tokens.length}): "${rawTerm}"`
  };
}

function clonePreset(preset: Preset, overrides: Partial<DirectionPresetMatch> = {}): DirectionPresetMatch {
  return {
    id: preset.id,
    styleId: preset.styleId,
    score: 0,
    matchQuality: 'none',
    matchedTerms: [],
    matchReasons: [],
    variantCandidates: [],
    variantAmbiguous: false,
    principles: [...preset.principles],
    patterns: { ...preset.patterns },
    sources: preset.sources.map((source) => ({ ...source, patternCues: [...source.patternCues] })),
    ...overrides
  };
}

export function listDirectionPresets(): DirectionPresetMatch[] {
  return presets.map((preset) => clonePreset(preset));
}

/**
 * Offline advisory discovery only. Matches expose evidence and ambiguity;
 * they never authorize a visual style or replace routeDesignPreset().
 */
export function matchDirectionPresets(query: string, limit = 5): DirectionPresetMatch[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];
  const queryWords = new Set(normalizedQuery.split(' ').filter((word) => word.length >= 3));
  const maxResults = Number.isFinite(limit) ? Math.max(1, Math.min(20, Math.floor(limit))) : 5;

  return presets.flatMap((preset) => {
    const termMatches = preset.matchTerms.flatMap((raw) => {
      const match = matchTerm(normalizedQuery, queryWords, raw);
      return match ? [{ raw, ...match }] : [];
    });
    if (!termMatches.length) return [];

    const exactMatches = termMatches.filter((item) => item.kind === 'exact');
    const matchQuality: PresetMatchQuality = exactMatches.length ? 'exact' : 'token-overlap';
    const matchReasons = termMatches.map((item) => item.reason);
    let score = termMatches.reduce((total, item) => total + item.score, 0);

    const variantMatches = (preset.variants ?? []).flatMap((variant) =>
      variant.when_any.flatMap((raw) => containsPhrase(normalizedQuery, raw)
        ? [{ styleId: variant.style_id, term: raw, length: normalize(raw).length }]
        : [])
    );
    const longestVariantLength = variantMatches.length ? Math.max(...variantMatches.map((item) => item.length)) : 0;
    const longestVariantMatches = variantMatches.filter((item) => item.length === longestVariantLength);
    const variantCandidates = [...new Set(longestVariantMatches.map((item) => item.styleId))].sort();
    const variantAmbiguous = variantCandidates.length > 1;
    const selectedVariantStyle = variantCandidates.length === 1 ? variantCandidates[0] : undefined;
    if (selectedVariantStyle) score += 1.25;
    if (variantAmbiguous) matchReasons.push('Multiple equally specific variant styles matched; no variant style was selected.');

    return [clonePreset(preset, {
      styleId: selectedVariantStyle ?? preset.styleId,
      score,
      matchQuality,
      matchedTerms: termMatches.map((item) => item.raw),
      matchReasons,
      variantCandidates,
      variantAmbiguous
    })];
  }).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, maxResults);
}

export function getDirectionStyle(styleId: string) {
  return styleCatalog.styles[styleId as keyof typeof styleCatalog.styles] ?? null;
}
export const directionPresetMetadata = {
  schemaVersion: presetCatalog.schemaVersion,
  provenance: presetCatalog.provenance,
  count: presetCatalog.presets.length
};
