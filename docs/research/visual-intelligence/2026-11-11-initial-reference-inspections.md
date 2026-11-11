# Visual Intelligence — Initial Reference Inspection Batch 001

**Date inspected:** 2026-11-11  
**Repository baseline:** `main` at `9db438a522d4cb7edd1bf7b16606a0915a029fb5`  
**Batch status:** promoted into the canonical observation catalog as two partial, page-scoped records; direct live-product verification remains outstanding  
**Scope:** two official, first-party design references. This batch records documented principles, not a claim that the live authenticated products were exhaustively inspected.

## Why this batch exists

The visual knowledge library began with discovery leads and no page-level observations. This batch established two evidence-backed research records using first-party pages that explicitly document design decisions. Both records are now available to the deterministic knowledge resolver.

Evidence type is deliberately set to `official-documentation`, not `direct-observation`: the pages were inspected as published documentation/articles, but this work did not run the products, inspect authenticated states, or capture independent browser screenshots.

---

## Observation 001 — Linear interface refresh

| Field | Value |
|---|---|
| Canonical observation ID | `linear-interface-refresh-2026` |
| Existing source ID | `linear` |
| Evidence type | `official-documentation` |
| Page | [A calmer interface for a product in motion](https://linear.app/now/behind-the-latest-design-refresh) |
| Publication date | 2026-03-12 |
| Inspection date | 2026-11-11 |
| Confidence | Medium |
| Verification status | Partial |

### What the source explicitly documents

1. **Task-first visual hierarchy.** Linear describes reducing the prominence of navigation that supports orientation, so the main work area receives more attention. The article gives a concrete example: a dimmer sidebar after the user has reached the destination.
2. **Compact navigation controls.** Desktop tabs were made more compact instead of stretching across the full width; icon and text sizing were reduced.
3. **Icon restraint.** The refresh reduced unnecessary icon usage, reduced icon size and removed decorative colored backgrounds from some team icons.
4. **Structural restraint.** Borders and separators had accumulated without sufficient purpose. The refresh softened their contrast and reduced unnecessary separators while preserving grouping.
5. **Incremental visual experimentation.** The team describes feature flags and an internal toolbar to compare old and new UI states. A token-aware color tool exposed hue, chroma and lightness adjustments; selected token values were exported as JSON and aligned with Figma.
6. **Agent-assisted implementation.** The article reports using coding agents to understand the codebase, locate components/usages and prototype alternative directions. This is process evidence, not proof that an agent independently judged the final design.

Evidence locations: article sections “Don’t compete for attention you haven’t earned” (page lines 30–44), “Structure should be felt not seen” (45–52), and “The tools that helped us move faster” (53–76).

### Transferable principles for Integra

- Allocate visual emphasis according to the user's current task, not according to the number of controls available.
- Treat navigation and orientation as supporting layers; their prominence should not routinely compete with the primary work surface.
- Use icons when they improve recognition or action discovery. Avoid decorative icon treatment that adds visual weight without adding meaning.
- Prefer the minimum separators needed to communicate grouping and boundaries. Reduce contrast before removing a boundary that users need.
- Make visual experiments reversible and comparable. Feature flags, side-by-side states and token-level controls provide a better review loop than untracked CSS tweaks.
- Keep design tokens portable between implementation and design tooling, while preserving the product's existing token source of truth.

### Adaptation guidance

For dense operational products (dashboards, project tools, admin panels and editors), Integra may propose a hierarchy audit of primary workspace, navigation, metadata and secondary actions. It should inspect the actual task and content before recommending a quieter sidebar, smaller icons or fewer borders.

For visual iteration, a future Live Inspector workflow could capture a baseline, preview a proposed change, compare both states and export a reviewable diff. The preview must remain temporary until the user approves the exact source change.

### Do not copy

- Linear's exact sidebar, tab geometry, iconography, color palette or proprietary component styling.
- A dimmer sidebar as a universal rule; navigation may legitimately be a primary task surface.
- Fewer borders as a blanket instruction; tables, forms and complex data may require stronger boundaries.
- Linear's internal toolbar or token values as if they were public implementation specifications.

### Limitations and unresolved questions

- This is a first-party design-process article, not an independent usability study.
- The article describes a specific desktop product refresh. It does not establish mobile behavior for every pattern.
- No authenticated Linear workspace, live interaction, keyboard flow, responsive state or runtime performance was independently tested in this batch.
- The described token workflow is evidence of their process, not evidence that the exact token values are suitable for another product.

---

## Observation 002 — GitHub Primer layout foundations

| Field | Value |
|---|---|
| Observation ID (proposed) | `primer-layout-foundations-2026` |
| Existing source ID | `github-primer` |
| Evidence type | `official-documentation` |
| Page | [Primer — Layout](https://primer.style/product/getting-started/foundations/layout/) |
| Inspection date | 2026-11-11 |
| Confidence | Medium |
| Verification status | Partial |

### What the source explicitly documents

1. **Focus and responsive functionality.** The guidelines say pages should focus attention on content and adapt to smaller screens without losing functionality. Multi-column layouts should become suitable mobile views when all columns cannot fit.
2. **Viewport ranges as layout modes.** Primer documents `narrow` below 768px as one column, `regular` from 768px as up to two columns, and `wide` from 1400px as up to three columns when needed.
3. **Breakpoints are tuning tools, not complete layout strategy.** The page distinguishes high-level viewport ranges from breakpoints used to fine-tune specific responsive behavior.
4. **Navigation has separate contextual layers.** The app header, context region and local navigation have distinct responsibilities. The context region identifies where the user is, but should not become a full-path breadcrumb or host custom interactive controls.
5. **Page structures should match task shape.** Full pages suit centered content; split pages suit side navigation, filtering or list-detail patterns; interstitial pages suit focused tasks such as sign-in or long operations.
6. **Narrow-screen adaptation should preserve context.** A list-detail layout can become separate list and detail views. An auxiliary pane may become a bottom sheet when it contains metadata, details or actions rather than primary navigation.

Evidence locations: “Overview” and “Strive for a focused experience” (page lines 207–219), “Viewport ranges” (222–256), “Anatomy of a page” (278–304), “Page types” (338–361), and “Responsive behavior” (387–402).

### Transferable principles for Integra

- Select layout from the information/task relationship (full page, split/list-detail, interstitial), not from a preset name alone.
- Treat responsive design as a change in information architecture and interaction, not merely shrinking columns.
- Separate global navigation, contextual location and local navigation so each layer has one understandable job.
- On narrow screens, preserve the user's place in a workflow when switching between list and detail.
- Distinguish primary navigation panes from auxiliary metadata panes; they may need different mobile treatments.
- Record viewport assumptions explicitly in the Direction Artifact and test the resulting layout at those viewports.

### Adaptation guidance

When a brief describes a dashboard, file browser, settings area or list-detail workflow, the Direction Engine can use these documented patterns as candidates. It should first establish whether the side pane is navigation, filtering, selected-item content or auxiliary metadata. That classification determines whether a mobile transformation should become a separate view, a drawer/bottom sheet or a different navigation pattern.

The documented Primer viewport ranges may be offered as a reference for projects already using Primer. They must not be silently adopted as Integra-wide defaults: another product may have different content constraints, framework breakpoints or platform requirements.

### Do not copy

- Primer's exact breakpoint values as universal defaults.
- GitHub's repository context labels or information architecture when the target product has different entities.
- A bottom sheet for primary navigation or a workflow-critical panel without validating the interaction.
- The assumption that every desktop split layout should become a two-page mobile flow.

### Limitations and unresolved questions

- This is official design-system guidance, not a measurement of every GitHub product screen.
- The page is specific to Primer and GitHub product UI.
- No full responsive screenshot series or interactive keyboard test was captured in this batch.
- The documented viewport ranges are design-system guidance, not a WCAG requirement or universal breakpoint standard.

---

## Promotion record and evidence boundary

Both records are stored in `data/design-library/reference-observations.json` with `evidenceType: official-documentation`, `verificationStatus: partial` and medium confidence. `observedAt` stores a calendar date only because the exact inspection time was not captured. The source catalog entries remain `catalog-only`; an inspection of one article or documentation page does not verify an entire product or source.

The records are included in the Knowledge Pack and Visual Intelligence Bundle 1.1.0 as partial evidence candidates. The manifest tracks `observations: 2`, `partialObservations: 2` and `verifiedObservations: 0`. Run `npm run validate:visual-library` and `npm run check` after changes. Add direct rendered-product observations separately when screenshots, viewport, state and interaction evidence are later collected.

## Suggested next inspection batch

Prioritize references that answer distinct product questions rather than collecting more galleries:

1. **Navigation and command surfaces:** inspect one real product workflow for global/local navigation, command menu and contextual actions.
2. **Dense operational workspace:** inspect a dashboard or editor with a real data table, filters, empty/loading/error states and responsive behavior.
3. **Forms and feedback:** inspect a complete create/edit flow including validation, success, failure and keyboard interaction.

For each future inspection, capture the page/state, viewport, date, observed behavior, transferable principle, adaptation and limitations. Keep direct observations separate from source-authored design guidance.
