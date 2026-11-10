import visualSources from '../../../../data/design-library/visual-sources.json' with { type: 'json' };
import nicheReferenceMap from '../../../../data/design-library/niche-reference-map.json' with { type: 'json' };
import tokenCatalog from '../../../../data/design-library/token-systems.json' with { type: 'json' };
import layoutCatalog from '../../../../data/design-library/layout-patterns.json' with { type: 'json' };
import rulesCatalog from '../../../../data/design-library/design-rules.json' with { type: 'json' };
import antiPatternsCatalog from '../../../../data/design-library/anti-patterns.json' with { type: 'json' };
import examplesCatalog from '../../../../data/design-library/examples/index.json' with { type: 'json' };
import assetSources from '../../../../data/design-library/asset-sources.json' with { type: 'json' };

export type ExperienceMode = 'persuade' | 'operate' | 'read' | 'experience';
export interface VisualKnowledgeRequest { nicheId?: string; mode?: ExperienceMode; query?: string; tags?: string[]; assetTypes?: string[]; limit?: number; }
export interface KnowledgeCandidate<T> { item: T; score: number; reasons: string[]; }
const sources = visualSources.sources;
const niches = nicheReferenceMap.niches;
const tokenSystems = tokenCatalog.tokenSystems;
const patterns = layoutCatalog.patterns;
const rules = rulesCatalog.rules;
const antiPatterns = antiPatternsCatalog.antiPatterns;
const examples = examplesCatalog.examples;
const assets = assetSources.providers;

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('en-US')
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
}
function tokens(value: string): Set<string> { return new Set(normalize(value).split(' ').filter((token) => token.length > 2)); }
function overlapScore(query: string, values: string[]): number {
  const queryTokens = tokens(query); if (!queryTokens.size) return 0;
  const valueTokens = new Set(values.flatMap((value) => [...tokens(value)]));
  const matches = [...queryTokens].filter((token) => valueTokens.has(token)).length;
  return matches / queryTokens.size;
}
function cap(limit: number | undefined, fallback: number, max: number): number {
  return Number.isFinite(limit) ? Math.max(1, Math.min(max, Math.floor(limit as number))) : fallback;
}

