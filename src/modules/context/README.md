# Context module

The Context module currently provides a deterministic normalizer for caller-supplied direction context.

- Accepts the exact fields represented by `DirectionContextSnapshot`.
- Trims values, collapses repeated whitespace and removes case-insensitive duplicates from string lists while preserving first-seen order.
- Rejects malformed values and unknown keys instead of silently discarding them.
- Records absent scalar fields and empty/absent lists in `missingInformation`.
- Never infers an audience, goal, platform, constraint, preference or technology stack.

The normalizer is a pure function and has no provider, filesystem or environment dependencies. It does not parse free-form Markdown briefs; extraction from source documents is a separate future boundary.
