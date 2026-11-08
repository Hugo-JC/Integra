export type DesignEvidenceType =
  | 'direct-observation'
  | 'official-documentation'
  | 'screenshot'
  | 'source-trace'
  | 'inference'
  | 'unknown';

export type DesignEvidenceConfidence = 'direct' | 'inferred' | 'unverified';

export interface DesignEvidenceInput {
  referenceId: string;
  sourceTitle: string;
  sourceUrl?: string | null;
  evidenceType: DesignEvidenceType;
  confidence: DesignEvidenceConfidence;
  observation: string;
  interpretation?: string | null;
  limitations?: string[];
  licenseNote?: string;
  adaptation?: string;
}

export interface DesignEvidenceRecord {
  schemaVersion: '1.0.0';
  referenceId: string;
  sourceTitle: string;
  sourceUrl?: string;
  evidenceType: DesignEvidenceType;
  confidence: DesignEvidenceConfidence;
  observation: string;
  interpretation?: string;
  limitations: string[];
  licenseNote: string;
  adaptation: string;
}

/** Normalizes and validates a user-supplied evidence record; it does not fetch the URL. */
export function createDesignEvidence(input: DesignEvidenceInput): DesignEvidenceRecord {
  const referenceId = input.referenceId.trim();
  const sourceTitle = input.sourceTitle.trim();
  const observation = input.observation.trim();
  if (!referenceId) throw new TypeError('referenceId is required.');
  if (!sourceTitle) throw new TypeError('sourceTitle is required.');
  if (!observation) throw new TypeError('observation is required.');

  let sourceUrl: string | undefined;
  if (input.sourceUrl?.trim()) {
    let parsed: URL;
    try {
      parsed = new URL(input.sourceUrl.trim());
    } catch {
      throw new TypeError('sourceUrl must be a valid absolute URL.');
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new TypeError('sourceUrl must use HTTP or HTTPS.');
    }
    sourceUrl = parsed.toString();
  }

  if (input.evidenceType === 'unknown' && input.confidence !== 'unverified') {
    throw new TypeError('Unknown evidence must use unverified confidence.');
  }
  if (input.evidenceType === 'inference' && input.confidence === 'direct') {
    throw new TypeError('An inference cannot be labeled as direct evidence.');
  }

  return {
    schemaVersion: '1.0.0',
    referenceId,
    sourceTitle,
    ...(sourceUrl ? { sourceUrl } : {}),
    evidenceType: input.evidenceType,
    confidence: input.confidence,
    observation,
    ...(input.interpretation?.trim() ? { interpretation: input.interpretation.trim() } : {}),
    limitations: [...new Set((input.limitations ?? []).map((item) => item.trim()).filter(Boolean))],
    licenseNote: input.licenseNote?.trim() || 'Review the source terms and license before reuse.',
    adaptation: input.adaptation?.trim() || 'No adaptation proposal recorded.',
  };
}
