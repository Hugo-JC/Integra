export type QualitySeverity = 'P0' | 'P1' | 'P2' | 'P3';
export type QualityVerification = 'verified' | 'heuristic' | 'inconclusive';

export interface ContrastObservation {
  id: string;
  target: string;
  ratio: number;
  requiredRatio: number;
  source: 'runtime' | 'static-estimate';
}

export interface InteractiveNameObservation {
  target: string;
  role: string;
  accessibleName?: string | null;
  source: 'rendered-dom' | 'source';
}

export interface HeadingObservation {
  target: string;
  level: number;
}

export interface SpacingObservation {
  target: string;
  property: string;
  valuePx: number;
  referenceIncrementPx?: number;
}

export interface SurfaceNestingObservation {
  target: string;
  nestedSurfaceDepth: number;
  expectedMaximumDepth?: number;
}

export interface QualityAuditInput {
  contrast?: ContrastObservation[];
  interactiveNames?: InteractiveNameObservation[];
  headings?: HeadingObservation[];
  spacing?: SpacingObservation[];
  surfaceNesting?: SurfaceNestingObservation[];
  motion?: {
    hasNonEssentialMotion: boolean;
    supportsReducedMotion: boolean | null;
  };
}

export interface QualityFinding {
  id: string;
  ruleId: string;
  severity: QualitySeverity;
  target: string;
  message: string;
  impact: string;
  recommendation: string;
  verification: QualityVerification;
}

export interface QualityAuditReport {
  findings: QualityFinding[];
  summary: Record<QualitySeverity, number>;
  note: string;
}

const severityOrder: Record<QualitySeverity, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };

/**
 * Audits only explicit observations supplied by another analyzer or a reviewer.
 * It does not parse TSX, render a page or infer missing evidence.
 */
export function auditDesignQuality(input: QualityAuditInput): QualityAuditReport {
  const findings: QualityFinding[] = [];

  for (const observation of input.contrast ?? []) {
    if (!Number.isFinite(observation.ratio) || !Number.isFinite(observation.requiredRatio)
      || observation.ratio < 1 || observation.requiredRatio < 1) continue;
    if (observation.ratio >= observation.requiredRatio) continue;
    const runtime = observation.source === 'runtime';
    findings.push({
      id: `contrast-${observation.id}`,
      ruleId: 'A11Y-CONTRAST-MINIMUM',
      severity: runtime ? 'P1' : 'P2',
      target: observation.target,
      message: `Contrast ${observation.ratio}:1 is below the supplied minimum ${observation.requiredRatio}:1.`,
      impact: 'Some users may be unable to read the text or distinguish the interface information.',
      recommendation: 'Adjust the text or background token and verify the actual composited colors in the rendered state.',
      verification: runtime ? 'verified' : 'heuristic',
    });
  }

  for (const observation of input.interactiveNames ?? []) {
    if (observation.accessibleName?.trim()) continue;
    const rendered = observation.source === 'rendered-dom';
    findings.push({
      id: `name-${observation.target}`,
      ruleId: 'A11Y-INTERACTIVE-NAME',
      severity: rendered ? 'P1' : 'P2',
      target: observation.target,
      message: `Interactive element (${observation.role}) has no supplied accessible name.`,
      impact: 'Assistive technology users may not understand the purpose of this control.',
      recommendation: 'Provide a concise accessible name using visible text, an associated label or an appropriate aria-label.',
      verification: rendered ? 'verified' : 'heuristic',
    });
  }

  let previousHeading = 0;
  for (const heading of input.headings ?? []) {
    if (!Number.isInteger(heading.level) || heading.level < 1 || heading.level > 6) continue;
    if (previousHeading > 0 && heading.level > previousHeading + 1) {
      findings.push({
        id: `heading-order-${heading.target}`,
        ruleId: 'STRUCTURE-HEADING-ORDER',
        severity: 'P2',
        target: heading.target,
        message: `Heading level jumps from h${previousHeading} to h${heading.level}.`,
        impact: 'The document outline may be harder to navigate and understand.',
        recommendation: 'Use a logical heading hierarchy that reflects the content structure, not the desired visual size.',
        verification: 'verified',
      });
    }
    previousHeading = heading.level;
  }

  for (const observation of input.spacing ?? []) {
    const increment = observation.referenceIncrementPx;
    if (!Number.isFinite(observation.valuePx) || observation.valuePx <= 0 ||
      !Number.isFinite(increment) || (increment ?? 0) <= 0) continue;
    if (Math.abs(observation.valuePx / increment! - Math.round(observation.valuePx / increment!)) < 0.001) continue;
    findings.push({
      id: `spacing-${observation.target}-${observation.property}`,
      ruleId: 'VISUAL-SPACING-CONSISTENCY',
      severity: 'P3',
      target: observation.target,
      message: `${observation.property} uses ${observation.valuePx}px, outside the supplied ${increment}px reference increment.`,
      impact: 'Repeated deviations may weaken visual rhythm, but this value can be intentional.',
      recommendation: 'Check the nearby spacing tokens and keep the deviation only when the layout benefits from it.',
      verification: 'heuristic',
    });
  }

  for (const observation of input.surfaceNesting ?? []) {
    const threshold = observation.expectedMaximumDepth;
    if (!Number.isFinite(observation.nestedSurfaceDepth) || !Number.isFinite(threshold) ||
      (threshold ?? 0) < 0 || observation.nestedSurfaceDepth <= threshold!) continue;
    findings.push({
      id: `surface-nesting-${observation.target}`,
      ruleId: 'VISUAL-SURFACE-NESTING',
      severity: 'P3',
      target: observation.target,
      message: `The observed surface nesting depth (${observation.nestedSurfaceDepth}) exceeds the supplied review threshold (${threshold}).`,
      impact: 'Excessive nested surfaces can obscure grouping and add visual noise.',
      recommendation: 'Check whether spacing, dividers or typography can express the hierarchy with fewer containers.',
      verification: 'heuristic',
    });
  }

  if (input.motion?.hasNonEssentialMotion && input.motion.supportsReducedMotion === false) {
    findings.push({
      id: 'motion-reduced-motion',
      ruleId: 'A11Y-REDUCED-MOTION',
      severity: 'P2',
      target: 'global motion behavior',
      message: 'Non-essential motion is present without a reduced-motion alternative.',
      impact: 'Some users may experience discomfort or difficulty completing tasks.',
      recommendation: 'Respect prefers-reduced-motion and provide a non-animated state that preserves the same information.',
      verification: 'verified',
    });
  }

  findings.sort((a, b) =>
    severityOrder[a.severity] - severityOrder[b.severity]
    || a.ruleId.localeCompare(b.ruleId)
    || a.target.localeCompare(b.target),
  );

  const summary: Record<QualitySeverity, number> = { P0: 0, P1: 0, P2: 0, P3: 0 };
  for (const finding of findings) summary[finding.severity] += 1;

  return {
    findings,
    summary,
    note: 'This report evaluates supplied observations only. It does not parse source files or certify WCAG conformance. Heuristic findings are review prompts, not automatic defects.',
  };
}
