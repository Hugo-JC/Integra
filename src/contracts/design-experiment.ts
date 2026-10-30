/**
 * Paired baseline vs Integra-guided evaluation record.
 *
 * Experiment controls are shared by both runs so the Direction Artifact is the
 * intended treatment variable rather than a different agent/model setup.
 */
export type DesignExperimentCriterion =
  | 'product-focus'
  | 'information-hierarchy'
  | 'visual-coherence'
  | 'content-completeness'
  | 'responsive-behavior'
  | 'accessibility'
  | 'interaction-states'
  | 'implementation-discipline';

export type DesignExperimentResultStatus =
  | 'pass'
  | 'partial'
  | 'fail'
  | 'not-verifiable';

export interface DesignExperimentControls {
  agentId: string;
  agentVersion: string;
  modelId: string;
  modelVersion: string;
  configurationSha256: string;
}

export interface DesignExperimentEvidence {
  id: string;
  kind: 'screenshot' | 'dom-snapshot' | 'source' | 'test' | 'trace' | 'manual-note';
  path: string;
  sha256?: string;
  description: string;
}

export interface DesignExperimentRun {
  outputPath: string;
  outputSha256: string;
  evidence: DesignExperimentEvidence[];
}

export interface DesignExperimentGuidedRun extends DesignExperimentRun {
  directionArtifact: {
    artifactId: string;
    schemaVersion: '1.1.0';
    path: string;
    sha256: string;
  };
}

export interface DesignExperimentCriterionResult {
  criterion: DesignExperimentCriterion;
  baseline: { status: DesignExperimentResultStatus; note: string };
  integraGuided: { status: DesignExperimentResultStatus; note: string };
  baselineEvidenceIds: string[];
  integraGuidedEvidenceIds: string[];
}

export interface DesignExperimentRecord {
  schemaVersion: '1.0.0';
  experimentId: string;
  scenarioId: string;
  briefSha256: string;
  controls: DesignExperimentControls;
  runs: {
    baseline: DesignExperimentRun;
    integraGuided: DesignExperimentGuidedRun;
  };
  evaluation: {
    criteria: DesignExperimentCriterionResult[];
    summary: string;
  };
  limitations: string[];
}
