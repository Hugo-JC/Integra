# Roadmap do Integra

Última atualização: 08/11/2026.

## Direção

Integra transforma contexto em direção visual rastreável, ajuda agentes a implementar e verifica resultados com evidências. Não é apenas um gerador de sites ou uma coleção de prompts.

## Fase 1 — Contracts & Design Lab foundation
**Concluída.** Cinco cenários, schemas, contratos, fixtures e base do Design Lab.

## Fase 2 — Deterministic Direction
**Concluída para DL-001.** Direction Artifact 1.1.0, Context normalizer, factos/restrições estruturadas, resolver, serialização canónica e validação em quatro camadas. A conclusão não cobre os outros cenários.

## Fase 2.1 — Agent integration
**Base implementada.** CLI de geração/validação, Agent Integration Contract, Direction Consumption Report, Design Experiment Record e protocolo baseline vs Integra-guided.

## Fase 2.2 — Portable Design Intelligence
**Adicionada nesta branch.**
- Oito Agent Skills para direção, geração, refatoração, QA, Live Inspector, investigação, acessibilidade e performance.
- Guia de projeto para Gemini CLI.
- Nove presets contextuais validados.
- Biblioteca migrada do ADE com 61 perfis de nicho, 17 estilos e referências/regras originais.
- Standard de design, anti-pattern policy e vocabulário de comandos especializados inspirado em Impeccable.

## Fase 2.3 — Live Inspector & Evidence QA
**Fundação experimental implementada.**
- Seleção pointer com overlay azul #3B82F6.
- Preview de classes, cores, radius e padding.
- Diff de classes/estilos e prompt de handoff.
- Estimativa WCAG AA para cores opacas e alpha compositing simples.
- Findings tipados e evidence records.

Limites: sem source-map adapter, persistência de source, keyboard picker completo, browser runner ou scanner AST. Não declarar conformidade WCAG do website a partir desta fase.

## Próximo marco — validação
1. Executar CI no head exato do PR e corrigir falhas.
2. Testar o inspector numa página local simples e num projeto React/Vite.
3. Verificar restore/revert, click interception, classes e style diff.
4. Testar transparência, fundos com imagem/gradiente e zoom/responsive.
5. Atualizar exemplos com resultados observados.

## Fase 3 — Runner & experiments
Workspaces isolados, versions/hashes, logs, screenshots, runs repetíveis, relatórios de falha e limpeza segura.

## Fase 4 — Refinement & evaluators
Adapter DOM/browser, axe-core opcional, TypeScript AST, responsive tests, findings baseados em evidências e deteção de regressões.

## Fase 5 — Scenario coverage
Implementar DL-002, DL-003 e DL-005 com regras e fixtures específicas. DL-004 continua como avaliação de interfaces genéricas.

## Fase 6 — Investigation adapters & optional AI
Adapters autorizados para fontes externas; providers opcionais com timeout, cancelamento, validação, fallback determinístico e respeito por hard constraints.

## Release gates
Nenhuma fase é concluída apenas por adicionar ficheiros. Checks têm de passar no head exato. Relatórios autoavaliados por agentes não substituem avaliação independente. Não publicar ganhos sem experiências reproduzíveis.
