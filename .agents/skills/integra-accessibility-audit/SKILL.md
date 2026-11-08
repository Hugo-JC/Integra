---
name: integra-accessibility-audit
description: Audit rendered interfaces for WCAG 2.2 accessibility risks including contrast, keyboard operation, forms, semantics, motion and responsive reflow.
---

# Integra Accessibility Audit

1. Identify user flow and stated conformance target; do not assume AAA if AA is required.
2. Inspect landmarks, heading structure, names/roles/values and form labels.
3. Test keyboard operation, focus order, visible focus, Escape behavior and focus restoration.
4. Measure text and non-text contrast in rendered states. For WCAG AA, normal text generally requires 4.5:1 and large text 3:1.
5. Check zoom/reflow, clipping, text spacing and orientation.
6. Review reduced motion, animation controls, flashing and time-dependent content.
7. Inspect validation messages, instructions, status announcements and recovery.
8. Report criterion, evidence, impact, severity, fix and verification status.

Automated checks are not a complete audit. A passing ratio does not prove page accessibility. Do not infer keyboard behavior from source alone when runtime inspection is needed. Keep user preference, brand and accessibility requirements distinct.
