---
name: integra-animate
description: Design, implement or refine purposeful motion in an existing interface. Use for transitions, micro-interactions, state feedback, spatial continuity and motion systems; always preserve usability, reduced-motion preferences and measurable performance.
---

# Integra Animate — Motion Design & Engineering

## Mission

Use motion to explain state, relationship and hierarchy, acknowledge user actions, preserve continuity or create one authored moment the product has earned. Animation is part of interaction design, not decoration added after the interface is complete.

A good motion decision answers three questions: **what changed, why should the user notice, and what would become less clear without movement?** When the answer is unclear, keep the interface still.

This workflow adapts motion-design principles from Impeccable's `animate` reference for Integra's evidence-first, product-aware workflow. The skill is a modified work; attribution and license details are recorded in [third-party notices](../../../docs/third-party-notices.md) and [the Apache-2.0 license](../../../licenses/IMPECCABLE-APACHE-2.0.txt).

## When to use

Use when the user requests animation, transitions, micro-interactions or a motion system; when an interaction needs clearer feedback; when navigation or layout changes need spatial continuity; or when existing motion feels slow, distracting, inaccessible or expensive.

Do not use to animate a static area simply because it exists, introduce motion before the primary task is understood, replace missing hierarchy with movement, or redesign a product's identity. Route new visual direction to `integra-design-direction`.

## 1. Establish the motion context

Inspect the target route or component, its task, existing animation language, state model, platform, input methods, design tokens, installed motion libraries and representative rendered states.

Classify relevant context as **Fact**, **Constraint**, **Preference**, **Assumption** or **Unknown**. Confirm:
- surface mode: Persuade, Operate, Read or Experience;
- target audience, task and consequence of the interaction;
- current state transitions and feedback conventions;
- browser/platform support and target device class;
- motion preferences, reduced-motion behavior and any performance budget.

Do not assume that a site's motion should be reproduced because a reference uses it. Extract the principle and adapt it to the product.

## 2. Write a motion thesis before implementation

Produce a short plan with four parts:

| Part | Decision to make |
|---|---|
| **Focal moment** | The one sequence or interaction that deserves authored motion, if any |
| **Continuity** | Which state, layout or navigation changes need a spatial explanation |
| **Feedback** | Which user actions and outcomes need acknowledgment |
| **Budget** | Which effects may be expensive, how often they run and how they are bounded |

The thesis must be specific to the product and target surface. A generic fade-and-rise, hover lift, parallax layer or scroll reveal is not a motion concept by itself.

Prefer one meaningful focal sequence with quiet supporting transitions over repeated reveals across every section.

## 3. Choose motion by the meaning it carries

Select the smallest technique that communicates the intended relationship:

- **State and feedback:** subtle color, opacity, scale or position change that makes an action and its result unmistakable.
- **Continuity and relationship:** shared-element transitions, FLIP-style transforms or View Transitions when an element or context persists between states.
- **Focus and depth:** bounded shadow, blur, filter or backdrop changes when a surface gains or loses focus.
- **Reveal and composition:** masks, clipping, cropping or controlled occlusion when the order of discovery matters.
- **Material and atmosphere:** gradient movement, texture, distortion or shader effects only when the visual direction, browser support and performance budget justify them.
- **Lists and groups:** stagger sibling items only when the group is meaningfully perceived as one list; cap total delay and avoid turning every scrolled section into a cascade.

Do not stack techniques for spectacle. Transforms and opacity are reliable options, not automatic proof of cheap rendering. Avoid animating layout-driving properties such as width, height, top, left and margins when a transform, FLIP strategy or grid transition can express the same change more safely.

## 4. Define timing, easing and choreography

Use the ranges below as starting points, not universal rules. Tune them to distance, consequence, platform convention and user expectation.

| Duration | Typical role |
|---|---|
| 100–150 ms | Immediate control feedback |
| 150–300 ms | Routine state change |
| 300–500 ms | Overlay, layout or view transition |
| 500–800 ms | Deliberate focal entrance that carries product character |

- Exits should generally resolve faster than entrances.
- Use easing that decelerates naturally for arrivals; for example, `cubic-bezier(0.16, 1, 0.3, 1)` can produce a confident settle.
- Avoid bounce, elastic and overshoot curves by reflex. Use them only when the physical metaphor and product tone justify them.
- Keep repeated feedback short. Long transitions are perceived as latency.
- Make choreography interruptible. A second action, route change or dismissal must not wait for an unrelated animation to finish.

