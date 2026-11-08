import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const readJson = <T>(path: string): T => JSON.parse(readFileSync(join(root, path), 'utf8')) as T;

interface LegacyNiche {
  id: string;
  style_id: string;
  integra_preset_id: string;
  match_terms?: string[];
}

interface PresetManifest {
  presets: Array<{ id: string; path: string }>;
}

interface LegacyStyleCatalog {
  styles: Record<string, unknown>;
}

const errors: string[] = [];
const nicheCatalog = readJson<{ presets: LegacyNiche[] }>('references/ade-knowledge/local-presets.json');
const legacyStyles = readJson<LegacyStyleCatalog>('references/ade-knowledge/design-styles.json');
const currentPresets = readJson<PresetManifest>('presets/manifest.json');

const presetIds = new Set(currentPresets.presets.map((preset) => preset.id));
const styleIds = new Set(Object.keys(legacyStyles.styles));
const nicheIds = new Set<string>();

if (nicheCatalog.presets.length !== 61) {
  errors.push(`Expected 61 migrated niche profiles, found ${nicheCatalog.presets.length}.`);
}
if (styleIds.size !== 17) {
  errors.push(`Expected 17 legacy style systems, found ${styleIds.size}.`);
}

for (const niche of nicheCatalog.presets) {
  if (!niche.id || nicheIds.has(niche.id)) errors.push(`Missing or duplicate niche id: ${niche.id || '(empty)'}`);
  nicheIds.add(niche.id);
  if (!styleIds.has(niche.style_id)) errors.push(`${niche.id}: unknown legacy style id "${niche.style_id}".`);
  if (!presetIds.has(niche.integra_preset_id)) errors.push(`${niche.id}: unmapped Integra preset "${niche.integra_preset_id}".`);
  if (!Array.isArray(niche.match_terms) || niche.match_terms.length === 0) errors.push(`${niche.id}: match_terms must be a non-empty array.`);
}

if (errors.length) {
  console.error('Legacy knowledge validation failed:\n- ' + errors.join('\n- '));
  process.exitCode = 1;
} else {
  console.log(`Validated ${nicheIds.size} niche profiles and ${styleIds.size} legacy style systems.`);
}
