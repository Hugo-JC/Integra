import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Ajv2020 } from 'ajv/dist/2020.js';
const root = process.cwd(); const errors: string[] = [];
const readJson = (path: string): any => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const ajv = new Ajv2020({ allErrors: true, strict: false });
const sourceSchema = readJson('schemas/visual-source.schema.json');
const assetSchema = readJson('schemas/asset-source.schema.json');
ajv.addSchema(sourceSchema); ajv.addSchema(assetSchema);
const compile = (path: string) => ajv.compile(readJson(path));
const sourceCatalogValidator = compile('schemas/visual-sources.schema.json');
const assetCatalogValidator = compile('schemas/asset-sources.schema.json');
const tokenValidator = compile('schemas/token-system.schema.json');
const patternValidator = compile('schemas/layout-pattern.schema.json');
const ruleValidator = compile('schemas/design-rule.schema.json');
const ruleCatalogValidator = compile('schemas/design-rules-catalog.schema.json');
const nicheValidator = compile('schemas/niche-reference-map.schema.json');
const antiValidator = compile('schemas/anti-pattern.schema.json');
const exampleValidator = compile('schemas/design-example.schema.json');
const observationCatalogValidator = compile('schemas/reference-observations.schema.json');
const sources = readJson('data/design-library/visual-sources.json');
const nicheMap = readJson('data/design-library/niche-reference-map.json');
const tokens = readJson('data/design-library/token-systems.json');
const layouts = readJson('data/design-library/layout-patterns.json');
const rules = readJson('data/design-library/design-rules.json');
const anti = readJson('data/design-library/anti-patterns.json');
const examples = readJson('data/design-library/examples/index.json');
const assets = readJson('data/design-library/asset-sources.json');
const observations = readJson('data/design-library/reference-observations.json');
const presets = readJson('data/design-library/local-presets.json');
function validate(label: string, items: any[], validator: any) {
  for (const item of items) if (!validator(item)) errors.push(label + ': ' + JSON.stringify(validator.errors ?? []));
}
function unique(label: string, ids: string[]) { if (new Set(ids).size !== ids.length) errors.push(label + ' contains duplicate IDs.'); }
if (!sourceCatalogValidator(sources)) errors.push('visual source catalog: ' + JSON.stringify(sourceCatalogValidator.errors ?? []));
if (!assetCatalogValidator(assets)) errors.push('asset source catalog: ' + JSON.stringify(assetCatalogValidator.errors ?? []));
if (!ruleCatalogValidator(rules)) errors.push('design rules catalog: ' + JSON.stringify(ruleCatalogValidator.errors ?? []));
if (!observationCatalogValidator(observations)) errors.push('reference observations catalog: ' + JSON.stringify(observationCatalogValidator.errors ?? []));
validate('token system', tokens.tokenSystems, tokenValidator);
validate('layout pattern', layouts.patterns, patternValidator);
validate('design rule', rules.rules, ruleValidator);
validate('anti-pattern', anti.antiPatterns, antiValidator);
validate('example', examples.examples, exampleValidator);
if (!nicheValidator(nicheMap)) errors.push('niche map: ' + JSON.stringify(nicheValidator.errors ?? []));
unique('visual source IDs', sources.sources.map((x: any) => x.id));
unique('niche IDs', nicheMap.niches.map((x: any) => x.nicheId));
unique('token IDs', tokens.tokenSystems.map((x: any) => x.id));
unique('layout pattern IDs', layouts.patterns.map((x: any) => x.id));
unique('design rule IDs', rules.rules.map((x: any) => x.id));
unique('anti-pattern IDs', anti.antiPatterns.map((x: any) => x.id));
unique('example IDs', examples.examples.map((x: any) => x.id));
unique('asset source IDs', assets.providers.map((x: any) => x.id));
unique('observation IDs', observations.observations.map((x: any) => x.id));
const sourceIds = new Set(sources.sources.map((x: any) => x.id));
const nicheIds = new Set(nicheMap.niches.map((x: any) => x.nicheId));
for (const niche of nicheMap.niches) {
  if (!presets.presets.some((preset: any) => preset.id === niche.nicheId)) errors.push('Unknown niche mapping: ' + niche.nicheId);
  for (const id of niche.sourceIds) if (!sourceIds.has(id)) errors.push(niche.nicheId + ' references unknown source ' + id);
}
for (const preset of presets.presets) if (!nicheIds.has(preset.id)) errors.push('Missing niche map for ' + preset.id);
for (const source of sources.sources) {
  if (source.verificationStatus === 'catalog-only' && (source.lastVerifiedAt !== null || source.verifiedPage !== null)) errors.push(source.id + ' catalog-only entry has verification metadata.');
  if (source.verificationStatus === 'verified' && (!source.lastVerifiedAt || !source.verifiedPage)) errors.push(source.id + ' verified entry lacks page/date.');
}
for (const asset of assets.providers) if (asset.verificationStatus === 'catalog-only' && !asset.perAssetVerificationRequired) errors.push(asset.id + ' must require per-asset verification.');
for (const observation of observations.observations) {
  if (!sourceIds.has(observation.sourceId)) errors.push(observation.id + ' references unknown visual source ' + observation.sourceId);
  if (observation.verificationStatus === 'verified' && observation.evidenceType === 'inference') errors.push(observation.id + ' cannot be verified solely from inference.');
}
const tokenIds = new Set(tokens.tokenSystems.map((x: any) => x.id));
const patternIds = new Set(layouts.patterns.map((x: any) => x.id));
const ruleIds = new Set(rules.rules.map((x: any) => x.id));
const antiIds = new Set(anti.antiPatterns.map((x: any) => x.id));
for (const pattern of layouts.patterns) for (const id of pattern.references) if (!sourceIds.has(id)) errors.push(pattern.id + ' references unknown source ' + id);
for (const rule of rules.rules) for (const id of rule.references) if (!sourceIds.has(id)) errors.push(rule.id + ' references unknown source ' + id);
for (const example of examples.examples) {
  for (const id of example.tokenSystemIds) if (!tokenIds.has(id)) errors.push(example.id + ' unknown token ' + id);
  for (const id of example.patternIds) if (!patternIds.has(id)) errors.push(example.id + ' unknown pattern ' + id);
  for (const id of example.ruleIds) if (!ruleIds.has(id)) errors.push(example.id + ' unknown rule ' + id);
  for (const id of example.antiPatternIds) if (!antiIds.has(id)) errors.push(example.id + ' unknown anti-pattern ' + id);
  for (const id of example.referenceIds) if (!sourceIds.has(id)) errors.push(example.id + ' unknown reference ' + id);
}
if (nicheMap.niches.length !== presets.presets.length) errors.push('Niche-map coverage count differs from local preset count.');
if (errors.length) { console.error('Visual knowledge validation failed:\n- ' + errors.join('\n- ')); process.exitCode = 1; }
else console.log('Validated ' + sources.sources.length + ' visual sources, ' + assets.providers.length + ' asset providers, ' + nicheMap.niches.length + ' niche mappings, ' + tokens.tokenSystems.length + ' token recipes, ' + layouts.patterns.length + ' layout patterns, ' + rules.rules.length + ' rules, ' + anti.antiPatterns.length + ' anti-patterns, ' + examples.examples.length + ' examples and ' + observations.observations.length + ' observations.');
