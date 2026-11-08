---
name: integra-a11y-audit
description: Audits web interface accessibility using semantic HTML, keyboard and focus checks, accessible names, WCAG contrast and reduced-motion requirements. Use before shipping components, forms, navigation, dialogs or interactive flows.
---

# Integra Accessibility Audit

## Audit sequence
1. Identify the page task, user groups, interaction modes and target WCAG level.
2. Inspect semantic structure and heading order.
3. Verify labels, accessible names, roles, states and error association.
4. Complete the flow using keyboard only; check focus order, focus visibility, focus trapping and return.
5. Inspect contrast using actual rendered/composited colors. Distinguish normal and large text thresholds.
6. Check non-text contrast, target size and that meaning is not conveyed by color alone.
7. Check zoom/reflow, responsive overflow and touch/pointer alternatives.
8. Verify prefers-reduced-motion and avoid flashes or motion-only communication.
9. Use automated tooling as one input, not as a replacement for manual checks.
10. Report exact criteria, evidence and verification limitations.

## Finding discipline
- Cite the WCAG criterion when a finding maps to a success criterion.
- Separate confirmed failures from potential issues.
- Mark untested criteria not_run.
- Do not state "WCAG compliant" from a contrast result or automated scan alone.
- Do not change accessible names or labels without checking user intent and context.

## Output
Prioritize blockers, provide a reproducible test path, identify affected users and recommend the smallest effective fix.
