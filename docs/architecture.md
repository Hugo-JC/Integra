# Integra — arquitetura

## Visão

Integra é uma aplicação modular monolítica com contratos versionados e módulos de capacidade separados. Não vamos começar com microserviços: a complexidade operacional não se justifica antes de provar os fluxos e os contratos.

~~~text
Brief + Project
      |
      v
Context module
      |
      v
Deterministic Direction Engine
      |
      v
Direction Artifact 1.1.0
      |
      v
Four-layer artifact validation
      |
      v
External site-creation agent (optional consumer)
      |
      v
Direction Consumption Report (agent-reported)
      |
      v
Controlled baseline vs Integra-guided experiment
      |
      v
Refinement / Design Lab evaluation
~~~

A integração com um agente externo consome a direção como dados; não é uma dependência do motor e não é executada pelo núcleo determinístico.

## Responsabilidades

- **Shared contracts:** definem formatos serializáveis, versionados e independentes de fornecedores.
- **Context:** normaliza contexto estruturado fornecido pelo chamador, preserva a ordem, remove duplicados triviais, valida factos e restrições e regista campos ausentes sem inferir valores.
- **Direction:** gera decisões de sistema e recomendações contextualizadas nas oito áreas do Direction Artifact; o submódulo `presets` fornece uma sugestão contextual de estilo/nicho, com alternativas e baixa confiança explícitas.
- **Resolver:** filtra candidatos incompatíveis com restrições rígidas antes de aplicar a precedência de proveniência. Se uma comparação não puder ser feita com segurança, o resultado é inconclusivo.
- **Artifact validation:** verifica estrutura, semântica, restrições e consistência em quatro camadas ordenadas.
- **Agent consumer:** interpreta o artefacto e devolve outcomes por decisão e recomendação. O relatório é auto-relatado, não uma prova independente.
- **Design Lab:** compara execuções com variáveis controladas e avalia os resultados por evidências.
- **Refinement:** identifica problemas, explica o impacto e recomenda melhorias verificáveis; a auditoria de contraste DOM é uma primeira fatia e não uma auditoria WCAG completa.
- **Investigation:** integra referências, ferramentas ou fontes externas através de adaptadores opcionais.
- **Quality Gate:** aplica regras bloqueantes objetivas e conserva resultados inconclusivos e não verificáveis.

## Contratos entre módulos

src/contracts/ contém contratos partilhados. DirectionContextSnapshot vive em src/contracts/direction-context.ts, evitando que Context dependa de tipos internos de Direction.

src/modules/refinement/audits/ contém verificadores objetivos independentes. src/modules/live-inspector/ é uma ferramenta de browser de desenvolvimento, não parte do núcleo determinístico. src/modules/context/ contém a implementação pura de normalização. src/modules/direction/ contém proveniência, compatibilidade com restrições, geração e validação. src/cli/ fornece fronteiras de comando para workflows locais; não contém regras de design.

Texto livre (goals, constraints, preferences) preserva a intenção humana. A lógica determinística não tenta interpretar frases com keyword matching: para bloquear candidatos, usa structuredConstraints com path, operator, value e hard.

## Direction Artifact

O módulo Direction emite um DirectionArtifact provider-independent, versão 1.1.0, com oito áreas obrigatórias: Visual Identity, Color System, Typography, Layout & Composition, Component Principles, Motion & Interaction, Accessibility e Implementation Guidance.

Cada decisão inclui origem e razão; decisões derivadas do brief podem apontar para um caminho estável do contexto (sourcePath). Recomendações heurísticas são marcadas [R]. O artefacto não contém timestamp para preservar a reprodutibilidade.

A validação ocorre em quatro camadas ordenadas: structural (JSON Schema), semantic (IDs e categorias), constraints (compatibilidade com restrições rígidas) e consistency (proveniência e contexto). Se a camada structural falhar, as seguintes ficam not_run. Resultados não avaliáveis permanecem inconclusive.

A geração determinística do Direction Artifact atualmente cobre DL-001. O router de presets pode funcionar independentemente, mas não implica que todos os cenários tenham geradores completos. Os restantes cenários só serão adicionados quando as suas necessidades justificarem regras específicas. Não há presets globais de estilo.

## Agent Integration

O contrato de consumo define como o agente deve interpretar proveniência, restrições, oito áreas e missingInformation. O consumidor devolve um DirectionConsumptionReport com outcomes por ID.

Este relatório representa o que o agente afirma ter aplicado, adaptado ou omitido. Não prova que o resultado está correto, acessível ou visualmente consistente. Essas propriedades pertencem à avaliação independente e ao Design Lab.

O CLI funciona sem fornecedores externos:

- direction:generate normaliza um input, gera DL-001, valida as quatro camadas e exporta JSON.
- direction:validate valida um artefacto existente.
- Outputs locais por defeito ficam em .integra/runs/, ignorado pelo Git.

## Live Inspector e Design QA

O Design QA executa heurísticas AST sobre JSX/TSX. Os resultados não substituem testes de browser, avaliação humana ou medições reais.
O Live Inspector corre no browser do projeto local, opera por cima do DOM e exporta um diff para revisão. Não altera source code, não envia dados a providers e não deve ser ativado em produção.

## Reprodutibilidade e limites

O caminho determinístico não usa relógio, aleatoriedade, rede ou fornecedores externos. A serialização do artefacto ordena as chaves dos objetos e preserva a ordem das listas. A repetibilidade é testada para DL-001.

Experiências com agentes devem fixar o brief, agente, modelo, configuração e starter project; o artefacto é a única diferença intencional entre as condições. Cada execução conserva outputs, hashes e evidências.

O artefacto direciona um agente de implementação; não prova que o site criado esteja correto. Avaliação visual, browser runner, mutação de projetos e geração de aplicações inteiras permanecem fora do âmbito do núcleo atual.
