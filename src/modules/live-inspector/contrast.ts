import type { ParsedCssColor } from './color.js';
import { parseCssColor } from './color.js';

export interface LiveContrastResult {
  ratio: number;
  requiredRatio: 3 | 4.5;
  isLargeText: boolean;
  passesAA: boolean;
  level: 'AA' | 'fail';
}

function linearize(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(color: ParsedCssColor): number {
  return 0.2126 * linearize(color.red) + 0.7152 * linearize(color.green) + 0.0722 * linearize(color.blue);
}

/** WCAG relative-luminance contrast for already-composited sRGB colors. */
export function calculateLiveContrast(foreground: string, background: string, fontSizePx = 16, fontWeight = 400): LiveContrastResult | null {
  if (!Number.isFinite(fontSizePx) || fontSizePx <= 0) return null;
  if (!Number.isFinite(fontWeight) || fontWeight < 1 || fontWeight > 1000) return null;
  const fg = parseCssColor(foreground);
  const bg = parseCssColor(background);
  if (!fg || !bg || fg.alpha < 0.999 || bg.alpha < 0.999) return null;
  const isLargeText = fontSizePx >= 24 || (fontSizePx >= 18.66 && fontWeight >= 700);
  const requiredRatio = isLargeText ? 3 : 4.5;
  const values = [luminance(fg), luminance(bg)];
  const ratio = (Math.max(...values) + 0.05) / (Math.min(...values) + 0.05);
  const passesAA = ratio >= requiredRatio;
  return {
    ratio: Math.round(ratio * 100) / 100,
    requiredRatio,
    isLargeText,
    passesAA,
    level: passesAA ? 'AA' : 'fail',
  };
}
