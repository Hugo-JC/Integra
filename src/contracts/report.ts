export type RunStatus = 'passed' | 'failed' | 'inconclusive' | 'error';
export type FindingSeverity = 'critical' | 'major' | 'minor' | 'info';
export type VerificationStatus = 'passed' | 'failed' | 'not_run' | 'not_applicable' | 'inconclusive';
export type EvidenceKind = 'code' | 'screenshot' | 'test' | 'metric' | 'text' | 'external';

export interface EvidenceRecord {
  kind: EvidenceKind;
  description: string;
  file?: string;
  line?: number;
  uri?: string;
  excerpt?: string;
}

export interface Finding {
  id: string;
  category: string;
  severity: FindingSeverity;
  description: string;
  impact?: string;
  recommendation?: string;
  evidence: EvidenceRecord[];
  verificationStatus: VerificationStatus;
  relatedFiles?: string[];
}

export interface CheckResult {
  id: string;
  status: VerificationStatus;
  description: string;
  expected?: unknown;
  actual?: unknown;
  evidence?: EvidenceRecord[];
}

export interface ReportArtifact {
  id: string;
  kind: 'source' | 'report' | 'screenshot' | 'log' | 'diff' | 'trace' | 'other';
  path: string;
  sha256?: string;
  mediaType?: string;
}

export interface RunReport {
  schemaVersion: '1.0.0';
  runId: string;
  scenarioId: 'DL-001' | 'DL-002' | 'DL-003' | 'DL-004' | 'DL-005';
  engineVersion: string;
  status: RunStatus;
  score: number | null;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  metrics: Record<string, number | null>;
  environment?: {
    nodeVersion?: string;
    platform?: string;
    commit?: string | null;
    model?: string | null;
    seed?: string | number | null;
  };
  findings: Finding[];
  checks: CheckResult[];
  artifacts: ReportArtifact[];
  limitations: string[];
}
