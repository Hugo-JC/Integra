# Integra — arquitetura

Integra é um motor modular de inteligência de design. O núcleo determinístico não depende de browser, framework, IA ou providers. Skills, presets, Live Inspector e adaptadores são camadas isoladas que consomem contratos comuns.

~~~text
Brief → Context → Direction + Preset → Direction Artifact
                                      ↓
                             Agent Skills / external agent
                                      ↓
                           implementation / Live Inspector
                                      ↓
                              Refinement + Design QA
                                      ↓
                            evidence-backed findings
                                      ↓
                                 Design Lab

Investigation → references, observations, evidence records
~~~

## Módulos

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

## Direction Artifact

O artefacto contém Visual Identity, Color System, Typography, Layout & Composition, Component Principles, Motion & Interaction, Accessibility e Implementation Guidance. As decisões registam origem e razão; recomendações heurísticas usam [R]. A validação tem quatro camadas: structural, semantic, constraints e consistency.

src/modules/refinement/audits/ contém verificadores objetivos independentes. src/modules/live-inspector/ é uma ferramenta de browser de desenvolvimento, não parte do núcleo determinístico. src/modules/context/ contém a implementação pura de normalização. src/modules/direction/ contém proveniência, compatibilidade com restrições, geração e validação. src/cli/ fornece fronteiras de comando para workflows locais; não contém regras de design.

## Presets e legado

presets/manifest.json indexa nove presets para developer tools, productivity, commerce, analytics, education, editorial, media, community/gaming e public services.

references/ade-knowledge/ preserva o corpus legado do AI Design Engine. Os estilos antigos são referências, não regras universais. #050505 / #111111 não são a paleta obrigatória do Integra. #3B82F6 é a assinatura do overlay do Live Inspector.

## Live Inspector

Usa DOM APIs e Shadow DOM, sem dependência de React/Vite/Tailwind. O seletor CSS identifica um elemento renderizado, não um ficheiro TSX. sourceHint só é aceite quando fornecido explicitamente. Source maps, persistência de alterações, keyboard picker completo e browser automation são etapas futuras.

A geração determinística do Direction Artifact atualmente cobre DL-001. O router de presets pode funcionar independentemente, mas não implica que todos os cenários tenham geradores completos. Os restantes cenários só serão adicionados quando as suas necessidades justificarem regras específicas. Não há presets globais de estilo.

## Quality & evidence

auditDesignQuality() avalia apenas observações fornecidas. createDesignEvidence() valida registos de investigação sem fazer fetch da URL. Não há score global e não se declara WCAG compliance a partir de verificações parciais.

## Stack

Node.js 24, TypeScript strict, JSON Schema, Vitest, tsx e browser APIs nativas. Playwright, axe-core, TypeScript AST, Vite/React adapters e providers são extensões opcionais; não são dependências do core.

## Live Inspector e Design QA

O Design QA executa heurísticas AST sobre JSX/TSX. Os resultados não substituem testes de browser, avaliação humana ou medições reais.
O Live Inspector corre no browser do projeto local, opera por cima do DOM e exporta um diff para revisão. Não altera source code, não envia dados a providers e não deve ser ativado em produção.

## Reprodutibilidade e limites

O caminho determinístico não usa relógio, aleatoriedade, rede ou providers. Experiências devem fixar brief, agente, modelo, configuração e starter project. O artefacto orienta implementação, mas não prova a qualidade final.
