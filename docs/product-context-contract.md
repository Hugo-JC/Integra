# Product Context Contract

Este contrato define como uma skill ou agente deve descobrir e preservar a verdade do produto antes de alterar UX ou UI. É agnóstico ao framework, editor e provider de IA.

## Ficheiros convencionais

Os projetos podem usar nomes diferentes. Quando existem, estes ficheiros são pistas prioritárias:

| Ficheiro | Responsabilidade | Não deve ser usado para |
|---|---|---|
| PRODUCT.md | Problema, público, jobs, proposta de valor, linguagem, factos e limites de claims | Definir todos os detalhes visuais |
| DESIGN.md | Sistema visual atual/aprovado, tokens, tipografia, componentes, motion e responsividade | Substituir requisitos funcionais |
| Brief da superfície | Objetivo e requisitos de uma rota/ecrã/fluxo específico | Redefinir o produto inteiro sem autorização |
| README e instruções do agente | Stack, comandos, estrutura e convenções técnicas | Provar comportamento visual runtime |
| Código e interface renderizada | Estado implementado e comportamento observável | Transformar implementação atual em requisito de produto automaticamente |

A ausência destes ficheiros não bloqueia o trabalho. Procura documentos equivalentes, tokens e componentes no projeto. Não crie documentos extensos apenas para preencher um modelo.

## Classificação de informação

Regista separadamente:

- **Product fact:** facto diretamente fornecido ou aprovado sobre produto, público, capacidade ou linguagem.
- **Hard constraint:** condição que a implementação não pode violar.
- **Approved design commitment:** identidade ou padrão aprovado que deve ser preservado no modo de refinamento.
- **Current implementation:** comportamento/tokens realmente encontrados no código ou browser.
- **Preference:** direção desejada que admite negociação.
- **Assumption:** escolha provisória, marcada e reversível.
- **Unknown:** informação não disponível e que não pode ser inventada.

Não converta uma preferência num requisito nem uma implementação atual num compromisso de marca sem evidência.

## Resolução de conflitos

1. Requisitos explícitos mais recentes do utilizador e brief aprovado da tarefa definem o objetivo em execução.
2. PRODUCT.md ou documentação equivalente fornece factos e restrições duradouras, desde que não esteja claramente desatualizada.
3. DESIGN.md ou tokens aprovados definem o sistema visual que deve ser preservado por defeito.
4. Código e browser descrevem o que está implementado, não necessariamente o que deveria estar. Divergências em relação aos documentos devem ser reportadas.
5. Referências externas, presets, padrões e recomendações do Integra são material consultivo; nunca substituem os compromissos do produto.

Quando duas fontes aprovadas entram em conflito, identifica as duas, explica o impacto e pede uma decisão apenas se a escolha for material. Não escolha silenciosamente a mais recente ou mais fácil.

## Refinement vs. redesign

**Refinement (default for existing products):**
- manter a identidade visual reconhecível;
- preservar tokens, tipografia, linguagem dos componentes e padrões que já funcionam;
- corrigir problemas específicos com a menor mudança coerente;
- permitir evolução de hierarquia, composição e densidade quando houver benefício para a tarefa;
- explicar desvios intencionais de compromissos aprovados.

**Redesign / visual departure:**
- só acontece quando pedido ou aprovado explicitamente;
- identifica o que será preservado, substituído e migrado;
- não remove requisitos funcionais, acessibilidade ou conteúdo obrigatório;
- compara alternativas pelos seus trade-offs, não por preferência estética isolada.

Para um novo produto sem identidade aprovada, o agente pode propor uma direção original e indicar que os elementos ainda são decisões propostas, não factos de marca.

## Handoff mínimo

Cada workflow especializado recebe:
- objetivo e superfície;
- factos, constraints e identidade que não podem ser perdidos;
- stack e convenções relevantes;
- documentos e componentes que sustentam cada decisão;
- pressupostos e desconhecidos;
- acceptance criteria e estados que precisam de verificação;
- âmbito de alterações autorizado e estado de aprovação.

## Regras de qualidade

- Uma página deve ser reconhecível pela função, linguagem, dados e decisões específicas do produto, não apenas por decoração.
- Não adicionar secções, cartões, ícones, animações ou gradientes para preencher espaço.
- Evitar escolhas de estilo universais; justificar cada padrão com a tarefa, conteúdo e contexto.
- Preservar os padrões fortes encontrados, além de reportar problemas.
- Distinguir finding objetivo, heurística e preferência.
- Nunca atribuir status passed a algo que não foi verificado.
