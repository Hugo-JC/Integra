import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import type { ValidateFunction } from 'ajv';
import type { ErrorObject } from 'ajv';
import { Ajv2020 } from 'ajv/dist/2020.js';

interface PresetManifestEntry {
  id: string;
  path: string;
}

interface PresetManifest {
  version: string;
  presets: PresetManifestEntry[];
}

interface ReferenceCatalog {
  references: Array<{ id: string }>;
}

interface DesignPreset {
  id: string;
  references: string[];
  compositionEscapes: Array<{ id: string }>;
}

const root = process.cwd();
const presetRoot = resolve(root, 'presets');
const errors: string[] = [];
const readJson = (path: string): unknown => JSON.parse(readFileSync(path, 'utf8'));
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const readSchema = (path: string): object => {
  const schema: unknown = readJson(path);
  if (!isRecord(schema)) throw new Error(path + ' must contain a JSON schema object');
  return schema;
};
const isPresetManifest = (value: unknown): value is PresetManifest =>
  isRecord(value) &&
  typeof value.version === 'string' &&
  Array.isArray(value.presets) &&
  value.presets.every((entry: unknown) =>
    isRecord(entry) && typeof entry.id === 'string' && typeof entry.path === 'string',
  );
const formatValidationErrors = (validationErrors: ErrorObject[]): string[] =>
  validationErrors.map((item) => item.instancePath + ' ' + (item.message ?? 'is invalid'));
const validateAs = <T>(validator: ValidateFunction<T>, value: unknown): value is T =>
  validator(value);

const ajv = new Ajv2020({ allErrors: true, strict: true });
const presetValidator = ajv.compile<DesignPreset>(readSchema(resolve(root, 'schemas/design-preset.schema.json')));
const referenceValidator = ajv.compile<ReferenceCatalog>(readSchema(resolve(root, 'schemas/reference-catalog.schema.json')));

const rawPresetManifest = readJson(resolve(presetRoot, 'manifest.json'));
if (!isPresetManifest(rawPresetManifest)) {
  throw new Error('presets/manifest.json must contain a string version and presets[] entries with string id and path');
}
const presetManifest = rawPresetManifest;
const rawReferenceCatalog = readJson(resolve(root, 'references/catalog.json'));
let referenceCatalog: ReferenceCatalog | undefined;
if (!validateAs(referenceValidator, rawReferenceCatalog)) {
  errors.push(...formatValidationErrors(referenceValidator.errors ?? []).map((message) => 'references/catalog.json: ' + message));
} else {
  referenceCatalog = rawReferenceCatalog;
}
const referenceIds = new Set(referenceCatalog?.references.map((item) => item.id) ?? []);
const presetIds = new Set<string>();
const registeredPaths = new Set<string>();

for (const entry of presetManifest.presets) {
  if (presetIds.has(entry.id)) errors.push('Duplicate preset id: ' + entry.id);
  presetIds.add(entry.id);
  const file = resolve(presetRoot, entry.path);
  const relativePath = relative(presetRoot, file);
  if (
    !entry.path.endsWith('.json') ||
    isAbsolute(entry.path) ||
    relativePath.startsWith('..' + sep) ||
    relativePath === '..' ||
    isAbsolute(relativePath)
  ) {
    errors.push(entry.id + ': unsafe preset path ' + entry.path);
    continue;
  }
  registeredPaths.add(entry.path);
  if (!existsSync(file)) { errors.push(entry.id + ': missing preset file ' + entry.path); continue; }
  try {
    const preset: unknown = readJson(file);
    if (!validateAs(presetValidator, preset)) {
      errors.push(...formatValidationErrors(presetValidator.errors ?? []).map((message) => entry.id + ': ' + message));
      continue;
    }
    if (preset.id !== entry.id) errors.push(entry.id + ': file id does not match manifest');
    for (const reference of preset.references) if (!referenceIds.has(reference)) errors.push(entry.id + ': unknown reference id "' + reference + '"');
    const escapeIds = preset.compositionEscapes.map((item) => item.id);
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
