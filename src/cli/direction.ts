import { normalizeDirectionContextDetailed } from '../modules/context/index.js';
import { validateDirectionArtifact } from '../modules/direction/index.js';
import type { DirectionArtifactValidationResult } from '../modules/direction/artifact-validation.js';
import { generateProductLandingDirection } from '../modules/direction/product-landing.js';
import type { DirectionGenerationResult } from '../modules/direction/product-landing.js';

export interface DirectionGenerateOptions {
  scenario: string;
  inputPath: string;
  outputPath: string;
  stdout: boolean;
  help: boolean;
}

export interface DirectionValidateOptions {
  inputPath?: string;
  help: boolean;
}

export interface DirectionCommandResult {
  generation: DirectionGenerationResult;
  validation: DirectionArtifactValidationResult;
}

export function parseDirectionGenerateArgs(args: readonly string[]): DirectionGenerateOptions {
  const values = new Map<string, string>();
  let stdout = false;
  let help = false;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--help' || argument === '-h') {
      help = true;
      continue;
    }
    if (argument === '--stdout') {
      if (stdout) throw new TypeError('Option --stdout was provided more than once.');
      stdout = true;
      continue;
    }
    if (!['--scenario', '--input', '--out'].includes(argument)) {
      throw new TypeError('Unknown option: ' + argument);
    }
    if (values.has(argument)) throw new TypeError('Option ' + argument + ' was provided more than once.');
    const value = args[index + 1];
    if (!value || value.startsWith('--')) {
      throw new TypeError('Option ' + argument + ' requires a value.');
    }
    values.set(argument, value);
    index += 1;
  }

  if (stdout && values.has('--out')) {
    throw new TypeError('Use either --stdout or --out, not both.');
  }

  return {
    scenario: values.get('--scenario') ?? 'DL-001',
    inputPath: values.get('--input') ?? 'fixtures/brief-data/DL-001.json',
    outputPath: values.get('--out') ?? '.integra/runs/direction/DL-001.json',
    stdout,
    help,
  };
}

export function parseDirectionValidateArgs(args: readonly string[]): DirectionValidateOptions {
  let inputPath: string | undefined;
  let help = false;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--help' || argument === '-h') {
      help = true;
      continue;
    }
    if (argument !== '--input') throw new TypeError('Unknown option: ' + argument);
    if (inputPath !== undefined) throw new TypeError('Option --input was provided more than once.');
    const value = args[index + 1];
    if (!value || value.startsWith('--')) throw new TypeError('Option --input requires a value.');
    inputPath = value;
    index += 1;
  }

  if (!help && !inputPath) throw new TypeError('Missing required option --input.');
  return { inputPath, help };
}

export function extractDirectionContext(input: unknown): unknown {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return input;
  if (Object.hasOwn(input, 'directionContext')) {
    return (input as Record<string, unknown>).directionContext;
  }
  return input;
}

export function generateDirectionFromInput(
  input: unknown,
  scenario: string,
): DirectionCommandResult {
  if (scenario !== 'DL-001') {
    throw new TypeError(
      'Direction generation is currently implemented only for DL-001. Received: ' + scenario,
    );
  }

  const normalized = normalizeDirectionContextDetailed(extractDirectionContext(input));
  if (!normalized.context || normalized.issues.length > 0) {
    const details = normalized.issues
      .map((issue) => issue.path + ' [' + issue.code + '] ' + issue.message)
      .join('\n');
    throw new TypeError('Direction context is invalid:\n' + details);
  }

  const generation = generateProductLandingDirection(normalized.context);
  const validation = validateDirectionArtifact(generation.artifact);
  return { generation, validation };
}

export function validateDirectionDocument(input: unknown): DirectionArtifactValidationResult {
  return validateDirectionArtifact(input);
}
