# Integra

**Integra é um toolkit de design engineering e Agent Skills para orientar agentes de IA na criação, evolução e avaliação de interfaces.** Combina contexto de produto, direção visual, conhecimento visual estruturado, workflows de implementação, inspeção local e QA baseado em evidências.

O objetivo não é impor um tema ou gerar interfaces genéricas. É ajudar o agente a compreender o produto, fazer escolhas justificadas, executar o workflow certo e apresentar o que realmente verificou.

## Instalação rápida

**Estado da distribuição:** o pacote `integra-cli` ainda não foi publicado no npm. Depois da publicação e confirmação do nome/versionamento, a instalação num projeto será:

```bash
npx integra-cli init
npx integra-cli list
npx integra-cli doctor
```

Para testar o instalador no checkout atual, constrói primeiro o bundle local e executa o CLI diretamente:

```bash
npm run distribution:build
node packages/cli/bin/integra.js init
node packages/cli/bin/integra.js doctor
```

Depois da publicação, para instalar apenas uma skill especializada noutro projeto:

```bash
npx integra-cli add integra-visual-knowledge
```

A instalação coloca as Agent Skills e o contexto partilhado no workspace. Não instala o runtime TypeScript do Integra nem garante que um host específico carregou ou executou as skills. Consulta o [guia do CLI](packages/cli/README.md) e a [matriz de compatibilidade](docs/agent-compatibility.md).

## Live Workbench (desenvolvimento local)

O Live Workbench oferece **Quick Canvas** para pré-visualizações rápidas e **Inspector** para diagnóstico detalhado. É independente de framework e não acrescenta dependências ao projeto consumidor.

No checkout completo do Integra, regista o plugin no Vite:

```ts
import { defineConfig } from 'vite';
import { integraLiveInspectorPlugin } from './src/modules/live-inspector/vite-plugin.js';

export default defineConfig({
  plugins: [integraLiveInspectorPlugin()],
});
```

Inicia o servidor normal de desenvolvimento, abre a aplicação local e pressiona **Alt + Shift + I**. Seleciona um elemento para consultar dimensões, tipografia, classes e contraste estimado. Podes pré-visualizar classes, cor do texto, fundo, padding e border radius; usar Undo/Redo; repor o estado; e exportar um diff textual ou o pacote JSON de revisão.

Pressiona **Escape** para fechar e restaurar os atributos originais. O atalho pode voltar a abrir o inspector depois de o descartar. O plugin usa `apply: 'serve'` e não injeta o inspector em builds de produção.

O Live não escreve ficheiros-fonte, não chama providers de IA e não transforma um seletor DOM num caminho de ficheiro. O pacote de revisão marca o mapeamento de source como não verificado; qualquer alteração ao projeto exige inspeção do código e aprovação do diff exato.

**Importante:** o CLI instala skills e contexto, não este runtime. Para integrar o Live Inspector noutro projeto, mantém o checkout do Integra disponível ou usa uma distribuição runtime futura quando existir.

## O que o Integra oferece

- **Context:** normaliza factos, restrições, preferências e informação em falta sem inventar valores.
- **Direction:** produz um Direction Artifact versionado com decisões nas oito áreas do sistema visual.
- **Visual Intelligence:** reúne fontes, observações, tokens, padrões, regras e salvaguardas num Bundle offline e determinístico.
- **Agent Skills:** workflows especialistas para UX, direção, sistema de design, geração, refactor, motion, investigação e QA.
- **Live Inspector:** inspeção local do DOM e pré-visualizações temporárias/reversíveis.
- **Refinement e QA:** avaliações com severidade, evidência, confiança e estado de verificação.
- **CLI independente:** instalação, atualização, diagnóstico e remoção de skills sem executar scripts incluídos no bundle.

## Catálogo de skills

| Área | Skill | Responsabilidade |
|---|---|---|
| Orquestração | `integra` | Entender o pedido e selecionar o workflow mínimo adequado |
| UX e estrutura | `integra-ux-shape` | Jobs, fluxos, navegação, IA e estados |
| Direção visual | `integra-design-direction` | Tese visual, composição, identidade e decisões de design |
| Sistema | `integra-design-system` | Tokens, componentes, variantes, temas e governação |
| Cor | `integra-colorize` | Cor semântica, hierarquia, temas e contraste |
| Motion | `integra-animate` | Transições, micro-interações, timing, reduced motion e performance |
| Implementação | `integra-ui-generator` | Novos ecrãs, componentes e interações |
| Manutenção | `integra-refactor-agent` | Refactor com preservação do comportamento |
| Revisão | `integra-design-qa` | UX, qualidade visual, estados e responsividade |
| Acessibilidade | `integra-accessibility-audit` | Auditoria WCAG com evidência por critério |
| Performance | `integra-performance-audit` | Medição e diagnóstico de gargalos |
| Investigação | `integra-investigation` | Pesquisa técnica e de produto baseada em fontes |
| Referências | `integra-reference-investigator` | Observação e adaptação original de referências |
| Inteligência visual | `integra-visual-knowledge` | Curadoria e retrieval de fontes, tokens, padrões, regras e exemplos |
| Inspeção | `integra-live-inspector` | Preview de DOM local e handoff para source |

`integra-direction` é mantida como alias legado de `integra-design-direction` para compatibilidade. Os nomes canónicos seguem o padrão `integra-<capacidade>`; não renomeamos skills já distribuídas sem uma estratégia de migração.

## Comandos e routing

O catálogo `commands/manifest.json` descreve comandos, modificadores, gatilhos, skills, inputs, outputs e política de alteração de source. O routing determinístico está disponível no módulo `src/modules/commands`; inclui o workflow `/integra:visual-intelligence`.

