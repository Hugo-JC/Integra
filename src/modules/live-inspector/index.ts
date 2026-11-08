import { createIntegraInspector } from './overlay.js';
import type {
  IntegraLiveInspectorOptions,
  LiveElementChangeSet,
  LiveInspectorHandle,
  LiveInspectorOptions,
  LiveInspectorPatch,
} from './types.js';

function toLegacyPatch(change: LiveElementChangeSet): LiveInspectorPatch {
  const ratio = change.evidence.contrastRatio;
  const contrast = ratio === undefined ? undefined : {
    ratio,
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7,
    aaaLarge: ratio >= 4.5,
  };

  return {
    schemaVersion: '1.0.0',
    source: 'integra-live-inspector',
    element: {
      tagName: change.target.tagName.toLowerCase(),
      ...(change.target.componentHint ? { sourcePath: change.target.componentHint } : {}),
      ...(change.target.accessibleName ? { accessibleName: change.target.accessibleName } : {}),
    },
    classDiff: {
      originalClasses: change.originalClasses,
      updatedClasses: change.updatedClasses,
    },
    styleChanges: change.styleChanges,
    ...(contrast ? { contrast } : {}),
    notes: [
      'Browser preview only; source files are unchanged.',
      'A source hint is caller-provided and is not verified source mapping.',
      'Review the exact source diff and obtain explicit approval before applying changes.',
    ],
  };
}

/**
 * Compatibility adapter. The legacy API now delegates to the canonical v2
 * inspection engine so both public entry points share one DOM session.
 * @deprecated Prefer createIntegraInspector().
 */
export function createLiveInspector(options: LiveInspectorOptions = {}): LiveInspectorHandle {
  const inspectorOptions: IntegraLiveInspectorOptions = {
    title: options.panelTitle,
    accentColor: options.accentColor,
    enabled: options.enabled,
    keyboardShortcut: options.keyboardShortcut,
    ignoreSelector: options.ignoreSelector,
    onSelectionChange: options.onSelectionChange,
    onChange: (changes) => options.onPatchChange?.(changes.length ? toLegacyPatch(changes[0]) : null),
  };
  const controller = createIntegraInspector(inspectorOptions);

  return {
    isActive: controller.isActive,
    setActive: controller.setActive,
    getSelectedElement: () => {
      const selected = controller.getSelectedElement();
      return selected instanceof HTMLElement ? selected : null;
    },
    getPatch: () => {
      const changes = controller.getChangeSets();
      return changes.length ? toLegacyPatch(changes[0]) : null;
    },
    toPrompt: () => controller.getChangeSets().length ? controller.getPrompt() : null,
    destroy: ({ restoreChanges = true } = {}) => controller.stop({ restore: restoreChanges }),
  };
}

export { createIntegraInspector } from './overlay.js';
export {
  calculateLiveContrast,
  contrastRatio,
  evaluateContrast,
  parseColor,
  relativeLuminance,
  toHexColor,
} from './contrast.js';
export type * from './types.js';
