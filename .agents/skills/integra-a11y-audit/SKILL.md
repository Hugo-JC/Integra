---
name: integra-accessibility-audit
description: Audit rendered interfaces against WCAG 2.2 (contrast, keyboard, focus, names, forms, motion, reflow) with criterion-level evidence and honest limits. Use before shipping interactive flows or when a11y risks are suspected; automated checks alone never prove conformance.
---

# Integra Accessibility Audit

## Scope first
Identify the user flow, assistive-tech assumptions, and the stated target (default WCAG 2.2 AA; do not assume AAA). Keep user preference, brand and accessibility requirements distinct.

## Sequence
1. Landmarks, heading order, page title, language.
2. Names, roles, values; form labels, instructions, error association and recovery.
3. Keyboard-only run of the real flow: order, visible focus (SC 2.4.7/2.4.11), no traps, Escape and focus restoration.
4. Contrast on **rendered, composited** colors: text 4.5:1 (3:1 large: >=24px or >=18.66px bold, SC 1.4.3), non-text 3:1 (SC 1.4.11). Gradients, images, opacity, filters = `inconclusive` unless measured on the render.
5. Not color alone for meaning; target size (SC 2.5.8); zoom/reflow to 320 CSS px, text spacing, orientation.
6. `prefers-reduced-motion`, flashing, auto-updating content, time limits.
7. Status messages and live regions.
8. Automated pass (axe or `npm run design:qa`) as one input only.

## Finding discipline
Cite the success criterion. Separate **confirmed failure**, **automated signal**, **manual-review recommendation**. Mark untested criteria `not_run`. Do not infer keyboard behavior from source when runtime inspection is needed. Do not change names/labels without checking intent.

## Output per finding
Criterion · evidence (selector/file:line/screenshot/ratio with both colors) · affected users · severity P0-P3 · smallest effective fix · reproducible test path · status.

## Signature touch: "Repro in three lines"
Every finding includes a 3-line reproduction (where, do, observe) so a developer can verify the fix without asking you anything.
