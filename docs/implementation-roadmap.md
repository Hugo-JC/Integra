# Roadmap do Integra

## Fase 1 — Contratos e fixtures (fundação concluída)

Esquemas, manifests dos cinco cenários, briefings, dados de referência, contratos TypeScript e helpers de scoring. A Fase 1 permanece como base do Design Lab.

## Fase 2 — Direction Engine híbrido (em implementação)

Objetivo: transformar briefings e contexto de projeto numa direção visual estruturada, verificável e independente de fornecedores.

### Concluído nesta fatia

1. **Direction Artifact 1.1.0:** oito áreas obrigatórias, proveniência, caminhos de origem e validação estrutural.
2. **Context contracts:** contrato partilhado em src/contracts/, factos tipados e restrições estruturadas, mantendo texto livre para leitura humana.
3. **Context normalizer:** normalização determinística, Unicode NFC, deduplicação estável, limites, null/vazio como ausente e diagnósticos agregados.
4. **Resolver mínimo:** restrições rígidas são aplicadas antes da precedência de decisões; conflitos ou comparações impossíveis permanecem inconclusivos.
5. **Direction Engine DL-001:** primeira geração determinística das oito áreas, sem IA, com provenance e serialização canónica.
6. **CI:** typecheck, testes e validação de fixtures em GitHub Actions.

### Próximas implementações

1. **Completar o Resolver e a validação do artefacto:** estrutural, semântica, restrições e consistência; se a validação estrutural falhar, as camadas seguintes ficam not_run.
2. **Expandir o motor por cenário:** acrescentar DL-002, DL-003 e DL-005 quando os seus dados estruturados e regras específicas estiverem definidos; DL-004 continua focado em avaliação, não em criação de estilo.
3. **AI Provider Layer:** uma única porta de pedido para candidatos, schema validation, timeout e fornecedor falso nos testes. IA opcional, sem alterar a saída determinística em caso de falha.
4. **Design Lab Integration:** comparar execução com e sem Direction Artifact e conservar artefactos, versões e limitações.
5. **Extração de briefings:** melhor esforço, com alias PT/EN e missingInformation para tudo o que não puder ser extraído com confiança. Um formato estruturado continua a ser a entrada principal.

## Fase 3 — Runner e artefactos de execução

- Carregar manifest validado.
- Criar workspace temporário com limites claros.
- Separar inputs de outputs.
- Recolher logs e hashes de artefactos.
- Produzir relatório por cenário, mesmo quando uma etapa falha.
- Testar repetição de execução e limpeza de workspaces.

## Fase 4 — Evaluators automáticos e Refinement

- Acessibilidade automatizada com limites documentados.
- Verificação de conteúdo e estados obrigatórios.
- Métricas de findings conhecidos e falsos positivos.
- Comparação de baseline e detecção de regressões.
- Auditorias com evidências e recomendações verificáveis.

## Fase 5 — Investigation, adaptadores e integração contínua avançada

- Adaptadores opcionais para ferramentas externas.
- Aprovação explícita de baseline.
- Jobs especializados de CI para execução isolada.
- Deploy apenas depois de definir o ambiente e validar segredos, comandos e permissões.

## Princípios de release

- Nenhuma fase é considerada concluída só por haver ficheiros.
- A conclusão exige testes executados, resultados guardados e limitações documentadas.
- O caminho determinístico deve funcionar sem fornecedores externos.
- Sugestões de IA nunca ultrapassam restrições explícitas nem regras obrigatórias.
- Critérios WCAG estabelecidos não são confundidos com recomendações heurísticas ou preferências estéticas.
