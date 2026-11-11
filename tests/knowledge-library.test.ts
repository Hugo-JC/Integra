import { describe, expect, it } from 'vitest';
import { buildVisualKnowledgePack, visualKnowledgeMetadata } from '../src/modules/direction/knowledge/index.js';
describe('visual knowledge library', () => {
  it('covers all migrated niches with source discovery leads', () => {
    expect(visualKnowledgeMetadata.nicheMappingCount).toBe(61);
    expect(visualKnowledgeMetadata.observationCount).toBe(2);
    expect(visualKnowledgeMetadata.partialObservationCount).toBe(2);
    expect(visualKnowledgeMetadata.verifiedObservationCount).toBe(0);
    const pack = buildVisualKnowledgePack({ nicheId: 'coffee-artisan-food', mode: 'persuade' });
    expect(pack.references.some((entry) => entry.item.id === 'blue-bottle')).toBe(true);
    expect(pack.references.every((entry) => entry.verificationStatus === 'catalog-only')).toBe(true);
  });
  it('retrieves scoped documentation observations without upgrading their evidence status', () => {
    const pack = buildVisualKnowledgePack({
      nicheId: 'saas-developer-ai',
      mode: 'operate',
      query: 'task-first hierarchy compact navigation responsive layout',
    });

    expect(pack.observations.map((entry) => entry.item.id).sort()).toEqual([
      'linear-interface-refresh-2026',
      'primer-layout-foundations-2026',
    ].sort());
    expect(pack.observations.every((entry) => entry.verificationStatus === 'partial')).toBe(true);
    expect(pack.observations.every((entry) => entry.item.evidenceType === 'official-documentation')).toBe(true);
    expect(pack.observations.every((entry) => entry.item.confidence === 'medium')).toBe(true);
    expect(pack.safeguards.some((item) => item.includes('Partial page observations'))).toBe(true);
  });

  it('selects layout patterns by surface mode and task tags', () => {
    const pack = buildVisualKnowledgePack({ mode: 'operate', query: 'admin inventory data table' });
    expect(pack.layoutPatterns.some((entry) => entry.item.id === 'data-table-workbench')).toBe(true);
    expect(pack.layoutPatterns.every((entry) => entry.item.mode === 'operate')).toBe(true);
  });
  it('keeps token recipes provisional and exposes contrast safeguards', () => {
    const pack = buildVisualKnowledgePack({ mode: 'read', query: 'editorial article typography' });
    expect(pack.tokenSystems.length).toBeGreaterThan(0);
    expect(pack.tokenSystems.every((entry) => entry.item.contrastStatus === 'requires-rendered-verification')).toBe(true);
    expect(pack.safeguards.some((item) => item.includes('contrast verification'))).toBe(true);
  });
  it('returns anti-patterns as unconfirmed candidates', () => {
    const pack = buildVisualKnowledgePack({ mode: 'operate', query: 'dashboard three cards fake live metrics' });
    expect(pack.antiPatterns.length).toBeGreaterThan(0);
    expect(pack.antiPatterns.every((entry) => entry.reasons[0].includes('not a confirmed finding'))).toBe(true);
  });
  it('retrieves asset providers separately from visual reference galleries', () => {
    expect(visualKnowledgeMetadata.assetSourceCount).toBe(10);
    const pack = buildVisualKnowledgePack({ query: 'photography assets', assetTypes: ['photography'] });
    expect(pack.assetSources.length).toBeGreaterThan(0);
    expect(pack.assetSources.every((entry) => entry.item.assetTypes.includes('photography'))).toBe(true);
    expect(pack.assetSources.every((entry) => entry.verificationStatus === 'catalog-only')).toBe(true);
  });
  it('does not invent a niche mapping for unknown products', () => {
    const pack = buildVisualKnowledgePack({ nicheId: 'unknown-enterprise-niche', mode: 'operate' });
    expect(pack.references).toEqual([]);
    expect(pack.selection.nicheMappingStatus).toBe('unmapped');
  });
});
