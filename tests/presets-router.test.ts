import { describe, expect, it } from 'vitest';
import { routeDesignPreset, getDesignStyle, normalizeDesignQuery } from '../src/modules/direction/presets/router.js';

describe('design preset router', () => {
  it('normalizes Portuguese accents and punctuation', () => {
    expect(normalizeDesignQuery('Clínica — Estética!')).toBe('clinica estetica');
  });
  it('routes a specific niche and resolves its style', () => {
    const result = routeDesignPreset('SaaS developer AI platform');
    expect(result.status).toBe('matched');
    expect(result.confidence).toBe('high');
    expect(getDesignStyle(result.styleId)).toBeDefined();
  });
  it('does not silently guess when there is no match', () => {
    const result = routeDesignPreset('something impossible to classify xyz');
    expect(result.status).toBe('fallback');
    expect(result.requiresConfirmation).toBe(true);
  });
  it('keeps weak matching explicit', () => {
    const result = routeDesignPreset('loja online');
    expect(result.requiresConfirmation).toBe(true);
  });
});
