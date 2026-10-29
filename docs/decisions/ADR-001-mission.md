# ADR-001 — Missão do Integra

- **Estado:** aceite como direção inicial
- **Decisão:** suportar geração de interfaces novas e análise/melhoria de projetos existentes, com um contexto e contratos partilhados.

## Motivo

Os cenários escolhidos testam ambos os caminhos. Separar dois produtos desde o início duplicaria contratos e dificultaria a avaliação comparativa.

## Consequência

O orquestrador terá fluxos explícitos (`generate`, `analyze`, `analyze-and-fix`). Não é necessário implementar todos na Fase 1. A escrita de código deverá ser sempre opt-in e ocorrer numa cópia de trabalho.
