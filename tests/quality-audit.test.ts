import { describe, expect, it } from 'vitest';
import { auditDesignQuality } from '../src/modules/refinement/quality-audit.js';

describe('design quality audit', () => {
  it('ranks verified accessibility findings above heuristics', () => {
    const result = auditDesignQuality({
      contrast: [{ id: 'hero-copy', target: 'h1', ratio: 3.2, requiredRatio: 4.5, source: 'runtime' }],
      spacing: [{ target: '.card', property: 'padding', valuePx: 10 }],
      surfaceNesting: [{ target: '.panel', nestedSurfaceDepth: 4 }],
    });
    expect(result.findings[0]).toMatchObject({ ruleId: 'A11Y-CONTRAST-MINIMUM', severity: 'P1', verification: 'verified' });
    expect(result.summary).toEqual({ P0: 0, P1: 1, P2: 0, P3: 2 });
  });

  it('marks static contrast estimates as heuristic and does not fabricate a score', () => {
    const result = auditDesignQuality({
      contrast: [{ id: 'muted', target: '.muted', ratio: 3, requiredRatio: 4.5, source: 'static-estimate' }],
    });
    expect(result.findings[0].verification).toBe('heuristic');
    expect(result).not.toHaveProperty('score');
  });

  it('checks interactive names, heading order and reduced motion', () => {
    const result = auditDesignQuality({
      interactiveNames: [{ target: '#icon-button', role: 'button', accessibleName: '', source: 'rendered-dom' }],
      headings: [{ target: 'h2:first', level: 2 }, { target: 'h4:first', level: 4 }],
      motion: { hasNonEssentialMotion: true, supportsReducedMotion: false },
    });
    expect(result.findings.map((finding) => finding.ruleId)).toContain('A11Y-INTERACTIVE-NAME');
    expect(result.findings.map((finding) => finding.ruleId)).toContain('STRUCTURE-HEADING-ORDER');
    expect(result.findings.map((finding) => finding.ruleId)).toContain('A11Y-REDUCED-MOTION');
  });

  it('returns stable empty report when no findings are supplied', () => {
    expect(auditDesignQuality({})).toMatchObject({
      findings: [],
      summary: { P0: 0, P1: 0, P2: 0, P3: 0 },
    });
  });
});
