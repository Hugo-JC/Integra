# Roadmap do Integra

Última atualização: 30/10/2026.

## Direção do produto

Integra é um motor provider-agnostic de direção e qualidade de design. Converte briefs e contexto estruturado em artefactos de direção rastreáveis; depois permite que agentes externos os consumam e que o Design Lab avalie os resultados com evidências.

Integra não é um gerador de sites, um editor visual ou um conjunto de prompts. O núcleo deve permanecer determinístico, testável e útil sem fornecedores externos.

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

- Acessibilidade automatizada com limites explícitos e referências WCAG.
- Verificação de conteúdo obrigatório, claims e estados de interação.
- Avaliação de responsividade com browser/DOM quando disponível.
- Findings com evidências, severidade, impacto e correções verificáveis.
- Deteção de regressões contra baselines aprovadas.
- Estados not-verifiable e inconclusive sempre que a evidência não permite concluir.

## Fase 5 — Scenario coverage

- DL-002 Productivity Dashboard.
- DL-003 Education Platform.
- DL-005 Existing React Project.
- DL-004 permanece centrado em avaliação de interfaces genéricas, não em impor uma direção criativa universal.

Cada cenário exige contexto, regras, critérios e fixtures próprios. Não criar geradores só para aumentar a contagem.

## Fase 6 — AI Provider Layer & Investigation

- Porta única para pedidos de sugestões.
- Adaptadores provider-agnostic, timeouts e validação de payloads.
- Fallback determinístico quando a IA falhar ou devolver dados inválidos.
- IA nunca ultrapassa hard constraints nem decisões explícitas do brief.
- Adaptadores opcionais para referências, documentação e ferramentas externas, com proveniência.

Esta fase vem depois do primeiro piloto e da definição das necessidades reais. Não introduzir IA antes de provar o fluxo determinístico.

## Release gates

- Alterações de schema incluem testes, documentação e migração.
- Nenhuma fase é concluída apenas por adicionar ficheiros.
- Checks locais e CI têm de passar no head exato do PR.
- Resultados de agentes são avaliados separadamente dos seus relatórios de autoavaliação.
- Não publicar claims de melhoria sem experiências reproduzíveis.
- WCAG, heurísticas [R], preferências subjetivas e decisões de produto continuam separados.
