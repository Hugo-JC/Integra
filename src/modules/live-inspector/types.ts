export type LiveStyleProperty = 'background-color' | 'color' | 'border-radius' | 'padding';
export type LiveEditableProperty = LiveStyleProperty;

export interface LiveStyleChange {
  property: LiveStyleProperty;
  before: string;
  after: string;
}

export interface LiveContrastResult {
  ratio: number;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  aaaLarge: boolean;
}

export interface LiveInspectorPatch {
  schemaVersion: '1.0.0';
  source: 'integra-live-inspector';
  element: { tagName: string; id?: string; sourcePath?: string; accessibleName?: string };
  classDiff: { originalClasses: string; updatedClasses: string };
  styleChanges: LiveStyleChange[];
  contrast?: LiveContrastResult;
  notes: string[];
}

export interface LiveInspectorOptions {
  accentColor?: string;
  panelTitle?: string;
  enabled?: boolean;
  keyboardShortcut?: boolean;
  ignoreSelector?: string;
  onSelectionChange?: (element: HTMLElement | null) => void;
  onPatchChange?: (patch: LiveInspectorPatch | null) => void;
}

export interface LiveInspectorHandle {
  isActive(): boolean;
  setActive(active: boolean): void;
  getSelectedElement(): HTMLElement | null;
  getPatch(): LiveInspectorPatch | null;
  toPrompt(): string | null;
  destroy(options?: { restoreChanges?: boolean }): void;
}

/** Stable DOM identity snapshot. A selector is never a source-code path. */
export interface LiveElementSnapshot {
  selector: string;
  tagName: string;
  accessibleName: string;
  originalClasses: string;
  componentHint?: string;
}

export interface LiveContrastEvidence {
  ratio: number;
  requiredRatio: number;
  passesAA: boolean;
  isLargeText: boolean;
  level: 'AA' | 'Fail';
}

export interface LiveElementChangeSet {
  schemaVersion: '1.0.0';
  target: LiveElementSnapshot;
  originalClasses: string;
  updatedClasses: string;
  addedClasses: string[];
  removedClasses: string[];
  styleChanges: LiveStyleChange[];
  evidence: {
    contrastRatio?: number;
    contrastRequired?: number;
    contrastPass?: boolean;
    contrastNote: string;
  };
}

export interface IntegraLiveInspectorOptions {
  title?: string;
  sourceHint?: string;
  onApply?: (changes: LiveElementChangeSet[], prompt: string) => void;
}

export interface IntegraLiveInspectorController {
  getChangeSets(): LiveElementChangeSet[];
  getPrompt(): string;
  stop(options?: { restore?: boolean }): void;
}
