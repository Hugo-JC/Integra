import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Ajv2020 from 'ajv/dist/2020';
import type { ErrorObject } from 'ajv';
import manifestJson from '../../../commands/manifest.json' with { type: 'json' };
import schemaJson from '../../../schemas/command-manifest.schema.json' with { type: 'json' };
import type { CommandDefinition, CommandManifest, CommandResolution } from './types.js';

const ajv = new Ajv2020({ allErrors: true, strict: true });
const validateSchema = ajv.compile(schemaJson);
const manifest = manifestJson as CommandManifest;

export interface ManifestValidation {
  valid: boolean;
  errors: string[];
}

export function validateCommandManifest(
  candidate: unknown = manifest,
  root = process.cwd(),
): ManifestValidation {
  const errors: string[] = [];
  if (!validateSchema(candidate)) {
    errors.push(...(validateSchema.errors ?? []).map((error: ErrorObject) =>
      `${error.instancePath || '/'} ${error.message ?? 'is invalid'}`,
    ));
    return { valid: false, errors };
  }

  const value = candidate as CommandManifest;
  const ids = new Set<string>();
  const invocations = new Set<string>();
  const skillRoot = resolve(root, '.agents/skills');

  for (const command of value.commands) {
    if (ids.has(command.id)) errors.push(`Duplicate command id: ${command.id}`);
    ids.add(command.id);

    if (invocations.has(command.invocation)) errors.push(`Duplicate invocation: ${command.invocation}`);
    invocations.add(command.invocation);

    if (command.kind === 'orchestrator' && command.invocation !== value.invocation.orchestrator) {
      errors.push(`${command.id}: orchestrator invocation must be ${value.invocation.orchestrator}`);
    }
    if (command.kind !== 'orchestrator' && command.invocation === value.invocation.orchestrator) {
      errors.push(`${command.id}: only the orchestrator may use the root invocation`);
    }
    if (command.kind === 'modifier' && command.id === 'integra') {
      errors.push('The orchestrator cannot be a modifier.');
    }

    for (const skill of command.skills) {
      const skillFile = resolve(skillRoot, skill, 'SKILL.md');
      if (!skillFile.startsWith(skillRoot + '/') || !existsSync(skillFile)) {
        errors.push(`${command.id}: missing or unsafe skill reference "${skill}"`);
      }
    }
  }

  const orchestrators = value.commands.filter((command) => command.kind === 'orchestrator');
  if (orchestrators.length !== 1) errors.push('Manifest must define exactly one orchestrator.');
  return { valid: errors.length === 0, errors };
}

export function getCommandManifest(): CommandManifest {
  const result = validateCommandManifest();
  if (!result.valid) throw new Error(`Invalid Integra command manifest:\n- ${result.errors.join('\n- ')}`);
  return manifest;
}

export function listCommands(kind?: CommandDefinition['kind']): CommandDefinition[] {
  const commands = getCommandManifest().commands;
  return commands.filter((command) => !kind || command.kind === kind);
}

/** Resolves only explicit manifest invocations; host adapters own natural-language routing. */
export function resolveCommand(input: string): CommandResolution | null {
  const [invocation, ...args] = input.trim().split(/\s+/);
  if (!invocation) return null;
  const command = getCommandManifest().commands.find((entry) => entry.invocation === invocation);
  return command ? { command, args } : null;
}

/** Reads the canonical manifest from disk for tooling that validates working-tree changes. */
export function readCommandManifest(filePath: string): unknown {
  return JSON.parse(readFileSync(filePath, 'utf8')) as unknown;
}
