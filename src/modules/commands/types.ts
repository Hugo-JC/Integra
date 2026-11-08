export type CommandKind = 'orchestrator' | 'workflow' | 'modifier';

export interface CommandDefinition {
  id: string;
  kind: CommandKind;
  invocation: string;
  description: string;
  skills: string[];
  outputs: string[];
  sourceMutation?: 'approval-required' | 'never';
}

export interface CommandManifest {
  schemaVersion: '1.0.0';
  name: string;
  description: string;
  invocation: {
    orchestrator: '/integra';
    namespace: '/integra:';
    bareAliases: 'optional-host-adapter-only';
  };
  executionPolicy: {
    defaultMode: 'review';
    sourceMutation: 'approval-required';
    previewMutation: 'temporary-dom-only';
    approvalScope: 'exact-proposed-diff';
    neverInferApprovalFrom: Array<'command invocation' | 'preview acceptance' | 'generated patch' | 'test success'>;
  };
  commands: CommandDefinition[];
}

export interface CommandResolution {
  command: CommandDefinition;
  args: string[];
}
