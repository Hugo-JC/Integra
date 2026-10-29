# React reference project for DL-005

Synthetic, small React + TypeScript project. It includes intentional candidates for analysis:

- A clickable `div` used for a primary action (keyboard/semantic control concern).
- Muted text/button colors that should be measured, not automatically asserted as a confirmed WCAG failure without contrast calculation and context.
- No explicit empty-task state.
- A semantic button also exists, so the test should distinguish better and worse patterns.

This fixture has not been built or run as part of Phase 1. It does not include `package-lock.json`. The runner must install dependencies in a disposable copy, report install/build failure honestly, and never modify the source fixture. The findings in `fixtures/expected-findings/DL-005.json` are drafts awaiting confirmation.
