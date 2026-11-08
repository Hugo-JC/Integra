import { routeDesignPreset } from '../src/modules/direction/presets/router.js';

const args = process.argv.slice(2);
const json = args.includes('--json');
const toneIndex = args.indexOf('--tone');
let tone: 'calm' | 'loud' | undefined;
if (toneIndex >= 0) {
  const value = args[toneIndex + 1];
  if (value !== 'calm' && value !== 'loud') {
    console.error('Usage: npm run design:route -- "brief" [--tone calm|loud] [--json]');
    process.exit(1);
  }
  tone = value;
}
const toneValueIndex = toneIndex >= 0 ? toneIndex + 1 : -1;
const query = args.filter((arg, index) => arg !== '--json' && arg !== '--tone' && index !== toneValueIndex).join(' ').trim();
if (!query) {
  console.error('Usage: npm run design:route -- "brief" [--tone calm|loud] [--json]');
  process.exit(1);
}
try {
  const result = routeDesignPreset(query, { tone });
  console.log(json ? JSON.stringify(result, null, 2) : [
    `Status: ${result.status} · confidence: ${result.confidence}`,
    `Preset: ${result.presetId ?? 'none'} · style: ${result.styleId}`,
    `Matched: ${result.matchedTerms.join(', ') || 'none'}`,
    `Alternatives: ${result.alternatives.join(', ') || 'none'}`,
    `Confirmation required: ${result.requiresConfirmation ? 'yes' : 'no'}`,
    result.reason,
  ].join('\n'));
  if (result.requiresConfirmation) process.exitCode = 2;
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
