import { describe, expect, it } from 'vitest';
import { restoreElementAttributes } from '../../src/modules/live-inspector/dom.js';

function createElementStub(initial: Record<string, string> = {}) {
  const attributes = new Map(Object.entries(initial));
  return {
    attributes,
    element: {
      setAttribute(name: string, value: string) { attributes.set(name, value); },
      removeAttribute(name: string) { attributes.delete(name); },
    },
  };
}

describe('Live Inspector DOM restoration', () => {
  it('restores exact inline style text and preserves an empty class attribute', () => {
    const stub = createElementStub({ class: '', style: 'color: red !important; padding: 4px;' });
    restoreElementAttributes(stub.element, {
      classAttribute: '',
      styleAttribute: 'color: blue; padding: 12px !important;',
    });
    expect(stub.attributes.get('class')).toBe('');
    expect(stub.attributes.get('style')).toBe('color: blue; padding: 12px !important;');
  });

  it('removes attributes that were originally absent', () => {
    const stub = createElementStub({ class: 'preview', style: 'color: red;' });
    restoreElementAttributes(stub.element, {
      classAttribute: null,
      styleAttribute: null,
    });
    expect(stub.attributes.has('class')).toBe(false);
    expect(stub.attributes.has('style')).toBe(false);
  });
});
