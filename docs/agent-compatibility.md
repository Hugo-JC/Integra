# Agent compatibility

Integra uses `.agents/skills/<name>/SKILL.md` as the canonical portable skill format and supplies root project guidance.

| Host | Project guidance | Canonical skill location |
|---|---|---|
| Gemini CLI | `GEMINI.md` | `.agents/skills/` |
| Codex | `AGENTS.md` | `.agents/skills/` |
| Claude Code | `AGENTS.md` or host-specific instructions | `.agents/skills/` |
| Cursor | `AGENTS.md` / project rules | `.agents/skills/` |

Some hosts require a skill feature flag or workspace setting depending on version. Verify current host documentation; do not claim a skill loaded merely because its file exists. The skill remains readable Markdown when automatic discovery is unavailable.

Each skill uses frontmatter `name` and `description`, followed by task-specific instructions. The deterministic core has no model-provider API dependency.
