---
name: integra-performance-audit
description: Diagnose frontend loading, responsiveness, rendering and animation cost using measurements and before/after evidence rather than blanket optimization. Use when a page feels slow, rerenders excessively or needs hardening; never claim gains without data.
---

# Integra Performance Audit

## Workflow
1. Reproduce the symptom; record environment (device class, network, browser, build mode).
2. Baseline with browser tooling or project metrics **before** editing (LCP, INP, CLS, long tasks, bundle size).
3. Classify the bottleneck: network, asset, main thread, layout, paint, interaction latency.
4. Inspect heavy assets, font loading, image sizing/format, route splitting, third-party scripts, expensive components.
5. Trace repeated renders; a rerender is harmful only if it costs measurable time.
6. Avoid premature `useMemo`/`useCallback`/`memo`; change only what moves the measured bottleneck.
7. Preserve accessibility, perceived responsiveness and layout stability.
8. Re-measure the same scenario and compare.

## Principles
User-visible bottleneck first. Reduce JavaScript and image cost before adding abstractions. Prefer transform/opacity animation. Consider low-end devices and constrained networks when relevant.

## Output
Table: metric · before · after · conditions · confidence. Then: changes made, what stayed unmeasured, risks.

## Signature touch: "Budget line"
State a performance budget for the surface (e.g. LCP, JS KB) up front and report against it, so "faster" always means "faster than a number".
