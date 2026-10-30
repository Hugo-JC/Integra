# Integra — arquitetura

## Visão

Integra é uma aplicação modular monolítica com um núcleo coordenador e módulos de capacidade separados. Não vamos começar com microserviços: a complexidade operacional não se justifica antes de provar os contratos e os fluxos.

~~~text
Brief / Project
      |
      v
Context module  <----> Shared contracts
      |
      v
Direction Engine
      |
      v
Direction Artifact
      |
      v
External site-creation agent (optional consumer)
      |
      v
Refinement / Design Lab evaluation
~~~

A integração com um agente externo consome a direção como dados; não é uma dependência do motor e não é executada pelo núcleo determinístico.

## Responsabilidades

- **Shared contracts:** definem formatos serializáveis, versionados e independentes de fornecedores.
- **Context:** normaliza contexto estruturado fornecido pelo chamador, preserva a ordem, remove duplicados triviais, valida factos e restrições e regista campos ausentes sem inferir valores.
- **Direction:** gera decisões de sistema e recomendações contextualizadas nas oito áreas do Direction Artifact.
- **Resolver:** filtra candidatos incompatíveis com restrições rígidas antes de aplicar a precedência de proveniência. Se uma comparação não puder ser feita com segurança, o resultado é inconclusivo.
- **Refinement:** identifica problemas, explica o impacto e recomenda melhorias verificáveis.
- **Investigation:** integra referências, ferramentas ou fontes externas através de adaptadores opcionais.
- **Quality Gate:** aplica regras bloqueantes objetivas e conserva resultados inconclusivos.
- **Design Lab:** avalia cenários por evidências e compara resultados com baselines revistas.

## Contratos entre módulos

src/contracts/ contém contratos partilhados. DirectionContextSnapshot vive em src/contracts/direction-context.ts, evitando que Context dependa de tipos internos de Direction.

src/modules/context/ contém a implementação pura de normalização. src/modules/direction/ contém proveniência, compatibilidade com restrições e geração. src/engine/ fica reservado à coordenação futura e não deve duplicar os módulos de capacidade.

Texto livre (goals, constraints, preferences) preserva a intenção humana. A lógica determinística não tenta interpretar frases com keyword matching: para bloquear candidatos, usa structuredConstraints com path, operator, value e hard.

## Direction Artifact

O módulo Direction emite um DirectionArtifact versionado e independente de fornecedores. A versão 1.1.0 contém oito áreas obrigatórias: Visual Identity, Color System, Typography, Layout & Composition, Component Principles, Motion & Interaction, Accessibility e Implementation Guidance.

Cada decisão inclui origem e razão; decisões derivadas do brief podem apontar para um caminho estável do contexto (sourcePath). Recomendações heurísticas são marcadas [R]. O artefacto não contém timestamp para preservar a reprodutibilidade.

A primeira fatia de geração cobre DL-001. Os restantes cenários só serão adicionados quando as suas necessidades justificarem regras específicas. Não há presets globais de estilo.

## Restrições e precedência

Restrições rígidas aplicáveis são avaliadas antes de escolher uma decisão. Candidatos que violem uma restrição são rejeitados; quando a compatibilidade não pode ser avaliada, o resultado é inconclusivo, nunca passed.

Entre candidatos compatíveis mantém-se a precedência já estabelecida: brief > rule > ai > default. A IA não pode substituir restrições rígidas nem decisões explícitas do brief.

## Reprodutibilidade e limites

O caminho determinístico não usa relógio, aleatoriedade, rede ou fornecedores externos. A serialização do artefacto ordena as chaves de objetos e preserva a ordem das listas. A repetibilidade é testada para DL-001.

O artefacto direciona um agente de implementação; não prova que o site criado esteja correto. Avaliação visual, browser runner, mutação de projetos e geração de aplicações inteiras permanecem fora do âmbito desta fatia.
