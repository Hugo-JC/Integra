import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('.agents/skills');
if (!fs.existsSync(root)) {
  console.error('Missing .agents/skills directory.');
  process.exit(1);
}
const skills = fs.readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory());
const issues = [];
for (const skill of skills) {
  const file = path.join(root, skill.name, 'SKILL.md');
  if (!fs.existsSync(file)) { issues.push(`${skill.name}: missing SKILL.md`); continue; }
  const body = fs.readFileSync(file, 'utf8');
  const frontmatter = body.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!frontmatter) { issues.push(`${skill.name}: missing YAML frontmatter`); continue; }
  if (!/^name:\s*\S+/m.test(frontmatter[1])) issues.push(`${skill.name}: missing name`);
  if (!/^description:\s*\S+/m.test(frontmatter[1])) issues.push(`${skill.name}: missing description`);
  if (!body.slice(frontmatter[0].length).trim()) issues.push(`${skill.name}: empty instructions`);
}
if (issues.length) { console.error(issues.join('\n')); process.exit(1); }
console.log(`Agent Skills valid: ${skills.length} workspace skills in .agents/skills.`);
