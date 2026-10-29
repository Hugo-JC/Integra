# Matriz de rastreabilidade

| Requisito | Cenário | Evidência nesta Fase 1 | Automação atual |
|---|---|---|---|
| Personalidade visual e hierarquia | DL-001 | briefing + critérios | manifesto/fixture validado; avaliação visual futura |
| Densidade e consistência | DL-002 | briefing + critérios | manifesto/fixture validado; avaliação de UI futura |
| Acessibilidade e estados vazios | DL-003 | briefing + critérios WCAG | manifesto/fixture validado; checks ainda não integrados |
| Precisão e recall de findings | DL-004 | referência de findings | helpers de métrica + testes |
| Integridade de projeto React | DL-005 | fixture sintética + finding reference | manifesto validado; execução isolada futura |
| Relatório normalizado | Todos | `schemas/report.schema.json` + exemplo | validação por schema |
| Pontuação ponderada | Todos | `src/lab/scoring.ts` | testes unitários |
| Não ocultar falhas | Todos | estados `inconclusive` / `error` | testes de contrato e helpers |

Esta matriz separa o que está preparado nesta versão do que será automatizado nas fases seguintes.
