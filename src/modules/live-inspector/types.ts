export type LiveEditableProperty = 'color' | 'background-color' | 'border-radius' | 'padding';

export interface LiveElementSnapshot {
  selector: string;
  tagName: string;
  accessibleName: string;
  originalClasses: string;
  componentHint?: string;
}

export interface LiveStyleChange {
  property: LiveEditableProperty;
  before: string;
  after: string;
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
  /** Optional source hint supplied by a dev-server adapter or developer. Never guessed from the DOM. */
  sourceHint?: string;
  /** Receives the exact in-memory diff and an agent-ready prompt. No network request is made. */
  onApply?: (changes: LiveElementChangeSet[], prompt: string) => void;
  title?: string;
}

export interface IntegraLiveInspectorController {
  getChangeSets(): LiveElementChangeSet[];
  getPrompt(): string;
  /** restore=true reverts temporary DOM edits before removing the overlay. */
  stop(options?: { restore?: boolean }): void;
}
