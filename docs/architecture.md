# Integra — arquitetura

Integra é um motor modular de inteligência de design. O núcleo determinístico não depende de browser, framework, IA ou providers. Skills, presets, Live Inspector e adaptadores são camadas isoladas que consomem contratos comuns.

~~~text
Brief → Context → Direction + Preset → Direction Artifact
                                      ↓
                           Visual Intelligence Bundle
                                      ↓
                             Agent Skills / external agent
                                      ↓
                           implementation / Live Inspector
                                      ↓
                              Refinement + Design QA
                                      ↓
                            evidence-backed findings
                                      ↓
                                 Design Lab

Investigation → references, observations, evidence records
~~~

## Módulos

- **Shared contracts:** definem formatos serializáveis, versionados e independentes de fornecedores.
- **Context:** normaliza contexto estruturado fornecido pelo chamador, preserva a ordem, remove duplicados triviais, valida factos e restrições e regista campos ausentes sem inferir valores.
- **Direction:** gera decisões de sistema e recomendações contextualizadas nas oito áreas do Direction Artifact; o submódulo `presets` fornece uma sugestão contextual de estilo/nicho, com alternativas e baixa confiança explícitas.
- **Visual Intelligence Bundle:** combina um Direction Artifact validado, tarefa fornecida pelo chamador e o Knowledge Pack offline; mantém candidatos distintos de decisões e observações.
- **Resolver:** filtra candidatos incompatíveis com restrições rígidas antes de aplicar a precedência de proveniência. Se uma comparação não puder ser feita com segurança, o resultado é inconclusivo.
- **Artifact validation:** verifica estrutura, semântica, restrições e consistência em quatro camadas ordenadas.
- **Agent consumer:** interpreta o artefacto e devolve outcomes por decisão e recomendação. O relatório é auto-relatado, não uma prova independente.
- **Design Lab:** compara execuções com variáveis controladas e avalia os resultados por evidências.
- **Refinement:** identifica problemas, explica o impacto e recomenda melhorias verificáveis; a auditoria de contraste DOM é uma primeira fatia e não uma auditoria WCAG completa.
- **Investigation:** integra referências, ferramentas ou fontes externas através de adaptadores opcionais.
- **Quality Gate:** aplica regras bloqueantes objetivas e conserva resultados inconclusivos e não verificáveis.

## Direction Artifact

O artefacto contém Visual Identity, Color System, Typography, Layout & Composition, Component Principles, Motion & Interaction, Accessibility e Implementation Guidance. As decisões registam origem e razão; recomendações heurísticas usam [R]. A validação tem quatro camadas: structural, semantic, constraints e consistency.

src/modules/refinement/audits/ contém verificadores objetivos independentes. src/modules/live-inspector/ é uma ferramenta de browser de desenvolvimento, não parte do núcleo determinístico. src/modules/context/ contém a implementação pura de normalização. src/modules/direction/ contém proveniência, compatibilidade com restrições, geração e validação. src/cli/ fornece fronteiras de comando para workflows locais; não contém regras de design.

## Presets e legado

presets/manifest.json indexa nove presets para developer tools, productivity, commerce, analytics, education, editorial, media, community/gaming e public services.

references/ade-knowledge/ preserva o corpus legado do AI Design Engine. Os estilos antigos são referências, não regras universais. #050505 / #111111 não são a paleta obrigatória do Integra. #3B82F6 é a assinatura do overlay do Live Inspector.

## Live Inspector

Usa DOM APIs e Shadow DOM, sem dependência de React, Tailwind ou provider de IA. O plugin Vite é opcional, usa `apply: 'serve'` e carrega o módulo apenas depois do atalho local; builds de produção não recebem o bootstrap. O listener de bootstrap mantém-se disponível para recriar o controller depois de Escape o descartar.

Quick Canvas e Inspector partilham uma sessão. As previews limitam-se a classes existentes, cor do texto, cor de fundo, border radius e padding; o histórico é limitado e restaura os atributos originais. Elementos removidos pelo framework deixam de ser targets válidos e são excluídos dos diffs ativos. O Review Package 1.1.0 regista viewport, modo, targets ligados/desligados, limitações, source mapping não resolvido e a fronteira de aprovação.

