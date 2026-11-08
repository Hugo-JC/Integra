import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { validateSkills } from '../scripts/skill-validation.js';

const temporaryRoots: string[] = [];

function createSkill(name: string, frontmatter: string, body: string): { repositoryRoot: string; skillRoot: string } {
  const repositoryRoot = mkdtempSync(join(tmpdir(), 'integra-skill-validation-'));
  temporaryRoots.push(repositoryRoot);
  const skillRoot = join(repositoryRoot, '.agents', 'skills');
  const skillDirectory = join(skillRoot, name);
  mkdirSync(skillDirectory, { recursive: true });
  writeFileSync(join(skillDirectory, 'SKILL.md'), `---\n${frontmatter}\n---\n\n${body}\n`);
  return { repositoryRoot, skillRoot };
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('Agent Skill validation', () => {
  it('accepts standard YAML metadata, host extensions and resolvable local resources', () => {
    const { repositoryRoot, skillRoot } = createSkill(
      'example-skill',
      [
        'name: example-skill',
        'description: >-',
        '  Explain the workflow. Use when its task is requested.',
        'metadata:',
        '  owner: Integra',
        'paths:',
        '  - "**/*.tsx"',
        'disable-model-invocation: false',
      ].join('\n'),
      'Read the [guide](references/guide.md).',
    );
    const referenceDirectory = join(skillRoot, 'example-skill', 'references');
    mkdirSync(referenceDirectory);
    writeFileSync(join(referenceDirectory, 'guide.md'), '# Guide');

    expect(validateSkills(skillRoot, repositoryRoot)).toEqual({ skillCount: 1, errors: [] });
  });

  it('rejects invalid YAML and invalid or missing required metadata', () => {
    const { repositoryRoot, skillRoot } = createSkill(
      'example-skill',
      'name: Example-Skill\ndescription: [unterminated',
      'Instructions.',
    );

    expect(validateSkills(skillRoot, repositoryRoot).errors.join('\n')).toMatch(/invalid YAML frontmatter/);

    writeFileSync(
      join(skillRoot, 'example-skill', 'SKILL.md'),
      '---\nname: different-name\ndescription: ""\n---\n\nInstructions.\n',
    );
    const errors = validateSkills(skillRoot, repositoryRoot).errors.join('\n');
    expect(errors).toContain('frontmatter name must match the directory name');
    expect(errors).toContain('description must contain 1–1024 characters');
  });

  it('rejects missing local resources and links that escape the repository', () => {
    const { repositoryRoot, skillRoot } = createSkill(
      'example-skill',
      'name: example-skill\ndescription: A valid skill. Use when testing validation.',
      'See [missing](references/missing.md) and [outside](../../../../outside.md).',
    );

    const errors = validateSkills(skillRoot, repositoryRoot).errors.join('\n');
    expect(errors).toContain('resource link does not resolve: references/missing.md');
    expect(errors).toContain('resource link escapes the repository: ../../../../outside.md');
  });
});
