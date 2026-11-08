import { describe,expect,it } from "vitest";
import { getCommandManifest,listCommands,resolveCommand,validateCommandManifest } from "../src/modules/commands/manifest.js";
describe("Integra command manifest",()=>{
  it("validates schema, command identities and skill references",()=>{const r=validateCommandManifest();expect(r.valid,r.errors.join("\n")).toBe(true);});
  it("keeps one orchestrator and separate workflow/modifier kinds",()=>{expect(listCommands("orchestrator")).toHaveLength(1);expect(listCommands("workflow").length).toBeGreaterThan(0);expect(listCommands("modifier").length).toBeGreaterThan(0);});
  it("rejects duplicate IDs and invocations",()=>{const value=structuredClone(getCommandManifest());value.commands.push({...value.commands[1],id:value.commands[0].id});const r=validateCommandManifest(value);expect(r.valid).toBe(false);expect(r.errors.some((e)=>e.includes("Duplicate command id"))).toBe(true);expect(r.errors.some((e)=>e.includes("Duplicate invocation"))).toBe(true);});
  it("requires active context for every modifier",()=>{const value=structuredClone(getCommandManifest());const modifier=value.commands.find((item)=>item.kind==="modifier");if(modifier) modifier.requiresActiveContext=false;expect(validateCommandManifest(value).valid).toBe(false);});
  it("resolves explicit commands and preserves arguments",()=>{const r=resolveCommand("/integra:direction mobile dashboard");expect(r?.command.id).toBe("direction");expect(r?.args).toEqual(["mobile","dashboard"]);});
});
