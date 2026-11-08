# Integra quality gates

Every finding must include a location, evidence, severity, impact, recommendation and verification status.

- P0: blocks a core task or creates severe safety, security or data-integrity risk.
- P1: breaks a major flow, keyboard access or common responsive interaction.
- P2: noticeable usability, consistency or quality issue.
- P3: polish with low user impact.

Objective gates (types, tests, schema, contrast pairs and keyboard paths) are reported separately from subjective visual ratings. Unknown is not pass; skipped checks remain `not_run`. A contrast ratio alone cannot prove WCAG conformance.
