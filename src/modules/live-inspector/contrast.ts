import type { LiveContrastResult, LiveInspectorContrastAssessment } from './types.js';

export interface RGBColor { r: number; g: number; b: number; }

function channel(value: number): number { return Math.min(255, Math.max(0, value)); }

export function parseColor(input: string): RGBColor | null {
  const value = input.trim().toLowerCase();
  const hex = value.match(/^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i);
  if (hex) {
    let digits = hex[1];
    if (digits.length === 3 || digits.length === 4) digits = [...digits.slice(0, 3)].map((x) => x + x).join('');
    else if (digits.length === 8) digits = digits.slice(0, 6);
    return { r: parseInt(digits.slice(0,2),16), g: parseInt(digits.slice(2,4),16), b: parseInt(digits.slice(4,6),16) };
  }
  const rgb = value.match(/^rgba?\((.*)\)$/);
  if (!rgb) return null;
  const values = rgb[1].replace(/\s*\/\s*[^,\s]+\s*$/, '').split(/[\s,]+/).filter(Boolean).slice(0,3);
  if (values.length !== 3) return null;
  const parsed = values.map((v) => {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? channel(v.endsWith('%') ? n * 2.55 : n) : NaN;
  });
  return parsed.some(Number.isNaN) ? null : { r:parsed[0], g:parsed[1], b:parsed[2] };
}

function linearize(c: number): number {
  const n = c / 255;
  return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(c: RGBColor): number {
  return 0.2126 * linearize(c.r) + 0.7152 * linearize(c.g) + 0.0722 * linearize(c.b);
}

export function contrastRatio(foreground: string, background: string): number | null {
  const f = parseColor(foreground), b = parseColor(background);
  if (!f || !b) return null;
  const a = relativeLuminance(f), z = relativeLuminance(b);
  return Number(((Math.max(a,z) + 0.05) / (Math.min(a,z) + 0.05)).toFixed(2));
}

export function evaluateContrast(foreground: string, background: string): LiveContrastResult | null {
  const ratio = contrastRatio(foreground, background);
  return ratio === null ? null : {
    ratio, aaNormal: ratio >= 4.5, aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7, aaaLarge: ratio >= 4.5
  };
}

/** Evaluates contrast using the WCAG AA threshold for the supplied text size and weight. */
export function calculateLiveContrast(
  foreground: string,
  background: string,
  fontSize: number,
  fontWeight: number,
): LiveInspectorContrastAssessment | null {
  const ratio = contrastRatio(foreground, background);
  if (ratio === null || !Number.isFinite(fontSize) || !Number.isFinite(fontWeight)) return null;
  const isLargeText = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
  const requiredRatio = isLargeText ? 3 : 4.5;
  const passesAA = ratio >= requiredRatio;
  return {
    ratio,
    requiredRatio,
    passesAA,
    isLargeText,
    level: passesAA ? 'AA' : 'fail',
  };
}

export function toHexColor(input: string): string | null {
  const c = parseColor(input);
  return c ? '#' + [c.r,c.g,c.b].map((x) => Math.round(x).toString(16).padStart(2,'0')).join('') : null;
}
