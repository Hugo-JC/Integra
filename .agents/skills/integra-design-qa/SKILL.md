---
name: integra-design-qa
description: Review an existing interface or flow for product UX, visual quality, responsive behavior, interaction completeness and implementation risks. Use for critique and evidence-backed audits before or after changes; do not generate a new design by default.
---

# Integra Design QA

## Mission

Evaluate whether the existing interface serves its users and product task clearly, consistently and reliably. Produce findings that another engineer can reproduce and prioritize. QA is an evidence process, not a taste score or permission to redesign.

## Scope contract

Before reviewing, identify target routes/components, primary user task, expected behavior, viewport range, themes, available states, stack and requested depth. Inspect PRODUCT.md, DESIGN.md or equivalent project context when present, then inspect project conventions and the actual rendered page when available. Distinguish an approved design commitment from the current implementation; report drift rather than assuming one silently overrides the other.

If no brief exists, infer only from visible evidence and label assumptions. Do not invent users, requirements or expected product behavior.

## Review passes

1. **Task and UX:** purpose, hierarchy, navigation, terminology, content completeness, trust, task completion and recovery.
2. **Visual craft:** composition, typography, spacing, alignment, density, contrast, color roles, surfaces, elevation, imagery and icon consistency.
3. **Responsive behavior:** narrow, medium and wide screens; overflow, clipping, wrapping, navigation, touch targets and content priority.
4. **Interaction states:** hover, focus, active, selected, disabled, loading, empty, error, success, pending and destructive confirmation.
5. **Accessibility signals:** semantic elements, accessible names, keyboard, focus visibility, non-color cues, reduced motion and contrast.
6. **Implementation quality:** component boundaries, types, duplication, state modeling, async errors, asset loading and measurable performance risk.
7. **Evidence:** run repository checks and inspect the actual rendered result when tools exist. Record what was unavailable or skipped.

## Multi-agent protocol

Only use independent passes when the host genuinely supports independent agents. Give each reviewer the same target and brief, request location-specific evidence, then deduplicate. If one agent performs several passes, call it a sequential single-agent review; never imply independent review occurred.

## Severity

- **P0 — Blocker:** primary task impossible, data loss, serious security issue or severe access barrier.
- **P1 — Major:** common flow or important interaction is broken or materially misleading.
- **P2 — Moderate:** workaround exists, but friction or inconsistency is meaningful.
- **P3 — Polish:** low-impact refinement with a clear contextual benefit.

Severity expresses impact, not confidence. Rank by severity and user impact; present confidence separately.

## Finding schema

For every finding include:
- stable ID and relevant rule/criterion;
- exact location (route, selector, component or file:line);
- observed behavior and evidence;
- expected outcome and why it matters;
- affected user/task;
- severity and confidence;
- recommended smallest effective fix;
- reproduction steps;
- verification method and status.

Use statuses `verified`, `heuristic`, `inconclusive` and `not_run`. Do not call an unmeasured suspicion verified.

## Change boundary

A critique request authorizes inspection and reporting only. Do not edit source code unless the user separately approves the exact proposed change. Preserve positive patterns; do not rewrite working UI to satisfy personal taste.

## Output

1. Scope and environment.
2. Executive summary with number of findings by severity/status.
3. Ranked findings.
4. Evidence-backed strengths to preserve.
5. Verification ledger: Verified / Heuristic / Inconclusive / Not run.
6. Limitations and a focused next step.

## Signature: confidence ledger

For each high-impact finding, state both severity and confidence. Never conflate a severe potential issue with a confirmed defect; never claim page-wide accessibility or performance compliance from partial checks.
