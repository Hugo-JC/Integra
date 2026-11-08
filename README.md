# Integra — AI Design Engine v5

**Um motor modular de inteligência de design que transforma contexto em direção visual, ajuda agentes a implementar melhor e verifica resultados com evidências.**

Integra não é um gerador de sites nem impõe uma estética universal. É uma camada entre a intenção do produto, o agente que implementa a interface e os mecanismos independentes de qualidade.

## Capacidades

| Área | O que entrega | Estado |
|---|---|---|
| Context | Normalização de brief, factos, restrições e informação ausente | Implementado |
| Direction | Direction Artifact determinístico, com proveniência e oito áreas | DL-001 implementado |
| Presets | Direções contextuais versionadas, sem paleta universal obrigatória | Novo |
| Agent Skills | Competências portáveis para Gemini CLI, Codex e agentes compatíveis | Novo |
| Live Inspector | Seleção DOM, preview de estilos, diff e prompt para refatoração | Novo, opt-in |
| Contrast QA | Estimativa WCAG AA em runtime para cores opacas simples | Novo |
| Design QA | Findings determinísticos a partir de evidências estruturadas | Novo |
| Investigation | Catálogo de fontes e registo de evidências/limitações | Fundação |
| Design Lab | Comparação controlada baseline vs Integra-guided | Contratos e helpers |

## Princípios

1. Contexto antes de estética: audiência, tarefas, conteúdo, plataforma e restrições vêm antes do preset.
2. Presets como ponto de partida: nunca substituem identidade de marca nem instruções explícitas.
3. Sem estética universal: #050505 e #3B82F6 não são a paleta obrigatória de todos os produtos. O azul #3B82F6 é a assinatura do overlay do Live Inspector.
4. Evidence-first: distinguir observação direta, inferência, sugestão e informação desconhecida.
5. Acessibilidade como requisito: não remover semântica, foco, teclado, contraste ou reduced motion por estética.
6. Regras explicáveis: cada finding tem regra, evidência, impacto, severidade e verificação.
7. IA é opcional: o caminho determinístico não depende de API keys, rede ou provider.
8. Sem mutação silenciosa: Live Inspector altera apenas o DOM em memória; aplicar no código exige revisão explícita.

## Stack

- Node.js 24 + TypeScript strict.
- JSON Schema para contratos serializáveis.
- Vitest + tsx para testes e scripts.
- Browser APIs + Shadow DOM para Live Inspector, sem framework obrigatório.
- React/Vite são alvos de integração, não dependências do núcleo.
- Tailwind, shadcn/ui, Radix ou CSS Modules só são usados quando o projeto de destino os justifica.

Não adicionámos dependências runtime para o Live Inspector.

## Começar

~~~bash
npm ci
npm run check
~~~

O check inclui typecheck, testes, validação de fixtures, Agent Skills e presets.

## Direction CLI

~~~bash
npm run direction:generate
npm run direction:generate -- --scenario DL-001 --input ./brief.json --out ./.integra/runs/my-direction.json
npm run direction:validate -- --input ./.integra/runs/my-direction.json
~~~

## Agent Skills

As skills seguem o formato aberto Agent Skills e vivem em .agents/skills/. O Gemini CLI reconhece esta localização como diretório de workspace; agentes compatíveis podem carregar a mesma skill sob demanda.

- integra-design-direction — transformar o contexto em direção de design.
- integra-ui-generator — gerar interfaces contextualizadas e implementáveis.
- integra-refactor-agent — refatorar componentes existentes sem quebrar comportamento.
- integra-design-qa — auditar qualidade visual e estrutural com evidências.
- integra-live-inspector — converter inspeções do browser em mudanças rastreáveis.
- integra-reference-investigator — investigar referências sem copiar implementação ou assets.
- integra-a11y-audit — auditoria de acessibilidade e WCAG.
- integra-performance-audit — auditoria de renderização, carregamento e custo de interação.

O ficheiro GEMINI.md resume as regras gerais para Gemini CLI.

## Live Inspector

Módulo opcional em src/modules/live-inspector/. O runtime destaca elementos com uma borda azul Integra, permite selecionar com o rato e editar classes, cores, radius e padding, calcula uma estimativa de contraste e gera um diff/prompt para um agente.

Limites importantes: não identifica automaticamente ficheiros TSX a partir do DOM; sourceHint é opcional e explícito. Contraste é inconclusivo para transparências, imagens, gradientes, pseudo-elementos e camadas complexas. As alterações são temporárias e não são escritas no source. Não exponhas o inspector em produção.

Ver docs/live-inspector.md.

## Presets e referências

- presets/manifest.json — catálogo versionado.
- presets/*.json — nove direções contextuais.
- references/catalog.json — sistemas, documentação e ferramentas de referência.
- docs/design-quality-standard.md — regras e critérios de qualidade.
- docs/reference-investigation.md — método evidence-first inspirado em REA.

## Próximo marco

1. Ligar Live Inspector a um adaptador Vite/React que resolva source maps de forma verificável.
2. Adicionar browser tests com Playwright e auditoria axe-core como dependências opcionais.
3. Expandir Direction para DL-002 e DL-003 com regras específicas e fixtures.
4. Criar detetores AST/DOM para anti-padrões que podem ser medidos com fiabilidade.
5. Executar o piloto DL-001 em workspaces equivalentes e comparar evidências.

## Limites atuais

A direção determinística completa continua limitada a DL-001. O Live Inspector é uma fundação browser-only, sem adaptador Vite, persistência de source ou execução de agentes. Design QA avalia evidências estruturadas; ainda não interpreta automaticamente todos os ficheiros TSX. Investigation fornece método, catálogo e contratos, não crawling arbitrário. Não afirmamos melhorias de qualidade antes de as medir no Design Lab.
