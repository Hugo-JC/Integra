# DL-001 — First Agent Pilot

## Objetivo

Comparar, sob condições controladas, uma landing page criada por um agente externo sem Integra e a mesma tarefa com Direction Artifact + Visual Intelligence Bundle. O piloto testa se o handoff do Integra melhora a qualidade da implementação sem prejudicar conteúdo, identidade, responsividade, acessibilidade ou fiabilidade.

O piloto é manual. O Integra prepara artefactos e valida contratos; não invoca o agente, não cria a implementação e não executa browser automation neste momento.

## Preparar o pacote

No checkout do Integra, com Node.js 24 e dependências instaladas:

~~~bash
npm install
npm run pilot:prepare
~~~

O pacote é escrito por omissão em .integra/runs/pilots/DL-001/. Para escolher outro destino:

~~~bash
npm run pilot:prepare -- --scenario DL-001 --out .integra/runs/pilots/DL-001-run-02
~~~

O gerador valida o Direction Artifact e o Visual Intelligence Bundle antes de escrever. O manifesto guarda hashes dos inputs e outputs, IDs e versões dos artefactos. O output é isolado em .integra/runs/; o comando recusa paths que escapem desse diretório.

## Desenho experimental

Usar duas cópias limpas do mesmo ponto de partida:

| Condição | Materiais entregues |
|---|---|
| Baseline | brief.md + TASK-PROMPT.md |
| Integra-guided | Os mesmos dois ficheiros + direction.json + bundle.json + GUIDED-AGENT-INSTRUCTIONS.md |

Manter o mesmo agente, versão/modelo, permissões, dependências, prompt base, seed/temperatura quando disponível e limite de tempo. Não reutilizar contexto, código ou resultados da primeira execução na segunda.

Registar fornecedor, versão do agente, modelo, data/hora, host, configuração, ferramentas permitidas, duração e eventuais custos apresentados pelo provider.

## Critérios independentes

Avaliar ambas as implementações com acceptance-criteria.json. Cada critério recebe pass, fail ou inconclusive, acompanhado de evidência e observações. Quando possível, quem avalia não deve saber qual das implementações recebeu Integra.

Capturar no mínimo:
- 1440×900;
- 390×844;
- screenshots da página completa e dos estados principais;
- verificação de overflow horizontal;
- navegação por teclado e foco visível;
- build, testes e erros de runtime;
- assets/rede e dependências adicionadas.

Os dois viewports são mínimos, não uma auditoria responsive completa. A avaliação manual de acessibilidade também não é certificação WCAG.

## Relatório de consumo

Na condição Integra-guided, o agente deve guardar consumption-report.json. O relatório precisa declarar um outcome para cada decisão e recomendação, uma única vez. Adaptações e omissões exigem motivo.

Validar a estrutura e a cobertura:

~~~bash
npm run direction:consumption:validate -- --artifact .integra/runs/pilots/DL-001/direction.json --report ./consumption-report.json
~~~

Um resultado passed confirma apenas que o relatório corresponde ao artefacto e cobre todos os IDs. Os outcomes continuam a ser autorrelato do agente; não confirmam que a UI foi implementada corretamente.

## Design QA estático

Para recolher sinais estáticos num projeto criado:

~~~bash
npm run design:qa -- ./src --json
npm run design:qa -- ./src --json --strict
~~~

O relatório usa P1–P3, localização, confiança, excerpto e verificationStatus: heuristic. A opção --strict termina com código 2 quando existem sinais estáticos P1. A ausência de findings não significa que o projeto passou QA.

A auditoria estática não executa browser, não verifica layout renderizado, operação de teclado, leitores de ecrã, contraste compositado, estados runtime ou performance medida. Essas verificações têm de ser executadas no projeto consumidor e registadas separadamente.

## Decisão após o piloto

Não definir um limiar de sucesso artificial antes de observar os resultados. Comparar:
- conteúdo correto e ausência de claims inventadas;
- clareza da tarefa e hierarquia;
- identidade e diferenciação visual;
- responsividade;
- interação, teclado e foco;
- qualidade do código e preservação do stack;
- resultados de build/testes e erros runtime;
- tempo, iterações, ferramentas e custo.

Documentar benefícios, regressões, inconclusivos e diferenças de esforço. Um único piloto não demonstra superioridade geral do Integra; indica quais os passos e contratos que merecem ser melhorados ou automatizados.
