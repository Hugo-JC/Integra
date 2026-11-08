export type RouteConfidence = 'high' | 'medium' | 'low';
export type RouteStatus = 'matched' | 'ambiguous' | 'fallback';
export type DesignTone = 'calm' | 'loud';

export interface DesignStyle {
  name: string;
  description: string;
  keywords: string[];
  mode: string;
  colors: Record<string, string>;
  radius: string;
  typography: string;
  font_display: string;
  font_body: string;
  heading_tracking: string;
  intensity: string;
  [key: string]: unknown;
}

export interface NichePreset {
  id: string;
  match_terms: string[];
  weak_terms?: string[];
  style_id: string;
  variants?: Array<{ when_any: string[]; style_id: string }>;
  patterns: Record<string, unknown>;
  principles: string[];
  sources?: Array<{ name: string; url: string; pattern_cues?: string[] }>;
}

export interface DesignPresetRoute {
  status: RouteStatus;
  confidence: RouteConfidence;
  query: string;
  normalizedQuery: string;
  presetId?: string;
  styleId: string;
  style: DesignStyle;
  matchedTerms: string[];
  alternatives: string[];
  selectedVariant?: string;
  reason: string;
  requiresConfirmation: boolean;
}
