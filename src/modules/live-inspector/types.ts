export type LiveStyleProperty = 'background-color' | 'color' | 'border-radius' | 'padding';

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