Define duration, easing and distance as semantic motion tokens when multiple components share the same behavior. Do not introduce a token system for a single one-off transition.

## 5. Implement with the project's existing runtime

Inspect the installed stack and dependencies before choosing an implementation:

- Use CSS transitions and keyframes for declarative, bounded state changes.
- Use the Web Animations API or an existing motion library for dynamic values, sequencing and interruption.
- Use View Transitions or shared-element techniques when continuity across views is the actual design goal.
- Use scroll-driven motion only when the scroll relationship carries meaning, with a non-scroll-driven fallback.
- Do not add a dependency when the current stack can express the effect cleanly.
- Keep the content visible in the default state. Animation failure, disabled scripting or a reduced-motion preference must not hide essential content.
- Do not use animation as a substitute for state management, loading logic or accessible feedback.

Follow local component, token and framework conventions. Keep animation logic close to the component or interaction that owns the state.

## 6. Accessibility, preferences and user control

Every non-essential web animation must have an intentional `prefers-reduced-motion: reduce` path. Reduce spatial travel, parallax, zoom and large movement while preserving meaningful state changes and confirmation. Reduced motion means less movement, not loss of information.

- Never make content, navigation or an action available only after an animation.
- Preserve keyboard operation, visible focus and screen-reader announcements independently of motion.
- Do not use flashing or rapidly alternating effects to attract attention.
- Respect platform conventions and system motion preferences.
- Nonessential loops must stop when offscreen, hidden or no longer relevant; provide user control when a loop persists or competes with a task.
- Do not autoplay sound as part of an animation.
- Check that repeated activation, dismissal, interruption and navigation leave the interface in a valid state.

If the implementation cannot detect or honor the preference in the target environment, state the limitation and provide a static or low-motion fallback.

## 7. Protect performance

Bound expensive work such as blur, filters, shadows, backdrop effects, canvas and shaders to small regions. Apply `will-change` only near a known animation and remove it after use; do not promote every element preemptively.

Measure on representative target viewports and devices. Inspect frame drops, long tasks, layout shifts, paint/compositing cost and battery-sensitive behavior when tools are available. Do not claim that a transform is GPU-accelerated or that an effect is performant without runtime evidence.

Pause or cancel work that is no longer visible. Avoid continuous animation of large areas, expensive properties or many simultaneous elements. The motion budget must account for frequency and concurrency, not just duration.

## 8. Verify the complete interaction

Check:
- default and final states remain understandable without motion;
- the animation explains the state change or spatial relationship;
- timing and easing feel proportional to the consequence;
- rapid repeated input, interruption, reversal and dismissal behave correctly;
- mouse, touch, keyboard and focus-visible paths remain usable;
- narrow and wide viewports do not clip or obscure animated content;
- reduced-motion preserves information and action feedback;
- hidden/offscreen loops stop;
- expensive effects stay within the target performance budget.

Use browser inspection and profiling when available. Otherwise report which checks are `not_run` and provide a manual verification procedure. Do not convert an assumption or untested animation into a verified result.

## Deliverable: Motion Brief

1. Target, primary task and surface mode.
2. Existing motion patterns and relevant constraints.
3. Motion thesis: focal moment, continuity, feedback and budget.
4. Proposed sequence with trigger, start state, end state and interruption behavior.
5. Duration, easing, distance and semantic tokens where relevant.
6. Runtime approach and existing dependencies to reuse.
7. Reduced-motion alternative and keyboard/screen-reader considerations.
8. Performance risks, device coverage and measurement method.
9. Exact files changed or proposed, with rollback considerations.
10. Verification ledger: verified, heuristic, inconclusive or not_run.

## Handoff

- New visual world or product-level art direction: `integra-design-direction`.
- UI implementation: `integra-ui-generator`.
- Accessibility criteria and assistive-technology checks: `integra-accessibility-audit`.
- Frame/rendering cost and before/after measurement: `integra-performance-audit`.
- Independent interface review: `integra-design-qa`.

Preserve the target, product constraints, motion thesis, relevant tokens, implementation choice, reduced-motion behavior, approval state and verification evidence when handing off. Do not ask downstream agents to rediscover context already recorded.

## Done when

Motion communicates a product-relevant change, remains optional when it is nonessential, can be interrupted safely, honors reduced-motion preferences, works across supported input modes and has an honest verification record.
