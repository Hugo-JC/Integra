# Brief — Análise de projeto React existente

## Entrada

Usa apenas uma cópia de `fixtures/source-projects/react-existing-project/`. Não executar scripts de projetos externos no processo principal e não copiar credenciais.

## Objetivo

Inspecionar a estrutura do projeto, localizar possíveis problemas de acessibilidade e qualidade de interface, e preparar recomendações associadas a ficheiros. Só aplicar mudanças numa cópia se o operador autorizar explicitamente a etapa de correção.

## Baseline

Registar primeiro a compilação, os testes existentes e o estado do Git/diff. Se a fixture não tiver lockfile ou se não for possível instalar dependências, assinalar a limitação em vez de afirmar que o build passou.

## Regras de segurança

- Nunca escrever no projeto de origem.
- Não ler nem expor `.env` ou segredos.
- Não executar comandos arbitrários sem revisão.
- Limitar acesso à rede e ao sistema de ficheiros no runner futuro.
- Mostrar o diff e explicar cada alteração.

## Aprovação

Não basta melhorar a pontuação visual: não pode haver regressões críticas nem alterações fora do âmbito.
