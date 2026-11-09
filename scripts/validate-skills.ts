import { validateSkills } from './skill-validation.js';

const result = validateSkills();

if (result.errors.length) {
  console.error('Skill validation failed:\n- ' + result.errors.join('\n- '));
  process.exitCode = 1;
} else {
  console.log(`Validated ${result.skillCount} Agent Skills, including YAML metadata and local resource links.`);
}
