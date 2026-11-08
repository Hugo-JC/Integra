import { describe, expect, it } from 'vitest';
import { colorToHex, compositeColors, parseCssColor } from '../src/modules/refinement/audits/contrast-audit.js';

describe('contrast color helpers', () => {
  it('parses hex and rgba CSS colors', () => {
    expect(parseCssColor('#3B82F6')?.red).toBe(59);
    expect(parseCssColor('rgba(0, 0, 0, 0.5)')?.alpha).toBe(0.5);
    expect(parseCssColor('rgb(100% 0% 0% / 50%)')).toMatchObject({ red: 255, green: 0, blue: 0, alpha: 0.5 });
  });
  it('composites alpha over a known background', () => {
    const result = compositeColors({ red: 0, green: 0, blue: 0, alpha: 0.5 }, { red: 255, green: 255, blue: 255, alpha: 1 });
    expect(colorToHex(result)).toBe('#808080');
  });
  it('rejects unrecognized color formats rather than guessing', () => {
    expect(parseCssColor('color(display-p3 1 0 0)')).toBeNull();
  });
});
