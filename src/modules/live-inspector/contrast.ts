import type { LiveContrastResult, LiveContrastEvidence } from './types.js';

export interface RGBColor { r: number; g: number; b: number; }

function channel(value: number): number { return Math.min(255, Math.max(0, value)); }

export function parseColor(input: string): RGBColor | null {
  if (typeof input !== 'string') return null;
  const value = input.trim().toLowerCase();
  const hex = value.match(/^#([\\da-f]{3,4}|[\\da-f]{6}|[\\da-f]{8})$/i);
  if (hex) {
    let digits = hex[1];
    if (digits.length === 3 || digits.length === 4) digits = [...digits.slice(0, 3)].map((x) => x + x).join('');
    else if (digits.length === 8) digits = digits.slice(0, 6);
    return { r: parseInt(digits.slice(0, 2), 16), g: parseInt(digits.slice(2, 4), 16), b: parseInt(digits.slice(4, 6), 16) };
  }
  const rgb = value.match(/^rgba?\\((.*)\\)$/);
  if (!rgb) return null;
  const values = rgb[1].replace(/\\s*\\/\\s*[^,\\s]+\\s*$/, '').split(/[\\s,]+/).filter(Boolean).slice(0, 3);
  if (values.length !== 3) return null;
  const parsed = values.map((part) => {
    const number = Number.parseFloat(part);
    return Number.isFinite(number) ? channel(part.endsWith('%') ? number * 2.55 : number) : NaN;
  });
  return parsed.some(Number.isNaN) ? null : { r: parsed[0], g: parsed[1], b: parsed[2] };
}

function linearize(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(color: RGBColor): number {
  return 0.2126 * linearize(color.r) + 0.7152 * linearize(color.g) + 0.0722 * linearize(color.b);
}

export function contrastRatio(foreground: string, background: string): number | null {
  const fg = parseColor(foreground);
  const bg = parseColor(background);
  if (!fg || !bg) return null;
  const first = relativeLuminance(fg);
  const second = relativeLuminance(bg);
  return Number(((Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)).toFixed(2));
}

export function evaluateContrast(foreground: string, background: string): LiveContrastResult | null {
  const ratio = contrastRatio(foreground, background);
  return ratio === null ? null : {
    ratio,
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7,
    aaaLarge: ratio >= 4.5,
  };
}

/** Runtime estimate for a solid foreground/background pair; it is not a full WCAG audit. */
export function calculateLiveContrast(
  foreground: string,
  background: string,
  fontSizePx = 16,
  fontWeight = 400,
): LiveContrastEvidence | null {
  const ratio = contrastRatio(foreground, background);
  if (ratio === null) return null;
  const isLargeText = fontSizePx >= 24 || (fontSizePx >= 18.66 && fontWeight >= 700);
  const requiredRatio = isLargeText ? 3 : 4.5;
  const passesAA = ratio >= requiredRatio;
  return { ratio, requiredRatio, passesAA, isLargeText, level: passesAA ? 'AA' : 'Fail' };
}

export function toHexColor(input: string): string | null {
  const color = parseColor(input);
  return color ? '#' + [color.r, color.g, color.b].map((value) => Math.round(value).toString(16).padStart(2, '0')).join('') : null;
}
