# Integra — AI Design Engine v5

**Um motor modular para transformar briefs e contexto em direção de design estruturada, rastreável e verificável — pronta para ser consumida por agentes externos.**

> **Estado atual:** fundação determinística da Phase 2 concluída para DL-001. O Direction Artifact 1.1.0 é gerado sem IA e validado em quatro camadas. Esta branch acrescenta ferramentas de CLI, contratos de integração com agentes e formatos para experiências controladas.

## O que é o Integra?

Integra não é um gerador de sites nem um editor visual. É uma camada de direção e qualidade entre a intenção do projeto e o agente que implementa a interface.

- **Direction:** transforma objetivos e contexto em decisões e recomendações visuais aplicáveis.
- **Refinement:** identifica problemas verificáveis e recomenda melhorias específicas.
- **Investigation:** recolhe contexto e evidências através de adaptadores opcionais.
- **V5 Design Lab:** testa cenários e compara resultados sem confundir recomendações com correções comprovadas.

O objetivo é reduzir improviso e padrões genéricos, sem impor uma estética universal ou inventar informação ausente.

## Princípios

1. Regras determinísticas são a base; IA é enriquecimento opcional.
2. O mesmo contexto normalizado e a mesma versão do motor produzem o mesmo artefacto.
3. Factos, restrições explícitas, preferências e heurísticas são tratados de forma distinta.
4. Texto livre preserva intenção; restrições bloqueantes usam estrutura tipada.
5. Informação ausente fica em missingInformation, nunca é inventada.
6. Decisões preservam proveniência: brief > rule > ai > default.
7. WCAG estabelecido não se confunde com recomendações heurísticas [R].
8. Relatórios de autoavaliação de agentes não substituem verificação independente.
9. O núcleo não depende de API keys, rede ou ferramentas de browser.

## Stack e requisitos

- TypeScript e Node.js numa arquitetura modular monolítica.
- Node.js 24 e npm 10 ou superior.
- JSON Schema 2020-12 para contratos serializáveis.
- React + TypeScript é o primeiro contexto de integração, sem obrigar todos os projetos a usar essa stack.

## Começar

~~~bash
npm ci
npm run check
~~~

## Direction CLI

Gerar o artefacto DL-001 a partir do fixture incluído:

~~~bash
npm run direction:generate
~~~

O output por defeito é escrito em .integra/runs/direction/DL-001.json (pasta ignorada pelo Git).

Usar um input próprio:

~~~bash
npm run direction:generate -- --scenario DL-001 --input ./brief.json --out ./.integra/runs/my-direction.json
~~~

O input pode ser o objeto DirectionContextInput ou um fixture com a propriedade directionContext.

Escrever o JSON diretamente no stdout:

~~~bash
npm run direction:generate -- --stdout
~~~

Validar um artefacto existente:

~~~bash
npm run direction:validate -- --input ./.integra/runs/my-direction.json
~~~

A validação usa as quatro camadas já existentes. Exit codes: 0 passed, 1 failed, 2 inconclusive ou com diagnóstico de geração que exige revisão.

## O que já está implementado

- Cinco cenários documentados, briefs, manifests e fixtures.
- Schemas para cenários, relatórios, findings e Direction Artifact.
- Context contracts e normalizador com diagnósticos, limites, Unicode NFC e deduplicação estável.
- Factos tipados para viewports, acessibilidade, idioma, tokens e conteúdo.
- Restrições estruturadas hard/soft e resolver com precedence.
- Geração determinística DL-001 nas oito áreas do artefacto.
- Serialização canónica e identidade estável sem timestamp.
- Validação estrutural, semântica, de restrições e consistência.
- CLI para gerar e validar direções sem IA.
- Contract de consumo do agente e Direction Consumption Report.
- Schema de experiências pareadas baseline vs Integra-guided.
- GitHub Actions para typecheck, testes e validação de fixtures.

## Próximo marco: First Agent Pilot

A primeira experiência real deve executar o mesmo agente com o mesmo brief e configuração em dois workspaces equivalentes: baseline e Integra-guided. A única diferença intencional será a presença do Direction Artifact. Outputs, hashes, screenshots e resultados por critério ficam registados.

Consultar:

- docs/implementation-roadmap.md — roadmap oficial.
- docs/architecture.md — fronteiras e fluxo dos módulos.
- docs/agent-integration-contract.md — como agentes consomem e reportam a direção.
- docs/design-experiment-protocol.md — protocolo do primeiro teste controlado.
- examples/agent-consumer/AGENT-INSTRUCTIONS.md — exemplo de instruções para um agente externo.

## Limites atuais

A geração determinística está implementada apenas para DL-001. Ainda não existem extração automática de briefs Markdown, AI Provider Layer, runner de browser, avaliação visual automática ou mutação de projetos React. A implementação de um agente externo e a eficácia da direção ainda precisam de ser testadas com experiências reais.

## Mapa rápido

- docs/ — arquitetura, decisões, contratos e roadmap.
- schemas/ — contratos JSON versionados.
- scenarios/ — os cinco cenários do V5 Design Lab.
- fixtures/ — dados e exemplos de referência.
- src/contracts/ — formatos partilhados.
- src/modules/context/ — normalização e validação do contexto.
- src/modules/direction/ — proveniência, resolver, geração e validação.
- src/cli/ — fronteira de aplicação para comandos locais.
- src/lab/ — helpers de avaliação.
- scripts/ — CLI e validação de fixtures.
- tests/ — testes unitários e de contrato.
