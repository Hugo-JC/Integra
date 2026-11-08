import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { parse } from 'yaml';

type SkillMetadata = {
  name?: unknown;
  description?: unknown;
  license?: unknown;
  compatibility?: unknown;
  metadata?: unknown;
  'allowed-tools'?: unknown;
};

export type SkillValidationResult = {
  skillCount: number;
  errors: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateLocalReferences(
  body: string,
  skillDirectory: string,
  repositoryRoot: string,
  skillName: string,
  errors: string[],
): void {
  const markdown = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '')
    .replace(/`[^`]*`/g, '');
  const links = /\[[^\]]*\]\(([^)]+)\)/g;

  for (const match of markdown.matchAll(links)) {
    const rawDestination = match[1].trim();
    const destination = rawDestination.match(/^<([^>]+)>/)?.[1] ?? rawDestination.split(/\s+/)[0];
    if (!destination || destination.startsWith('#') || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(destination)) continue;
    if (destination.startsWith('/')) {
      errors.push(`${skillName}: local resource links must be relative: ${destination}`);
      continue;
    }

    let decodedDestination: string;
    try {
      decodedDestination = decodeURIComponent(destination.split(/[?#]/, 1)[0]);
    } catch {
      errors.push(`${skillName}: invalid URL encoding in resource link: ${destination}`);
      continue;
    }
    if (!decodedDestination) continue;

    const target = resolve(skillDirectory, decodedDestination);
    const relativeToRepository = relative(repositoryRoot, target);
    if (relativeToRepository === '..' || relativeToRepository.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`) ||
        isAbsolute(relativeToRepository)) {
      errors.push(`${skillName}: resource link escapes the repository: ${destination}`);
    } else if (!existsSync(target)) {
      errors.push(`${skillName}: resource link does not resolve: ${destination}`);
    }
  }
}

export function validateSkills(
  skillRoot = resolve(process.cwd(), '.agents', 'skills'),
  repositoryRoot = resolve(skillRoot, '..', '..'),
): SkillValidationResult {
  const errors: string[] = [];
  const names = new Set<string>();

  if (!existsSync(skillRoot) || !statSync(skillRoot).isDirectory()) {
    return { skillCount: 0, errors: ['No skills found in .agents/skills.'] };
  }

  const skillDirectories = readdirSync(skillRoot)
    .filter((name) => statSync(join(skillRoot, name)).isDirectory());
  if (skillDirectories.length === 0) errors.push('No skills found in .agents/skills.');

  for (const directory of skillDirectories) {
    const skillName = directory;
    const skillPath = join(skillRoot, directory, 'SKILL.md');
    let content: string;
    try {
      content = readFileSync(skillPath, 'utf8').replace(/^\uFEFF/, '');
    } catch {
      errors.push(`${directory}: SKILL.md is missing or unreadable`);
      continue;
    }

    const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!frontmatter) {
      errors.push(`${directory}: missing YAML frontmatter at the start of SKILL.md`);
      continue;
    }

    let metadata: SkillMetadata;
    try {
      const parsed: unknown = parse(frontmatter[1]);
      if (!isRecord(parsed)) {
        errors.push(`${directory}: frontmatter must be a YAML mapping`);
        continue;
      }
      metadata = parsed as SkillMetadata;
    } catch (error) {
      const detail = error instanceof Error ? error.message.split('\n')[0] : 'invalid YAML';
      errors.push(`${directory}: invalid YAML frontmatter (${detail})`);
      continue;
    }

    const { name, description, compatibility, license, 'allowed-tools': allowedTools } = metadata;
    if (typeof name !== 'string' || name !== directory) {
      errors.push(`${directory}: frontmatter name must match the directory name`);
    } else if (names.has(name)) {
      errors.push(`${directory}: duplicate skill name "${name}"`);
    } else {
      names.add(name);
    }
    if (typeof name !== 'string' || name.length < 1 || name.length > 64 ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
      errors.push(`${directory}: name must be 1–64 lowercase letters, numbers or single hyphens`);
    }
    if (typeof description !== 'string' || description.trim().length < 1 || description.length > 1024) {
      errors.push(`${directory}: description must contain 1–1024 characters`);
    }
    if (license !== undefined && (typeof license !== 'string' || license.trim().length === 0)) {
      errors.push(`${directory}: license must be a non-empty string when provided`);
    }
    if (compatibility !== undefined &&
        (typeof compatibility !== 'string' || compatibility.trim().length < 1 || compatibility.length > 500)) {
      errors.push(`${directory}: compatibility must contain 1–500 characters when provided`);
    }
    if (metadata.metadata !== undefined &&
        (!isRecord(metadata.metadata) || Object.values(metadata.metadata).some((value) => typeof value !== 'string'))) {
      errors.push(`${directory}: metadata must be a mapping of string keys to string values`);
    }
    if (allowedTools !== undefined && typeof allowedTools !== 'string') {
      errors.push(`${directory}: allowed-tools must be a space-separated string when provided`);
    }
    if (content.split(/\r?\n/).length > 500) {
      errors.push(`${directory}: keep SKILL.md under 500 lines; move details to references/`);
    }

    validateLocalReferences(content.slice(frontmatter[0].length), dirname(skillPath), repositoryRoot, skillName, errors);
  }

  return { skillCount: skillDirectories.length, errors };
}
