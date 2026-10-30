# Tests

- scoring.test.ts: unit tests for weighted scores, detection metrics and hard-gate behavior.
- contracts/report-schema.test.ts: report contract validation and artifact-path safety.
- contracts/scenario-catalog.test.ts: catalogue invariants and weights.
- context-normalizer.test.ts: aggregate diagnostics, missing values, Unicode normalization, bounds, structured facts and idempotence.
- direction-artifact.test.ts: versioned Direction Artifact contract and provenance paths.
- direction-resolver.test.ts: hard-constraint filtering and source precedence.
- direction-engine.test.ts: deterministic DL-001 generation, eight sections and schema validation.

The fixture validation script also generates the DL-001 artifact and validates it against the checked-in schema. These checks validate direction contracts and deterministic outputs, not the quality of a website produced by an external agent.


## Direction Artifact validation

- Four ordered layers: structural, semantic, hard constraints and provenance/context consistency.
- A structural failure leaves all deeper layers as `not_run`.
- An unevaluable hard constraint is `inconclusive`, never silently passed.
