import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { parseVisualIntelligenceGenerateArgs } from '../src/cli/visual-intelligence.js';
import { buildVisualIntelligenceBundle, serializeVisualIntelligenceBundle } from '../src/modules/direction/index.js';
import type { DirectionArtifact } from '../src/modules/direction/types.js';

const HELP = `Integra Visual Intelligence Bundle Generator

Usage:
  npm run visual-intelligence:generate -- --artifact path/to/direction.json --task "Primary user task" [options]

Required:
  --artifact     Existing Direction Artifact JSON (schema 1.1.0).
  --task         Primary task for the target surface.

Retrieval:
  --mode         persuade | operate | read | experience.
  --niche-id     Exact niche ID supplied or confirmed by the caller.
  --query        Optional query replacing the task for knowledge retrieval.
  --tag          Additional retrieval tag; may be repeated.
  --asset-type   Requested asset type; may be repeated.
  --limit        Source lead limit (1–5); defaults to 5.

Output:
  --out          Output JSON path; defaults to .integra/runs/visual-intelligence/bundle.json.
  --stdout       Write JSON to stdout instead of a file.
  --help         Show this help.

The command validates the Direction Artifact and Bundle before writing. It does not modify
application source, inspect remote references, or approve retrieved candidates.
`;

async function main(): Promise<void> {
  const options = parseVisualIntelligenceGenerateArgs(process.argv.slice(2));
  if (options.help) { process.stdout.write(HELP); return; }
  if (!options.artifactPath || !options.primaryTask) throw new TypeError('Both --artifact and --task are required.');

  const artifactText = await readFile(resolve(options.artifactPath), 'utf8');
  const directionArtifact = JSON.parse(artifactText) as DirectionArtifact;
  const bundle = buildVisualIntelligenceBundle({
    directionArtifact, primaryTask: options.primaryTask, mode: options.mode,
    nicheId: options.nicheId, query: options.query, tags: options.tags,
    assetTypes: options.assetTypes, limit: options.limit,
  });
  const serialized = serializeVisualIntelligenceBundle(bundle);

  if (options.stdout) process.stdout.write(serialized);
  else {
    const target = resolve(options.outputPath);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, serialized, 'utf8');
    process.stderr.write('Visual Intelligence Bundle written to ' + target + '\\n');
  }
  process.stderr.write(
    'Bundle ' + bundle.bundleId + ' · schema ' + bundle.schemaVersion +
    ' · observations ' + bundle.knowledge.observations.length + ' · validation passed\\n',
  );
}

main().catch((error: unknown) => {
  process.stderr.write('Visual Intelligence generation failed: ' +
    (error instanceof Error ? error.message : String(error)) + '\\n');
  process.exitCode = 1;
});
