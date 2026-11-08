# Preset, Reference & Composition Routing Guide

**Status:** Canonical AI execution guide  
**Scope:** Design direction, page composition, UI generation, investigation and visual QA.

This guide explains how to combine Integra's three different kinds of preset data and its reference library without confusing task context, visual style and observed evidence.

## 1. Classify the product before choosing visuals

Before selecting anything, extract:
- product/service type and the primary user;
- the main job the user is trying to complete;
- the page or screen type (marketing, operational workspace, detail, form, reading, playback, analysis, etc.);
- content and data that genuinely exist;
- interaction, state, platform and responsive constraints;
- explicit visual preferences and existing brand tokens.

Separate facts, hard constraints, preferences, assumptions and unknowns. A style adjective such as “premium”, “modern”, “aggressive” or “minimal” is not a product niche.

Do not infer user demographics, capabilities, metrics, customer proof, legal requirements or brand history from the preset name.

## 2. Keep the three preset layers separate

| Layer | Canonical files | Actual role | Selection rule |
|---|---|---|---|
| Deterministic style router | `data/design-library/local-presets.json` + `data/design-library/design-styles.json` | Resolves niche to a legacy visual `style_id` and tokens. This is the runtime route used by `routeDesignPreset()`. | Explicit strong terms first; weak terms only if no strong match; longest full phrase wins; equal-strength ties and weak-only matches require confirmation; no match returns a neutral fallback that also requires confirmation. |
| Advisory 61-niche discovery | `presets/catalog.json` + `presets/design-styles-v3.json` | Finds potentially relevant migrated niche knowledge, principles and reference cues. | Discovery candidates only. Its fuzzy matching does not prove relevance and must not override the deterministic route or the user's brief. |
| Structured domain profiles | `presets/manifest.json` + its nine `presets/*.json` files | Gives task flow, priorities, unknowns, anti-patterns, acceptance checks and composition alternatives. | Choose by product context and primary task. It is not a visual style router. |

The migrated ADE knowledge under `references/ade-knowledge/` is a historical source archive. It preserves provenance and useful ideas but is not the current runtime API. Do not assume legacy command paths such as `tools/route.js`, `tools/lint-repo.js` or `tools/validate-design.js` exist.

### Current local commands

- Style route: `npm run design:route -- "brief" [--tone calm|loud] [--json]`
- Structured profile inventory: inspect `presets/manifest.json` and its listed files.
- Advisory niche discovery: `npm run direction:presets -- "brief"`
- Project validation: `npm run validate:presets`, `npm run validate:agent-assets`, `npm run validate:commands`, or `npm run check`.

The CLI tone values are `calm` and `loud`. A style's stored default intensity may be `balanced`, but that is not a valid CLI `--tone` value. Tone modifies intensity only; it never changes the product niche.

## 3. Resolve style route honestly

The current deterministic style router:
1. Normalizes case, diacritics and punctuation.
2. Matches complete words/phrases, not arbitrary substrings.
3. Checks strong niche terms first; weak/generic terms are considered only when no strong term matched.
4. Uses the longest normalized matching phrase.
5. Returns an ambiguous/low-confidence result when equally specific presets compete. Do not silently accept the implementation's first array entry; ask the user to resolve the competing niche or preserve both candidates in a proposal.
6. Returns a neutral `clean_editorial` fallback when no preset matches and marks confirmation as required.

Variants are selected only when a listed `when_any` expression appears in the prompt. Inspect the actual variant condition and explain the reason. Do not select a variant just because it looks attractive.

A user-specified color/font and existing project tokens must be considered before applying style tokens. Never imply a preset match is proof that a style is suitable.

## 4. Choose the domain profile by task

Read the matching structured profile's:
- `aiGuidance.primaryFlow`;
- `aiGuidance.prioritize`;
- `aiGuidance.confirmOrMarkUnknown`;
- `aiGuidance.avoidByDefault`;
- `aiGuidance.acceptanceChecks`.

Apply these as product-specific constraints. When two profiles partially fit (e.g. creator media + commerce), choose the one representing the user's primary task and borrow only compatible secondary principles with an explicit reason. Do not concatenate entire profiles.

