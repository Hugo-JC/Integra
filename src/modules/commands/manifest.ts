import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import manifestJson from '../../../commands/manifest.json' with { type: 'json' };
import schemaJson from '../../../schemas/command-manifest.schema.json' with { type: 'json' };
import type { CommandDefinition, CommandManifest, CommandResolution } from './types.js';

const ajv = new Ajv2020({ allErrors: true, strict: true });
const validateSchema = ajv.compile(schemaJson);
const manifest = manifestJson as CommandManifest;

export interface ManifestValidation { valid:boolean; errors:string[]; }

/**
 * Validate the canonical command contract, cross-field invariants and referenced
 * portable skill files. The path checks are platform-independent (Windows/macOS/Linux).
 */
export function validateCommandManifest(candidate:unknown=manifest,root=process.cwd()):ManifestValidation {
  const errors:string[]=[];
  if (!validateSchema(candidate)) {
    errors.push(...(validateSchema.errors??[]).map((error)=>`${error.instancePath||'/'} ${error.message??'is invalid'}`));
    return {valid:false,errors};
  }
  const value=candidate as CommandManifest;
  const ids=new Set<string>(), invocations=new Set<string>();
  const skillRoot=resolve(root,'.agents','skills');
  for (const command of value.commands) {
    if (ids.has(command.id)) errors.push(`Duplicate command id: ${command.id}`);
    ids.add(command.id);
    if (invocations.has(command.invocation)) errors.push(`Duplicate invocation: ${command.invocation}`);
    invocations.add(command.invocation);
    if (command.kind==='modifier' && command.requiresActiveContext!==true) errors.push(`${command.id}: modifier must require active context`);
    if (command.kind!=='modifier' && command.requiresActiveContext===true) errors.push(`${command.id}: only modifiers may require active context`);
    if (command.kind==='orchestrator' && command.invocation!==value.invocation.orchestrator) errors.push('Orchestrator invocation mismatch');
    if (command.kind!=='orchestrator' && command.invocation===value.invocation.orchestrator) errors.push(`${command.id}: root invocation reserved for orchestrator`);
    for (const skill of command.skills) {
      const file=resolve(skillRoot,skill,'SKILL.md');
      const relativePath=relative(skillRoot,file);
      const escapesRoot=relativePath==='..'||relativePath.startsWith('..'+sep)||isAbsolute(relativePath);
      if (escapesRoot||!existsSync(file)) errors.push(`${command.id}: missing or unsafe skill reference "${skill}"`);
    }
  }
  if (value.commands.filter((item)=>item.kind==='orchestrator').length!==1) errors.push('Manifest must define exactly one orchestrator.');
  if (!ids.has('integra')) errors.push('Manifest must define the integra orchestrator.');
  return {valid:errors.length===0,errors};
}
export function getCommandManifest():CommandManifest {
  const validation=validateCommandManifest();
  if(!validation.valid) throw new Error(`Invalid Integra command manifest:\n- ${validation.errors.join('\n- ')}`);
  return manifest;
}
export function listCommands(kind?:CommandDefinition['kind']):CommandDefinition[] {
  return getCommandManifest().commands.filter((command)=>!kind||command.kind===kind);
}
/** Resolve an explicit invocation only; natural-language routing belongs to the pure router. */
export function resolveCommand(input:string):CommandResolution|null {
  const [invocation,...args]=input.trim().split(/\s+/);
  if(!invocation)return null;
  const command=getCommandManifest().commands.find((entry)=>entry.invocation===invocation);
  return command?{command,args}:null;
}
export function readCommandManifest(filePath:string):unknown {
  return JSON.parse(readFileSync(filePath,'utf8')) as unknown;
}
