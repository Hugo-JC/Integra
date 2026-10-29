# ADR-002 — Stack e arquitetura

- **Estado:** aceite para o scaffold
- **Decisão:** TypeScript + Node.js 24 LTS, npm e arquitetura modular monolítica.

## Motivo

TypeScript permite contratos partilhados, boa integração com ferramentas web e uma trajetória direta para módulos de análise de projetos React.

## Consequência

A validação inicial usa TypeScript, Vitest e JSON Schema/Ajv. Node.js 24 é a versão recomendada para esta distribuição; o campo `engines` aceita `>=24 <27` para acomodar a linha atual e a LTS durante esta fase. Antes de fixar a runtime de deploy, confirmar o suporte do ambiente de destino.
