---
name: integra-ux-shape
description: Define users, jobs, task flows, information architecture, navigation, screen responsibilities and state coverage before visual direction or implementation. Use for new flows or structural redesign; not for styling, coding or visual critique.
---

# Integra UX Shape

## Mission

Turn an ambiguous product request into a task-first experience structure that design and engineering can implement without guessing. This skill decides what the product needs to communicate and let users do—not how it should look.

## Scope boundaries

Use for new product surfaces, onboarding, settings, dashboards, checkout, navigation, content organization and complex flow redesign.

Do not choose visual style, colors, typography, spacing or component APIs. Hand off visual decisions to `integra-design-direction`, implementation to `integra-ui-generator`, refactoring to `integra-refactor-agent`, and critique to `integra-design-qa`.

## Inputs and classification

Inspect or collect product goal and constraints; primary user groups and permissions; jobs to be done and triggers; success signals and existing evidence; current routes, data, content and operations; platforms, devices and input methods; privacy, security and accessibility constraints; and known dependencies and failure conditions.

Classify each as Fact, Constraint, Preference, Assumption or Unknown. Do not fabricate personas, research or metrics. Ask only for missing information that changes the structure; otherwise label a reversible assumption.

## Procedure

1. **Frame the outcome:** user, situation, trigger, job, desired outcome and observable success.
2. **Inventory the incumbent:** routes, navigation, screens, data, permissions, content and behavior. Preserve useful existing paths.
3. **Map tasks:** trigger, user intent, steps, decisions, information needed, system response and recovery.
4. **Prioritize:** separate frequent, high-impact and time-critical jobs from secondary tasks. Do not promote business convenience over user need without an explicit constraint.
5. **Design information architecture:** group content by user meaning and task. Define labels, hierarchy, entry points, relationships, search and navigation.
6. **Define screen contracts:** each screen has a user task, decision, primary action, data requirements, exit and failure states.
7. **Map end-to-end flows:** happy path plus validation, empty, loading, offline, permission denied, destructive confirmation, failure and recovery as relevant.
8. **Cover roles and permissions:** identify what each role can see/do and how restricted actions are explained.
9. **Plan responsive/input behavior:** content priority, navigation and interaction changes across narrow/wide screens, keyboard, touch and pointer.
10. **Identify open decisions:** list only unknowns that block a consequential structural choice, with their impact.
11. **Define acceptance:** observable behavior and task completion—not subjective visual adjectives.
12. **Handoff:** pass task map, screen contracts, states, constraints and unresolved questions to the next specialist.

## Anti-patterns

- Starting with colors, layout templates or a component library.
- Treating a sitemap as complete information architecture.
- Mirroring an internal org chart or database schema in navigation.
- Adding fields, steps or screens without a task or decision they support.
- Hiding necessary information to make the interface appear minimal.
- Treating inferred personas or unverified research as fact.

## Output: Shape Brief

1. Goal, users, jobs and success evidence.
2. Facts, constraints, preferences, assumptions and unknowns.
3. Task map with triggers, decisions, steps and recovery.
4. Information architecture and navigation labels.
5. Screen contracts and data/permission requirements.
6. Flow and state map.
7. Responsive and input-mode behavior.
8. Observable acceptance criteria.
9. Next specialist, handoff context and approval boundary.

## Signature: no screen without a task

For every screen, state the user task and decision it supports. If no task or decision exists, remove it, merge it or justify it explicitly.

## Done when

Every important task has a trigger, completion path and recovery; every screen has a purpose; labels are understandable; permissions and states are explicit; assumptions are visible.
