# Fase 1 — Contratos e fixtures

## Objetivo

Deixar os dados de entrada, saídas e regras de avaliação suficientemente explícitos para que o runner futuro não precise inventar significados.

## Entregáveis incluídos

- [x] Catálogo dos cinco cenários com manifests JSON.
- [x] Briefing individual para cada cenário.
- [x] JSON Schema para manifests, relatórios e findings anotados.
- [x] Tipos TypeScript para os contratos principais.
- [x] Funções puras para pontuação e métricas de deteção.
- [x] Testes iniciais de contratos, catálogo e scoring.
- [x] Projeto React sintético para o cenário DL-005.
- [x] Lista de problemas conhecidos para DL-004 e DL-005.
- [x] Documento de decisões arquiteturais.

## Por fazer nesta fase antes de considerar a base congelada

- [ ] Executar `npm install` e `npm run check` no ambiente do utilizador/CI.
- [ ] Rever os schemas e manifests com base em feedback dos testes.
- [ ] Rever a licença e a estratégia de reutilização antes de publicar.
- [ ] Calibrar os pesos com avaliadores humanos.

## Critério de conclusão

O catálogo e os ficheiros JSON passam validação; os testes confirmam os helpers de pontuação; os tipos passam `tsc`; as fixtures têm caminhos resolvidos; as falhas de validadores são reportadas com contexto.

## Próxima fase: runner isolado

Criar interfaces para `ScenarioRunner`, `WorkspaceManager` e `ArtifactCollector`. A primeira implementação deverá apenas carregar manifests, validar entradas e escrever um relatório; não deve ainda executar geração de código automaticamente.
