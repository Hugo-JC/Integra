import {describe,expect,it} from 'vitest';
import {directionPresetMetadata,getDirectionStyle,matchDirectionPresets} from '../src/modules/direction/preset-catalog.js';

describe('offline direction presets',()=>{
 it('loads the migrated niche catalog',()=>{expect(directionPresetMetadata.count).toBeGreaterThanOrEqual(50);});
 it('matches a relevant niche deterministically',()=>{expect(matchDirectionPresets('fintech para pagamentos em Angola')[0]?.id).toContain('fintech');});
 it('returns a known style definition',()=>{expect(getDirectionStyle('minimalist_warm')).not.toBeNull();});
 it('does not match an empty query',()=>{expect(matchDirectionPresets('')).toEqual([]);});
});
