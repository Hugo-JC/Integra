# ADR-008: Portable skills and contextual design presets

- Status: Accepted
- Date: 2026-11-08

## Decision

Use the Agent Skills open format with .agents/skills/ as the canonical workspace directory. Keep design presets in versioned JSON with a manifest and validation script.

## Rationale

Skills are task-scoped and progressively disclosed, reducing the need to place every workflow in a global prompt. The standard is supported by Gemini CLI and other compatible coding agents. Presets are data, not agent-specific prose, so they can be consumed by Direction, skills, tests and future UIs.

## Consequences

- Every skill has valid SKILL.md frontmatter with a directory-matching name and trigger-focused description.
- Skills are verified in npm run check.
- Presets express contextual direction and avoid globally mandated palettes.
- Provider-specific adapters may reference the same canonical skills without forking their content.