/** Deterministic offline retrieval. Results are candidates, not applied decisions or verified findings. */
export function buildVisualKnowledgePack(request: VisualKnowledgeRequest) {
  const query = request.query ?? '';
  const requestedTags = request.tags ?? [];
  const taskQuery = [query, ...requestedTags].join(' ');
  const limit = cap(request.limit, 5, 20);
  const mapping = request.nicheId ? niches.find((entry) => entry.nicheId === request.nicheId) : undefined;
  const referenceIds = new Set(mapping?.sourceIds ?? []);
  const references: KnowledgeCandidate<(typeof sources)[number]>[] = sources.map((item) => {
    const reasons: string[] = []; let score = 0;
    if (referenceIds.has(item.id)) { score += 10; reasons.push('Mapped to the requested niche as a discovery lead.'); }
    const tagScore = overlapScore(taskQuery, item.tags);
    if (tagScore > 0) { score += tagScore; reasons.push('Source tags overlap the task query.'); }
    return { item, score, reasons };
  }).filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id)).slice(0, Math.min(limit, 5));

  const tokenCandidates: KnowledgeCandidate<(typeof tokenSystems)[number]>[] = tokenSystems.map((item) => {
    const reasons: string[] = [];
    if (request.mode && !item.modes.includes(request.mode)) return { item, score: 0, reasons };
    let score = overlapScore(taskQuery, [...item.contexts, ...item.tags]) * 3;
    if (request.mode && item.modes.includes(request.mode)) { score += 2; reasons.push('Supports the requested surface mode.'); }
    if (item.contexts.some((context) => request.nicheId?.includes(context))) { score += 1; reasons.push('Context overlaps the requested niche.'); }
    if (score > 0 && !reasons.length) reasons.push('Contextual tag match.');
    return { item, score, reasons };
  }).filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id)).slice(0, 3);

  const patternCandidates: KnowledgeCandidate<(typeof patterns)[number]>[] = patterns.map((item) => {
    const reasons: string[] = [];
    if (request.mode && item.mode !== request.mode) return { item, score: 0, reasons };
    let score = overlapScore(taskQuery, item.tags) * 3;
    if (score === 0) return { item, score: 0, reasons };
    if (request.mode === item.mode) { score += 2; reasons.push('Exact experience-mode match.'); }
    if (score > 0 && !reasons.length) reasons.push('Task tags overlap the pattern.');
    return { item, score, reasons };
  }).filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id)).slice(0, 5);

  const ruleCandidates: KnowledgeCandidate<(typeof rules)[number]>[] = rules.map((item) => {
    const reasons: string[] = []; const ruleModes = item.appliesWhen.modes as string[];
    if (request.mode && !ruleModes.includes('all') && !ruleModes.includes(request.mode)) return { item, score: 0, reasons };
    const relevance = overlapScore(taskQuery, [item.id, item.statement, item.trigger]);
    if (relevance === 0) return { item, score: 0, reasons };
    let score = relevance * 2;
    reasons.push(ruleModes.includes('all') || ruleModes.includes(request.mode ?? '') ? 'Rule applies to the requested surface mode.' : 'Rule text overlaps the task.');
    if (score > 0 && !reasons.length) reasons.push('Rule text overlaps the task.');
    return { item, score, reasons };
  }).filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id)).slice(0, 12);

  const antiPatternCandidates: KnowledgeCandidate<(typeof antiPatterns)[number]>[] = antiPatterns
    .filter((item) => !request.mode || item.modeScope.includes(request.mode)).map((item) => {
      const score = overlapScore(taskQuery, [item.id, item.name, item.summary, item.trigger]);
      return { item, score, reasons: score > 0 ? ['Potential risk to inspect; not a confirmed finding.'] : [] };
    }).filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id)).slice(0, 8);

  const requestedAssetTypes = request.assetTypes ?? [];
  const assetCandidates: KnowledgeCandidate<(typeof assets)[number]>[] = assets.map((item) => {
    const reasons: string[] = [];
    const typeMatch = requestedAssetTypes.some((type) => item.assetTypes.includes(type));
    let score = overlapScore(taskQuery, [...item.assetTypes, item.name, item.bestFor]) * 2;
    if (typeMatch) { score += 3; reasons.push('Supports a requested asset type.'); }
    if (score > 0) reasons.push('Provider purpose overlaps the asset request.');
    return { item, score, reasons };
  }).filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id)).slice(0, 3);

  const relevantExamples = examples.filter((item) =>
    (!request.mode || item.mode === request.mode) && (!request.nicheId || !item.nicheId || item.nicheId === request.nicheId)
  ).slice(0, 4);
  return {
    schemaVersion: '1.0.0',
    selection: { nicheId: request.nicheId ?? null, mode: request.mode ?? null, query,
      nicheMappingStatus: mapping?.mappingStatus ?? 'unmapped',
      confidence: mapping?.mappingStatus === 'suggested-shortlist' ? 'medium' : 'low' },
    references: references.map((candidate) => ({ ...candidate, verificationStatus: candidate.item.verificationStatus })),
    assetSources: assetCandidates.map((candidate) => ({ ...candidate, verificationStatus: candidate.item.verificationStatus })),
    tokenSystems: tokenCandidates, layoutPatterns: patternCandidates, designRules: ruleCandidates,
    antiPatterns: antiPatternCandidates, examples: relevantExamples,
    safeguards: [
      'Catalog entries are research leads until page-level observation exists.',
      'Asset provider records do not clear an individual asset licence or model/property rights.',
      'Token recipes require project-token reconciliation and rendered contrast verification.',
      'Layout patterns require matching content prerequisites and task conditions.',
      'Rules and anti-patterns are candidates, not confirmed QA findings.',
      'No source code, asset, copy or complete reference composition is copied.'
    ]
  };
}

export const visualKnowledgeMetadata = { sourceCount: sources.length, assetSourceCount: assets.length, nicheMappingCount: niches.length,
  tokenSystemCount: tokenSystems.length, layoutPatternCount: patterns.length, ruleCount: rules.length,
  antiPatternCount: antiPatterns.length, exampleCount: examples.length };
