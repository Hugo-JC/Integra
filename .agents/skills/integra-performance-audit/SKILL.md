---
name: integra-performance-audit
description: Diagnose frontend loading, responsiveness, interaction latency, rendering and animation cost using reproducible measurements. Use when performance is slow or needs verification; do not optimize or claim gains without comparable evidence.
---

# Integra Performance Audit

## Mission

Find the bottleneck that matters to the user's task, establish a repeatable baseline and verify whether a targeted change improves it without degrading experience elsewhere.

## Define the scenario

Record route, build mode, browser, device class, CPU/network conditions, cache state, test data, interaction and repeat count. Compare like with like. Separate lab measurements from field data and estimates.

## Measurement procedure

1. Reproduce the reported symptom and record the exact steps.
2. Collect a baseline before making changes.
3. Inspect relevant Core Web Vitals where measurable: LCP, INP and CLS. Record the metric source, sample, environment and whether it is lab or field data.
4. Use traces/profilers to classify bottlenecks: network, server, asset, main thread, JavaScript, layout, paint, hydration, rendering or interaction.
5. Inspect image dimensions/formats, font loading, caching, route splitting, third-party scripts, expensive work and long tasks.
6. Trace repeated renders. A render is not a defect unless its user-visible cost is evidenced.
7. Form one causal hypothesis and choose the smallest change that tests it.
8. Preserve semantics, accessibility, layout stability and perceived feedback.
9. Re-measure the same scenario with the same conditions and enough repetitions to understand variability.
10. Report regressions and trade-offs; do not cherry-pick the best run.

## Optimization rules

- Optimize the measured bottleneck, not a fashionable technique.
- Avoid reflexive memoization, premature virtualization or unnecessary dependencies.
- Prefer reducing unnecessary bytes and work before adding abstractions.
- Use transform/opacity for animation when appropriate, but measure actual paint/compositing costs.
- Include low-end devices and constrained networks when they are relevant to the audience.
- Do not exchange accessibility, readable content or error recovery for a metric.

## Output

Table: metric, before, after, units, environment, repetitions, variance/range, source and confidence. Then bottleneck diagnosis, changes, trade-offs, unmeasured metrics and follow-up verification.

## Signature: budget line

Set a proposed budget only when product context supports one. Label a newly suggested budget as a target, not an existing requirement. Report measured values against it.

## Done when

A causal bottleneck is supported by evidence, before/after conditions are comparable, improvements and regressions are both reported, and unmeasured claims remain unclaimed.
