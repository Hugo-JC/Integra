import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import {
  generateDirectionFromInput,
  parseDirectionGenerateArgs,
} from '../src/cli/direction.js';
import { serializeDirectionArtifact } from '../src/modules/direction/index.js';

const HELP = `Integra Direction Generator

Usage:
  npm run direction:generate -- [--scenario DL-001] [--input path] [--out path]
  npm run direction:generate -- --stdout

Options:
  --scenario  Scenario identifier. DL-001 is the only generated scenario today.
  --input     JSON file containing directionContext or a DirectionContextInput object.
              Defaults to fixtures/brief-data/DL-001.json.
  --out       Output JSON path. Defaults to .integra/runs/direction/DL-001.json.
  --stdout    Write the Direction Artifact to stdout instead of a file.
  --help      Show this help.

The command validates the generated artifact before writing it.
`;

async function main(): Promise<void> {
  const options = parseDirectionGenerateArgs(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(HELP);
    return;
  }

  const inputText = await readFile(resolve(options.inputPath), 'utf8');
  const input = JSON.parse(inputText) as unknown;
  const result = generateDirectionFromInput(input, options.scenario);

  if (result.validation.status === 'failed') {
    process.stderr.write('Direction Artifact failed validation. No output was written.\n');
    process.stderr.write(JSON.stringify(result.validation, null, 2) + '\n');
    process.exitCode = 1;
    return;
  }

  const serialized = serializeDirectionArtifact(result.generation.artifact);
  if (options.stdout) {
    process.stdout.write(serialized);
  } else {
    const target = resolve(options.outputPath);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, serialized, 'utf8');
    process.stderr.write('Direction Artifact written to ' + target + '\n');
  }

  process.stderr.write(
    'Artifact ' + result.generation.artifact.artifactId +
    ' · schema ' + result.generation.artifact.schemaVersion +
    ' · validation ' + result.validation.status + '\n',
  );

  if (result.generation.diagnostics.length > 0) {
    process.stderr.write(
      'Generation diagnostics:\n' +
      result.generation.diagnostics.map((item) => '- ' + item.code + ': ' + item.message).join('\n') +
      '\n',
    );
    process.exitCode = 2;
  } else if (result.validation.status === 'inconclusive') {
    process.exitCode = 2;
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write('Direction generation failed: ' + message + '\n');
  process.exitCode = 1;
});
