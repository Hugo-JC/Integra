export interface IntegraInspectorOptions {
  /** Live inspection is limited to local development hosts unless explicitly enabled. */
  allowRemote?: boolean;
  enabled?: boolean;
  onPatch?: (patch: string) => void;
}
export interface IntegraInspectorController {
  setEnabled(enabled: boolean): void;
  destroy(): void;
}
