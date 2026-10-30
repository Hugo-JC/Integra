# Integra — AI Design Engine v5

**Uma base modular para gerar, analisar e melhorar interfaces com direções e evidências verificáveis.**

> Estado atual: **Fase 2 — primeiro Direction Engine determinístico em implementação**. A fundação inclui contratos partilhados, normalização de contexto estruturado, resolução mínima de restrições e geração das oito áreas do Direction Artifact para o cenário DL-001. O caminho funciona sem fornecedores de IA. A integração com um agente externo de criação de sites será validada como próximo teste prático.

## O que é o Integra?

O Integra é a nova identidade de trabalho do AI Design Engine v5. A arquitetura propõe um núcleo partilhado com três capacidades:

- **Direction:** transforma objetivos e contexto em direções visuais coerentes e aplicáveis.
- **Refinement:** encontra problemas verificáveis e recomenda melhorias específicas.
- **Investigation:** recolhe contexto e evidências através de adaptadores opcionais.

O **V5 Design Lab** é a bancada de testes que avalia os resultados sem confundir uma recomendação com uma correção comprovada.

## Princípios de construção

1. Regras determinísticas são a base; IA é um enriquecimento opcional.
2. O mesmo contexto normalizado e a mesma versão do motor devem produzir o mesmo artefacto.
3. Factos, restrições explícitas e preferências humanas são tratados de forma distinta.
4. Texto livre continua disponível para leitura humana; decisões bloqueantes usam restrições estruturadas.
5. Informação ausente é preservada em missingInformation, nunca inventada para preencher as oito áreas.
6. A origem das decisões é rastreável (brief, rule, ai, default).
7. WCAG estabelecido não é confundido com recomendações heurísticas [R].
8. O núcleo não depende de API keys, serviços externos ou ferramentas de browser.

## Stack e requisitos

- TypeScript + Node.js numa arquitetura modular monolítica.
- Node.js 24 LTS recomendado; npm 10 ou superior.
- React + TypeScript é o primeiro contexto de integração, sem obrigar todos os projetos a usar essa stack.

## Começar

~~~bash
npm ci
npm run check
~~~

Comandos individuais:

~~~bash
npm run typecheck
npm test
npm run validate:fixtures
~~~

O package-lock.json está versionado e npm ci instala as dependências bloqueadas. O workflow de GitHub Actions executa a mesma verificação completa em pull requests e em pushes para main.

## O que já está incluído

- Cinco cenários documentados, briefings e fixtures de referência.
- Esquemas versionados para cenários, relatórios, findings esperados e Direction Artifact.
- Contratos TypeScript para contexto partilhado e artefactos de direção.
- Normalizador de contexto com diagnósticos agregados, limites, Unicode NFC e deduplicação estável.
- Factos tipados para viewports, acessibilidade, idioma, tokens, conteúdo obrigatório e claims proibidas.
- Restrições estruturadas com caminho, operador, valor e sinalizador hard.
- Resolver mínimo que filtra candidatos incompatíveis antes de aplicar a precedência de proveniência.
- Primeira geração determinística das oito áreas do Direction Artifact para DL-001.
- CI para typecheck, testes e validação de fixtures.

## Limites atuais

A geração de direção implementada cobre apenas o cenário DL-001. Ainda não existe extração automática de briefings Markdown, camada de fornecedores de IA, geração de aplicações completas, mutação de projetos React, runner de browser ou avaliação visual automática. O artefacto é uma especificação de direção para um agente de implementação, não uma prova de que o site final ficou bom.

## Mapa rápido

- docs/ — arquitetura, decisões, especificação e roadmap.
- schemas/ — contratos JSON validados.
- scenarios/ — os cinco cenários do V5 Design Lab.
- fixtures/ — dados de referência, projetos sintéticos e exemplos.
- src/contracts/ — formatos partilhados entre módulos.
- src/modules/context/ — normalização e validação do contexto.
- src/modules/direction/ — proveniência, resolver e geração de direção.
- src/engine/ — futuras fronteiras de coordenação e pipeline.
- src/lab/ — utilitários independentes de avaliação.
- tests/ — testes unitários e de contrato.

## Próximo objetivo prático

Ligar o artefacto DL-001 a um agente de criação de sites. O primeiro ensaio deve comparar duas execuções do mesmo briefing: agente sem direção do Integra e agente com o Direction Artifact. Depois avaliamos se a direção melhora a hierarquia, o foco no produto, a coerência, a responsividade e a acessibilidade, sem assumir que uma recomendação foi aplicada só por estar no artefacto.

Consultar docs/implementation-roadmap.md para a sequência das próximas fases.
