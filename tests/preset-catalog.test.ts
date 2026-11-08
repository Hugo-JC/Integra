import {describe,expect,it} from 'vitest';
import {directionPresetMetadata,getDirectionStyle,matchDirectionPresets} from '../src/modules/direction/preset-catalog.js';

describe('offline direction presets',()=>{
 it('loads the migrated niche catalog',()=>{expect(directionPresetMetadata.count).toBeGreaterThanOrEqual(50);});
 it('ranks a relevant niche and exposes why it matched',()=>{
  const result=matchDirectionPresets('fintech para pagamentos em Angola')[0];
  expect(result?.id).toContain('fintech');
  expect(result?.matchQuality).toBe('exact');
  expect(result?.matchReasons.length).toBeGreaterThan(0);
 });
 it('does not match a term inside an unrelated word',()=>{
  expect(matchDirectionPresets('sass application')).toEqual([]);
 });
 it('does not select a style variant from a partial word',()=>{
  const result=matchDirectionPresets('unpremiumized coffee');
  const coffee=result.find((item)=>item.id==='coffee-artisan-food');
  expect(coffee?.variantCandidates).toEqual([]);
 });
 it('marks equally specific variant styles as ambiguous',()=>{
  const result=matchDirectionPresets('café sofisticado sustentável');
  const coffee=result.find((item)=>item.id==='coffee-artisan-food');
  expect(coffee?.variantAmbiguous).toBe(true);
  expect(coffee?.variantCandidates).toContain('minimalist_warm_dark');
  expect(coffee?.variantCandidates).toContain('organic_forest_dark');
  expect(coffee?.styleId).toBe('minimalist_warm');
 });
 it('returns a known style definition',()=>{expect(getDirectionStyle('minimalist_warm')).not.toBeNull();});
 it('does not match an empty query',()=>{expect(matchDirectionPresets('')).toEqual([]);});
});
