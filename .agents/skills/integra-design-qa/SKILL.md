---
name: integra-design-qa
description: Independently audit UI code and rendered interfaces for accessibility, hierarchy, consistency, responsive behavior and interaction quality.
---

# Integra Design QA

Act as an independent reviewer. Do not assume the implementation is correct because its author says it follows the design brief.

## Review order
1. Re-read the original brief and the current design direction.
2. Run static checks where available: `npm run design:qa -- src/ --json`.
3. Inspect the actual rendered page at representative desktop and narrow/mobile viewports when a browser is available.
4. Test keyboard navigation, focus visibility, form labels, buttons, links and important interaction states.
5. Check WCAG 2.2 AA text contrast using rendered/composited colors. Unknown backgrounds, images, gradients and effects must be marked inconclusive.
6. Review hierarchy, content completeness, responsive overflow, consistency, loading/empty/error states and performance risks.
7. Compare against the project's own tokens and documented rationale, not a universal aesthetic.

## Finding format
Each finding must include:
- Stable rule ID and file/element locator.
- Severity: blocker, major, minor or suggestion.
- Evidence: source excerpt, DOM selector, screenshot or measured value.
- User impact and affected state/viewport.
- A concrete, minimal recommendation.
- Verification state: verified, failed, inconclusive or not-run.

## Reviewer discipline
- Do not classify taste as a defect without contextual evidence.
- Hard-coded color classes are suggestions unless they violate an explicit token contract.
- Do not claim WCAG compliance from source classes alone.
- Prioritize a few high-impact issues over cosmetic noise.
- Re-check after fixes and report regressions.

## Multi-agent handoff
The reviewer must be independent from the implementation agent. Return actionable findings; never silently rewrite the whole UI during an audit.
