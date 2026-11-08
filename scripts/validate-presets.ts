import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';
import type { ErrorObject } from 'ajv';
import { Ajv2020 } from 'ajv/dist/2020.js';

const root = process.cwd();
const presetRoot = resolve(root, 'presets');
const errors: string[] = [];
const readJson = (path: string): unknown => JSON.parse(readFileSync(path, 'utf8'));
const readSchema = (path: string): object => {
  const schema = readJson(path);
  if (typeof schema !== 'object' || schema === null || Array.isArray(schema)) {
    throw new Error(path + ' must contain a JSON schema object');
  }
  return schema;
};
const ajv = new Ajv2020({ allErrors: true, strict: true });
const presetSchema = readSchema(resolve(root, 'schemas/design-preset.schema.json'));
const referenceSchema = readSchema(resolve(root, 'schemas/reference-catalog.schema.json'));
const presetValidator = ajv.compile(presetSchema);
const referenceValidator = ajv.compile(referenceSchema);

const presetManifest = readJson(resolve(presetRoot, 'manifest.json')) as {
  version: string;
  presets: Array<{ id: string; path: string }>;
};
const referenceCatalog = readJson(resolve(root, 'references/catalog.json')) as { references: Array<{ id: string }> };
if (!referenceValidator(referenceCatalog)) {
  errors.push(...(referenceValidator.errors ?? []).map((item: ErrorObject) => 'references/catalog.json: ' + item.instancePath + ' ' + item.message));
}
const referenceIds = new Set(referenceCatalog.references.map((item) => item.id));
const presetIds = new Set<string>();
const registeredPaths = new Set<string>();

for (const entry of presetManifest.presets) {
  if (presetIds.has(entry.id)) errors.push('Duplicate preset id: ' + entry.id);
  presetIds.add(entry.id);
  const file = resolve(presetRoot, entry.path);
  const relativePath = relative(presetRoot, file);
  if (!entry.path.endsWith('.json') || relativePath.startsWith('..' + sep) || relativePath === '..') {
    errors.push(entry.id + ': unsafe preset path ' + entry.path);
    continue;
  }
  registeredPaths.add(entry.path);
  if (!existsSync(file)) { errors.push(entry.id + ': missing preset file ' + entry.path); continue; }
  try {
    const preset = readJson(file) as { id: string; references?: string[]; compositionEscapes?: Array<{ id: string }> };
    if (preset.id !== entry.id) errors.push(entry.id + ': file id does not match manifest');
    if (!presetValidator(preset)) errors.push(...(presetValidator.errors ?? []).map((item: ErrorObject) => entry.id + ': ' + item.instancePath + ' ' + item.message));
    for (const reference of preset.references ?? []) if (!referenceIds.has(reference)) errors.push(entry.id + ': unknown reference id "' + reference + '"');
    const escapeIds = (preset.compositionEscapes ?? []).map((item) => item.id);
    if (new Set(escapeIds).size !== escapeIds.length) errors.push(entry.id + ': composition escape IDs must be unique');
  } catch (error) {
    errors.push(entry.id + ': invalid JSON or unreadable preset (' + String(error) + ')');
  }
}
const allowedSharedFiles = new Set(['manifest.json','catalog.json','design-styles-v3.json','ai-design-engine-v3.json','experience-patterns.json']);
for (const file of readdirSync(presetRoot)) {
  if (file.endsWith('.json') && !registeredPaths.has(file) && !allowedSharedFiles.has(file)) errors.push('Unregistered preset file: ' + file);
}
if (errors.length) {
  console.error('Preset validation failed:\n- ' + errors.join('\n- '));
  process.exitCode = 1;
} else {
  console.log('Validated ' + presetIds.size + ' contextual product profiles, ' + referenceIds.size + ' reference IDs and reference schema.');
}
