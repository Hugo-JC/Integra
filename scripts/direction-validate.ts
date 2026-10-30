import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseDirectionValidateArgs, validateDirectionDocument } from '../src/cli/direction.js';

const HELP = `Integra Direction Artifact Validator

Usage:
  npm run direction:validate -- --input path/to/direction-artifact.json

Options:
  --input  Direction Artifact JSON file to validate.
  --help   Show this help.

Exit codes:
  0  All validation layers passed.
  1  Validation failed or the input could not be read.
  2  Validation is inconclusive; human review is required.
`;

async function main(): Promise<void> {
  const options = parseDirectionValidateArgs(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(HELP);
    return;
  }

  const inputText = await readFile(resolve(options.inputPath!), 'utf8');
  const input = JSON.parse(inputText) as unknown;
  const result = validateDirectionDocument(input);
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');

  if (result.status === 'failed') process.exitCode = 1;
  else if (result.status === 'inconclusive') process.exitCode = 2;
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write('Direction validation failed: ' + message + '\n');
  process.exitCode = 1;
});
