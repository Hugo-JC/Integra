import { createHash } from 'node:crypto';
import type { DirectionContextSnapshot } from '../../contracts/direction-context.js';
import type {
  DesignDecision,
  DesignRecommendation,
  DirectionArtifact,
  DirectionSection,
  RecommendationCategory,
} from './types.js';
import { resolveDecisionWithConstraints } from './resolver.js';

export const DIRECTION_ENGINE_VERSION = '0.2.0';

export interface DirectionGenerationDiagnostic {
  code: 'hard-constraint-conflict' | 'hard-constraint-inconclusive';
  decisionId: string;
  message: string;
  constraintIds: string[];
}

export interface DirectionGenerationResult {
  artifact: DirectionArtifact;
  diagnostics: DirectionGenerationDiagnostic[];
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(record)
        .filter((key) => record[key] !== undefined)
        .sort()
        .map((key) => [key, canonicalize(record[key])]),
    );
  }
  return value;
}

function canonicalStringify(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

/** Stable JSON serialization: sorted object keys, preserved array order, no timestamp. */
export function serializeDirectionArtifact(artifact: DirectionArtifact): string {
  return JSON.stringify(canonicalize(artifact), null, 2) + '\n';
}

function createRecommendation(
  id: string,
  category: RecommendationCategory,
  text: string,
  rationale: string,
): DesignRecommendation {
  return { id, category, label: '[R]', text, rationale };
}

function resolveSectionDecision(
  candidate: DesignDecision,
  context: DirectionContextSnapshot,
  diagnostics: DirectionGenerationDiagnostic[],
): DesignDecision[] {
  const result = resolveDecisionWithConstraints(
    [candidate],
    context.structuredConstraints,
  );
  if (result.selected) return [result.selected];

  for (const rejected of result.rejected) {
    diagnostics.push({
      code: rejected.status === 'conflicted'
        ? 'hard-constraint-conflict'
        : 'hard-constraint-inconclusive',
      decisionId: rejected.decision.id,
      message: rejected.reason,
      constraintIds: rejected.constraintIds,
    });
  }
  return [];
}

function makeSection(
  summary: string,
  decisions: DesignDecision[],
  recommendation: DesignRecommendation,
): DirectionSection {
  return { summary, decisions, recommendations: [recommendation] };
}

/**
 * First deterministic vertical slice for Design Lab scenario DL-001.
 * It uses normalized context only, never infers missing project facts and never calls AI.
 */
export function generateProductLandingDirection(
  context: DirectionContextSnapshot,
): DirectionGenerationResult {
  const diagnostics: DirectionGenerationDiagnostic[] = [];
  const facts = context.facts;

  const visualPersonality = context.preferences.length
    ? {
        id: 'visual-personality',
        targetPath: 'design.visualPersonality' as const,
        value: context.preferences,
        source: 'brief' as const,
        sourcePath: 'context.preferences',
        reason: 'Preserves the visual preferences explicitly supplied in the context.',
      }
    : {
        id: 'visual-personality',
        targetPath: 'design.visualPersonality' as const,
        value: 'Product-led and distinctive; do not assume a dark/light theme or a visual trend.',
        source: 'default' as const,
        reason: 'No visual personality preference was supplied. The receiving agent must choose from the actual product and audience.',
      };

  const suppliedColorTokens = (facts?.existingTokens ?? [])
    .filter((token) => token.kind === 'color')
    .map((token) => token.name + ': ' + token.value);
  const colorPalette = suppliedColorTokens.length
    ? {
        id: 'color-palette',
        targetPath: 'design.colorPalette' as const,
        value: suppliedColorTokens,
        source: 'brief' as const,
        sourcePath: 'context.facts.existingTokens',
        reason: 'Uses existing color tokens supplied by the project instead of replacing its identity.',
      }
    : {
        id: 'color-palette',
        targetPath: 'design.colorPalette' as const,
        value: 'No existing color tokens supplied. Propose a context-specific palette and verify final text contrast.',
        source: 'default' as const,
        reason: 'No existing color tokens were supplied; the engine must not invent brand colors.',
      };

  const viewports = (facts?.viewports ?? []).map(
    (viewport) => viewport.width + 'x' + viewport.height,
  );
  const layoutTargets = viewports.length
    ? {
        id: 'layout-viewports',
        targetPath: 'viewport.targets' as const,
        value: viewports,
        source: 'brief' as const,
        sourcePath: 'context.facts.viewports',
        reason: 'Uses the exact viewport targets supplied by the scenario context.',
      }
    : {
        id: 'layout-viewports',
        targetPath: 'viewport.targets' as const,
        value: 'No viewport targets supplied; confirm target sizes before final responsive verification.',
        source: 'default' as const,
        reason: 'Responsive breakpoints must not be invented when no viewport targets are available.',
      };

  const requiredContent = facts?.requiredContent ?? [];
  const requiredContentDecision = requiredContent.length
    ? {
        id: 'required-content',
        targetPath: 'content.required' as const,
        value: requiredContent,
        source: 'brief' as const,
        sourcePath: 'context.facts.requiredContent',
        reason: 'Preserves required content items supplied by the scenario fixture.',
      }
    : {
        id: 'required-content',
        targetPath: 'content.required' as const,
        value: 'No structured required-content list supplied; derive content only from the approved brief.',
        source: 'default' as const,
        reason: 'The engine does not invent required sections when the brief has not defined them.',
      };

  const prohibitedClaims = facts?.prohibitedClaims ?? [];
  const prohibitedClaimsDecision = prohibitedClaims.length
    ? {
        id: 'prohibited-claims',
        targetPath: 'content.prohibitedClaims' as const,
        value: prohibitedClaims,
        source: 'brief' as const,
        sourcePath: 'context.facts.prohibitedClaims',
        reason: 'Carries explicit claims restrictions into the implementation direction.',
      }
    : {
        id: 'prohibited-claims',
        targetPath: 'content.prohibitedClaims' as const,
        value: 'No structured prohibited-claims list supplied; do not create factual claims without source material.',
        source: 'default' as const,
        reason: 'No claims evidence was supplied; unsupported customer, outcome or certification claims must not be invented.',
      };

  const accessibilityTarget = facts?.accessibilityTarget
    ? {
        id: 'accessibility-target',
        targetPath: 'accessibility.target' as const,
        value: facts.accessibilityTarget,
        source: 'brief' as const,
        sourcePath: 'context.facts.accessibilityTarget',
        reason: 'Uses the accessibility target explicitly supplied by the project context.',
      }
    : {
        id: 'accessibility-target',
        targetPath: 'accessibility.target' as const,
        value: 'No formal conformance target supplied. Preserve semantic HTML, keyboard access and visible focus; do not claim compliance without checks.',
        source: 'default' as const,
        reason: 'The engine will not claim WCAG conformance when no target or verification evidence has been supplied.',
      };

  const stack = context.stack.length
    ? {
        id: 'implementation-stack',
        targetPath: 'implementation.stack' as const,
        value: context.stack,
        source: 'brief' as const,
        sourcePath: 'context.stack',
        reason: 'Uses the implementation stack supplied by the project owner.',
      }
    : {
        id: 'implementation-stack',
        targetPath: 'implementation.stack' as const,
        value: 'Use the receiving agent or project configured stack; do not add framework or library assumptions.',
        source: 'default' as const,
        reason: 'No technology stack was supplied to the Direction Engine.',
      };

  const language = facts?.language
    ? {
        id: 'content-language',
        targetPath: 'project.language' as const,
        value: facts.language,
        source: 'brief' as const,
        sourcePath: 'context.facts.language',
        reason: 'Uses the content language explicitly supplied by the project context.',
      }
    : {
        id: 'content-language',
        targetPath: 'project.language' as const,
        value: 'Language not specified; preserve the language selected in the approved brief.',
        source: 'default' as const,
        reason: 'The engine does not infer a locale from the language used to write the brief.',
      };

  const contextAudience = context.audience
    ? 'Audience supplied: ' + context.audience + '. '
    : 'Audience is not specified. ';
  const contextGoal = context.primaryGoal
    ? 'Primary goal: ' + context.primaryGoal + '. '
    : 'Primary goal is not specified. ';

  const sections = {
    visualIdentity: makeSection(
      contextAudience + 'Choose a recognizable product personality from the real product and brief; avoid assuming a theme or trend.',
      resolveSectionDecision(visualPersonality, context, diagnostics),
      createRecommendation(
        'visual-identity-anchor',
        'visual-identity',
        'Give the product one recognizable visual anchor and keep decorative treatments subordinate to product understanding.',
        'This is a contextual design heuristic, not a universal style requirement.',
      ),
    ),
    colorSystem: makeSection(
      'Use supplied brand color tokens when present. Otherwise propose semantic color roles from the product context, then verify contrast using final composited colors.',
      resolveSectionDecision(colorPalette, context, diagnostics),
      createRecommendation(
        'semantic-color-roles',
        'color',
        'Define semantic roles for text, surfaces, borders, actions and status before applying colors to components.',
        'Semantic roles make the palette easier to inspect and keep component states consistent.',
      ),
    ),
    typography: makeSection(
      'Make the value proposition, supporting explanation, capability descriptions and actions distinguishable through a deliberate type hierarchy.',
      resolveSectionDecision({
        id: 'typography-hierarchy',
        targetPath: 'design.typography',
        value: 'Use a clear hierarchy for the primary message, supporting content, capability details and actions; avoid relying on size alone.',
        source: 'rule',
        ruleId: 'DL001-TYPOGRAPHY-HIERARCHY',
        reason: 'The scenario contains a primary value proposition, supporting explanations and multiple capability descriptions.',
      }, context, diagnostics),
      createRecommendation(
        'typographic-hierarchy',
        'typography',
        'Use a restrained type scale with clear differences in role, weight, spacing and line length.',
        'A landing page needs users to distinguish the promise from supporting detail and actions.',
      ),
    ),
    layoutComposition: makeSection(
      'Prioritize the product proposition and primary action. Preserve all essential content at the supplied desktop and mobile viewports.',
      resolveSectionDecision(layoutTargets, context, diagnostics),
      createRecommendation(
        'responsive-content-priority',
        'layout',
        'Keep the primary proposition and action visible early, and reflow sections without horizontal overflow on narrow screens.',
        'The recommendation follows the scenario viewport targets and its product-focused acceptance criteria.',
      ),
    ),
    componentPrinciples: makeSection(
      'Implement required content and actions from the brief. Keep trust statements factual and never fabricate testimonials, customer counts or certifications.',
      [
        ...resolveSectionDecision(requiredContentDecision, context, diagnostics),
        ...resolveSectionDecision(prohibitedClaimsDecision, context, diagnostics),
      ],
      createRecommendation(
        'content-driven-components',
        'components',
        'Choose component patterns from the required content and interaction, rather than repeating cards or sections for decoration.',
        'The scenario evaluates content completeness and product focus, not the number of UI components.',
      ),
    ),
    motionInteraction: makeSection(
      'Use motion only when it clarifies state or feedback. Essential content and actions must remain available without animation.',
      resolveSectionDecision({
        id: 'reduced-motion',
        targetPath: 'motion.reducedMotion',
        value: 'Respect prefers-reduced-motion and provide a usable non-animated path for essential interactions.',
        source: 'rule',
        ruleId: 'CORE-ACCESSIBLE-MOTION',
        reason: 'Motion must not become a dependency for understanding or completing the primary action.',
      }, context, diagnostics),
      createRecommendation(
        'purposeful-motion',
        'motion',
        'Keep transitions short and purposeful, and avoid animating large decorative elements in ways that compete with the product.',
        'Motion is a supporting interaction detail and must not displace the page objective.',
      ),
    ),
    accessibility: makeSection(
      'Do not claim conformance from design intent alone. Preserve semantic structure, keyboard operation and visible focus, and verify the final implementation.',
      resolveSectionDecision(accessibilityTarget, context, diagnostics),
      createRecommendation(
        'accessible-foundations',
        'accessibility',
        'Use semantic landmarks, logical heading order, accessible names, visible focus and sufficient contrast for final rendered states.',
        'These foundations support manual and automated accessibility verification without claiming that one helper covers the full standard.',
      ),
    ),
    implementationGuidance: makeSection(
      'Implementation must respect the receiving project and agent capabilities. Missing stack or language details remain explicit instead of being guessed.',
      [
        ...resolveSectionDecision(stack, context, diagnostics),
        ...resolveSectionDecision(language, context, diagnostics),
      ],
      createRecommendation(
        'implementation-boundaries',
        'implementation-guidance',
        'Keep content, design tokens and reusable components coherent; avoid introducing dependencies without a project requirement.',
        'The first Direction slice produces guidance only and does not mutate or scaffold the receiving project.',
      ),
    ),
  } satisfies DirectionArtifact['sections'];

  const artifactContent = {
    schemaVersion: '1.1.0' as const,
    engineVersion: DIRECTION_ENGINE_VERSION,
    context,
    sections,
  };
  const digest = createHash('sha256')
    .update(canonicalStringify(artifactContent))
    .digest('hex')
    .slice(0, 16);
  const artifact: DirectionArtifact = {
    schemaVersion: '1.1.0',
    artifactId: 'direction-dl001-' + digest,
    engineVersion: DIRECTION_ENGINE_VERSION,
    context,
    sections,
  };

  return { artifact, diagnostics };
}
