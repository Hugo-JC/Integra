# Reference investigation method

Integra borrows REA's evidence-first investigation mindset, adapted to product UI and design systems. The aim is to understand behavior and principles behind a reference, not to clone it.

## Investigation record

For every useful observation, record:

- reference ID and canonical URL;
- what was actually inspected (page, flow, screenshot, source code or documentation);
- the exact UI behavior or design principle observed;
- the user/problem it appears to serve;
- evidence type: direct observation, documentation, screenshot or source trace;
- confidence: direct, inferred or unverified;
- limitations and unknowns;
- license / attribution constraints;
- how the principle could be adapted to the current product.

## Evidence classes

| Class | Meaning | Allowed claim |
|---|---|---|
| Direct observation | Reproduced in the permitted product/browser | Describe observed behavior and state |
| Documentation | Supported by official published docs | Describe documented behavior or requirement |
| Screenshot | Visible in a supplied or permitted screenshot | Describe visible composition; do not infer hidden behavior |
| Source trace | Confirmed by code or official source | Describe the inspected implementation |
| Inference | Plausible explanation, not directly verified | Label explicitly as a hypothesis |
| Unknown | Not inspected or not knowable | Preserve as unknown |

## Workflow

1. Define the question: interaction, hierarchy, information architecture, motion, responsive behavior or token strategy.
2. Choose a small number of relevant references. Prefer primary sources and product documentation over trend galleries for interaction rules.
3. Inspect only the relevant flow or surface.
4. Capture evidence and note what was not inspected.
5. Extract reusable principles and constraints.
6. Create a new design solution that fits the product's own context.
7. Validate the adaptation with the project's users, accessibility and design QA.

## Ethical and legal boundaries

- Do not copy source code, proprietary assets, text, illustrations or complete page compositions.
- Do not bypass authentication, paywalls, access controls or technical restrictions.
- Respect the source site's terms, rate limits and privacy.
- Screenshots and examples are reference evidence, not assets to republish.
- Attribute external references in reports and preserve license notes.
- Never claim a feature exists based on a screenshot when its behavior was not tested.

## Current implementation boundary

The repository currently includes a reference catalog and this method. It does not include a crawler, browser automation agent or REA MCP integration. Future adapters must be optional, user-authorized and isolated from the deterministic core.
