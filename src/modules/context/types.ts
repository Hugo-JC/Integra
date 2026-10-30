import type { DirectionContextSnapshot } from '../direction/types.js';

/**
 * Untrusted, caller-supplied context accepted by the Context Engine.
 * Fields are optional so partial briefs can be represented without guessing.
 */
export interface DirectionContextInput {
  projectType?: string;
  audience?: string;
  primaryGoal?: string;
  platform?: string;
  goals?: string[];
  constraints?: string[];
  preferences?: string[];
  stack?: string[];
}

export type NormalizedDirectionContext = DirectionContextSnapshot;
