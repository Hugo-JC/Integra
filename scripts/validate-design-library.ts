import styles from '../data/design-library/design-styles.json' with { type: 'json' };
import library from '../data/design-library/local-presets.json' with { type: 'json' };
import refs from '../data/design-library/reference-sources.json' with { type: 'json' };

const styleMap = styles.styles as Record<string, unknown>;
const presets = library.presets as Array<{ id: string; style_id: string; match_terms?: string[]; variants?: Array<{ style_id: string }> }>;
const sources = refs.sources as Array<{ name: string; url: string }>;
const issues: string[] = [];
const ids = new Set<string>();

for (const preset of presets) {
  if (!preset.id || ids.has(preset.id)) issues.push(`Missing or duplicate preset id: ${preset.id}`);
  ids.add(preset.id);
  if (!styleMap[preset.style_id]) issues.push(`${preset.id} references unknown style ${preset.style_id}`);
  for (const variant of preset.variants ?? []) {
    if (!styleMap[variant.style_id]) issues.push(`${preset.id} references unknown variant style ${variant.style_id}`);
  }
  if (!preset.match_terms?.length) issues.push(`${preset.id} has no strong match terms`);
}
for (const source of sources) {
  try {
    const url = new URL(source.url);
    if (url.protocol !== 'https:') issues.push(`Reference must use HTTPS: ${source.url}`);
  } catch { issues.push(`Invalid reference URL: ${source.url}`); }
}
if (issues.length) {
  console.error(issues.join('\n'));
  process.exit(1);
}
console.log(`Design library valid: ${Object.keys(styleMap).length} styles, ${presets.length} presets, ${sources.length} reference sources.`);
