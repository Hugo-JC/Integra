# Roadmap do Integra

## Fase 1 — Contratos e fixtures (presente)

Esquemas, manifests dos cenários, briefings, dados de referência, contratos TypeScript e helpers de scoring.

## Fase 2 — Runner e artefactos

- Carregar manifest validado.
- Criar workspace temporário com limites claros.
- Separar inputs de outputs.
- Recolher logs e hashes de artefactos.
- Produzir relatório por cenário, mesmo quando uma etapa falha.
- Testar repetição de execução e limpeza de workspaces.

## Fase 3 — Evaluators automáticos

- Acessibilidade automatizada com limites documentados.
- Verificação de conteúdo/estados obrigatórios.
- Métricas de findings conhecidos e falsos positivos.
- Comparação de baseline e detecção de regressões.

## Fase 4 — Direção, refinamento e experiência humana

- Fluxo de geração orientado por contexto.
- Auditorias com evidências e recomendações.
- Grelha de avaliação visual e recolha de avaliações humanas.
- Medição de consistência entre execuções.

## Fase 5 — Adaptadores e integração contínua

- Adaptadores opcionais para ferramentas externas.
- Jobs de CI para testes rápidos e completos.
- Aprovação explícita de baseline.
- Deploy apenas depois de definir o ambiente e validar segredos, comandos e permissões.

## Princípio de release

Nenhuma fase é considerada concluída só por haver ficheiros. A conclusão exige executar testes, guardar resultados e documentar limitações.
