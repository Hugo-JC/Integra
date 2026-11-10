export interface LivePreviewSnapshot {
  classAttribute: string | null;
  styleAttribute: string | null;
}

export interface LivePreviewOperation<TTarget> {
  target: TTarget;
  before: LivePreviewSnapshot;
  after: LivePreviewSnapshot;
  label: string;
}

export interface LivePreviewHistory<TTarget> {
  record(target: TTarget, before: LivePreviewSnapshot, after: LivePreviewSnapshot, label: string): void;
  undo(): { target: TTarget; snapshot: LivePreviewSnapshot; label: string } | null;
  redo(): { target: TTarget; snapshot: LivePreviewSnapshot; label: string } | null;
  canUndo(): boolean;
  canRedo(): boolean;
  clear(): void;
}

function equalSnapshot(a: LivePreviewSnapshot, b: LivePreviewSnapshot): boolean {
  return a.classAttribute === b.classAttribute && a.styleAttribute === b.styleAttribute;
}

/** Bounded, deterministic history for reversible DOM preview transactions. */
export function createLivePreviewHistory<TTarget>(limit = 100): LivePreviewHistory<TTarget> {
  if (!Number.isInteger(limit) || limit < 1) throw new RangeError('History limit must be a positive integer.');
  const undoStack: LivePreviewOperation<TTarget>[] = [];
  const redoStack: LivePreviewOperation<TTarget>[] = [];

  return {
    record(target, before, after, label) {
      if (equalSnapshot(before, after)) return;
      const previous = undoStack[undoStack.length - 1];
      if (previous && previous.target === target && previous.label === label) {
        previous.after = after;
      } else {
        undoStack.push({ target, before, after, label });
        if (undoStack.length > limit) undoStack.shift();
      }
      redoStack.length = 0;
    },
    undo() {
      const operation = undoStack.pop();
      if (!operation) return null;
      redoStack.push(operation);
      return { target: operation.target, snapshot: operation.before, label: operation.label };
    },
    redo() {
      const operation = redoStack.pop();
      if (!operation) return null;
      undoStack.push(operation);
      return { target: operation.target, snapshot: operation.after, label: operation.label };
    },
    canUndo: () => undoStack.length > 0,
    canRedo: () => redoStack.length > 0,
    clear() {
      undoStack.length = 0;
      redoStack.length = 0;
    }
  };
}
