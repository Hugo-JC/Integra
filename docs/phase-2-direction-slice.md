# Phase 2 — deterministic Direction slice

This commit introduces a deliberately narrow, provider-independent foundation. It does not claim to implement the full Direction Engine.

## Included

- WCAG 2.2 SC 1.4.3 (AA) text contrast calculation for opaque `#RGB` and `#RRGGBB` colors.
- Normal-text and large-text thresholds (4.5:1 and 3:1), surfaced through the existing `CheckResult` and `Finding` contracts.
- Decision provenance with explicit precedence: brief > deterministic rule > AI > default. Equal-precedence candidates preserve input order.
- Runtime validation for untrusted AI suggestion payloads, bounded in count and text length, with an optional deterministic compatibility predicate.
- A `[R]` recommendation classification in the shared Direction types so heuristic recommendations are not confused with WCAG failures.

## Boundaries and limitations

- Contrast evaluation is a pure helper, not a DOM/CSS analyzer. Callers must supply the actual opaque, composited foreground/background colors and font metrics.
- Alpha colors, CSS color functions, gradients, images and background compositing are not inferred.
- Large-text classification uses WCAG point-to-CSS-pixel conversion: at least 24px regular, or at least 14pt (18.666… CSS px) bold (weight >= 700).
- The contrast ratio is kept at full precision for threshold comparison; presentation layers may round it for display.
- AI suggestions remain advisory data. Validation checks structure and delegates compatibility to a deterministic callback; it does not establish semantic truth or apply suggestions.
- The `[R]` marker denotes a heuristic recommendation, not a WCAG criterion or verified defect.
- No DOM parser, interactive semantics audit, provider integration, API key handling, report schema change or production orchestrator is added.

## Verification

The new Vitest suite covers contrast calculations, thresholds, invalid inputs, provenance precedence and AI payload rejection. Run the repository's full checks with `npm run check` in an environment with dependencies installed.
