---
name: integra-ui-generator
description: Builds new React, TypeScript, Tailwind or framework-native interface components from a concrete brief. Use when generating a screen, section, form, dashboard, card, navigation pattern or interaction.
---

# Integra UI Generator

## Before coding
1. Inspect package.json, existing components, routing, tokens, CSS conventions and test setup.
2. Read the relevant Direction Artifact or create a brief with integra-design-direction.
3. Identify whether the task is a page, reusable component or interaction.
4. Use the project's actual stack. Do not add Tailwind, shadcn/ui, Radix or animation libraries if they are not justified.
5. Confirm content and states; do not fill gaps with fake testimonials, statistics or invented product capabilities.

## Implementation rules
- Use semantic HTML before custom roles.
- Keep component responsibilities narrow and props typed.
- Reuse existing tokens and primitives.
- Make interactive controls accessible by keyboard and give each an accessible name.
- Implement focus-visible, hover, active, disabled and loading states where relevant.
- Use real content hierarchy; do not wrap every block in a card.
- Use deliberate typography roles, spacing and responsive constraints.
- Respect prefers-reduced-motion.
- Avoid arbitrary inline styling when the project has a token or utility convention.
- Preserve existing functionality and avoid gratuitous abstraction.

## Review before completion
Check responsive behavior, overflow, focus order, empty/error states, color contrast and console errors. Run the smallest relevant test first, then the project check. Report any behavior that was not exercised.
