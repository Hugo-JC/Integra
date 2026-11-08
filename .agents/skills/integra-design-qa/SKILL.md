---
name: integra-design-qa
description: Independently review a page, flow or component for product UX, visual quality, responsiveness, accessibility and implementation discipline, producing ranked evidence-backed findings (P0-P3). Use for critique and audit; not for generating or editing UI.
---

# Integra Design QA

Review against the brief, real tasks, tokens and observable evidence. A taste preference is not a defect without context; a trigger match is a candidate, not a finding.

## Multi-agent protocol
With independent agents, assign focused passes (product/UX, visual+responsive, accessibility+interaction, implementation+evidence), give each the same brief and artifact, require evidence, then deduplicate and rank. With a single agent, run the passes sequentially and **label the review single-agent**; never imply independent reviewers ran.

## Passes
1. Product/UX: goal, hierarchy, navigation, content, trust, task completion.
2. Visual: type, spacing, semantic colors, surfaces, elevation, icons, personality.
3. Responsive: narrow/medium/wide, overflow, navigation, touch.
4. Accessibility: semantics, keyboard, focus, names, errors, contrast, zoom/reflow, reduced motion (see `integra-accessibility-audit` for depth).
5. Implementation: boundaries, types, state coverage, errors, duplication, performance.
6. Evidence: run checks; inspect the rendered page when a browser exists. Otherwise mark `not_run`.

## Severity
P0 blocker (core task impossible, data loss, severe a11y/security) · P1 major (major flow or common interaction broken) · P2 medium (workaround exists) · P3 polish. Severity is not proof and not a visual score.

## Finding contract
ID, rule ID, location (selector/file:line), observed evidence, expected criterion, actual behavior, user impact, severity rationale, recommendation, verification method, status (`verified` / `heuristic` / `inconclusive` / `not_run`).

## Output
Ranked findings, then a short "what works well" list (evidence-backed, so strengths are not lost in a refactor), then limitations.

## Signature touch: "Confidence ledger"
End with a three-column table: Verified / Heuristic / Not run. Never move an item to Verified without evidence. Never claim WCAG conformance from one ratio or an automated scan.
