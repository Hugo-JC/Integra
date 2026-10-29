# ADR-004 — Investigação e integrações externas

- **Estado:** aceite
- **Decisão:** investigação externa é opcional e isolada por adaptadores.

## Motivo

O Design Lab precisa de continuar a executar cenários locais se um serviço externo estiver indisponível, exigir credenciais ou alterar a sua API.

## Consequência

O motor principal não importa diretamente SDKs de fornecedores. Resultados externos devem identificar a fonte, hora de recolha, limitações e grau de confiança. Ausência de acesso nunca deve ser convertida em evidência.
