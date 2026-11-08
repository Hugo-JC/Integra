import { describe, expect, it } from 'vitest';
import { calculateLiveContrast } from '../src/modules/live-inspector/contrast.js';
import { colorToHex, parseCssColor } from '../src/modules/live-inspector/color.js';
import { diffClasses, diffInlineStyles, synthesizeLivePrompt, createElementChangeSet } from '../src/modules/live-inspector/diff.js';

describe('Integra Live Inspector primitives', () => {
  it('parses browser-computed rgb and hex colors', () => {
    expect(parseCssColor('rgb(59, 130, 246)')).toEqual({ red: 59, green: 130, blue: 246, alpha: 1 });
    expect(colorToHex(parseCssColor('#3b82f6'))).toBe('#3b82f6');
    expect(parseCssColor('transparent')).toBeNull();
    expect(colorToHex(parseCssColor('rgba(0, 0, 0, 0.5)'))).toBeNull();
  });

  it('checks WCAG AA thresholds for normal and large text', () => {
    expect(calculateLiveContrast('#000000', '#ffffff', 16, 400)).toMatchObject({
      ratio: 21, requiredRatio: 4.5, passesAA: true, level: 'AA',
    });
    expect(calculateLiveContrast('#777777', '#ffffff', 16, 400)?.passesAA).toBe(false);
    expect(calculateLiveContrast('#777777', '#ffffff', 24, 400)?.passesAA).toBe(true);
  });

  it('computes exact class additions and removals', () => {
    expect(diffClasses('flex p-2 text-sm', 'grid p-4 text-sm')).toEqual({
      added: ['grid', 'p-4'], removed: ['flex', 'p-2'],
    });
  });

  it('reports property changes only when values differ', () => {
    expect(diffInlineStyles(
      { color: 'white', padding: '8px' },
      { color: '#fff', padding: '8px', 'background-color': '#111' },
    )).toEqual([
      { property: 'color', before: 'white', after: '#fff' },
      { property: 'background-color', before: '', after: '#111' },
    ]);
  });

  it('synthesizes a handoff prompt with source-mapping uncertainty', () => {
    const change = createElementChangeSet({
      target: { selector: '#hero > h1:nth-of-type(1)', tagName: 'H1', accessibleName: 'Build better products', originalClasses: 'text-4xl' },
      updatedClasses: 'text-5xl',
      beforeStyles: {},
      afterStyles: {},
    });
    const prompt = synthesizeLivePrompt([change]);
    expect(prompt).toContain('Original classes: "text-4xl"');
    expect(prompt).toContain('Updated classes: "text-5xl"');
    expect(prompt).toContain('Source file: unknown');
  });
});
