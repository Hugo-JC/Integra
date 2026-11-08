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

- **Shared contracts:** formatos serializáveis, versionados e provider-independent.
- **Context:** normaliza factos, restrições e informação ausente; não inventa contexto.
- **Direction:** gera o Direction Artifact 1.1.0 nas oito áreas obrigatórias. Geração determinística atual: DL-001.
- **Presets:** nove direções contextuais; nunca substituem requisitos explícitos, marca ou tokens do projeto.
- **Legacy ADE knowledge:** biblioteca de referência migrada do AI Design Engine anterior, com catálogo de nichos, estilos, regras e referências.
- **Agent Skills:** procedimentos task-scoped em .agents/skills/, com descoberta compatível com Gemini CLI.
- **Live Inspector:** módulo browser-only e opt-in em src/modules/live-inspector/. Seleciona elementos, faz preview temporário, gera diff/prompt e estima contraste em casos CSS simples.
- **Refinement:** avalia observações fornecidas pelo chamador e devolve findings P0–P3 com estados verified/heuristic/inconclusive.
- **Investigation:** normaliza evidências e limitações; não faz crawling nem chamadas de rede.
- **Design Lab:** compara execuções controladas; o relatório do agente não constitui prova independente.

## Direction Artifact

O artefacto contém Visual Identity, Color System, Typography, Layout & Composition, Component Principles, Motion & Interaction, Accessibility e Implementation Guidance. As decisões registam origem e razão; recomendações heurísticas usam [R]. A validação tem quatro camadas: structural, semantic, constraints e consistency.

A geração continua limitada a DL-001. Os restantes cenários precisam de regras e testes específicos.

## Presets e legado

presets/manifest.json indexa nove presets para developer tools, productivity, commerce, analytics, education, editorial, media, community/gaming e public services.

references/ade-knowledge/ preserva o corpus legado do AI Design Engine. Os estilos antigos são referências, não regras universais. #050505 / #111111 não são a paleta obrigatória do Integra. #3B82F6 é a assinatura do overlay do Live Inspector.

## Live Inspector

Usa DOM APIs e Shadow DOM, sem dependência de React/Vite/Tailwind. O seletor CSS identifica um elemento renderizado, não um ficheiro TSX. sourceHint só é aceite quando fornecido explicitamente. Source maps, persistência de alterações, keyboard picker completo e browser automation são etapas futuras.

Gradientes, imagens, filtros, pseudo-elementos e camadas complexas são inconclusivos para contraste. O inspector não escreve source, não chama IA e não deve estar ativo em produção.

## Quality & evidence

auditDesignQuality() avalia apenas observações fornecidas. createDesignEvidence() valida registos de investigação sem fazer fetch da URL. Não há score global e não se declara WCAG compliance a partir de verificações parciais.

## Stack

Node.js 24, TypeScript strict, JSON Schema, Vitest, tsx e browser APIs nativas. Playwright, axe-core, TypeScript AST, Vite/React adapters e providers são extensões opcionais; não são dependências do core.

## Reprodutibilidade e limites

O caminho determinístico não usa relógio, aleatoriedade, rede ou providers. Experiências devem fixar brief, agente, modelo, configuração e starter project. O artefacto orienta implementação, mas não prova a qualidade final.
