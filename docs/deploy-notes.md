# Notas para deploy futuro

O ZIP é uma base local, não um deploy publicado. Não foi criado nem alterado qualquer projeto de alojamento.

Antes de ligar um ambiente de deploy:

1. Confirmar o destino e o runtime suportado.
2. Executar `npm run check` no ambiente de CI.
3. Definir secrets apenas no gestor de variáveis do ambiente, nunca no repositório.
4. Garantir que execução de projetos de utilizador fica fora do processo do serviço e sem permissões excessivas.
5. Decidir onde guardar relatórios/artefactos e política de retenção.
6. Separar preview e produção.
7. Exigir revisão das baselines antes de promover uma versão.

A arquitetura ainda não possui uma API web, interface de utilizador, configuração de Vercel ou sistema de autenticação. Não adicionar estas partes até a necessidade e o contrato de implantação estarem definidos.
