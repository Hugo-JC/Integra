import presetCatalog from '../../../presets/catalog.json' with { type: 'json' };
import styleCatalog from '../../../presets/design-styles-v3.json' with { type: 'json' };

export interface DirectionPresetMatch {
  id: string; styleId?: string; score: number; matchedTerms: string[];
  principles: string[]; patterns: Record<string, unknown>;
  sources: Array<{ name?: string; url?: string; patternCues: string[] }>;
}
type Preset = {
  id:string; matchTerms:string[]; styleId?:string;
  variants?:Array<{when_any:string[];style_id:string}>;
  patterns:Record<string,unknown>; principles:string[];
  sources:Array<{name?:string;url?:string;patternCues:string[]}>;
};
const presets = presetCatalog.presets as unknown as Preset[];
function normalize(value:string):string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLocaleLowerCase('en-US').replace(/[^\p{Letter}\p{Number}]+/gu,' ').trim();
}
export function listDirectionPresets():DirectionPresetMatch[] {
  return presets.map(p=>({id:p.id,styleId:p.styleId,score:0,matchedTerms:[],principles:[...p.principles],patterns:{...p.patterns},sources:p.sources.map(s=>({...s,patternCues:[...s.patternCues]}))}));
}
/** Offline discovery only: matched presets are candidates, never mandatory styling. */
export function matchDirectionPresets(query:string,limit=5):DirectionPresetMatch[] {
  const q=normalize(query); if(!q)return [];
  const words=new Set(q.split(' ').filter(x=>x.length>=3));
  return presets.flatMap(p=>{
    const matchedTerms=p.matchTerms.filter(raw=>{
      const term=normalize(raw); return term.length>=3&&(q.includes(term)||term.split(' ').some(x=>words.has(x)));
    });
    if(!matchedTerms.length)return [];
    let score=matchedTerms.reduce((sum,raw)=>{const term=normalize(raw);return sum+(q.includes(term)?3+Math.min(term.length/20,1):1);},0);
    let styleId=p.styleId;
    const variant=p.variants?.find(v=>v.when_any.some(term=>q.includes(normalize(term))));
    if(variant){styleId=variant.style_id;score+=1.5;}
    return [{id:p.id,styleId,score,matchedTerms,principles:[...p.principles],patterns:{...p.patterns},sources:p.sources.map(s=>({...s,patternCues:[...s.patternCues]}))}];
  }).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,Math.max(1,Math.min(20,Math.floor(limit))));
}
export function getDirectionStyle(styleId:string) {
  return styleCatalog.styles[styleId as keyof typeof styleCatalog.styles] ?? null;
}
export const directionPresetMetadata={schemaVersion:presetCatalog.schemaVersion,provenance:presetCatalog.provenance,count:presetCatalog.presets.length};
