import type { LiveEditableProperty, LiveElementChangeSet, LiveElementSnapshot, LiveStyleChange } from './types.js';

const PROPERTIES: LiveEditableProperty[] = ['color', 'background-color', 'border-radius', 'padding'];

export function diffClasses(original: string, updated: string): { added: string[]; removed: string[] } {
  const before = new Set(original.split(/\s+/).filter(Boolean));
  const after = new Set(updated.split(/\s+/).filter(Boolean));
  return {
    added: [...after].filter((name) => !before.has(name)),
    removed: [...before].filter((name) => !after.has(name)),
  };
}

export function diffInlineStyles(before: Record<string, string>, after: Record<string, string>): LiveStyleChange[] {
  return PROPERTIES.flatMap((property) => {
    const oldValue = before[property] ?? '';
    const newValue = after[property] ?? '';
    return oldValue === newValue ? [] : [{ property, before: oldValue, after: newValue }];
  });
}

export function createElementChangeSet(input: {
  target: LiveElementSnapshot;
  updatedClasses: string;
  beforeStyles: Record<string, string>;
  afterStyles: Record<string, string>;
  contrast?: { ratio: number; requiredRatio: number; passesAA: boolean } | null;
}): LiveElementChangeSet {
  const classDiff = diffClasses(input.target.originalClasses, input.updatedClasses);
  const changed = diffInlineStyles(input.beforeStyles, input.afterStyles);
  return {
    schemaVersion: '1.0.0',
    target: input.target,
    originalClasses: input.target.originalClasses,
    updatedClasses: input.updatedClasses,
    addedClasses: classDiff.added,
    removedClasses: classDiff.removed,
    styleChanges: changed,
    evidence: input.contrast
      ? {
          contrastRatio: input.contrast.ratio,
          contrastRequired: input.contrast.requiredRatio,
          contrastPass: input.contrast.passesAA,
          contrastNote: 'Runtime estimate from computed foreground and nearest opaque ancestor background; verify complex layering, images, gradients and pseudo-elements independently.',
        }
      : {
          contrastNote: 'Contrast could not be measured reliably. Transparent, image, gradient or layered backgrounds require manual rendered-state verification.',
        },
  };
}

export function synthesizeLivePrompt(changes: LiveElementChangeSet[]): string {
  const blocks = changes.map((change, index) => {
    const styleLines = change.styleChanges.length
      ? change.styleChanges.map((item) => `- ${item.property}: "${item.before || '(unset)'}" → "${item.after || '(unset)'}"`).join('\n')
      : '- No inline style properties changed.';
    const source = change.target.componentHint
      ? `\n- Source hint (provided, not inferred): ${change.target.componentHint}`
      : '\n- Source file: unknown; resolve via the framework/dev-server source map before editing.';
    const contrast = change.evidence.contrastRatio === undefined
      ? change.evidence.contrastNote
      : `Contrast after edit: ${change.evidence.contrastRatio}:1; AA threshold ${change.evidence.contrastRequired}:1; ${change.evidence.contrastPass ? 'passes' : 'fails'}.`;
    return [
      `## Target ${index + 1}: ${change.target.selector}`,
      `- Element: <${change.target.tagName.toLowerCase()}>`,
      `- Accessible name / text: ${change.target.accessibleName || '(not available)'}${source}`,
      `- Original classes: "${change.originalClasses}"`,
      `- Updated classes: "${change.updatedClasses}"`,
      `- Added classes: ${change.addedClasses.length ? change.addedClasses.join(', ') : '(none)'}`,
      `- Removed classes: ${change.removedClasses.length ? change.removedClasses.join(', ') : '(none)'}`,
      '- Inline style delta:',
      styleLines,
      `- Accessibility evidence: ${contrast}`,
    ].join('\n');
  });
  return [
    '# Integra Live Inspector — implementation handoff',
    '',
    'Apply the following visual changes to the actual source component, not by keeping temporary DOM mutations.',
    'First resolve each selector to its source component. Do not guess file paths or component names.',
    'Preserve behavior, semantic HTML, responsive states, existing design tokens and project conventions.',
    'Re-check keyboard interaction, focus, reduced motion and WCAG contrast after the source change.',
    'Do not introduce a new dependency or replace the project styling system unless required and justified.',
    '',
    ...blocks,
    '',
    'Return: files changed, rationale, test results, unresolved source mappings and before/after evidence.',
  ].join('\n');
}
