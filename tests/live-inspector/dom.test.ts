import { describe, expect, it } from 'vitest';
import { restoreElementAttributes } from '../../src/modules/live-inspector/dom.js';

class FakeElement {
  private attributes = new Map<string, string>();

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  removeAttribute(name: string): void {
    this.attributes.delete(name);
  }
}

describe('Live Inspector DOM attribute restoration', () => {
  it('restores exact class and style values', () => {
    const element = new FakeElement();
    element.setAttribute('class', 'changed');
    element.setAttribute('style', 'padding: 12px;');

    restoreElementAttributes(element, {
      classAttribute: 'card active',
      styleAttribute: 'color: red;',
    });

    expect(element.getAttribute('class')).toBe('card active');
    expect(element.getAttribute('style')).toBe('color: red;');
  });

  it('preserves absent attributes instead of converting them to empty strings', () => {
    const element = new FakeElement();
    element.setAttribute('class', '');
    element.setAttribute('style', 'color: red;');

    restoreElementAttributes(element, {
      classAttribute: null,
      styleAttribute: null,
    });

    expect(element.getAttribute('class')).toBeNull();
    expect(element.getAttribute('style')).toBeNull();
  });
});
