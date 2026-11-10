# ADR-012 — Visual knowledge library v2

- Status: accepted for implementation
- Date: 2026-11-10

## Context
Integra had migrated the AI Design Engine's style and niche knowledge, but its visual source catalog was shallow, many niches lacked relevant discovery shortlists, and reference leads were not consistently separated from page-level observations. Token recipes, layout options, asset providers, rules, anti-patterns and examples needed explicit contracts and a deterministic consumer.

## Decision
Create a provider-agnostic visual knowledge layer with distinct catalogs for explained visual sources, asset providers, niche-to-source mappings, page-level reference observations, semantic token recipes, task/mode-aware layout patterns, contextual design rules, anti-pattern hypotheses and illustrative examples.

Add `integra-visual-knowledge`, a specialist Agent Skill for curating and consuming the library. Add an offline deterministic resolver and integrated validation. New sources remain `catalog-only` until exact page-level evidence is recorded.

Use the user-owned AI Design Engine as the primary domain-knowledge source and Impeccable as a primary methodological influence. Use official systems, standards, platform docs, products, galleries and asset providers as secondary sources with their authority and limits recorded. Do not copy third-party source text, code, images or proprietary compositions.

## Compatibility
Preserve the 17 style IDs, 61 niche preset IDs, existing H/F/S/N/R archetype IDs, current command system and existing preset resolver contracts. Add the knowledge layer as an independent module.

## Consequences
The library resolver is offline-first and returns explainable candidates. It does not browse sites, verify licences, download assets, apply tokens or confirm QA findings. Project identity, explicit user constraints and applicable accessibility requirements remain higher priority than recipes.
