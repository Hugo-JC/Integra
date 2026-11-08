export interface ParsedCssColor {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

function parseHex(input: string): ParsedCssColor | null {
  const value = input.trim().toLowerCase();
  if (!/^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(value)) return null;
  const raw = value.slice(1);
  const expanded = raw.length <= 4 ? [...raw].map((part) => part + part).join('') : raw;
  const hasAlpha = expanded.length === 8;
  return {
    red: Number.parseInt(expanded.slice(0, 2), 16),
    green: Number.parseInt(expanded.slice(2, 4), 16),
    blue: Number.parseInt(expanded.slice(4, 6), 16),
    alpha: hasAlpha ? Number.parseInt(expanded.slice(6, 8), 16) / 255 : 1,
  };
}

/** Parses common CSS color strings, including browser-computed rgb()/rgba() values. */
export function parseCssColor(input: string): ParsedCssColor | null {
  if (typeof input !== 'string') return null;
  const value = input.trim().toLowerCase();
  if (!value || value === 'transparent' || value === 'currentcolor') return null;
  if (value.startsWith('#')) return parseHex(value);
  const match = value.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+)%?\s*)?\)$/);
  if (!match) return null;
  const alphaRaw = match[4] === undefined ? 1 : Number(match[4]);
  const alpha = value.includes('%') && match[4] !== undefined ? alphaRaw / 100 : alphaRaw;
  const color = { red: Number(match[1]), green: Number(match[2]), blue: Number(match[3]), alpha };
  if (![color.red, color.green, color.blue, color.alpha].every(Number.isFinite)) return null;
  return {
    red: clamp(color.red, 0, 255),
    green: clamp(color.green, 0, 255),
    blue: clamp(color.blue, 0, 255),
    alpha: clamp(color.alpha, 0, 1),
  };
}

/** Converts an opaque parsed color to six-digit hex. Alpha colors return null. */
export function colorToHex(color: ParsedCssColor | null): string | null {
  if (!color || color.alpha < 0.999) return null;
  const channel = (value: number): string => Math.round(clamp(value, 0, 255)).toString(16).padStart(2, '0');
  return `#${channel(color.red)}${channel(color.green)}${channel(color.blue)}`;
}

export function compositeColors(foreground: ParsedCssColor, background: ParsedCssColor): ParsedCssColor {
  const alpha = foreground.alpha + background.alpha * (1 - foreground.alpha);
  if (alpha <= 0) return { red: 0, green: 0, blue: 0, alpha: 0 };
  return {
    red: (foreground.red * foreground.alpha + background.red * background.alpha * (1 - foreground.alpha)) / alpha,
    green: (foreground.green * foreground.alpha + background.green * background.alpha * (1 - foreground.alpha)) / alpha,
    blue: (foreground.blue * foreground.alpha + background.blue * background.alpha * (1 - foreground.alpha)) / alpha,
    alpha,
  };
}
