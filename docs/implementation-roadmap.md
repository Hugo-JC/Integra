# Roadmap do Integra

Última atualização: 08/11/2026.

## Direção

Integra transforma contexto em direção visual rastreável, ajuda agentes a implementar e verifica resultados com evidências. Não é apenas um gerador de sites ou uma coleção de prompts.

## Fase 1 — Contracts & Design Lab foundation

**Concluída.**

- Cinco cenários, briefs, manifests e fixtures.
- Schemas e contratos partilhados para cenários, relatórios e findings.
- Helpers de scoring e métricas de deteção.
- Base do V5 Design Lab.

## Fase 2 — Deterministic Direction foundation

**Concluída para DL-001.**

- Direction Artifact 1.1.0 com oito secções obrigatórias.
- Context contracts e normalizador determinístico, com diagnósticos, limites, Unicode NFC e deduplicação estável.
- Factos de projeto e restrições estruturadas hard/soft.
- Resolver mínimo: restrições rígidas antes da precedência brief > rule > ai > default.
- Geração determinística para DL-001 e serialização canónica sem timestamp.
- Validação ordenada em quatro camadas: structural, semantic, constraints e consistency.
- CI com typecheck, testes e validação de fixtures.

A fase está concluída para a primeira fatia funcional, não para todos os cenários. Não declarar cobertura geral de Direction enquanto DL-002, DL-003 e DL-005 não tiverem geradores próprios e testes específicos.

## Fase 2.1 — Agent integration foundation

**Em implementação nesta branch.**

- CLI para gerar e validar Direction Artifacts sem chamar IA.
- Contrato provider-agnostic para agentes consumidores.
- Direction Consumption Report para rastrear decisões e recomendações aplicadas, adaptadas ou omitidas.
- Schema do relatório de consumo e testes de contrato.
- Design Experiment Record para comparação pareada baseline vs Integra-guided.
- Protocolo de experiência, instruções de exemplo e documentação de compatibilidade.

Critério de conclusão: o artefacto pode ser gerado, validado, entregue a um agente externo e associado a um relatório de consumo validável.

## Fase 2.2 — Design Intelligence & Browser Preview

**Implementação inicial nesta branch; precisa de validação em Node 24 e browser real.**

- Biblioteca migrada do AI Design Engine: estilos, presets, fontes, regras, anti-patterns, playbook, arquétipos e catálogo.
- Router determinístico com termos fortes/fracos, variantes condicionais, alternativas e confirmação em fallback/ambiguidade.
- Skills interoperáveis em `.agents/skills/` e contextos para Gemini, Claude Code, Cursor e GitHub Copilot.
- QA estático AST para regras JSX/TSX selecionadas.
- Live Inspector local: seleção DOM azul, navegação ao pai, preview de classes/estilos, reset e exportação de diff.
- Auditoria de contraste de texto WCAG 2.2 1.4.3 com estados passed/failed/inconclusive.

Não declarar conformidade WCAG global nem persistência das edições do Live Inspector. O preview altera apenas o DOM; mudanças duráveis são feitas no código-fonte após revisão do agente.

## Marco seguinte — First Agent Pilot

1. Escolher um brief DL-001 e congelar o seu SHA-256.
2. Gerar e validar o Direction Artifact.
3. Executar o mesmo agente com a mesma configuração em dois workspaces limpos: baseline e Integra-guided.
4. Guardar outputs, screenshots, hashes e evidências.
5. Avaliar os mesmos critérios para os dois resultados e preencher o Design Experiment Record.
6. Documentar ganhos, regressões, aspetos não verificáveis e limitações.

Não alterar o motor com base numa impressão isolada. Primeiro recolher evidência do comportamento real do agente.

## Fase 3 — Runner & reproducible experiments

- Carregar manifests e preparar workspaces isolados.
- Capturar versões, configurações, logs e hashes.
- Guardar artefactos de execução sem misturar inputs e outputs.
- Repetir runs com controlo de variáveis.
- Produzir relatórios mesmo quando uma execução falha.
- Limpar workspaces de forma segura.

## Fase 4 — Refinement & evaluators
Adapter DOM/browser, axe-core opcional, TypeScript AST, responsive tests, findings baseados em evidências e deteção de regressões.

## Fase 5 — Scenario coverage
Implementar DL-002, DL-003 e DL-005 com regras e fixtures específicas. DL-004 continua como avaliação de interfaces genéricas.

## Fase 6 — Investigation adapters & optional AI
Adapters autorizados para fontes externas; providers opcionais com timeout, cancelamento, validação, fallback determinístico e respeito por hard constraints.

## Release gates

- Alterações de schema incluem testes, documentação e migração.
- Nenhuma fase é concluída apenas por adicionar ficheiros.
- Checks locais e CI têm de passar no head exato do PR.
- Resultados de agentes são avaliados separadamente dos seus relatórios de autoavaliação.
- Não publicar claims de melhoria sem experiências reproduzíveis.
- WCAG, heurísticas [R], preferências subjetivas e decisões de produto continuam separados.


## Delivered: agent skills, design intelligence and Live Inspector
- Migrated 61 niche presets and 17 style definitions from AI Design Engine v3 with provenance.
- Added deterministic offline preset matching and the `direction:presets` command.
- Added experience archetypes, evidence-led quality heuristics and agent prompt vocabulary.
- Added eight portable Agent Skills plus Gemini CLI guidance.
- Added a Vite development-only Live Inspector with element selection, temporary style/class previews, contrast estimate and exact diff/prompt export.
- Added asset validation to the project quality check.

Still outside this slice: persistent source writing, React state mutation, source-map resolution, full WCAG audit, automatic visual scoring and a complete Design Lab runner.
