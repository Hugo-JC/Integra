import { Ajv2020 } from 'ajv/dist/2020.js';
import directionArtifactSchema from '../../../../schemas/direction-artifact.schema.json' with { type: 'json' };
import visualIntelligenceBundleSchema from '../../../../schemas/visual-intelligence-bundle.schema.json' with { type: 'json' };
import { hashCanonicalJson, serializeCanonicalJson } from '../canonical-json.js';
import { validateDirectionArtifact } from '../artifact-validation.js';
import type { DirectionArtifact } from '../types.js';
import {
  buildVisualKnowledgePack,
  type ExperienceMode,
  type VisualKnowledgeRequest,
} from './index.js';

export const VISUAL_INTELLIGENCE_BUNDLE_SCHEMA_VERSION = '1.1.0' as const;
export const VISUAL_INTELLIGENCE_ENGINE_VERSION = '0.1.0';

export interface VisualIntelligenceRequest extends VisualKnowledgeRequest {
  directionArtifact: DirectionArtifact;
  primaryTask: string;
}

export type VisualKnowledgePack = ReturnType<typeof buildVisualKnowledgePack>;

export interface VisualIntelligenceBundle {
  schemaVersion: typeof VISUAL_INTELLIGENCE_BUNDLE_SCHEMA_VERSION;
  bundleId: string;
  engineVersion: string;
  directionArtifactId: string;
  task: {
    primaryTask: string;
    mode: ExperienceMode | null;
    nicheId: string | null;
    query: string;
  };
  direction: DirectionArtifact;
  knowledge: VisualKnowledgePack;
  consumerGuidance: {
    candidatePolicy: 'review-before-adoption';
    preserveProductIdentity: true;
    doNotCopyReferences: true;
  };
  verificationChecklist: string[];
  limitations: string[];
}

export interface VisualIntelligenceBundleValidationResult {
  status: 'passed' | 'failed';
  errors: string[];
}

export type VisualIntelligenceBundleErrorCode =
  | 'invalid-direction-artifact'
  | 'primary-task-required'
  | 'invalid-request'
  | 'invalid-bundle';

export class VisualIntelligenceBundleError extends TypeError {
  constructor(
    readonly code: VisualIntelligenceBundleErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'VisualIntelligenceBundleError';
  }
}

const ajv = new Ajv2020({ allErrors: true, strict: true });
ajv.addSchema(directionArtifactSchema);
const validateSchema = ajv.compile<VisualIntelligenceBundle>(visualIntelligenceBundleSchema);

const verificationChecklist = [
  'Read the project brief and Direction Artifact before reviewing knowledge candidates.',
  'Confirm the supplied surface mode and niche fit the actual task; do not infer missing values.',
  'Treat catalog-only sources as research leads, not inspected evidence.',
  'Use each page observation only within its recorded scope and preserve partial versus verified status.',
  'Reconcile token candidates with existing product tokens before proposing any change.',
  'Check pattern prerequisites and explain adoption, adaptation, or rejection.',
  'Verify the implemented interface independently; bundle consumption is not a QA pass.',
];

const limitations = [
  'Bundle assembly is offline and does not inspect reference pages or verify licenses.',
  'Knowledge entries remain candidates; selection does not approve a direction or finding.',
  'The current Knowledge Pack has no page-observation collection; catalogued sources remain leads.',
  'The bundle does not implement, write to, or inspect the receiving project.',
];

function isExperienceMode(value: unknown): value is ExperienceMode {
  return value === 'persuade' || value === 'operate' || value === 'read' || value === 'experience';
}

function getBundleContent(bundle: VisualIntelligenceBundle): Omit<VisualIntelligenceBundle, 'bundleId'> {
  const { bundleId: _bundleId, ...content } = bundle;
  return content;
}

function issueDetails(): string[] {
  return (validateSchema.errors ?? []).map((error) =>
    (error.instancePath || '/') + ' ' + (error.message ?? 'schema violation'),
  );
}

