# Live Inspector v2 — Product and Technical Specification

**Status:** Approved direction; implementation not yet started.  
**Decision:** Both Advanced Inspector and Figma-like Quick Canvas.  
**Source-code application:** Review required.

## 1. Product intent

Live Inspector v2 should make the gap between seeing a UI problem and preparing a precise code change much smaller. It remains a local-development inspection and preview tool—not a visual website builder, production editor or automatic source-code mutator.

One inspection engine powers two complementary experiences. Users can switch modes without losing the selected element or preview history.

## 2. Two modes, one inspection session

### Advanced Inspector

A structured panel for deliberate diagnosis:

- DOM Navigator: parent/child/sibling traversal and a compact breadcrumb.
- Element identity: tag, ID, classes, role, accessible name and best-effort selector.
- Layout: display, position, dimensions, box model, gap, alignment and overflow.
- Typography: family, size, weight, line-height, letter spacing and text alignment.
- Surface: text/background/border colors, border width/radius and shadow.
- Spacing: margin, padding and gap.
- States: hover/focus/active state observation where the browser can safely expose it; no claim of complete state simulation.
- Tokens: show likely matching CSS custom properties and utility classes; distinguish inferred matches from exact token references.
- Accessibility: semantic role/name signals, heading structure, form-label associations, focusability and contrast estimate with confidence/limitations.
- Responsive review: inspect the current viewport and provide suggested viewport checkpoints. Do not claim to emulate a device unless a real browser/device emulation adapter is connected.

### Quick Canvas

A compact, direct manipulation surface inspired by the speed of visual design tools:

- Clear blue selection outline and element badge.
- Contextual floating toolbar near the selected element.
- Fast controls for the most common visual properties.
- Quick parent/child navigation and mode switch to Advanced Inspector.
- Compact before/after preview and one-click revert.
- Panel can be repositioned within safe viewport bounds.
- Keyboard-first operation, visible focus and reduced-motion support.

Quick Canvas is not a freeform layout editor in v2. It must not silently drag, resize or reorder application elements in ways that alter layout structure.

## 3. Session state model

Use an explicit state machine:

- `inactive`: inspector is installed but not capturing interactions.
- `hovering`: pointer target is highlighted.
- `selected`: target is locked for inspection.
- `previewing`: one or more temporary edits are active.
- `review-ready`: a structured handoff package is available.
- `disposed`: listeners and overlay are removed.

State transitions must be deterministic. Changing selection with uncommitted preview changes must offer to keep the changes in the session, revert them, or cancel selection change. It must never silently lose the user's work.

## 4. Preview transaction and history

All edits are temporary DOM operations.

- Store the original inline value and priority for every edited property.
- Record each edit as a typed operation with target identity, property, previous value and next value.
- Support undo, redo, reset-one-property, reset-element and reset-session.
- Group rapid slider/input updates into one history transaction.
- Reverting must restore the exact prior inline declaration, including absence and `!important` priority.
- If the target is detached or replaced by framework rendering, mark the operation stale and do not apply it to a different element.
- Destroying the inspector restores the original DOM state by default.

Use a strict editable-property allowlist and validate values before previewing. Do not expose arbitrary CSS, JavaScript, selectors or HTML injection as an editing surface.

## 5. Structured handoff

Export a versioned `LiveInspectorReview` package containing:

- Session ID and schema version.
- Target selector and DOM breadcrumb.
- Element tag, role, accessible name and class snapshot.
- Optional source hint, explicitly marked as user-provided and unverified.
- Ordered operations with before/after values.
- Contrast/accessibility evidence, confidence and known limitations.
- Viewport dimensions and relevant state notes.
- Unresolved source mapping and verification requirements.

The package is a proposal, not executable source code. Do not infer a source file from a CSS class, generated selector or DOM ancestry.

## 6. Human review and application flow

1. User selects an element and previews changes.
2. Inspector exports a review package.
3. Refactor workflow inspects the actual repository, component, imports, call sites, tokens and tests.
4. Agent presents the exact proposed source diff, affected files, behavior-preservation notes and verification plan.
5. User explicitly approves that exact diff.
6. Only then may the agent edit source files.
7. Agent runs relevant checks and reports actual outcomes.
8. If implementation differs materially from the approved diff, stop and request another approval.

Preview acceptance is not source-edit approval. No automatic file write, commit, push, PR or merge is part of the Inspector.

## 7. Reliability and security requirements

- Render user-controlled labels through `textContent`, not HTML interpolation.
- Validate accent colors against a strict color format before using them in CSS.
- Treat `ignoreSelector` as untrusted input; validate it with guarded selector parsing and fail safely.
- Keep inspector chrome in Shadow DOM and exclude it from target selection.
- Reposition the outline on scroll, resize, visual viewport changes and layout shifts; throttle work with animation-frame scheduling and clean up observers/listeners.
- Handle nested scrolling containers and detached nodes.
- Keep keyboard shortcuts configurable and avoid intercepting typing in form controls.
- Respect Escape, focus restoration, reduced motion and high-contrast system preferences.
- Keep the Vite adapter development-only (`apply: 'serve'`) and avoid weakening CSP.
- Never send page content or DOM snapshots to an external provider without explicit user authorization.

## 8. Implementation phases

### Phase A — Core reliability
Unify the current public Inspector API and Vite adapter; validate configuration; harden selectors and rendering; make overlay geometry robust; add teardown and restoration tests.

### Phase B — Preview engine
Introduce typed operations, exact snapshots, undo/redo, grouped history and stale-target detection.

### Phase C — Advanced Inspector
Add DOM Navigator, computed-property groups, token hints and accessibility evidence with confidence labels.

### Phase D — Quick Canvas
Add contextual toolbar, quick controls, keyboard navigation and mode switching, reusing the same preview engine.

### Phase E — Review handoff
Add the versioned review package and explicit source-review boundary with the refactor workflow.

## 9. Acceptance criteria

- Preview never writes application source files.
- Undo/redo and full restore reproduce original inline styles, classes and priorities exactly.
- Selection and overlay remain aligned during scroll, resize and layout changes.
- Invalid configuration cannot break the host page or inject markup/styles.
- Detached/replaced targets are handled without corrupting another element.
- Keyboard users can select, navigate, edit, undo and close the inspector.
- Contrast output clearly communicates when it is an estimate or unavailable.
- Handoff contains exact preview operations and never claims automatic source mapping.
- Refactor workflow cannot write source until the user approves the displayed diff.
- Vite production build contains no inspector injection.
