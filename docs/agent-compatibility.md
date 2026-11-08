# Agent Skill compatibility and installation

Integra keeps `.agents/skills/<skill-name>/SKILL.md` as the canonical source for its 12 existing skills. Each skill uses the open Agent Skills format: a directory, YAML frontmatter with `name` and `description`, and Markdown instructions. Supporting files are linked relative to the skill directory and validated locally.

## Host discovery

| Host | Project discovery for this repository | How to confirm discovery |
|---|---|---|
| Codex | `.agents/skills/` is a repository skill location. | Open `/skills` or mention `$integra-design-direction`. |
| Gemini CLI | `.agents/skills/` is a workspace alias. | Run `/skills list` or `gemini skills list --all`. |
| Cursor | `.agents/skills/` is a project location. | Open Agent and search for `/integra-design-direction`. |
| GitHub Copilot | `.agents/skills/` is supported for project skills; supported surfaces and personal/cloud locations differ. | In Copilot CLI, run `/skills list` and `/skills info integra-design-direction`; in the app, open **Customize > Skills**. |
| Claude Code | Claude Code discovers project skills from `.claude/skills/`, not the canonical `.agents/skills/` directory. | Run `/skills` or enter `/integra-design-direction` after setting up the link below. |

These are documented discovery paths, not a claim that a host is installed, enabled, authenticated or has loaded the skills in a particular workspace. Host versions, trust settings and product surfaces can change behavior.

## Use the skills in this checkout

Codex, Gemini CLI, Cursor and supported GitHub Copilot surfaces can discover the checked-in `.agents/skills/` directory without copying it. Open the repository as the workspace and confirm discovery using the host-specific method above.

For Claude Code, create a project-local `.claude/skills/` directory and link the selected skill to its canonical source. From the repository root, POSIX shells can use:

```sh
mkdir -p .claude/skills
ln -s ../../.agents/skills/integra-design-direction .claude/skills/integra-design-direction
```

In PowerShell, create a directory junction instead:

```powershell
New-Item -ItemType Directory -Force .claude\skills | Out-Null
$source = (Resolve-Path .agents\skills\integra-design-direction).Path
New-Item -ItemType Junction -Path .claude\skills\integra-design-direction -Target $source
```

Repeat for other skill directories as needed. A link avoids maintaining duplicate skill files. If links are unavailable in your environment, copy the skill directory and keep it synchronized with `.agents/skills/`.

Several skills use project guidance in `docs/`. Their relative links resolve in a complete Integra checkout; copying only one skill elsewhere does not include that guidance. Keep the referenced `docs/` files alongside the skill, or treat those links as unavailable and do not claim to have read them. Host permissions may also limit access to files outside the skill directory.

## Use the skills in another project or user profile

These are Integra project workflows, not generic design recipes. For repository-level use, keep the full Integra checkout available to the agent and use that host's documented project skill directory. For user-level installation, follow the host's current instructions and include the linked `docs/` context for skills that need it. A copied skill is a snapshot and will not receive updates from this repository.

GitHub Copilot CLI can preview and install repository skills with the `gh skill` command (GitHub CLI 2.90.0 or later, currently documented as public preview). Preview skill contents before installing, and preserve the linked `docs/` context if you install an Integra skill outside this checkout. For example:

```sh
gh skill preview Hugo-JC/Integra integra-design-direction
gh skill install Hugo-JC/Integra integra-design-direction
```

In the Copilot app, skills configured for repositories or Copilot CLI are managed under **Customize > Skills**. Copilot personal skills for cloud sessions require separate dotfiles or account setup; project paths do not automatically configure personal or cloud environments.

## Validate before use

Run the repository validator:

```sh
npm run validate:skills
```

It checks parseable YAML frontmatter, required and optional metadata types and limits, directory/name agreement, unique names, the 500-line limit, and relative Markdown resource links that resolve within the checkout. It does not test host activation, network URLs, permissions, model selection or the quality of the instructions. The full project check includes it:

```sh
npm run check
```

The upstream `skills-ref validate` tool can provide an additional format check after it has been installed separately. It is not a dependency of this repository validator.

## Compatibility references

Discovery paths and setup details were checked against these vendor/standard documents:

- [Agent Skills specification](https://agentskills.io/specification)
- [Codex skills](https://developers.openai.com/codex/skills)
- [Gemini CLI skills](https://geminicli.com/docs/cli/skills/)
- [Cursor Agent Skills](https://cursor.com/docs/skills)
- [GitHub Copilot agent skills](https://docs.github.com/en/copilot/concepts/customizations/agent-skills)
- [Adding skills to Copilot](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills)
- [Adding skills to Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills)
- [Customizing the GitHub Copilot app](https://docs.github.com/en/copilot/how-tos/github-copilot-app/customize-github-copilot-app)
- [Claude Code skills](https://code.claude.com/docs/en/skills)

The compatible host documentation was consulted for this change; no live host installation, discovery command or activation was run here.
