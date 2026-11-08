import { describe, expect, it } from 'vitest';
import { contrastRatio, evaluateContrast, parseColor } from '../../src/modules/live-inspector/contrast.js';

describe('Live Inspector contrast utilities', () => {
  it('parses hexadecimal and rgb colors', () => {
    expect(parseColor('#fff')).toEqual({r:255,g:255,b:255});
    expect(parseColor('rgb(0, 0, 0)')).toEqual({r:0,g:0,b:0});
  });
  it('calculates the black/white maximum ratio', () => {
    expect(contrastRatio('#000000','#ffffff')).toBe(21);
  });
  it('reports AA and AAA thresholds separately', () => {
    expect(evaluateContrast('#767676','#ffffff')).toMatchObject({aaNormal:true,aaaNormal:false,aaLarge:true});
  });
  it('returns null for unsupported or translucent color syntax', () => {
    expect(contrastRatio('var(--ink)','#fff')).toBeNull();
    expect(contrastRatio('rgba(0, 0, 0, 0.5)','#fff')).toBeNull();
    expect(contrastRatio('#00000080','#fff')).toBeNull();
  });
});
