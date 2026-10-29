# Segurança e limites de execução

## Modelo mínimo

O Integra poderá analisar código de projetos que não foram escritos por ele. Esse código deve ser tratado como entrada não confiável.

- Nunca executar código do projeto no processo principal do motor.
- Copiar fixtures para um workspace descartável antes de testar mutações.
- Não copiar `.env`, tokens, ficheiros de credenciais nem diretórios Git com segredos.
- Limitar escrita ao workspace autorizado.
- Tornar comandos de build/test explicitamente configuráveis e revisáveis.
- Limitar tempo, memória, saída de logs e acesso à rede.
- Preservar o estado original e recolher o diff antes/depois.
- Guardar apenas artefactos necessários e evitar credenciais nos relatórios.
- Marcar ferramentas indisponíveis ou bloqueadas como `not_run`.

## Fase 1

A Fase 1 não executa o fixture React nem recebe projetos remotos. As regras acima são requisitos para o runner futuro, não uma alegação de sandbox implementado.
