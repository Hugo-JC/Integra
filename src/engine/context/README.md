# Context orchestration boundary

The Context capability is implemented in src/modules/context/. Its shared contract lives in src/contracts/direction-context.ts.

This directory is reserved for future orchestration that loads a structured brief, invokes the Context module and passes the normalized snapshot to downstream modules. It must not duplicate normalization rules or shared types.

Markdown extraction, filesystem access and project-specific adapters remain outside the pure normalizer.
