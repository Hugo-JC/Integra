# Integra

**Integra é um toolkit de design engineering e Agent Skills para orientar agentes de IA na criação, evolução e avaliação de interfaces.** Combina contexto de produto, direção visual, sistemas de design, implementação, inspeção local e QA baseado em evidências.

O objetivo não é impor um tema ou gerar interfaces genéricas. É ajudar o agente a compreender o produto, fazer escolhas justificadas, executar o trabalho certo e apresentar o que realmente verificou.

## Instalação rápida

O pacote npm é `integra-cli`. Num projeto onde pretendes instalar as skills:

```bash
npx integra-cli init
npx integra-cli add integra-animate
npx integra-cli list
npx integra-cli doctor
```

O destino predefinido é `.agents/skills/`. Para escolher outro diretório relativo:

```bash
npx integra-cli init --target .claude/skills
```

Consulta o [guia do CLI](packages/cli/README.md) para os comandos `add`, `update`, `remove` e para o contrato de instalação. O CLI instala skills e contexto partilhado; não instala o runtime do repositório nem ativa automaticamente uma skill em todos os hosts.

## O que o Integra oferece

- **Direção contextual:** transforma objetivos, utilizadores, conteúdo e restrições numa tese visual implementável.
- **Design intelligence:** roteamento de estilos e descoberta contextual de presets, sempre subordinados ao brief e à identidade do produto.
- **Agent Skills portáteis:** instruções especialistas para UX, direção, sistemas, geração, refactor, motion, cor, investigação e QA.
- **Quality engineering:** auditorias heurísticas, acessibilidade e performance com evidência, confiança e limitações explícitas.
- **Live Inspector:** inspeção local de DOM e preview temporário/reversível para preparar um handoff ao código-fonte.
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
| Inspeção | `integra-live-inspector` | Preview de DOM local e handoff para source |

`integra-direction` é mantida como alias legado de `integra-design-direction` para compatibilidade. Os nomes canónicos seguem o padrão `integra-<capacidade>`; não renomeamos skills já distribuídas sem uma estratégia de migração.

## Comandos e routing

O catálogo `commands/manifest.json` descreve comandos, modificadores, gatilhos, skills, inputs, outputs e política de alteração de source. Entre os modificadores estão `/integra:colorize` e `/integra:animate`.

O manifesto é agnóstico ao host. A sua presença não significa que Codex, Gemini CLI, Cursor, Claude Code ou Copilot tenham registado comandos nativos automaticamente. A descoberta e a invocação dependem do suporte e da configuração de cada host.

## Princípios de funcionamento

1. **Produto antes da decoração:** começa pelo trabalho do utilizador, conteúdo e contexto.
2. **Direção original:** referências informam princípios; não são copiadas como páginas, assets ou identidade.
3. **Menor workflow útil:** não chamar todas as skills quando uma especialista basta.
4. **Decisões rastreáveis:** separar factos, restrições, preferências, pressupostos e desconhecidos.
5. **Acessibilidade desde o início:** semântica, teclado, foco, contraste, estados e reduced motion.
6. **Motion com propósito:** cada animação comunica estado, continuidade, feedback ou uma intenção visual clara.
7. **Evidência antes de claims:** `not_run`, `inconclusive` e heurísticas nunca são convertidos em `passed`.
8. **Alterações seguras:** preservar trabalho existente e exigir aprovação do diff exato antes de editar source.

## Arquitetura

O core determinístico é provider-agnostic. Os módulos de contexto, direção, presets, investigação, refinamento, QA e Live Inspector comunicam através de contratos explícitos. As Agent Skills são a camada de instruções para os agentes; o CLI empacota as skills canónicas e os recursos de contexto necessários para as instalar noutros projetos.

Consulte:
- [Arquitetura](docs/architecture.md)
- [Compatibilidade e instalação por host](docs/agent-compatibility.md)
- [Contrato de contexto de IA](docs/ai-context-contract.md)
- [Contrato de integração dos agentes](docs/agent-integration-contract.md)
- [Avisos e licenças de terceiros](docs/third-party-notices.md)

## Desenvolvimento e validação

Para desenvolver o repositório completo:

- Node.js 24 e npm 10 ou superior.
- Instala dependências e executa a suite de verificação:

```bash
npm ci
npm run check
npm run distribution:check
npm run distribution:smoke
```

Para validar apenas as skills:

```bash
npm run validate:skills
npm run validate:agent-assets
```

O validador verifica frontmatter, nomes, limites do formato e links locais. O bundler verifica recursos e integridade antes de criar o bundle do CLI. Estes checks não provam que um host específico carregou ou executou uma skill.

## Limites importantes

- O CLI não executa scripts do bundle e não instala o runtime de desenvolvimento do repositório.
- Instalar uma skill não garante que um host a tenha descoberto, ativado ou seguido.
- O Live Inspector é apenas para desenvolvimento local; não edita source nem deve ser usado em produção.
- O Design QA contém heurísticas; não substitui revisão humana nem testes reais no browser.
- Uma auditoria parcial não prova conformidade WCAG global.
- Uma recomendação de performance sem medições não é um ganho comprovado.

## Licenças e atribuição

O Integra é distribuído sob MIT. A skill `integra-animate` e a adaptação existente de `integra-colorize` incorporam orientação adaptada do Impeccable, licenciado sob Apache-2.0. O bundle inclui o texto integral dessa licença e os avisos necessários em [docs/third-party-notices.md](docs/third-party-notices.md) e [licenses/](licenses/).

O Integra não incorpora o CLI, os binários, a extensão de browser, os scripts ou as dependências runtime do Impeccable.
