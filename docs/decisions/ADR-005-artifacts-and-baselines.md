# ADR-005 — Artefactos e baselines

- **Estado:** aceite para a primeira fase
- **Decisão:** manter manifests, briefs, esquemas, fixtures anotadas e baselines aprovadas e pequenas sob controlo de versão. Escrever logs, capturas e artefactos temporários em `.integra/runs/`, fora do controlo de versão.

## Motivo

Os testes precisam de ser reproduzíveis, mas capturas e outputs grandes não devem poluir o histórico de código.

## Consequência

A Fase 2 deve definir retenção, limites de tamanho e metadados de hash. Não adicionar uma base de dados até existir uma necessidade concreta de consulta multiutilizador ou histórico distribuído.
