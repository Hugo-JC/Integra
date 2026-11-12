# Roadmap do Integra

**Última atualização:** 12/11/2026  
**Estado global:** core determinístico e contratos iniciais implementados; piloto com agente externo e validação visual em browser ainda por executar.

## Direção do produto

Integra transforma contexto de produto em direção visual rastreável, ajuda um agente externo a consumir conhecimento visual e prepara evidência para revisão de interfaces. Não é um gerador universal de sites nem um executor autónomo de agentes.

O critério de progresso não é a quantidade de Skills, regras ou ficheiros adicionados. Cada etapa deve demonstrar um fluxo funcional, preservar proveniência e ser validada no ambiente de destino.

## Estado entregue

### Fase 1 — Contracts & Design Lab foundation

**Estado: base implementada.**

- Cenários, briefs, manifests e fixtures.
- Schemas e contratos partilhados para cenários, relatórios e findings.
- Helpers de scoring e métricas de deteção.
- Base do Design Lab.

**Ainda não demonstrado:** um runner completo de experiências pareadas, com workspaces isolados, captura reproduzível e comparação real de resultados.

### Fase 2 — Deterministic Direction foundation

**Estado: implementada para DL-001.**

- Direction Artifact 1.1.0 com oito secções.
- Context contracts e normalizador determinístico.
- Factos de projeto e restrições estruturadas hard/soft.
- Resolver com restrições rígidas antes da precedência brief > rule > ai > default.
- Geração DL-001, serialização canónica e validação em quatro camadas.

A conclusão limita-se a DL-001. Não representa cobertura de geração para todos os cenários.

### Fase 2.1 — Agent integration foundation

**Estado: contrato e handoff implementados; integração de agente ainda manual.**

- Direction Consumption Report e respetivo schema.
- Contrato provider-agnostic para agentes consumidores.
- Visual Intelligence Bundle 1.1.0, determinístico, offline e validado.
- CLI para gerar Direction Artifacts e Visual Intelligence Bundles.
- Limites de escrita: os outputs gerados ficam em .integra/runs/, com verificação de paths, diretórios e inputs protegidos.
- Skill e comando /integra:visual-intelligence.

**Ainda não demonstrado:** um agente externo a consumir automaticamente o Bundle, devolver um relatório de consumo e produzir uma interface testada no browser. O handoff existe; o adapter/runner universal não.

### Fase 2.2 — Visual knowledge foundation

**Estado: biblioteca e retrieval iniciais implementados.**

- 72 fontes visuais, 10 providers de assets e 61 mapeamentos de nicho.
- 8 receitas de tokens, 20 padrões de layout, 32 regras, 21 anti-patterns e 7 exemplos.
- 2 observações page-scoped, ambas official-documentation, partial e confiança média.
- Retrieval determinístico, offline-first, com candidatos separados de decisões.
- Bundle preserva status, proveniência, âmbito e limitações das observações.

**Limite importante:** existem apenas duas observações documentais parciais. O catálogo não é uma biblioteca de interfaces diretamente verificadas. Não há ainda cobertura direta de produto autenticado, screenshots sistemáticos ou estados interativos reais.

### Fase 2.3 — Live Inspector hardening

**Estado: primeira versão funcional e contratos de revisão implementados.**

- Plugin Vite apply: serve, com carregamento tardio e sem injeção em produção.
- Quick Canvas e Inspector partilham uma sessão de seleção.
- Pré-visualizações temporárias de classes e propriedades visuais permitidas.
- Histórico limitado, Undo/Redo e restauração no encerramento.
- Reativação do bootstrap depois de o controller ser descartado.
- Elementos DOM desligados são removidos do diff atual e contabilizados no pacote de revisão.
- Review Package 1.1.0 inclui viewport, modo, diffs, targets obsoletos, limitações e política de aprovação.

**Ainda fora do âmbito:** source-map resolution, mapeamento automático DOM → TSX, aplicação de patches, navegação completa da árvore DOM e browser automation multi-viewport.

### Fase 2.5 — Static source QA & pilot contracts

**Estado: primeira camada de preparação implementada; runtime QA ainda não coberta.**

- Static audit TSX/JSX + CSS com localização, regra, severidade, confiança, excerpto e status heuristic.
- JSON schema versionado para o relatório.
- Sinais para alt de imagens, nomes acessíveis, labels de forms, semântica teclado, foco, reduced motion e cores utilitárias hardcoded.
- Parser diagnostics incluídos; valores dinâmicos não são tratados como ausentes quando não podem ser determinados estaticamente.
- direction:consumption:validate verifica schema, artifact ID e cobertura exata de decisões/recomendações.
- pilot:prepare prepara um pacote controlado para comparação baseline vs Integra-guided.

