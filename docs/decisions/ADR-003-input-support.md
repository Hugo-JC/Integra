# ADR-003 — Suporte inicial de projetos

- **Estado:** aceite como ordem de prioridade
- **Decisão:** priorizar React + TypeScript nos exemplos de projeto; permitir análise estrutural de HTML/CSS/JavaScript através de adaptadores posteriores.

## Motivo

React/TypeScript dá-nos um alvo realista para validar a integridade do código e a segurança de alterações. Limitar a arquitetura apenas a React seria, contudo, demasiado restritivo.

## Consequência

Os contratos não devem depender de React. Adaptadores futuros deverão declarar as capacidades suportadas e retornar `not_applicable` para verificações que não se aplicam.
