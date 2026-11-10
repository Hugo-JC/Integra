import { describe, expect, it } from 'vitest';
import { createLivePreviewHistory } from '../../src/modules/live-inspector/history.js';

describe('Live preview history', () => {
  it('undoes and redoes exact attribute snapshots', () => {
    const history = createLivePreviewHistory<object>();
    const target = {};
    const before = { classAttribute: 'card', styleAttribute: null };
    const after = { classAttribute: 'card active', styleAttribute: 'padding: 8px;' };

    history.record(target, before, after, 'classes');
    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);
    expect(history.undo()).toEqual({ target, snapshot: before, label: 'classes' });
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(true);
    expect(history.redo()).toEqual({ target, snapshot: after, label: 'classes' });
  });

  it('merges consecutive edits to the same target and field', () => {
    const history = createLivePreviewHistory<object>();
    const target = {};
    const initial = { classAttribute: 'card', styleAttribute: null };
    const middle = { classAttribute: 'card', styleAttribute: 'padding: 4px;' };
    const latest = { classAttribute: 'card', styleAttribute: 'padding: 8px;' };

    history.record(target, initial, middle, 'padding');
    history.record(target, middle, latest, 'padding');
    expect(history.undo()).toEqual({ target, snapshot: initial, label: 'padding' });
  });

  it('clears redo after a new operation and ignores no-op snapshots', () => {
    const history = createLivePreviewHistory<object>();
    const target = {};
    const initial = { classAttribute: null, styleAttribute: null };
    const changed = { classAttribute: 'new', styleAttribute: null };

    history.record(target, initial, initial, 'classes');
    expect(history.canUndo()).toBe(false);
    history.record(target, initial, changed, 'classes');
    history.undo();
    history.record(target, initial, changed, 'classes');
    expect(history.canRedo()).toBe(false);
  });

  it('enforces a bounded history and validates its limit', () => {
    const history = createLivePreviewHistory<object>(2);
    const target = {};
    const snapshots = [0, 1, 2, 3].map((n) => ({ classAttribute: String(n), styleAttribute: null }));
    history.record(target, snapshots[0], snapshots[1], 'one');
    history.record(target, snapshots[1], snapshots[2], 'two');
    history.record(target, snapshots[2], snapshots[3], 'three');
    expect(history.undo()?.snapshot).toEqual(snapshots[2]);
    expect(history.undo()?.snapshot).toEqual(snapshots[1]);
    expect(history.undo()).toBeNull();
    expect(() => createLivePreviewHistory(0)).toThrow(RangeError);
  });
});
