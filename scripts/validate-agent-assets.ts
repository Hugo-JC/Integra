import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = process.cwd();
const errors: string[] = [];
function json<T>(file: string): T {
  return JSON.parse(readFileSync(resolve(root, file), 'utf8')) as T;
}

type PresetSource = {
  referenceId?: string;
  url?: string;
  patternCues?: string[];
  verificationStatus?: string;
  lastVerifiedAt?: string | null;
  verifiedPage?: string | null;
};
type Preset = {
  id: string;
  matchTerms: string[];
  principles: string[];
  styleId?: string;
  variants?: Array<{ when_any: string[]; style_id: string }>;
  sources: PresetSource[];
};
const presets = json<{
  schemaVersion: string;
  styleIds: string[];
  agentGuidance?: Record<string, string>;
  presets: Preset[];
}>('presets/catalog.json');

if (presets.schemaVersion !== '1.0.0' || presets.presets.length < 50) {
  errors.push('Preset catalog version/count is invalid.');
}
if (new Set(presets.presets.map((preset) => preset.id)).size !== presets.presets.length) {
  errors.push('Preset IDs must be unique.');
}
const styleIds = new Set(presets.styleIds);
const guidanceKeys = ['presetUse', 'variantUse', 'patternUse', 'referenceUse', 'sourceTrust', 'output', 'nonCopying'];
for (const key of guidanceKeys) {
  if (!presets.agentGuidance?.[key]) errors.push('Preset AI guidance is missing: ' + key);
}
for (const preset of presets.presets) {
  if (!preset.matchTerms.length || !preset.principles.length) {
    errors.push('Preset ' + preset.id + ' needs match terms and principles.');
  }
  if (preset.styleId && !styleIds.has(preset.styleId)) {
    errors.push('Preset ' + preset.id + ' references unknown style ' + preset.styleId);
  }
  for (const variant of preset.variants ?? []) {
    if (!variant.when_any.length || !styleIds.has(variant.style_id)) {
      errors.push('Preset ' + preset.id + ' has an invalid style variant.');
    }
  }
  for (const source of preset.sources ?? []) {
    const statusValid = ['catalog-only', 'verified'].includes(source.verificationStatus ?? '');
    const catalogOnly = source.verificationStatus === 'catalog-only' && source.lastVerifiedAt === null;
    const verified = source.verificationStatus === 'verified' && Boolean(source.lastVerifiedAt && source.verifiedPage);
    if (!source.referenceId || !/^https:\/\//i.test(source.url ?? '') ||
        !source.patternCues?.length || !statusValid || !(catalogOnly || verified)) {
      errors.push('Preset ' + preset.id + ' has incomplete or misleading reference metadata.');
    }
  }
}

const skillsRoot = resolve(root, '.agents/skills');
const dirs = readdirSync(skillsRoot).filter((name) => statSync(join(skillsRoot, name)).isDirectory());
const names = new Set<string>();
for (const dir of dirs) {
  try {
    const body = readFileSync(join(skillsRoot, dir, 'SKILL.md'), 'utf8');
    const name = body.match(/^name:\s*(.+)$/m)?.[1]?.trim();
    const desc = body.match(/^description:\s*(.+)$/m)?.[1]?.trim();
    if (!name || !desc || name !== dir || names.has(name)) errors.push('Invalid or duplicate skill: ' + dir);
    if (name) names.add(name);
  } catch {
    errors.push('Missing skill: ' + dir);
  }
}
if (!readFileSync(resolve(root, 'GEMINI.md'), 'utf8').includes('.agents/skills/')) {
  errors.push('GEMINI.md must point to canonical skills.');
}

const sources = json<{
  sources: Array<{ id: string; url: string; verificationStatus?: string; lastVerifiedAt?: string | null; verifiedPage?: string | null }>;
}>('docs/references/sources.json');
if (sources.sources.length < 10 || new Set(sources.sources.map((source) => source.id)).size !== sources.sources.length) {
  errors.push('Reference catalog must have 10+ unique sources.');
}
for (const source of sources.sources) {
  const statusValid = ['catalog-only', 'verified'].includes(source.verificationStatus ?? '');
  const catalogOnly = source.verificationStatus === 'catalog-only' && source.lastVerifiedAt === null;
  const verified = source.verificationStatus === 'verified' && Boolean(source.lastVerifiedAt && source.verifiedPage);
  if (!/^https:\/\//i.test(source.url) || !statusValid || !(catalogOnly || verified)) {
    errors.push('Reference ' + source.id + ' must be explicitly marked as a catalog lead until inspected.');
  }
}

const patterns = json<{ archetypes: Array<{ id: string; buildingBlocks: string[]; qualityChecks: string[] }> }>(
  'presets/experience-patterns.json',
);
if (patterns.archetypes.length < 10 || new Set(patterns.archetypes.map((item) => item.id)).size !== patterns.archetypes.length) {
  errors.push('Experience archetypes must be unique and number at least 10.');
}

const rules = json<{
  evidencePolicy?: { defaultStatus: string; requireObservedEvidence: boolean; severityIsNotProof: boolean };
  severityDefinitions?: Record<string, string>;
  findingContract?: string[];
  rules: Array<{ id: string; severity: string; requiredEvidence: string; status?: string }>;
}>('rules/design-quality-rules.json');
if (!rules.evidencePolicy || rules.evidencePolicy.defaultStatus !== 'candidate' ||
    !rules.evidencePolicy.requireObservedEvidence || !rules.evidencePolicy.severityIsNotProof) {
  errors.push('Quality rules need an explicit evidence-first policy.');
}
if (!rules.severityDefinitions || !['P0', 'P1', 'P2', 'P3'].every((key) => rules.severityDefinitions?.[key])) {
  errors.push('Quality rules need definitions for P0–P3 severity.');
}
if (!rules.findingContract?.length) errors.push('Quality rules need a structured finding contract.');
if (rules.rules.length < 20 || new Set(rules.rules.map((rule) => rule.id)).size !== rules.rules.length ||
    rules.rules.some((rule) => !['P0', 'P1', 'P2', 'P3'].includes(rule.severity) ||
      !rule.requiredEvidence || rule.status !== 'heuristic')) {
  errors.push('Quality rules must be unique, evidence-led heuristics with explicit evidence requirements.');
}

const vocabulary = json<{ commands: Array<{ name: string; intent: string }> }>('commands/vocabulary.json');
if (vocabulary.commands.length < 15 || new Set(vocabulary.commands.map((command) => command.name)).size !== vocabulary.commands.length) {
  errors.push('Command vocabulary must have 15+ unique entries.');
}

if (errors.length) {
  errors.forEach((error) => console.error('✖ ' + error));
  process.exitCode = 1;
} else {
  const referenceCount = presets.presets.reduce((total, preset) => total + preset.sources.length, 0);
  console.log('✓ ' + presets.presets.length + ' presets, ' + referenceCount + ' preset references, ' +
    patterns.archetypes.length + ' archetypes, ' + rules.rules.length + ' rules, ' +
    vocabulary.commands.length + ' verbs, ' + dirs.length + ' skills and ' +
    sources.sources.length + ' reference sources validated.');
}
