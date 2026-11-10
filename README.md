# Integra — AI Design Engine v5

**Motor modular de direção de design, inteligência visual e qualidade para agentes de IA.** O Integra transforma briefs e contexto em decisões verificáveis; ajuda os agentes a implementar e permite inspecionar e auditar resultados.

> Esta branch acrescenta uma biblioteca contextual de presets, routing determinístico, skills interoperáveis, QA estático e um Live Inspector de browser. Não afirma que a qualidade visual de um website melhorou sem uma experiência controlada.

## O que o Integra faz

- **Direction:** converte intenção, contexto e restrições em direção visual rastreável.
- **Design Intelligence:** 17 estilos, 61 presets de nicho e 14 fontes importadas do AI Design Engine.
- **Refinement:** verifica problemas objetivos e classifica resultados inconclusivos sem inventar conformidade.
- **Live Inspector:** seleciona elementos DOM, pré-visualiza alterações e exporta um diff para revisão no código-fonte.
- **Design QA:** verifica padrões estáticos em JSX/TSX e conduz auditorias independentes.
- **Investigation:** guia pesquisa baseada em hipóteses, evidências, confiança e limitações.
- **Design Lab:** compara resultados baseline vs Integra-guided com variáveis controladas.

## Começar

Requisitos: Node.js 24 e npm 10 ou superior.

~~~bash
npm ci
npm run check
~~~

## Direção e presets

O router usa expressões completas, normaliza acentos e dá prioridade a termos fortes sobre termos genéricos. Empates e correspondências fracas exigem confirmação. O preset é uma sugestão contextual, nunca um tema obrigatório.

~~~bash
npm run design:route -- "SaaS developer AI platform"
npm run design:route -- "clínica de estética premium" --json
npm run design:route -- "marketplace de produtos artesanais" --tone calm --json
~~~

Os estilos e presets estão em `data/design-library/`. O manifesto preserva a origem e a política de utilização. Referências servem para estudar princípios; não copiar páginas, marcas ou layouts distintivos.

## Design QA

~~~bash
npm run design:qa -- src/
npm run design:qa -- src/ --json
npm run design:qa -- src/ --strict
~~~

Regras atuais incluem imagens sem alt, elementos não nativos clicáveis sem semântica/teclado, remoção de outline sem substituto e cores hex hardcoded como sugestão. O scanner é estático: não prova contraste real, responsividade nem qualidade visual.

## Live Workbench (local development only)

O Live Workbench oferece Quick Canvas para ajustes rápidos e Inspector para diagnóstico detalhado. É independente de framework e não acrescenta dependências de runtime. Ativa-o apenas num entrypoint de desenvolvimento (por exemplo, Vite):

~~~ts
if (import.meta.env.DEV && import.meta.env.VITE_INTEGRA_LIVE === 'true') {
  void import('./modules/live-inspector/index.js').then(({ startIntegraInspector }) => {
    startIntegraInspector();
  });
}
~~~

Usa `Alt + Shift + I` para abrir/fechar rapidamente o Live depois de registar o plugin. Hover e seleção usam o azul Integra `#3B82F6`; **↑ Pai** sobe na árvore DOM. Podes pré-visualizar classes, cores, tamanho de texto, padding e radius; consultar o contraste; repor o estado; e copiar o DOM diff.

O inspector:
- Está limitado a localhost por defeito.
- Não escreve ficheiros, não chama agentes e não envia dados para uma API.
- Não garante que uma alteração persista após um re-render React/Vue/Svelte.
- Só oferece um selector DOM best-effort; um caminho de ficheiro só existe quando a aplicação fornece explicitamente `data-integra-file`.
- Deve ser removido/destruído antes de uma release de produção. Não enfraquecer CSP para o ativar.

Ver [docs/live-inspector.md](docs/live-inspector.md).

## Skills e compatibilidade de agentes

Skills canónicas vivem em `.agents/skills/*/SKILL.md` no formato Agent Skills. Codex, Gemini CLI, Cursor e superfícies compatíveis do GitHub Copilot descobrem esse diretório; Claude Code requer um link em `.claude/skills/`. `AGENTS.md`, `GEMINI.md` e `CLAUDE.md` continuam a fornecer contexto do projeto, mas não instalam Skills automaticamente. Consulte [compatibilidade, instalação e validação por host](docs/agent-compatibility.md).

