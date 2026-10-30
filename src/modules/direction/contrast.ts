import type { CheckResult, EvidenceRecord, Finding } from '../../contracts/report.js';

export interface TextContrastInput {
  foreground: string;
  background: string;
  fontSizePx: number;
  fontWeight?: number;
  id?: string;
}

export interface TextContrastResult {
  ratio: number;
  requiredRatio: 4.5 | 3;
  isLargeText: boolean;
  check: CheckResult;
  finding?: Finding;
}

function parseHexColor(input: string): [number, number, number] {
  if (typeof input !== 'string' || !/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(input)) {
    throw new TypeError('Colors must use #RGB or #RRGGBB hex notation; alpha is not supported.');
  }

  const hex = input.slice(1);
  const expanded = hex.length === 3 ? [...hex].map((part) => part + part).join('') : hex;
  return [
    Number.parseInt(expanded.slice(0, 2), 16),
    Number.parseInt(expanded.slice(2, 4), 16),
    Number.parseInt(expanded.slice(4, 6), 16),
  ];
}

function linearize(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(color: string): number {
  const [red, green, blue] = parseHexColor(color).map(linearize);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/** Calculates the WCAG relative-luminance contrast ratio for opaque sRGB hex colors. */
export function calculateContrastRatio(foreground: string, background: string): number {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Evaluates WCAG 2.2 SC 1.4.3 (AA) for text.
 * Large text is >= 24 CSS px, or >= 18.66 CSS px when bold (weight >= 700).
 * This helper expects already-composited opaque colors; it does not inspect DOM or CSS.
 */
export function evaluateTextContrast(input: TextContrastInput): TextContrastResult {
  if (!Number.isFinite(input.fontSizePx) || input.fontSizePx <= 0) {
    throw new RangeError('fontSizePx must be a positive finite number.');
  }
  const weight = input.fontWeight ?? 400;
  if (!Number.isInteger(weight) || weight < 1 || weight > 1000) {
    throw new RangeError('fontWeight must be an integer between 1 and 1000.');
  }

  const isLargeText = input.fontSizePx >= 24 || (input.fontSizePx >= 18.66 && weight >= 700);
  const requiredRatio = isLargeText ? 3 : 4.5;
  const ratio = calculateContrastRatio(input.foreground, input.background);
  const passed = ratio >= requiredRatio;
  const id = input.id ?? 'wcag-1-4-3-text-contrast';
  const evidence: EvidenceRecord[] = [{
    kind: 'metric',
    description: `WCAG contrast ratio ${ratio}:1 (required ${requiredRatio}:1).`,
    excerpt: `foreground=${input.foreground}; background=${input.background}; fontSizePx=${input.fontSizePx}; fontWeight=${weight}`,
  }];

  const check: CheckResult = {
    id,
    status: passed ? 'passed' : 'failed',
    description: 'WCAG 2.2 Success Criterion 1.4.3 — Contrast (Minimum), Level AA.',
    expected: { minimumRatio: requiredRatio },
    actual: { ratio, isLargeText },
    evidence,
  };

  if (passed) return { ratio, requiredRatio, isLargeText, check };

  const finding: Finding = {
    id: `${id}-failure`,
    category: 'accessibility.wcag',
    severity: 'major',
    description: `Text contrast is ${ratio}:1; at least ${requiredRatio}:1 is required for this text size.`,
    impact: 'Some users may have difficulty reading the text.',
    recommendation: 'Adjust the foreground or background color and re-check the rendered, composited colors.',
    evidence,
    verificationStatus: 'failed',
  };

  return { ratio, requiredRatio, isLargeText, check, finding };
}
