import { calculateContrastRatio } from '../../direction/contrast.js';

export interface RgbaColor { red: number; green: number; blue: number; alpha: number }
export type ContrastAuditStatus = 'passed' | 'failed' | 'inconclusive' | 'not-applicable';
export interface ContrastAuditResult {
  status: ContrastAuditStatus;
  ratio?: number;
  requiredRatio?: number;
  aaaRatio?: number;
  foreground?: string;
  background?: string;
  message: string;
  criterion: 'WCAG 2.2 SC 1.4.3';
}

export function parseCssColor(input: string): RgbaColor | null {
  const value = input.trim().toLowerCase();
  const hex = value.match(/^#([\da-f]{3,8})$/i)?.[1];
  if (hex) {
    if (![3, 4, 6, 8].includes(hex.length)) return null;
    const full = hex.length <= 4 ? [...hex].map((v) => v + v).join('') : hex;
    return {
      red: Number.parseInt(full.slice(0, 2), 16),
      green: Number.parseInt(full.slice(2, 4), 16),
      blue: Number.parseInt(full.slice(4, 6), 16),
      alpha: full.length === 8 ? Number.parseInt(full.slice(6, 8), 16) / 255 : 1,
    };
  }
  const parts = value.match(/^rgba?\((.*)\)$/)?.[1]?.replace(/,/g, ' ').replace(/\//g, ' ').trim().split(/\s+/);
  if (!parts || parts.length < 3 || parts.length > 4) return null;
  const channel = (raw: string) => {
    const n = Number.parseFloat(raw);
    if (!Number.isFinite(n)) return null;
    return raw.endsWith('%') ? Math.max(0, Math.min(255, n * 2.55)) : Math.max(0, Math.min(255, n));
  };
  const rgb = parts.slice(0, 3).map(channel);
  const alpha = parts[3] === undefined ? 1 : Number.parseFloat(parts[3]);
  if (rgb.some((n) => n === null) || !Number.isFinite(alpha)) return null;
  return { red: rgb[0]!, green: rgb[1]!, blue: rgb[2]!, alpha: Math.max(0, Math.min(1, alpha)) };
}

export function compositeColors(front: RgbaColor, back: RgbaColor): RgbaColor {
  const alpha = front.alpha + back.alpha * (1 - front.alpha);
  if (alpha === 0) return { red: 0, green: 0, blue: 0, alpha: 0 };
  const blend = (a: number, b: number) => (a * front.alpha + b * back.alpha * (1 - front.alpha)) / alpha;
  return { red: blend(front.red, back.red), green: blend(front.green, back.green), blue: blend(front.blue, back.blue), alpha };
}

export function colorToHex(color: RgbaColor): string {
  const hex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${hex(color.red)}${hex(color.green)}${hex(color.blue)}`;
}

/** Audits the selected text element; uncertain backgrounds deliberately stay inconclusive. */
export function auditTextContrast(element: Element, view: Window = window): ContrastAuditResult {
  const computed = view.getComputedStyle(element);
  if (!computed.color || computed.display === 'none' || computed.visibility === 'hidden') {
    return { status: 'not-applicable', message: 'No visible text was detected on this element.', criterion: 'WCAG 2.2 SC 1.4.3' };
  }
  if (computed.backgroundImage !== 'none' || computed.filter !== 'none' || computed.mixBlendMode !== 'normal') {
    return { status: 'inconclusive', message: 'Image/gradient, filter or blend mode prevents a reliable color calculation.', criterion: 'WCAG 2.2 SC 1.4.3' };
  }
  let foreground = parseCssColor(computed.color);
  if (!foreground) return { status: 'inconclusive', message: 'The foreground color format could not be parsed.', criterion: 'WCAG 2.2 SC 1.4.3' };
  let background: RgbaColor = { red: 0, green: 0, blue: 0, alpha: 0 };
  const backgroundLayers: RgbaColor[] = [];
  let current: Element | null = element;
  while (current) {
    const style = view.getComputedStyle(current);
    if (Number.parseFloat(style.opacity) < 1 || style.filter !== 'none' || style.mixBlendMode !== 'normal') {
      return { status: 'inconclusive', message: 'An ancestor opacity/filter/blend layer makes the effective colors uncertain.', criterion: 'WCAG 2.2 SC 1.4.3' };
    }
    if (style.backgroundImage !== 'none') {
      return { status: 'inconclusive', message: 'A background image or gradient makes the effective background uncertain.', criterion: 'WCAG 2.2 SC 1.4.3' };
    }
    const layer = parseCssColor(style.backgroundColor);
    if (layer && layer.alpha > 0) backgroundLayers.push(layer);
    current = current.parentElement;
  }
  for (const layer of backgroundLayers.reverse()) background = compositeColors(layer, background);
  if (background.alpha < 0.999) {
    return { status: 'inconclusive', message: 'No fully opaque ancestor background was found; the browser canvas color is not assumed.', criterion: 'WCAG 2.2 SC 1.4.3' };
  }
  foreground = compositeColors(foreground, background);
  if (foreground.alpha < 0.999) {
    return { status: 'inconclusive', message: 'The final text color is not fully opaque after compositing.', criterion: 'WCAG 2.2 SC 1.4.3' };
  }
  const fg = colorToHex(foreground);
  const bg = colorToHex(background);
  const size = Number.parseFloat(computed.fontSize);
  const weight = Number.parseInt(computed.fontWeight, 10) || 400;
  const large = size >= 24 || (size >= 18.66 && weight >= 700);
  const required = large ? 3 : 4.5;
  const aaa = large ? 4.5 : 7;
  const ratio = calculateContrastRatio(fg, bg);
  return {
    status: ratio >= required ? 'passed' : 'failed', ratio, requiredRatio: required, aaaRatio: aaa,
    foreground: fg, background: bg,
    message: `${ratio.toFixed(2)}:1 contrast; WCAG AA requires ${required}:1 and AAA requires ${aaa}:1.`,
    criterion: 'WCAG 2.2 SC 1.4.3',
  };
}
