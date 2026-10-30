# Integra — AI Design Engine v5

**Uma base modular para gerar, analisar e melhorar interfaces com evidências verificáveis.**

> Estado atual: **Fase 2 — fundação do Direction Engine em implementação**. A base da Fase 1 (contratos, cenários e fixtures) está concluída; a Fase 2 já inclui a fundação determinística de acessibilidade e o contrato versionado do Direction Artifact. Inclui agora a primeira fatia do Context Engine: normalização determinística de contexto estruturado e registo de informação em falta. Ainda não inclui extração automática de briefings Markdown, o motor de direção completo, integração com fornecedores de IA ou runner de produção.

## O que é o Integra?

O Integra é a nova identidade de trabalho do AI Design Engine v5. A arquitetura propõe um núcleo partilhado com três capacidades:

- **Direction:** transforma objetivos e contexto em direções visuais coerentes.
- **Refinement:** encontra problemas verificáveis e recomenda melhorias específicas.
- **Investigation:** recolhe contexto e evidências através de adaptadores opcionais.

O **V5 Design Lab** é a bancada de testes que avalia os resultados sem confundir uma recomendação com uma correção comprovada.

## Decisões iniciais tomadas

1. **Missão:** geração e análise de interfaces, com contratos e contexto partilhados.
2. **Stack de referência:** TypeScript + Node.js, numa arquitetura modular monolítica.
3. **Compatibilidade inicial:** priorizar React + TypeScript; usar HTML/CSS/JavaScript como entrada de análise e adicionar adaptadores específicos quando necessário.
4. **Investigação externa:** opcional; o caminho principal deve funcionar localmente sem fornecedores externos.
5. **Dados e baselines:** fixtures e esquemas versionados no repositório; resultados de execução local em `.integra/runs/`, ignorados pelo Git. Apenas baselines revistos devem ser versionados.
6. **Entrega:** não há deploy configurado nem executado nesta fase. Primeiro validar os contratos e a estrutura local.
7. **Repositórios de origem:** este scaffold é independente; não modifica `ai-design-engine`, `impeccable` ou `rea`.

## Requisitos

- Node.js 24 LTS recomendado. Node.js 24 está em Active LTS em outubro de 2026, segundo o calendário oficial: <https://nodejs.org/en/about/previous-releases>.
- npm incluído com Node.js.

## Começar

```bash
npm install
npm run check
```

Comandos individuais:

```bash
npm test                 # testes unitários e de contrato
npm run typecheck        # verificação de tipos TypeScript
npm run validate:fixtures # valida esquemas, cenários e caminhos de fixtures
```

O primeiro `npm install` requer acesso ao registo npm. Não é incluído `node_modules` no ZIP. **Esta distribuição ainda não tem `package-lock.json`** porque a instalação de dependências não terminou no ambiente de criação; depois de instalares as dependências com sucesso, conserva o lockfile gerado no repositório antes de configurar o deploy.

## O que já está incluído

- Arquitetura proposta e decisões registadas em ADRs.
- Esquemas JSON para cenários, relatórios e listas de resultados esperados.
- Cinco cenários documentados, com briefings, critérios, pesos e condições de aceitação.
- Fixtures para problemas visuais conhecidos e um pequeno projeto React sintético para testes futuros.
- Contratos TypeScript e utilitários puros para pontuação e métricas de deteção.
- Testes automatizados iniciais para contratos, catálogo e pontuação.
- Um relatório exemplo marcado como `inconclusive`, não como resultado real.

## Limites desta versão

A Fase 1 não prova que o motor produz boas interfaces. As fixtures são dados de referência; as avaliações subjetivas ainda exigem revisão humana. Os valores de aprovação são limiares iniciais e devem ser calibrados com execuções reais. Nenhuma execução do motor ou deploy é alegada nesta distribuição.

## Mapa rápido

- `docs/` — arquitetura, decisões, especificação, segurança e plano de entrega.
- `schemas/` — contratos JSON validados.
- `scenarios/` — os cinco cenários do V5 Design Lab.
- `fixtures/` — resultados esperados e projeto de referência.
- `src/contracts/` — tipos TypeScript.
- `src/lab/` — funções puras de pontuação e métricas.
- `tests/` — testes da Fase 1.
- `src/modules/` — módulos de capacidade, incluindo a fundação do Direction Engine.
- `schemas/direction-artifact.schema.json` — contrato versionado do artefacto de direção.

## Próximo trabalho

A Fase 2 está a construir o Direction Engine híbrido: primeiro o contrato do artefacto, depois Context Engine, motor determinístico, camada de IA opcional, resolver e integração com o Design Lab. O runner isolado passa para a Fase 3. Consultar `docs/implementation-roadmap.md`.
