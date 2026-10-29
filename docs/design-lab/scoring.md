# Scoring e interpretação

## Pontuação ponderada

Cada critério recebe uma nota inteira entre 0 e 100. Os pesos de um cenário têm de somar exatamente 100. A pontuação é `sum(score_i * weight_i / 100)`.

Se qualquer critério obrigatório não tiver nota, a pontuação final é `null`. Não preencher lacunas com zero nem renormalizar silenciosamente pesos: isso poderia tornar resultados incompletos artificialmente favoráveis.

## Limiares iniciais

- DL-001: 80/100
- DL-002: 80/100
- DL-003: 85/100
- DL-004: 80/100, sujeito também aos limiares específicos de precisão, recall e utilidade humana.
- DL-005: 80/100, sujeito às condições de integridade e ausência de regressões críticas.

## Qualidade de deteção

A lista de problemas verdadeiros deve ser anotada antes de executar o motor e revista por um avaliador. A correspondência de findings deve considerar categoria, localização/contexto e o mesmo problema subjacente. Vários avisos duplicados para o mesmo defeito não devem ser contados como deteções independentes.

Limiar inicial de DL-004: precisão ≥ 0,85; recall ≥ 0,75; utilidade humana ≥ 4/5; nenhum falso positivo crítico. Calibrar estes limites com uma amostra real.

## Estados do gate

- `passed`: métricas necessárias calculadas, sem falhas obrigatórias e pontuação acima do limiar.
- `failed`: uma condição bloqueante falhou ou a pontuação ficou abaixo do limiar.
- `inconclusive`: faltam evidências ou verificações necessárias; não equivale a aprovado.
- `error`: a execução do próprio laboratório falhou tecnicamente.

## Avaliação humana visual

Usar ao menos dois avaliadores quando possível, com grelha de avaliação e briefing à vista. Registar divergências e a justificação; não esconder desacordos dentro de uma média. Separar a nota estética da verificação objetiva.
