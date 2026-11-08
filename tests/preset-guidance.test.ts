import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { routeDesignPreset } from "../src/modules/direction/presets/router.js";

type PresetManifest = { presets: Array<{ id: string; path: string }> };
type ReferenceCatalog = { references: Array<{
  id:string; authority:string; useWhen:string[]; notFor:string[];
  verificationStatus:"catalog-only"|"verified"; lastVerifiedAt:string|null; verifiedPage:string|null;
}> };
const root=process.cwd();
const presetManifest=JSON.parse(readFileSync(join(root,"presets/manifest.json"),"utf8")) as PresetManifest;
const referenceCatalog=JSON.parse(readFileSync(join(root,"references/catalog.json"),"utf8")) as ReferenceCatalog;
const referenceIds=new Set(referenceCatalog.references.map((item)=>item.id));
const profiles=presetManifest.presets.map((entry)=>{
  const value=JSON.parse(readFileSync(join(root,"presets",entry.path),"utf8")) as {
    id:string; references:string[];
    aiGuidance:{primaryFlow:string;prioritize:string[];confirmOrMarkUnknown:string[];avoidByDefault:string[];acceptanceChecks:string[]};
    compositionEscapes:Array<{id:string;when:string;composition:string;contentRequirements:string[];avoid:string[]}>;
  };
  return {entry,value};
});

describe("Integra contextual presets and reference guidance",()=>{
  it("gives every domain profile an explicit user flow and acceptance checks",()=>{
    expect(profiles.length).toBeGreaterThanOrEqual(9);
    for(const {entry,value} of profiles){
      expect(value.id).toBe(entry.id);
      expect(value.aiGuidance.primaryFlow.length,entry.id).toBeGreaterThan(30);
      expect(value.aiGuidance.prioritize.length,entry.id).toBeGreaterThanOrEqual(3);
      expect(value.aiGuidance.confirmOrMarkUnknown.length,entry.id).toBeGreaterThanOrEqual(2);
      expect(value.aiGuidance.acceptanceChecks.length,entry.id).toBeGreaterThanOrEqual(3);
    }
  });

  it("defines distinct, content-conditioned composition alternatives",()=>{
    for(const {entry,value} of profiles){
      const escapes=value.compositionEscapes;
      expect(escapes.length,entry.id).toBeGreaterThanOrEqual(3);
      expect(new Set(escapes.map((item)=>item.id)).size,entry.id).toBe(escapes.length);
      for(const escape of escapes){
        expect(escape.when.length,entry.id+":"+escape.id).toBeGreaterThan(20);
        expect(escape.composition.length,entry.id+":"+escape.id).toBeGreaterThan(35);
        expect(escape.contentRequirements.length,entry.id+":"+escape.id).toBeGreaterThanOrEqual(2);
        expect(escape.avoid.length,entry.id+":"+escape.id).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("resolves every profile reference ID to the canonical reference catalog",()=>{
    for(const {entry,value} of profiles) for(const id of value.references){
      expect(referenceIds.has(id),entry.id+" -> "+id).toBe(true);
    }
  });

  it("keeps reference verification claims explicit and source-specific",()=>{
    for(const source of referenceCatalog.references){
      expect(source.useWhen.length,source.id).toBeGreaterThan(0);
      expect(source.notFor.length,source.id).toBeGreaterThan(0);
      if(source.verificationStatus==="catalog-only"){
        expect(source.lastVerifiedAt).toBeNull();
        expect(source.verifiedPage).toBeNull();
      } else {
        expect(source.lastVerifiedAt).toBeTruthy();
        expect(source.verifiedPage).toBeTruthy();
      }
    }
  });

  it("uses a confirmation-gated neutral fallback when no niche matches",()=>{
    const result=routeDesignPreset("zzqv 729 no matching niche");
    expect(result.status).toBe("fallback");
    expect(result.styleId).toBe("clean_editorial");
    expect(result.confidence).toBe("low");
    expect(result.requiresConfirmation).toBe(true);
  });

  it("keeps tone separate from niche and style selection",()=>{
    const normal=routeDesignPreset("café artesanal premium");
    const loud=routeDesignPreset("café artesanal premium",{tone:"loud"});
    expect(loud.presetId).toBe(normal.presetId);
    expect(loud.styleId).toBe(normal.styleId);
    expect(loud.style.intensity).toBe("loud");
  });
});
