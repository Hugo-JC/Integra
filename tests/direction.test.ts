import { describe, expect, it, vi } from "vitest";
import {
  calculateContrastRatio,
  createDefaultDecision,
  evaluateTextContrast,
  resolveDecision,
  validateAiSuggestions,
} from "../src/modules/direction/index.js";

describe("calculateContrastRatio", () => {
  it("calculates the black/white contrast ratio", () => {
    expect(calculateContrastRatio("#000", "#fff")).toBe(21);
  });

  it("is independent of foreground/background order", () => {
    expect(calculateContrastRatio("#777777", "#ffffff")).toBe(
      calculateContrastRatio("#ffffff", "#777777"),
    );
  });

  it("rejects unsupported color formats and alpha channels", () => {
    expect(() => calculateContrastRatio("rgb(0 0 0)", "#fff")).toThrow();
    expect(() => calculateContrastRatio("#00000080", "#fff")).toThrow();
  });
});

describe("evaluateTextContrast", () => {
  it("uses 4.5:1 for normal text and returns a failed check with evidence", () => {
    const result = evaluateTextContrast({
      foreground: "#777777",
      background: "#ffffff",
      fontSizePx: 16,
    });
    expect(result.requiredRatio).toBe(4.5);
    expect(result.check.status).toBe("failed");
    expect(result.finding?.verificationStatus).toBe("failed");
    expect(result.check.evidence?.[0].kind).toBe("metric");
  });

  it("uses 3:1 for large text and passes sufficient contrast", () => {
    const result = evaluateTextContrast({
      foreground: "#777777",
      background: "#ffffff",
      fontSizePx: 24,
    });
    expect(result.requiredRatio).toBe(3);
    expect(result.check.status).toBe("passed");
    expect(result.finding).toBeUndefined();
  });

  it("recognizes bold large text and validates font size", () => {
    expect(
      evaluateTextContrast({
        foreground: "#777",
        background: "#fff",
        fontSizePx: 18.66,
        fontWeight: 700,
      }).isLargeText,
    ).toBe(true);
    expect(() =>
      evaluateTextContrast({
        foreground: "#000",
        background: "#fff",
        fontSizePx: 0,
      }),
    ).toThrow();
  });
});

describe("decision provenance", () => {
  it("keeps brief decisions above rules, AI and defaults", () => {
    const brief = {
      id: "theme",
      value: "light",
      source: "brief" as const,
      reason: "Required by brief.",
    };
    const rule = {
      id: "theme",
      value: "dark",
      source: "rule" as const,
      reason: "Rule preference.",
    };
    const ai = {
      id: "theme",
      value: "blue",
      source: "ai" as const,
      reason: "Provider suggestion.",
    };
    const fallback = createDefaultDecision(
      "theme",
      "neutral",
      "No input supplied.",
    );
    expect(resolveDecision([fallback, ai, rule, brief])).toBe(brief);
  });

  it("preserves the first candidate when precedence is equal", () => {
    const first = {
      id: "spacing",
      value: 8,
      source: "rule" as const,
      reason: "Rule A.",
    };
    const second = {
      id: "spacing",
      value: 12,
      source: "rule" as const,
      reason: "Rule B.",
    };
    expect(resolveDecision([first, second])).toBe(first);
  });
});

describe("validateAiSuggestions", () => {
  const valid = {
    category: "typography",
    text: "Use a readable type scale.",
    rationale: "The content has several hierarchy levels.",
    confidence: 0.8,
  };

  it("accepts valid suggestions without treating them as applied decisions", () => {
    const result = validateAiSuggestions([valid]);
    expect(result.accepted).toEqual([valid]);
    expect(result.rejected).toEqual([]);
  });

  it("rejects malformed or incompatible suggestions", () => {
    const compatibility = vi.fn(() => false);
    const result = validateAiSuggestions(
      [valid, { ...valid, confidence: 2 }, null],
      compatibility,
    );
    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toHaveLength(3);
    expect(compatibility).toHaveBeenCalledTimes(1);
  });

  it("rejects non-array and oversized payloads", () => {
    expect(() => validateAiSuggestions({ ...valid })).toThrow();
    expect(() =>
      validateAiSuggestions(Array.from({ length: 51 }, () => valid)),
    ).toThrow();
  });
});
