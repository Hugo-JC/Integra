# Controlled Design Experiment Protocol

## Objective

Measure whether a Direction Artifact improves the output of a particular site-creation agent for a fixed brief. The experiment compares two conditions:

- **Baseline:** the agent receives the brief and its normal, unchanged operating configuration.
- **Integra-guided:** the same agent receives the same brief and configuration, plus one validated Integra Direction Artifact.

The intended treatment variable is the presence of the Direction Artifact. Do not change the agent, model, tools, brief, task request, project starter or evaluation rubric between conditions.

## Before running

1. Select one scenario and freeze the exact brief.
2. Calculate the SHA-256 hash of the brief.
3. Generate and validate the Direction Artifact. Save its exact bytes and calculate its SHA-256 hash.
4. Record the agent ID/version, model ID/version and a configuration hash. The configuration hash covers the shared agent settings, tool permissions and relevant generation parameters, but excludes the added Direction Artifact.
5. Prepare two clean, equivalent workspaces from the same project starter.
6. Capture the original starter state and the viewport/evaluation plan.

Do not use a result from an earlier run as the baseline for a later guided run. The pair must start from equivalent states.

## Run procedure

1. Run the baseline condition first or randomize the order and record it.
2. Run the Integra-guided condition with the Direction Artifact added as the only intentional difference.
3. Do not repair either output before evaluation.
4. Save each complete output, logs and evidence in separate run directories.
5. Calculate output hashes. Capture equivalent screenshots and relevant DOM/source/test evidence for both conditions.
6. Preserve failures, incomplete runs and negative results. Do not discard an inconvenient result.

## Evaluation rubric

Evaluate each dimension separately. Use the same rubric and viewport set for both outputs.

| Criterion | What to inspect |
|---|---|
| product-focus | Whether the main product proposition and primary action remain the visual and informational focus. |
| information-hierarchy | Whether content order, typography and emphasis make the intended reading path clear. |
| visual-coherence | Whether colors, typography, spacing and components form a coherent system appropriate to the brief. |
| content-completeness | Whether required content is present and unsupported claims are absent. |
| responsive-behavior | Whether content reflows and remains usable at every recorded target viewport. |
| accessibility | What the available evidence can verify about semantics, contrast, keyboard use, focus and reduced motion. |
| interaction-states | Whether relevant default, hover, focus, disabled, loading and error states behave as required. |
| implementation-discipline | Whether the agent respects the existing stack, avoids unnecessary dependencies and keeps the implementation coherent. |

Use only these statuses:

- pass: the criterion is supported by sufficient evidence and no relevant issue was found.
- partial: some parts pass, but at least one material issue remains.
- fail: evidence shows a material failure.
- not-verifiable: the available input does not prove the criterion either way.

A screenshot alone cannot prove keyboard behavior, DOM semantics or all responsive states. Mark those areas not-verifiable unless you collect the necessary evidence. Do not turn missing evidence into a pass.

Do not compress the rubric into one weighted score during the first pilot. Retain per-criterion results, evidence and limitations so the team can inspect trade-offs and regressions.

## Experiment record

Store a record conforming to schemas/design-experiment.schema.json. Shared controls live once at the top level so the baseline and guided runs cannot accidentally describe different agent/model configurations.

The record must include:

- scenario and brief hash;
- shared agent/model/configuration identifiers;
- output path and SHA-256 hash for both runs;
- direction artifact ID, schema version, path and hash for the guided run;
- paired results for each evaluated criterion;
- evidence IDs used to support each result;
- limitations and a concise interpretation.

Evidence references must resolve to retained files. Hash evidence files when practical. Record the exact viewport dimensions and test method in the evidence description or attached notes.

## Interpreting results

A better guided result in one run is a signal, not proof of general improvement. Repeat the pair before making broad claims. Keep the same scenario and controls for repetitions, and later test additional scenarios and agent/model families.

Report improvements and regressions. A direction that improves hierarchy while harming implementation discipline is not an unqualified success. The experiment is successful as a measurement even when Integra produces no improvement or a regression.

The agent's DirectionConsumptionReport is useful for understanding what the agent says it applied. It must not replace inspection of the output or independent evaluation.
