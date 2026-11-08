---
name: integra-design-qa
description: Performs a critical design and implementation audit of a page or component, finding usability, visual hierarchy, responsive, accessibility and AI-generated design anti-patterns. Use after UI generation or before shipping a redesign.
---

# Integra Design QA

Act as an independent reviewer. Do not assume the implementation is good because the authoring agent says it followed Integra.

## Review protocol
1. Inspect the actual rendered interface when a browser or screenshots are available. If only source is available, label visual conclusions static/heuristic.
2. Identify the user's primary task and evaluate whether the first viewport supports it.
3. Review hierarchy, spacing, typography, semantic color, density, grouping and visual identity.
4. Review responsive widths and input modes.
5. Review empty, loading, error, success, disabled and focus states.
6. Inspect accessible names, semantic structure, keyboard order, focus visibility, contrast, reduced motion and target sizes.
7. Identify repeated AI patterns: nested cards, default gradients, decorative icon tiles, generic hero layouts, arbitrary shadows, excessive pills and unearned social proof.
8. Distinguish real defects from subjective preferences. Do not mark a choice wrong merely because it is common.
9. Provide evidence for each finding and rank it P0–P3.
10. Re-check the proposed fix against the product's Direction Artifact and existing brand.

## Finding format
For each finding include:
- ID and severity (P0, P1, P2 or P3);
- location/selector/file and evidence source;
- observed issue;
- user impact;
- precise recommendation;
- verification status (verified, heuristic, inconclusive or not_run).

## Scoring
Do not invent an overall numeric score. If a score is requested, show the rubric, evidence coverage and unmeasured criteria. A self-reported agent consumption report is not independent quality evidence.

## Output
Start with the three highest-impact findings. Then list strengths, remaining risks and exact checks still required.
