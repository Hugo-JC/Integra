---
name: integra-design-qa
description: Independently review a page, flow or component for product UX, visual quality, responsiveness, accessibility and implementation discipline.
---

# Integra Design QA

Review against the brief, real tasks, tokens and observable evidence. Do not report a taste preference as a defect without context.

## Multi-agent protocol
When independent agents are available, assign focused passes: (1) product/UX, (2) visual system/responsive, (3) accessibility/interaction, (4) implementation/evidence. Give each the same brief and artifact; require evidence; deduplicate and rank findings. If only one agent is available, perform sequential passes and label the review single-agent—never pretend independent reviewers ran.

## Review passes
1. Product/UX: user goal, hierarchy, navigation, content, trust and task completion.
2. Visual: type, spacing, semantic colors, surfaces, borders, elevation, icons and personality.
3. Responsive: narrow/medium/wide behavior, overflow, navigation and touch usability.
4. Accessibility: semantics, keyboard, focus, names, form errors, contrast, zoom/reflow and reduced motion.
5. Implementation: boundaries, types, state coverage, errors, dependencies, performance and duplicated styles.
6. Evidence: inspect code, run checks and inspect the rendered page when a browser exists.

## Severity
- P0 blocker: core task impossible, data loss or severe accessibility/security issue.
- P1 high: major flow or common interaction materially broken.
- P2 medium: noticeable usability/consistency issue with a workaround.
- P3 polish: useful craft refinement, not a blocker.

## Finding contract
Include ID, severity, location, evidence (selector/file/line/screenshot), user impact, recommendation, verification method and status: verified, unverified, not_run or inconclusive.

Never claim WCAG conformance from one contrast ratio. Separate objective checks from visual ratings. Order fixes by impact and effort.
