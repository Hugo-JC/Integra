# Integra — arquitectura propuesta

## Visión

Integra será umaa aplicação modular monolítica com um núcleo coordenador e módulos de capacidade separados. Não vamos começar com microserviços: a complexidade operacional não se justifica antes de provar os contratos e os fluxos.

```text
Brief / Project
      |
      v
Input & Context Normalizer
      |
      v
Orchestrator / Pipeline
  |          |          |
Direction  Refinement  Investigation (optional)
  |          |          |
  +----------+----------+
             |
     Findings / Artifacts
             |
     Quality Gate + Report
             |
        V5 Design Lab
```

## Responsabilidades

- **Engine / Orchestrator:** coordena um fluxo, controla falhas e conserva a origem de cada artefacto.
- **Context:** normaliza contexto estruturado fornecido pelo chamador, preserva a ordem dos dados, remove duplicados triviais e regista campos ausentes sem inferir valores. A extração de briefings em texto livre permanece fora desta primeira fatia.
- **Direction:** propõe uma direção visual e decisões de sistema coerentes com o contexto.
- **Refinement:** identifica problemas, explica o impacto e recomenda melhorias verificáveis.
- **Investigation:** integra referências, ferramentas ou fontes externas através de adaptadores opcionais.
- **Quality Gate:** aplica regras bloqueantes objetivas e conserva resultados inconclusivos.
- **Design Lab:** avalia cenários por evidências e compara resultados com baselines revistas.

## Contratos entre módulos

As entradas e saídas devem ser serializáveis, versionadas e independentes de fornecedores. Os módulos não devem importar implementações internas de outros módulos; devem conversar por tipos e interfaces de fronteira.

## Estrutura do código

`src/engine/` contém os pontos do futuro fluxo coordenado. `src/modules/` contém as capacidades. `src/contracts/` define formatos comuns. `src/lab/` contém utilitários independentes usados para avaliar os resultados.

## Direction Artifact boundary

The Direction module emits a versioned, provider-independent `DirectionArtifact`. Its eight required areas are Visual Identity, Color System, Typography, Layout & Composition, Component Principles, Motion & Interaction, Accessibility and Implementation Guidance. Each area carries a concise summary, decisions with provenance (`brief`, `rule`, `ai`, `default`) and contextual recommendations marked `[R]`.

The artifact is serializable and intentionally excludes generation timestamps. Context fields may be absent; `missingInformation` records gaps instead of allowing the engine to invent audience, goals, constraints or stack details. The artifact schema is separate from the Design Lab run-report schema.

## Limites da Fase 1

Os diretórios de módulos contêm notas de fronteira e extensões planeadas; não indicam que a funcionalidade já esteja implementada. A fase atual valida apenas contratos, catálogo, fixtures e helpers de avaliação.