O manifesto é agnóstico ao host. A sua presença não significa que Codex, Gemini CLI, Cursor, Claude Code ou Copilot tenham registado comandos nativos automaticamente. A descoberta e invocação dependem do suporte e configuração de cada host.

## Fluxo recomendado

### 1. Gerar uma direção

```bash
npm run direction:generate -- --stdout
```

O comando usa o fixture DL-001 por omissão e escreve o Direction Artifact validado no stdout. Para o guardar numa execução local:

```bash
npm run direction:generate
```

O destino predefinido é `.integra/runs/direction/DL-001.json`.

### 2. Preparar o handoff para um agente

```bash
npm run visual-intelligence:generate -- \
  --artifact .integra/runs/direction/DL-001.json \
  --task "Explain the product value and invite visitors to try a demo" \
  --mode persuade \
  --niche-id saas-developer-ai
```

O comando produz um Visual Intelligence Bundle 1.1.0 em `.integra/runs/visual-intelligence/bundle.json`. A tarefa é obrigatória; modo e nicho são fornecidos pelo chamador e não são inferidos automaticamente. Usa `--stdout` para receber JSON no stdout, ou `--query`, `--tag`, `--asset-type` e `--limit` para orientar o retrieval.

O Bundle separa decisões do Direction Artifact de candidatos de conhecimento. Fontes `catalog-only`, observações `partial`, observações verificadas, receitas de tokens e padrões não são equivalentes nem se transformam automaticamente em decisões aprovadas.

### 3. Implementar e rever

O agente externo recebe o Bundle e implementa no projeto de destino segundo o seu próprio contrato de execução. O Live Inspector pode depois recolher previews e exportar um pacote de revisão. O source mapping é resolvido separadamente; o Bundle e o pacote Live não são prova de implementação nem um QA pass.

## Princípios de funcionamento

1. **Produto antes da decoração:** começa pelo trabalho do utilizador, conteúdo e contexto.
2. **Direção original:** referências informam princípios; não são copiadas como páginas, assets ou identidade.
3. **Menor workflow útil:** não chamar todas as skills quando uma especialista basta.
4. **Decisões rastreáveis:** separar factos, restrições, preferências, pressupostos e desconhecidos.
5. **Acessibilidade desde o início:** semântica, teclado, foco, contraste, estados e reduced motion.
6. **Motion com propósito:** cada animação comunica estado, continuidade, feedback ou intenção visual clara.
7. **Evidência antes de claims:** `not_run`, `inconclusive` e heurísticas nunca são convertidos em `passed`.
8. **Alterações seguras:** preservar trabalho existente e exigir aprovação do diff exato antes de editar source.

## Arquitetura

O core determinístico é provider-agnostic. Os módulos de contexto, direção, knowledge, investigação, refinamento, QA e Live Inspector comunicam através de contratos explícitos. As Agent Skills são a camada de instruções para os agentes; o CLI empacota as skills canónicas e recursos de contexto partilhados.

Consulte:
- [Arquitetura](docs/architecture.md)
- [Visual knowledge routing](docs/ai-guides/visual-knowledge-routing.md)
- [Design Intelligence Library](data/design-library/README.md)
- [Compatibilidade e instalação por host](docs/agent-compatibility.md)
- [Contrato de contexto de IA](docs/ai-context-contract.md)
- [Contrato de integração dos agentes](docs/agent-integration-contract.md)
- [Especificação do Live Inspector](docs/live-inspector-v2-spec.md)
- [Avisos e licenças de terceiros](docs/third-party-notices.md)

## Visual Knowledge Library

A biblioteca separa fontes visuais, providers de assets, mapeamentos para os 61 nichos existentes, observações por página, receitas semânticas de tokens, padrões de layout, regras, anti-patterns e exemplos. O resolver é offline-first e devolve candidatos explicáveis, sem navegar em sites, aplicar tokens ou declarar defeitos automaticamente. Novas fontes permanecem `catalog-only` até inspeção específica.

As observações de referência são page-scoped. Uma observação documental não verifica todo o produto ou fonte; os seus limites e estado são preservados no Bundle.

## Desenvolvimento e validação

Requisitos do checkout completo:
- Node.js 24 (intervalo suportado: `>=24 <27`).
- npm 10 ou superior.

Executa:

```bash
npm ci
npm run check
npm run distribution:smoke
```

Validações focadas:

```bash
npm run validate:visual-library
npm run validate:skills
npm run validate:agent-assets
npm run validate:commands
npm run distribution:check
```

O validador de skills verifica frontmatter, nomes, limites do formato e links locais. O bundler verifica recursos e integridade antes de criar o bundle do CLI. Estes checks não provam que um host específico carregou ou executou uma skill.

## Limites importantes

- O CLI não executa scripts do bundle e não instala o runtime TypeScript do repositório.
- Instalar uma skill não garante que um host a tenha descoberto, ativado ou seguido.
- O routing prepara um plano; não é um executor universal de agentes.
- O Live Inspector é apenas para desenvolvimento local; não edita source nem deve ser usado em produção.
- O Design QA contém heurísticas; não substitui revisão humana nem testes reais no browser.
- Uma auditoria parcial não prova conformidade WCAG global.
- Uma recomendação de performance sem medições não é um ganho comprovado.

## Licenças e atribuição

O Integra é distribuído sob MIT. A skill `integra-animate` e a adaptação existente de `integra-colorize` incorporam orientação adaptada do Impeccable, licenciado sob Apache-2.0. O bundle inclui o texto integral dessa licença e os avisos necessários em [docs/third-party-notices.md](docs/third-party-notices.md) e [licenses/](licenses/).

O Integra não incorpora o CLI, binários, extensão de browser, scripts ou dependências runtime do Impeccable.
