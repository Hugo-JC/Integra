---
name: integra-performance-audit
description: Reviews frontend loading, responsiveness, rendering work, state updates, asset delivery and animation cost using measurements rather than blanket optimization rules. Use when a page feels slow, has unnecessary rerenders or needs performance hardening.
---

# Integra Performance Audit

## Workflow
1. Reproduce the reported performance problem and capture the environment.
2. Establish a baseline with browser tooling or project metrics before modifying code.
3. Separate network, asset, main-thread, layout, rendering and interaction latency.
4. Inspect large assets, font loading, image sizing, route splitting, third-party scripts and expensive components.
5. Trace repeated renders and state updates. Do not assume every rerender is harmful.
6. Avoid premature useMemo/useCallback/memo. Measure the cost and confirm the optimization changes the observed bottleneck.
7. Preserve accessibility, perceived responsiveness and visual stability.
8. Compare the same scenario after the change.
9. Report metrics, test conditions and what remains unmeasured.

## Principles
- Optimize the user-visible bottleneck, not a style preference.
- Prefer responsive feedback and stable layout over decorative animation.
- Reduce JavaScript and image cost before adding abstractions.
- Include low-end device and constrained network considerations when relevant.
- Never claim a performance gain without before/after evidence.
