# Agent Command Vocabulary

These are reusable task names for humans and coding agents. They are workflows, not a claim that a slash-command runtime or multi-agent orchestrator is already installed.

| Command | Purpose | Skill |
|---|---|---|
| `integra:shape` | Clarify user, task, constraints and information architecture | direction |
| `integra:direction` | Produce a contextual visual direction and token plan | direction |
| `integra:generate` | Build a component or screen from a brief | ui-generator |
| `integra:refactor` | Improve an existing component without breaking behavior | refactor-agent |
| `integra:critique` | Review hierarchy, content and product clarity | design-qa |
| `integra:audit` | Run objective static and accessibility checks | design-qa |
| `integra:polish` | Refine spacing, type, consistency and feedback | ui-generator |
| `integra:harden` | Review edge cases, errors, overflow and keyboard use | refactor-agent |
| `integra:adapt` | Review responsive behavior and narrow viewports | design-qa |
| `integra:investigate` | Research a reference or behavior with evidence | investigation |
| `integra:live` | Inspect a local page and export a DOM diff | live-inspector |

## Suggested handoff
1. Direction agent creates a brief and documents decisions.
2. Implementation agent generates/refactors code and reports files changed.
3. Independent QA agent reviews source and rendered behavior.
4. Live Inspector is used to explore visual alternatives, not as a substitute for source edits.
5. Human reviews findings and approves the final changes.
