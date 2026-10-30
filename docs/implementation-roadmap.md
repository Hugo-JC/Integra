# Roadmap do Integra

## Fase 1 — Contratos e fixtures (fundação concluída)

Esquemas, manifests dos cenários, briefings, dados de referência, contratos TypeScript e helpers de scoring. A Fase 1 permanece como base do Design Lab.

## Fase 2 — Direction Engine híbrido (em implementação)

Objetivo: transformar briefings e contexto de projeto numa direção visual estruturada, verificável e independente de fornecedores.

1. **Contracts & Artifact:** contrato versionado do Direction Artifact, oito áreas obrigatórias, proveniência e validação estrutural.
2. **Context Engine (primeira fatia implementada):** normalizador determinístico de contexto estruturado, validação de tipos/chaves, normalização de whitespace, deduplicação estável e identificação explícita de informação em falta. Extração de briefings em texto livre e integração com manifests continuam pendentes.
3. **Deterministic Direction Engine:** decisões e recomendações baseadas em regras, contexto e restrições.
4. **AI Provider Layer:** enriquecimento opcional e agnóstico ao fornecedor, com validação e fallback determinístico.
5. **Resolver & Artifact Validation:** resolução de conflitos, precedência, consistência e validação semântica/estrutural.
6. **Design Lab Integration:** avaliação reproduzível nos cinco cenários existentes.

## Fase 3 — Runner e artefactos de execução

- Carregar manifest validado.
- Criar workspace temporário com limites claros.
- Separar inputs de outputs.
- Recolher logs e hashes de artefactos.
- Produzir relatório por cenário, mesmo quando uma etapa falha.
- Testar repetição de execução e limpeza de workspaces.

## Fase 4 — Evaluators automáticos e Refinement

- Acessibilidade automatizada com limites documentados.
- Verificação de conteúdo/estados obrigatórios.
- Métricas de findings conhecidos e falsos positivos.
- Comparação de baseline e detecção de regressões.
- Auditorias com evidências e recomendações verificáveis.

## Fase 5 — Investigation, adaptadores e integração contínua

- Adaptadores opcionais para ferramentas externas.
- Jobs de CI para testes rápidos e completos.
- Aprovação explícita de baseline.
- Deploy apenas depois de definir o ambiente e validar segredos, comandos e permissões.

## Princípios de release

- Nenhuma fase é considerada concluída só por haver ficheiros.
- A conclusão exige testes executados, resultados guardados e limitações documentadas.
- O caminho determinístico deve funcionar sem fornecedores externos.
- Sugestões de IA nunca ultrapassam restrições explícitas nem regras obrigatórias.
- Critérios WCAG estabelecidos não são confundidos com recomendações heurísticas ou preferências estéticas.
