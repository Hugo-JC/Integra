# Integra design command vocabulary

These are reusable intents for skills and agent workflows. They are not all executable CLI commands yet.

| Intent | Use when | Expected result |
|---|---|---|
| shape | Planning a new flow or product surface | Task map, content hierarchy, states and interaction model |
| direct | Choosing visual personality and preset | Direction with context, rationale and alternatives |
| generate | Creating a new component or section | Implementable code consistent with the project |
| critique | Reviewing usability and visual hierarchy | Ranked findings with evidence |
| audit | Checking accessibility, responsive behavior and implementation | Technical quality report with verification state |
| polish | Final refinement of a nearly complete surface | Focused corrections; no unnecessary redesign |
| distill | Removing visual and interaction noise | Simpler hierarchy without losing meaning |
| bolder | Strengthening a weak but safe visual direction | More distinctive direction with constraints preserved |
| quieter | Reducing excessive visual intensity | Lower visual noise without erasing hierarchy |
| typeset | Improving typography system | Roles, scale, line length and responsive behavior |
| layout | Improving structure, spacing and density | Grid, rhythm and content grouping |
| colorize | Strengthening semantic color use | Role-based palette and accessible pairings |
| animate | Improving motion and feedback | Motion rules plus reduced-motion alternative |
| harden | Preparing a screen for real use | Empty/error/loading states, overflow and edge cases |
| adapt | Making a surface responsive | Behavior by viewport and input method |
| refactor | Cleaning existing implementation | Safe, typed, semantic and tested code |
| investigate | Understanding an external product pattern | Evidence log, unknowns and reusable principles |
| live | Inspecting and previewing a running page | Element selection, DOM diff and AI handoff |
| verify | Checking final output | Tests, accessibility evidence and remaining risks |

## Command contract

An agent should interpret an intent with a concrete target, for example "critique the pricing table" or "typeset the onboarding screen". It must not claim a CLI command exists unless a matching executable is present. Prefer one target and one task per invocation.
