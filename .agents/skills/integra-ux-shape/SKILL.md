---
name: integra-ux-shape
description: >-
  Shape a product surface before visual direction or code: clarify users, jobs, task flows, information architecture, screen states and success signals. Use for new flows, navigation and content structure; not for visual styling, component implementation or code review.
---

# Integra UX Shape

Turn an ambiguous product request into a task-first structure that later direction and implementation work can follow. Do not choose colors, type, components or code in this skill.

Read the [AI context contract](../../../docs/ai-context-contract.md) when it exists in the workspace. Otherwise apply the same rules: explicit user instruction > project constraints > observed facts > platform and accessibility requirements > references > presets > judgment.

## Use when / not when

- Use: new product surface, onboarding, dashboard, settings, checkout, navigation model, content hierarchy or flow redesign.
- Not: visual thesis or tokens (`integra-design-direction`), component code (`integra-ui-generator`), code refactor (`integra-refactor-agent`) or critique of an existing screen (`integra-design-qa`).

## Inputs to collect (never invent)

Product goal, primary user and job, success signal, current routes and content, required data, permissions, platform, viewports, accessibility target and known constraints. Classify each as Fact, Constraint, Preference, Assumption or Unknown. Ask only what materially changes the structure; otherwise state one reversible assumption.

## Workflow

1. **Frame:** name the user, the job to be done, the trigger, the desired outcome and how success is observed.
2. **Inventory:** inspect existing routes, components, content, data and states before proposing new structure. Preserve what already works.
3. **Task model:** list jobs; for each record trigger, steps, decisions, required information, failure and recovery. Separate frequent or high-urgency tasks from occasional ones.
4. **Information architecture:** group content by user task and meaning, not by org chart or database table. Define labels, hierarchy, entry points, cross-links and navigation.
5. **Screen map:** screen → primary task → primary action → data shown → states. Remove screens that do not serve a task.
6. **Flows:** happy path plus empty, loading, error, permission-denied, offline and success. Include keyboard order and focus destination.
7. **Responsive and input:** define information order and navigation for narrow and wide viewports; do not merely shrink a desktop layout.
8. **Open questions:** list only unknowns that block a structural decision, with the impact of each.
9. **Handoff:** produce the Shape Brief and name the next skill.

## Anti-patterns

- Starting from a visual style, hero layout or component library.
- Inventing personas, research, metrics, testimonials or product capabilities.
- Treating a sitemap as information architecture.
- Navigation that mirrors the internal team or database schema.
- Adding a screen, step or field without a user task and a decision it supports.
- Hiding required content to make the layout look minimal.

## Output: Shape Brief

1. Product goal, primary user, job and success signal.
2. Facts, constraints, preferences, assumptions and unknowns.
3. Task map with triggers, steps, decisions and recovery.
4. Information architecture: groups, labels, hierarchy and navigation.
5. Screen map: task, primary action, data and states.
6. Flow and state coverage, including failure and empty paths.
7. Responsive and input behavior.
8. Acceptance checks observable without visual taste.
9. Handoff: `integra-design-direction` for visual direction, `integra-ui-generator` for implementation.

## Signature touch: "No screen without a task"

For every screen, state the user task and the decision it supports in one line. If you cannot, remove the screen or merge it into one that has a task.

## Done when

Every screen maps to a task; every task has a trigger, success and recovery; navigation and labels are understandable without internal context; required content and states are covered; assumptions are labeled; the next skill and approval boundary are explicit.
