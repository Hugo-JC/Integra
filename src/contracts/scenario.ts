export type ScenarioMode = 'generate' | 'analyze' | 'analyze-and-fix';
export type ScenarioPriority = 'P0' | 'P1' | 'P2';
export type EvaluationMethod = 'automated' | 'human' | 'mixed';

export interface EvaluationCriterion {
  id: string;
  label: string;
  weight: number;
  method?: EvaluationMethod;
}

export interface ScenarioManifest {
  schemaVersion: '1.0.0';
  id: 'DL-001' | 'DL-002' | 'DL-003' | 'DL-004' | 'DL-005';
  title: string;
  priority: ScenarioPriority;
  mode: ScenarioMode;
  purpose: string;
  briefPath: string;
  implementationStatus: 'planned' | 'fixture-ready' | 'implemented';
  tags: string[];
  fixturePaths?: string[];
  evaluation: {
    minimumScore: number;
    criteria: EvaluationCriterion[];
  };
  acceptance: {
    hardGates: string[];
    expectedOutcomes: string[];
  };
}
