import { describe, expect, it } from 'vitest';
import { createDesignEvidence } from '../src/modules/investigation/evidence.js';

describe('design investigation evidence', () => {
  it('normalizes a direct observation and deduplicates limitations', () => {
    const record = createDesignEvidence({
      referenceId: 'polaris',
      sourceTitle: 'Shopify Polaris',
      sourceUrl: 'https://polaris.shopify.com',
      evidenceType: 'direct-observation',
      confidence: 'direct',
      observation: 'The filter panel preserves applied state while closing.',
      limitations: ['Tested one viewport', 'Tested one viewport'],
    });
    expect(record.sourceUrl).toBe('https://polaris.shopify.com/');
    expect(record.limitations).toEqual(['Tested one viewport']);
  });

  it('rejects unknown evidence presented as verified', () => {
    expect(() => createDesignEvidence({
      referenceId: 'x',
      sourceTitle: 'Unknown',
      evidenceType: 'unknown',
      confidence: 'direct',
      observation: 'Not inspected',
    })).toThrow('Unknown evidence must use unverified confidence.');
  });

  it('rejects non-web URLs', () => {
    expect(() => createDesignEvidence({
      referenceId: 'x',
      sourceTitle: 'Example',
      sourceUrl: 'file:///etc/passwd',
      evidenceType: 'screenshot',
      confidence: 'direct',
      observation: 'Visible composition was inspected.',
    })).toThrow('sourceUrl must use HTTP or HTTPS.');
  });
});
