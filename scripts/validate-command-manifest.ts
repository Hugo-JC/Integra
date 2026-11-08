import { resolve } from 'node:path';
import { readCommandManifest, validateCommandManifest } from '../src/modules/commands/manifest.js';

const manifestPath = resolve(process.cwd(), 'commands/manifest.json');
const candidate = readCommandManifest(manifestPath);
const result = validateCommandManifest(candidate);

if (!result.valid) {
  console.error('Command manifest validation failed:\n- ' + result.errors.join('\n- '));
  process.exitCode = 1;
} else {
  const commands = (candidate as { commands: Array<{ kind: string }> }).commands;
  const count = (kind: string) => commands.filter((command) => command.kind === kind).length;
  console.log(
    `Validated ${commands.length} commands (${count('orchestrator')} orchestrator, ${count('workflow')} workflows, ${count('modifier')} modifiers).`,
  );
}
