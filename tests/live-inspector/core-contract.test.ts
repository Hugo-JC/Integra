import { describe, expect, it } from 'vitest';
import { calculateLiveContrast } from '../../src/modules/live-inspector/contrast.js';
import { findUniqueSelector, getAccessibleName } from '../../src/modules/live-inspector/selector.js';
import { createIntegraInspector } from '../../src/modules/live-inspector/index.js';

describe('Live Inspector v2 core contracts', () => {
  it('exposes the canonical inspector API from the module entry', () => {
    expect(createIntegraInspector).toBeTypeOf('function');
  });

  it('uses the large-text AA threshold only for qualifying text', () => {
    expect(calculateLiveContrast('#777777', '#ffffff', 24, 400)).toMatchObject({
      requiredRatio: 3,
      isLargeText: true,
    });
    expect(calculateLiveContrast('#777777', '#ffffff', 16, 400)).toMatchObject({
      requiredRatio: 4.5,
      isLargeText: false,
    });
  });

  it('prefers an explicit accessible name over visible text', () => {
    const element = {
      tagName: 'BUTTON',
      textContent: 'Fallback label',
      getAttribute: (name: string) => name === 'aria-label' ? 'Open navigation' : null,
    } as unknown as Element;
    expect(getAccessibleName(element)).toBe('Open navigation');
  });

  it('returns a unique ID selector only when it resolves to the target', () => {
    const element = { id: 'hero' } as unknown as Element;
    const doc = {
      querySelectorAll: (selector: string) => selector === '#hero' ? [element] : [],
    } as unknown as Document;
    expect(findUniqueSelector(element, doc)).toBe('#hero');
  });
});
