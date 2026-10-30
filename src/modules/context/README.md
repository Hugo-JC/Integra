# Context module

The Context module normalizes caller-supplied direction context and reports all detectable input issues.

- The shared contract lives in src/contracts/direction-context.ts; this module does not own a second copy.
- normalizeDirectionContextDetailed(unknown) returns a safe partial context plus machine-readable issues (code, path, message).
- normalizeDirectionContext(DirectionContextInput) is the strict typed boundary and throws one ContextValidationError containing all issues.
- undefined, null and whitespace-only text are treated as missing information. Wrong types, unknown keys and invalid structured values are reported.
- Text is trimmed, whitespace is collapsed, Unicode is normalized to NFC, and list duplicates are removed case-insensitively while preserving first-seen order.
- Input sizes are bounded. The normalizer never infers an audience, goal, platform, constraint, preference, token or stack.

Structured facts currently cover viewports, accessibility target, language, existing design tokens, prohibited claims and required content. Structured constraints use a stable target path, operator, value and hard flag.

Free-form strings remain available for human context. The deterministic resolver does not try to infer their meaning through keyword matching.

The normalizer is a pure function with no provider, filesystem or environment dependencies. It does not parse free-form Markdown briefs; extraction remains a separate future boundary.
