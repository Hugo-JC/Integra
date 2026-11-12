import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  parseVisualIntelligenceValidateArgs,
} from '../src/cli/visual-intelligence.js';
import {
  validateVisualIntelligenceBundle,
} from '../src/modules/direction/index.js';

const HELP = `Integra Visual Intelligence Bundle Validator

Usage:
  npm run visual-intelligence:validate -- --input path/to/visual-intelligence-bundle.json

Options:
  --input  Bundle JSON file to validate.
  --help   Show this help.

Exit codes:
  0  Bundle schema, nested Direction Artifact and semantic relationships passed.
  1  Input could not be read or the Bundle is invalid.
`;

async function main(): Promise<void> {
  const options = parseVisualIntelligenceValidateArgs(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(HELP);
    return;
  }

  const inputText = await readFile(resolve(options.inputPath!), 'utf8');
  const input = JSON.parse(inputText) as unknown;
  const result = validateVisualIntelligenceBundle(input);
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');

  if (result.status === 'failed') process.exitCode = 1;
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write('Visual Intelligence validation failed: ' + message + '\n');
  process.exitCode = 1;
});
