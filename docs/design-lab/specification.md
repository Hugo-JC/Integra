# V5 Design Lab — especificação técnica

**Versão:** 0.1.0 · **Estado:** proposta preparada para implementação

## Propósito

O V5 Design Lab compara versões do Integra através de cenários reproduzíveis. Mede a qualidade visual e funcional, a utilidade dos diagnósticos, a acessibilidade, a integridade do código e as regressões.

A suite não prova sucesso comercial, não determina automaticamente o melhor design possível e não substitui a avaliação humana de estética e usabilidade.

## Princípios

1. Cada finding possui identificador, categoria, gravidade, evidência, impacto, recomendação e estado de verificação.
2. Qualidade visual, qualidade da análise, qualidade técnica e acessibilidade são reportadas separadamente.
3. A preferência estética deve ser contextual: minimalismo, dark mode, gradientes e cantos arredondados não são defeitos universais.
4. Ferramentas ausentes produzem `not_run`, nunca aprovação presumida.
5. Geração não determinística deve ser repetida e analisada pela variação.

## Fluxo de execução previsto

1. Validar manifesto e entradas.
2. Criar workspace isolado.
3. Executar o fluxo sob teste.
4. Guardar artefactos e logs sem os alterar.
5. Executar verificações automáticas aplicáveis.
6. Comparar findings e checks com a referência anotada.
7. Calcular métricas.
8. Emitir relatório validado por esquema.
9. Comparar com a baseline aprovada.
10. Classificar como `passed`, `failed`, `inconclusive` ou `error`.

## Cenários incluídos

| ID | Cenário | Modo | Foco | Limiar inicial |
|---|---|---|---|---:|
| DL-001 | Landing page de produto | generate | personalidade, hierarquia, foco no produto | 80 |
| DL-002 | Dashboard de produtividade | generate | densidade, legibilidade, consistência e estados | 80 |
| DL-003 | Plataforma educativa | generate | acessibilidade, navegação e estados vazios | 85 |
| DL-004 | Interface visualmente genérica | analyze | precisão dos findings e recomendações contextuais | 80 |
| DL-005 | Projeto React existente | analyze-and-fix | integridade do código e ausência de regressões | 80 |

Todos os limiares são hipóteses iniciais. A condição de falha crítica prevalece sobre a pontuação.

## Critérios por cenário

Os pesos e critérios completos encontram-se nos manifests `scenarios/*/scenario.json`. Os briefings descrevem entradas e comportamentos esperados. `fixtures/expected-findings/` contém as primeiras referências anotadas. Nenhum destes ficheiros representa resultados de uma execução real.

## Métricas de deteção

Para problemas conhecidos anotados:

- Precisão = TP / (TP + FP).
- Recall = TP / (TP + FN).
- F1 = 2 × precisão × recall / (precisão + recall).
- Taxa de descoberta falsa = FP / (TP + FP).

Se o denominador for zero, a métrica correspondente será `null` e não zero. Uma verdadeira taxa de falsos positivos estatística exigiria o universo de negativos; por isso, o projeto reporta explicitamente `falseDiscoveryRate` nesta fase.

## Aprovação

Os critérios obrigatórios não podem ser compensados pela média. Uma regressão crítica, alteração fora do âmbito, aviso crítico sem evidência ou check obrigatório não executado impede a aprovação. Os estados `inconclusive` e `error` não passam pelo gate.

## Segurança do projeto de referência

O cenário DL-005 deve executar numa cópia descartável. Credenciais e variáveis de ambiente reais devem ficar fora do workspace. Scripts e comandos da aplicação só devem ser executados após revisão e com permissões mínimas.