O seletor CSS identifica um elemento renderizado, não um ficheiro TSX. sourceHint só é aceite quando fornecido explicitamente e continua não verificado. O Live não escreve source, não resolve source maps, não aplica patches e não é um ambiente de produção. Browser automation multi-viewport e source mapping são etapas futuras.

A geração determinística do Direction Artifact atualmente cobre DL-001. O router de presets pode funcionar independentemente, mas não implica que todos os cenários tenham geradores completos. Os restantes cenários só serão adicionados quando as suas necessidades justificarem regras específicas. Não há presets globais de estilo.

## Quality & evidence

auditDesignQuality() avalia apenas observações fornecidas. As heurísticas de espaçamento e nesting exigem uma escala ou limite explicitamente fornecido pelo projeto; o motor não assume um grid universal. createDesignEvidence() valida registos de investigação sem fazer fetch da URL. Não há score global e não se declara WCAG compliance a partir de verificações parciais.

## Stack

Node.js 24, TypeScript strict, JSON Schema, Vitest, tsx e browser APIs nativas. Playwright, axe-core, TypeScript AST, Vite/React adapters e providers são extensões opcionais; não são dependências do core.

## Live Inspector e Design QA

O Design QA executa heurísticas AST sobre JSX/TSX. Os resultados não substituem testes de browser, avaliação humana ou medições reais.
O Live Inspector corre no browser do projeto local, opera por cima do DOM e exporta um diff para revisão. Não altera source code, não envia dados a providers e não deve ser ativado em produção.

## Reprodutibilidade e limites

O artefacto direciona um agente de implementação; não prova que o site criado esteja correto. Avaliação visual, browser runner, mutação de projetos e geração de aplicações inteiras permanecem fora do âmbito do núcleo atual.


## Agent knowledge and local tooling
`.agents/skills/` is the canonical Agent Skills directory. `.agents/skills/integra/` is the orchestration entry point; specialist directories provide focused workflows. `GEMINI.md` and `AGENTS.md` route host agents. The preset catalog migrates AI Design Engine v3 niche/style knowledge and exposes deterministic offline discovery. Presets and experience archetypes are contextual references, not universal templates.

Live Inspector is an optional browser adapter. It uses Vite `apply: 'serve'`, Shadow DOM, temporary DOM previews and a serializable diff. It does not mutate source code, resolve source maps or become a production runtime dependency.

## Camada de Agent Skills e motion

`.agents/skills/` é a fonte canónica de instruções portáteis. A skill `integra` coordena o trabalho; as skills especialistas tratam uma capacidade por vez. O manifesto em `commands/manifest.json` liga intenções e modificadores às skills corretas, sem prometer que todos os hosts registam comandos nativos automaticamente.

`integra-animate` é a especialista para motion design e engenharia de interação. Produz uma Motion Brief com tese, momento focal, continuidade, feedback, orçamento, timing, easing, comportamento interrompível, alternativa para `prefers-reduced-motion` e plano de verificação. A implementação reutiliza o stack existente; não adiciona uma biblioteca por defeito.

Motion é uma camada de orientação, não um runtime adicional. O bundle do `integra-cli` inclui a skill e os avisos/licenças de terceiros, mas não inclui os binários, scripts ou dependências do Impeccable.


## Visual knowledge library v2

`data/design-library/` separates explained visual source leads, asset providers, niche mappings, page-level observations, semantic token recipes, task/mode-aware layout patterns, conditional design rules, anti-pattern hypotheses and illustrative examples. `.agents/skills/integra-visual-knowledge/` governs curation and consumption. `src/modules/direction/knowledge/` provides deterministic offline retrieval with bounded tokenization caching, match reasons and explicit safeguards; `visual-intelligence-bundle.ts` adds Bundle 1.1.0 around the validated Direction Artifact and Knowledge Pack. Neither layer crawls external sources, applies tokens, verifies asset licences or mutates a receiving project. Source leads and page observations stay separate: one partial documentation record does not verify an entire source.