**Limite:** a análise estática não executa browser, não mede contrastes, não verifica operações reais de teclado ou leitores de ecrã, nem prova a qualidade do design. Os findings são heurísticas; o piloto ainda exige execução manual com agente externo.

### Fase 2.4 — Refinement & evidence foundation

**Estado: primeira camada implementada.**

- Auditoria de contraste para estados avaliáveis e inconclusivos.
- Quality Audit baseada apenas em observações fornecidas.
- Heurísticas de espaçamento e nesting exigem baseline de projeto explicitamente fornecida.
- Findings separam evidência verificada de heurísticas.

**Ainda fora do âmbito:** parser DOM/AST abrangente, auditoria WCAG completa, avaliação visual automática e validação visual independente.

## Primeiro teste — DL-001 First Agent Pilot

**Preparação automatizada disponível; execução externa ainda manual.** O comando `npm run pilot:prepare` gera o pacote com brief, prompt de tarefa idêntico para as duas condições, Direction Artifact 1.1.0, Visual Intelligence Bundle 1.1.0, instruções/contrato do agente, critérios de aceitação e hashes. O comando valida os dois artefactos centrais, protege os inputs e escreve em `.integra/runs/`. O agente e o browser ainda não são invocados automaticamente.

O comando `npm run direction:consumption:validate -- --artifact direction.json --report consumption-report.json` valida o schema e garante que o relatório cobre exatamente cada decisão e recomendação uma vez. Isto verifica cobertura do autorrelato, não a veracidade dos outcomes.

Objetivo do piloto: provar, ou refutar, se o Bundle melhora a implementação de um agente externo sem introduzir regressões.

1. Executar `npm run pilot:prepare` e preservar o manifest/hashes gerados.
2. Escolher um agente, versão, modelo e configuração; registar esses valores.
3. Executar o mesmo agente em dois workspaces limpos: baseline e Integra-guided, sem partilhar contexto entre runs.
4. No segundo run, entregar o Direction Artifact e Bundle 1.1.0, mantendo o mesmo brief e prompt base.
5. Guardar outputs, screenshots nos dois viewports, hashes, logs e testes.
6. Validar o report do agente com `direction:consumption:validate`, mas não usar o autorrelato como prova independente.
7. Verificar os mesmos critérios nos dois resultados e documentar ganhos, regressões, inconclusivos e limites.

O piloto é manual nesta fase. Não criar um runner genérico antes de saber quais os inputs, permissões e outputs efetivamente necessários.

## Fase 3 — Reproducible execution & experiment runner

- Preparação de workspaces descartáveis.
- Captura de versões, configuração, prompts, logs e hashes.
- Execução baseline vs guided com variáveis controladas.
- Artefactos de run isolados e relatório mesmo em caso de falha.
- Limpeza segura e preservação de inputs.

Só avançar depois do piloto mostrar quais os passos que precisam de automação.

## Fase 4 — Visual Validation & source mapping

- Adapter browser opcional para screenshots e estados.
- Comparação da intenção do Direction Artifact com a implementação real.
- Source mapping com evidência de AST/source-map, sem inferir ficheiros a partir de seletores.
- Contrast, keyboard, responsive, interaction e visual findings com estado e confiança.
- Review package unificado para Bundle + Live + QA.

Nenhuma comparação visual deve produzir um finding confirmado apenas por semelhança estética; exige tarefa, estado, viewport e evidência.

## Fase 5 — Scenario coverage

Adicionar geradores específicos para DL-002, DL-003, DL-004 e DL-005 apenas quando cada cenário tiver:
- contrato de inputs e outputs;
- regras e restrições próprias;
- fixtures positivas e negativas;
- critérios de aceitação verificáveis;
- testes de regressão.

## Fase 6 — Investigation adapters & optional AI

- Adapters autorizados para browser, documentação e fontes externas.
- Timeouts, cancelamento, quotas e fallback offline.
- Providers opcionais com saída validada e provenance.
- Hard constraints mantidas como gates.
- Conteúdo externo tratado como dados não confiáveis.

## Release gates

- npm run check e matriz CI passam no SHA exato que será revisto.
- Contratos versionados incluem schemas, tipos, fixtures, testes e notas de migração.
- Cada output gerado permanece isolado dos inputs e do source do projeto.
- Nenhum workflow afirma que um host carregou uma Skill sem confirmação real.
- Nenhuma fase é marcada como completa apenas por adicionar ficheiros.
- Resultados de agentes são avaliados independentemente do seu autorrelato.
- Não publicar ganhos visuais, de performance ou WCAG sem evidência reproduzível.