Skills canónicas:
- `integra-ux-shape` — enquadramento de tarefas, fluxos, IA e estados.
- `integra-design-direction` — direção visual, tokens e composição.
- `integra-design-system` — tokens, componentes, variantes e migração.
- `integra-ui-generator` — geração de UI React/TypeScript.
- `integra-refactor-agent` — refactor seguro com preservação de comportamento.
- `integra-design-qa` — revisão UX, visual e responsiva com findings.
- `integra-accessibility-audit` — auditoria WCAG 2.2 com evidência.
- `integra-performance-audit` — diagnóstico de performance com medições.
- `integra-investigation` — investigação de referências e documentação.
- `integra-reference-investigator` — extração de princípios de referências.
- `integra-live-inspector` — inspeção DOM local e preview reversível.
- `integra-colorize` — estratégia de cor, tokens semânticos e verificação de contraste.

`integra-direction` permanece como alias legado até ser consolidada em `integra-design-direction`.

## Princípios de qualidade

1. Produto e conteúdo antes da decoração.
2. Direção visual contextual; nunca uma paleta universal.
3. Hierarquia tipográfica e espaçamento intencionais.
4. Componentes semanticamente corretos e acessíveis.
5. Estados completos e feedback de interação.
6. Motion com propósito e respeito por reduced-motion.
7. Performance medida; sem memoização indiscriminada.
8. Factos, preferências, heurísticas e requisitos separados.
9. WCAG AA/AAA calculado com cores efetivamente compostas quando possível.
10. Evidência e confiança acompanham as conclusões.

## Núcleo e limites

O núcleo determinístico continua provider-agnostic e sem API keys. A geração de Direction Artifact continua implementada para DL-001; os restantes cenários precisam de geradores e testes próprios. O Live Inspector é um preview DOM, não um editor de source code. O scanner é heurístico e estático. O runner visual multi-viewport, auto-mutation de projetos e adaptadores externos de investigação permanecem marcos futuros.

## Documentação

- docs/ — arquitetura, decisões, contratos e roadmap.
- schemas/ — contratos JSON versionados.
- scenarios/ — os cinco cenários do V5 Design Lab.
- fixtures/ — dados e exemplos de referência.
- src/contracts/ — formatos partilhados.
- src/modules/context/ — normalização e validação do contexto.
- src/modules/direction/ — proveniência, resolver, geração e validação.
- src/cli/ — fronteira de aplicação para comandos locais.
- src/lab/ — helpers de avaliação.
- scripts/ — CLI e validação de fixtures.
- tests/ — testes unitários e de contrato.


## Agent Skills, design knowledge and Live Inspector

Integra distributes portable Agent Skills from `.agents/skills/`. Gemini CLI, Codex, Claude Code, Cursor and other compatible agents can read the relevant skill through their workspace conventions; `GEMINI.md` describes Gemini-specific routing.

The `integra` skill is the orchestration entry point. Specialist skills include `integra-ux-shape`, `integra-design-direction`, `integra-ui-generator`, `integra-refactor-agent`, `integra-design-qa`, `integra-accessibility-audit`, `integra-performance-audit`, `integra-investigation`, `integra-reference-investigator`, `integra-design-system`, `integra-colorize` and `integra-live-inspector`. `integra-direction` remains a legacy alias.

### Local design intelligence
The predecessor AI Design Engine v3 niche/style catalogs are preserved in `presets/`. Discover offline candidates with:

```bash
npm run direction:presets -- "fintech para pagamentos em Angola"
```

Matches are advisory and subordinate to explicit brief facts, hard constraints and the existing product identity. The repository also includes contextual experience archetypes, evidence-led quality rules and agent prompt vocabulary.

### Live Inspector (Vite development only)
```ts
import { defineConfig } from 'vite';
import { integraLiveInspectorPlugin } from './src/modules/live-inspector/vite-plugin';
export default defineConfig({ plugins: [integraLiveInspectorPlugin()] });
```

Use `Alt + Shift + I` to toggle. Hover and click to select an element, preview color/spacing/class changes, then export an exact diff and agent prompt. The blue outline (`#3B82F6`) is reserved for inspector chrome. Vite integration runs only with `apply: 'serve'`; the preview never writes source files.

Contrast output is a limited estimate for solid colors—not a complete WCAG audit. Gradients, images, transparency and compositing need rendered accessibility verification.

### Reference policy
Impeccable informs command-oriented critique/live workflows; REA informs evidence-oriented investigation and adapter boundaries (REA is not treated as a design system). W3C, WAI-ARIA APG, MDN, React, Vite, Tailwind, Radix, shadcn/ui, Material, Apple HIG, Carbon and Polaris are indexed in `docs/references/sources.json`. References are for study and adaptation, not copying.
