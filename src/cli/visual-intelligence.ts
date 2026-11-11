import type { ExperienceMode } from '../modules/direction/knowledge/index.js';

export interface VisualIntelligenceGenerateOptions {
  artifactPath?: string;
  primaryTask?: string;
  mode?: ExperienceMode;
  nicheId?: string;
  query?: string;
  tags: string[];
  assetTypes: string[];
  limit?: number;
  outputPath: string;
  stdout: boolean;
  help: boolean;
}

const VALUE_OPTIONS = new Set(['--artifact', '--task', '--mode', '--niche-id', '--query', '--tag', '--asset-type', '--limit', '--out']);
const REPEATABLE_OPTIONS = new Set(['--tag', '--asset-type']);
const MODES = new Set<ExperienceMode>(['persuade', 'operate', 'read', 'experience']);

export function parseVisualIntelligenceGenerateArgs(args: readonly string[]): VisualIntelligenceGenerateOptions {
  const values = new Map<string, string>();
  const tags: string[] = [];
  const assetTypes: string[] = [];
  let stdout = false;
  let help = false;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--help' || argument === '-h') { help = true; continue; }
    if (argument === '--stdout') {
      if (stdout) throw new TypeError('Option --stdout was provided more than once.');
      stdout = true;
      continue;
    }
    if (!VALUE_OPTIONS.has(argument)) throw new TypeError('Unknown option: ' + argument);
    const value = args[index + 1];
    if (!value || value.startsWith('--') || !value.trim()) {
      throw new TypeError('Option ' + argument + ' requires a non-empty value.');
    }
    if (REPEATABLE_OPTIONS.has(argument)) {
      (argument === '--tag' ? tags : assetTypes).push(value.trim());
    } else {
      if (values.has(argument)) throw new TypeError('Option ' + argument + ' was provided more than once.');
      values.set(argument, value.trim());
    }
    index += 1;
  }

  if (help) return {
    tags, assetTypes,
    outputPath: values.get('--out') ?? '.integra/runs/visual-intelligence/bundle.json',
    stdout, help,
  };
  if (stdout && values.has('--out')) throw new TypeError('Use either --stdout or --out, not both.');

  const modeValue = values.get('--mode');
  if (modeValue && !MODES.has(modeValue as ExperienceMode)) {
    throw new TypeError('--mode must be persuade, operate, read, or experience.');
  }
  const limitValue = values.get('--limit');
  const limit = limitValue === undefined ? undefined : Number(limitValue);
  if (limitValue !== undefined && (limit === undefined || !Number.isInteger(limit) || limit < 1 || limit > 5)) {
    throw new TypeError('--limit must be an integer between 1 and 5.');
  }

  const artifactPath = values.get('--artifact');
  const primaryTask = values.get('--task');
  if (!artifactPath) throw new TypeError('Missing required option --artifact.');
  if (!primaryTask) throw new TypeError('Missing required option --task.');

  return {
    artifactPath, primaryTask,
    ...(modeValue ? { mode: modeValue as ExperienceMode } : {}),
    ...(values.has('--niche-id') ? { nicheId: values.get('--niche-id')! } : {}),
    ...(values.has('--query') ? { query: values.get('--query')! } : {}),
    tags, assetTypes,
    ...(limit !== undefined ? { limit } : {}),
    outputPath: values.get('--out') ?? '.integra/runs/visual-intelligence/bundle.json',
    stdout, help,
  };
}