export function validateVisualIntelligenceBundle(
  input: unknown,
): VisualIntelligenceBundleValidationResult {
  if (!validateSchema(input)) {
    return { status: 'failed', errors: issueDetails() };
  }

  const bundle = input;
  const errors: string[] = [];
  const directionValidation = validateDirectionArtifact(bundle.direction);
  if (directionValidation.status !== 'passed') {
    errors.push(
      'direction does not pass Direction Artifact validation (' +
      directionValidation.status + ').',
    );
  }
  for (const candidate of bundle.knowledge.observations) {
    if (candidate.verificationStatus !== candidate.item.verificationStatus) {
      errors.push('Observation candidate verificationStatus must match its item.');
    }
    if (candidate.item.verificationStatus === 'verified' && candidate.item.evidenceType === 'inference') {
      errors.push('An inference-only observation cannot be marked verified.');
    }
  }
  if (bundle.directionArtifactId !== bundle.direction.artifactId) {
    errors.push('directionArtifactId must match direction.artifactId.');
  }
  if (bundle.task.mode !== bundle.knowledge.selection.mode) {
    errors.push('task.mode must match knowledge.selection.mode.');
  }
  if (bundle.task.nicheId !== bundle.knowledge.selection.nicheId) {
    errors.push('task.nicheId must match knowledge.selection.nicheId.');
  }
  if (bundle.task.query !== bundle.knowledge.selection.query) {
    errors.push('task.query must match knowledge.selection.query.');
  }
  const expectedId = 'visual-intelligence-' + hashCanonicalJson(getBundleContent(bundle));
  if (bundle.bundleId !== expectedId) {
    errors.push('bundleId does not match the canonical bundle content.');
  }
  return { status: errors.length ? 'failed' : 'passed', errors };
}

export function serializeVisualIntelligenceBundle(bundle: VisualIntelligenceBundle): string {
  const validation = validateVisualIntelligenceBundle(bundle);
  if (validation.status !== 'passed') {
    throw new VisualIntelligenceBundleError(
      'invalid-bundle',
      'Visual Intelligence Bundle failed validation: ' + validation.errors.join('; '),
    );
  }
  return serializeCanonicalJson(bundle);
}

export function buildVisualIntelligenceBundle(
  request: VisualIntelligenceRequest,
): VisualIntelligenceBundle {
  if (typeof request.primaryTask !== 'string' || !request.primaryTask.trim()) {
    throw new VisualIntelligenceBundleError(
      'primary-task-required',
      'primaryTask must contain at least one non-whitespace character.',
    );
  }
  if (request.mode !== undefined && !isExperienceMode(request.mode)) {
    throw new VisualIntelligenceBundleError(
      'invalid-request',
      'mode must be one of persuade, operate, read, or experience.',
    );
  }
  if (request.nicheId !== undefined && !request.nicheId.trim()) {
    throw new VisualIntelligenceBundleError('invalid-request', 'nicheId must not be empty.');
  }

  const directionValidation = validateDirectionArtifact(request.directionArtifact);
  if (directionValidation.status !== 'passed') {
    const findings = directionValidation.findings.map((item) => item.description).join('; ');
    throw new VisualIntelligenceBundleError(
      'invalid-direction-artifact',
      'Direction Artifact validation did not pass (' + directionValidation.status + ')' +
        (findings ? ': ' + findings : '.'),
    );
  }

  const primaryTask = request.primaryTask.trim();
  const query = request.query?.trim() || primaryTask;
  const knowledge = buildVisualKnowledgePack({
    mode: request.mode,
    nicheId: request.nicheId,
    query,
    tags: request.tags,
    assetTypes: request.assetTypes,
    limit: request.limit,
  });
  const content = {
    schemaVersion: VISUAL_INTELLIGENCE_BUNDLE_SCHEMA_VERSION,
    engineVersion: VISUAL_INTELLIGENCE_ENGINE_VERSION,
    directionArtifactId: request.directionArtifact.artifactId,
    task: {
      primaryTask,
      mode: request.mode ?? null,
      nicheId: request.nicheId ?? null,
      query,
    },
    direction: request.directionArtifact,
    knowledge,
    consumerGuidance: {
      candidatePolicy: 'review-before-adoption' as const,
      preserveProductIdentity: true as const,
      doNotCopyReferences: true as const,
    },
    verificationChecklist,
    limitations,
  };
  const bundle: VisualIntelligenceBundle = {
    ...content,
    bundleId: 'visual-intelligence-' + hashCanonicalJson(content),
  };
  const validation = validateVisualIntelligenceBundle(bundle);
  if (validation.status !== 'passed') {
    throw new VisualIntelligenceBundleError(
      'invalid-bundle',
      'Generated Visual Intelligence Bundle failed validation: ' + validation.errors.join('; '),
    );
  }
  return bundle;
}
