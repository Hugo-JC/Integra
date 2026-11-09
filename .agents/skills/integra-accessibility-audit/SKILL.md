---
name: integra-accessibility-audit
description: Audit web interfaces and interactive flows against WCAG 2.2 with criterion-level evidence. Use for keyboard, screen-reader semantics, forms, focus, contrast, reflow, motion and inclusive interaction reviews; automated checks alone do not prove conformance.
---

# Integra Accessibility Audit

## Mission and scope

Evaluate whether people with different abilities, input methods and assistive technologies can understand and complete the target task. Audit the actual rendered experience whenever possible; source inspection alone cannot prove runtime behavior.

Default target: WCAG 2.2 Level AA unless the user specifies another target. Do not silently claim AAA, legal compliance or certification.

Before reviewing, record:
- target route, component and user flow;
- supported platforms, browsers and input modes;
- relevant user roles and data states;
- stated conformance target;
- available runtime, browser and assistive-technology tools;
- areas not available for inspection.

## Audit procedure

### 1. Structure and orientation
Inspect document title, language, landmarks, heading hierarchy, regions, page relationships, reading order and repeated navigation. Check whether users can orient themselves without relying on visual position.

### 2. Names, roles and values
Inspect native semantics first. Check accessible names, role, state, value, relationships, icon-only controls, custom widgets, dynamic labels and state announcements. Use ARIA only where native HTML does not express the behavior.

### 3. Keyboard and focus
Operate the actual task using keyboard only:
- logical tab and reading order;
- visible focus that is not clipped or obscured;
- no keyboard trap;
- expected Enter/Space behavior;
- Escape behavior where a dismissible layer exists;
- focus movement into dialogs and restoration to the invoking control;
- keyboard alternatives for drag, hover and pointer-only interactions.

Do not infer this from JSX alone. Mark runtime checks `not_run` when no browser is available.

### 4. Contrast and non-text content
Measure foreground/background pairs as rendered and composited:
- normal text: 4.5:1 minimum;
- large text: 3:1 minimum (at least 24 CSS px regular or approximately 18.66 CSS px bold);
- meaningful non-text UI components and graphical objects: 3:1 against adjacent colors where SC 1.4.11 applies.

Record both colors, ratio, text size/weight and the criterion. Gradients, image backgrounds, opacity, blend modes, overlays and filters require sampling or equivalent rendered evidence. Otherwise report `inconclusive`.

### 5. Color, visual and responsive access
Check that color is not the only carrier of meaning. Verify labels, icons, patterns or position also distinguish state and data. Check text resizing, zoom, 320 CSS px reflow where applicable, spacing overrides, orientation, text wrapping, target size and content clipping.

### 6. Forms and recovery
Inspect labels, instructions, required state, input purpose, error identification, correction suggestions, preservation of entered values, validation timing and success confirmation. Check whether errors are associated programmatically and announced.

### 7. Motion, time and updates
Check reduced-motion preferences, flashing, auto-updating regions, animation pauses, time limits, session expiry and live announcements. Do not add movement merely to make a screen feel more responsive.

### 8. Automated assistance
Use available tools such as axe, browser audits or the repository's Design QA. Record tool/version/scope. Automated checks are one evidence source; they do not test every criterion or prove conformance.

## Finding discipline

Each finding must identify:
- WCAG success criterion and level;
- exact location (route, selector, component or file:line);
- observed evidence and reproduction;
- affected task and likely impact;
- severity P0–P3 with rationale;
- smallest effective remediation;
- verification method and status.

Classify evidence as:
- **Confirmed failure:** directly reproduced or measured against a criterion.
- **Automated signal:** tool reported a candidate requiring interpretation.
- **Manual review:** human inspection indicates a likely issue not yet reproduced.
- **Inconclusive:** evidence is insufficient.
- **Not run:** check was not performed.

Do not invent a criterion mapping. If the relation is advisory rather than normative, say so.

## Output

Start with scope and coverage. Provide ranked findings, then successful patterns, then untested criteria and limitations. End with a verification ledger.

For each issue include a three-step reproduction: **Where → Action → Expected/observed result**.

## Done when

Every reported failure has criterion-level evidence; every untested area is explicit; fixes are actionable; automated and manual evidence are separated; no global conformance claim exceeds the audited scope.
