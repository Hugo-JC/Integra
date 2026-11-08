import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root=process.cwd(), errors:string[]=[];
function json<T>(file:string):T{return JSON.parse(readFileSync(resolve(root,file),'utf8')) as T;}
const presets=json<{schemaVersion:string;presets:Array<{id:string;matchTerms:string[];principles:string[]}>}>('presets/catalog.json');
if(presets.schemaVersion!=='1.0.0'||presets.presets.length<50)errors.push('Preset catalog version/count is invalid.');
if(new Set(presets.presets.map(x=>x.id)).size!==presets.presets.length)errors.push('Preset IDs must be unique.');
for(const p of presets.presets)if(!p.matchTerms.length||!p.principles.length)errors.push('Preset '+p.id+' needs match terms and principles.');
const skillsRoot=resolve(root,'.agents/skills');
const dirs=readdirSync(skillsRoot).filter(x=>statSync(join(skillsRoot,x)).isDirectory());
const names=new Set<string>();
for(const dir of dirs){try{const body=readFileSync(join(skillsRoot,dir,'SKILL.md'),'utf8');const name=body.match(/^name:\s*(.+)$/m)?.[1]?.trim();const desc=body.match(/^description:\s*(.+)$/m)?.[1]?.trim();if(!name||!desc||name!==dir||names.has(name))errors.push('Invalid or duplicate skill: '+dir);if(name)names.add(name);}catch{errors.push('Missing skill: '+dir);}}
if(!readFileSync(resolve(root,'GEMINI.md'),'utf8').includes('.agents/skills/'))errors.push('GEMINI.md must point to canonical skills.');
const sources=json<{sources:Array<{id:string;url:string}>}>('docs/references/sources.json');
if(sources.sources.length<10||new Set(sources.sources.map(x=>x.id)).size!==sources.sources.length)errors.push('Reference catalog must have 10+ unique sources.');
const patterns=json<{archetypes:Array<{id:string;buildingBlocks:string[];qualityChecks:string[]}>}>('presets/experience-patterns.json');
if(patterns.archetypes.length<10||new Set(patterns.archetypes.map(x=>x.id)).size!==patterns.archetypes.length)errors.push('Experience archetypes must be unique and number at least 10.');
const rules=json<{rules:Array<{id:string;severity:string;requiredEvidence:string}>}>('rules/design-quality-rules.json');
if(rules.rules.length<20||new Set(rules.rules.map(x=>x.id)).size!==rules.rules.length||rules.rules.some(x=>!['P0','P1','P2','P3'].includes(x.severity)||!x.requiredEvidence))errors.push('Quality rules must be unique and evidence-led.');
const vocabulary=json<{commands:Array<{name:string;intent:string}>}>('commands/vocabulary.json');
if(vocabulary.commands.length<15||new Set(vocabulary.commands.map(x=>x.name)).size!==vocabulary.commands.length)errors.push('Command vocabulary must have 15+ unique entries.');
if(errors.length){errors.forEach(x=>console.error('✖ '+x));process.exitCode=1;}
else console.log('✓ '+presets.presets.length+' presets, '+patterns.archetypes.length+' archetypes, '+rules.rules.length+' rules, '+vocabulary.commands.length+' verbs, '+dirs.length+' skills and '+sources.sources.length+' references validated.');
