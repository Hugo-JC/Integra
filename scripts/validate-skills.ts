import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), '.agents', 'skills');
const errors: string[] = [];
const skillDirectories = readdirSync(root).filter((name) => statSync(join(root, name)).isDirectory());

if (skillDirectories.length === 0) errors.push('No skills found in .agents/skills.');

for (const directory of skillDirectories) {
  const path = join(root, directory, 'SKILL.md');
  try {
    const content = readFileSync(path, 'utf8');
    const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
    if (!frontmatter) {
      errors.push(`${directory}: missing YAML frontmatter at the start of SKILL.md`);
      continue;
    }
    const name = frontmatter[1].match(/^name:\s*([a-z0-9-]+)\s*$/m)?.[1];
    const description = frontmatter[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
    if (name !== directory) errors.push(`${directory}: frontmatter name must match the directory name`);
    if (!description || description.length > 1024) errors.push(`${directory}: description must contain 1–1024 characters`);
    if (directory.length > 64 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(directory)) errors.push(`${directory}: invalid Agent Skills directory name`);
    if (content.split('\n').length > 500) errors.push(`${directory}: keep SKILL.md under 500 lines; move details to references/`);
  } catch {
    errors.push(`${directory}: SKILL.md is missing or unreadable`);
  }
}

if (errors.length) {
  console.error('Skill validation failed:\n- ' + errors.join('\n- '));
  process.exitCode = 1;
} else {
  console.log(`Validated ${skillDirectories.length} Agent Skills.`);
}
