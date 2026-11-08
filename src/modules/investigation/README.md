# Investigation module

The module normalizes traceable reference/evidence records. Local tooling works when external integrations are disabled.

evidence.ts validates source title, optional HTTP/HTTPS URL, evidence type, confidence, observation, interpretation, limitations, license note and adaptation proposal. It does not fetch URLs.

The reference catalog lists current standards and design systems. references/ade-knowledge/ preserves the original AI Design Engine knowledge corpus.

No crawler, browser automation, REA MCP integration, asset downloader or claim verifier is implemented. Future adapters must be optional, user-authorized and preserve evidence provenance and limitations.