Before proposing interface structure, write the primary flow in a short arrow sequence. If the task flow differs from the profile's `primaryFlow`, explain why the profile is still useful or reject it.

## 5. Use composition escapes instead of repeating the same page

A profile's `compositionEscapes` contains conditional layout alternatives. Each one has:
- `when`: the situation in which it is relevant;
- `composition`: how to arrange the interface;
- `contentRequirements`: the real information or interaction evidence needed;
- `avoid`: patterns that would undermine that alternative.

Select an escape only when its condition matches the user's primary task AND its content requirements can be satisfied. If a requirement is absent, do not fabricate it. Choose another escape or use a neutral task-first composition.

Do not default to “headline left + image right + three feature cards”. Do not pick an escape merely to create novelty. The escape must improve the user's actual path to value.

For a consequential page structure, compare up to two eligible alternatives and explain their trade-offs. For a routine, well-understood task, choose one directly. Never randomly cycle through archetypes to create variety.

The historical H/F/S/N/R pattern IDs in `references/ade-knowledge/layout-archetypes.md` are structural references, not complete templates or mandatory limits. Resolve the meaning before using an ID.

## 6. Reference selection and evidence

Use `references/catalog.json` when selecting the authoritative current reference IDs for structured profiles. Select sources by the question they can answer, not by popularity.

Source authority:
1. Normative standards for requirements.
2. Official platform and technical documentation for supported behavior and APIs.
3. Official design-system documentation for its own components and patterns.
4. Directly inspected product pages for observed product behavior only.
5. Methodology repositories for process ideas, not as visual authority.
6. Secondary commentary for context, clearly labelled.

Normally use one to three relevant references. More references do not automatically increase confidence.

Every source has a verification status:
- `catalog-only`: an indexed research lead. Its present content has not been verified by this project.
- `verified`: a specific page/section was inspected and `lastVerifiedAt` and `verifiedPage` are recorded.

A URL, title, thumbnail or preset cue is not proof that the live page was inspected. Never upgrade a catalog lead to a verified source without actually inspecting it.

For every source used, record:
- reference ID, canonical URL, publisher and source type;
- exact page/section inspected and access date;
- evidence class: direct observation, official documentation, supplied screenshot, source trace, inference or unknown;
- observed behavior/pattern and why it answers the research question;
- limitation, version sensitivity and anything inaccessible;
- adaptation for this product and what must not be copied.

Extract the principle, not the source's code, copy, assets, proprietary components or complete visual composition. Follow license and attribution requirements.

## 7. Decision and uncertainty protocol

- If one strong route matches and the domain context agrees, proceed with the documented rationale.
- If strong and weak signals disagree, preserve the strong niche and treat weak signals as secondary context.
- If equally strong niches compete, ask one focused question or return alternatives. Do not resolve ties by aesthetic preference.
- If only a weak/generic term matches, request confirmation before committing to a style.
- If no style route matches, use the neutral fallback only as a provisional direction.
- If a domain profile does not fit, do not force it.
- If no composition escape meets its conditions and content requirements, use a task-first structure and state that no named alternative is supported by the evidence.
- If the task can proceed safely with a reversible assumption, state it rather than asking unnecessary questions.

## 8. Required compact decision record

For substantial design work, return:
1. **Task:** product, user and primary job.
2. **Style route:** status, `style_id`, matched terms, confidence, alternatives and whether confirmation is required.
3. **Domain profile:** ID and why its primary flow matches.
4. **Composition:** selected escape ID, condition match, available content and rejected alternatives.
5. **References:** IDs, verification status, inspected evidence and limitations.
6. **Unknowns:** assumptions and facts that must not be fabricated.
7. **Acceptance:** concrete, observable checks for the final interface.

Keep this record proportional to task complexity. A small component may need only one sentence for the route and one for its constraints.

## 9. Non-negotiable constraints

- User instructions and verified project constraints outrank every preset.
- A style ID does not prescribe information architecture.
- A domain profile does not automatically prescribe a visual style.
- A reference cue does not prove current website behavior.
- A composition escape does not authorize invented content.
- A heuristic match is not a confirmed QA finding.
- Accessibility and real task completion outrank aesthetic novelty.
- A command, generated proposal or passing check does not authorize source mutation.
