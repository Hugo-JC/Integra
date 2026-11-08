import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

interface PresetManifest {
  version: string;
  presets: Array<{ id: string; path: string }>;
}

const root = join(process.cwd(), 'presets');
const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8')) as PresetManifest;
const errors: string[] = [];
const ids = new Set<string>();

for (const entry of manifest.presets) {
  if (ids.has(entry.id)) errors.push(`Duplicate preset id: ${entry.id}`);
  ids.add(entry.id);
  try {
    const preset = JSON.parse(readFileSync(join(root, entry.path), 'utf8')) as Record<string, unknown>;
    if (preset.id !== entry.id) errors.push(`${entry.id}: file id does not match manifest`);
    for (const key of ['name', 'version', 'productContexts', 'designIntent', 'visualDirection', 'layout', 'components', 'accessibility', 'antiPatterns', 'references']) {
      if (!(key in preset)) errors.push(`${entry.id}: missing required property "${key}"`);
    }
    if (!Array.isArray(preset.productContexts) || preset.productContexts.length === 0) errors.push(`${entry.id}: productContexts must be a non-empty array`);
  } catch {
    errors.push(`${entry.id}: cannot read preset file "${entry.path}"`);
  }
}

const files = readdirSync(root);
for (const file of files) {
  if (file.endsWith('.json') && file !== 'manifest.json' && !manifest.presets.some((entry) => entry.path === file)) {
    errors.push(`Unregistered preset file: ${file}`);
  }
}

if (errors.length) {
  console.error('Preset validation failed:\n- ' + errors.join('\n- '));
  process.exitCode = 1;
} else {
  console.log(`Validated ${manifest.presets.length} design presets (manifest v${manifest.version}).`);
}
