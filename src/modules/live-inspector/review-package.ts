import type { LiveElementChangeSet, LiveInspectorReviewPackage } from './types.js';

export type LiveInspectorMode = 'quick' | 'advanced';

export interface LiveInspectorReviewPackageInput {
  capturedAt: string;
  page: { origin: string; pathname: string };
  viewport: { width: number; height: number; devicePixelRatio: number };
  mode: LiveInspectorMode;
  changes: LiveElementChangeSet[];
  prompt: string;
}


/** Builds a portable review handoff; it never applies previews or writes source files. */
export function createLiveInspectorReviewPackage(
  input: LiveInspectorReviewPackageInput,
): LiveInspectorReviewPackage {
  const capturedAt = new Date(input.capturedAt);
  if (!Number.isFinite(capturedAt.getTime()) || capturedAt.toISOString() !== input.capturedAt) {
    throw new TypeError('capturedAt must be a valid ISO 8601 timestamp.');
  }
  if (!input.page.origin.trim() || !input.page.pathname.startsWith('/')) {
    throw new TypeError('page must include a non-empty origin and an absolute pathname.');
  }
  const { width, height, devicePixelRatio } = input.viewport;
  if (![width, height, devicePixelRatio].every(Number.isFinite) ||
    width < 1 || height < 1 || devicePixelRatio <= 0) {
    throw new RangeError('viewport dimensions and devicePixelRatio must be finite positive values.');
  }
  if (input.mode !== 'quick' && input.mode !== 'advanced') {
    throw new TypeError('mode must be quick or advanced.');
  }

  return {
    schemaVersion: '1.0.0',
    capturedAt: input.capturedAt,
    page: { origin: input.page.origin, pathname: input.page.pathname },
    viewport: { width, height, devicePixelRatio },
    mode: input.mode,
    targetCount: input.changes.length,
    changes: input.changes,
    prompt: input.prompt,
    sourceMapping: {
      status: 'unresolved',
      confidence: 'low',
      note: 'DOM selectors and component hints are not verified source mappings. Resolve each target against the receiving project before preparing a source diff.',
    },
    approval: {
      sourceMutation: 'none',
      requiredBeforeSourceChanges: true,
      scope: 'exact-proposed-diff',
    },
    limitations: [
      'This package records a local browser preview, not a source-code change or proof that the proposed result is correct.',
      'The viewport is a snapshot of the current browser window; other responsive states still require separate inspection.',
      'Contrast data is a runtime estimate or inconclusive signal, not a complete WCAG conformance result.',
      'Source mapping remains unresolved until the receiving project is inspected; a component hint is caller-provided and unverified.',
      'Any source edit requires a separate exact-diff review and explicit approval.',
    ],
  };
}
