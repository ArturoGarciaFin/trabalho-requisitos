# Regras de Negócio

## As diretrizes de negócio estabelecem as premissas, limitações e políticas fundamentais que regem o funcionamento mandatório do sistema.

*Hierarquia de dados*: toda inserção de informações deve obedecer rigorosamente à estrutura de dependência, na qual um Compromisso precede um Objetivo, este precede uma Linha de Ação, que por sua vez precede uma Tarefa ou Indicador.
*Prioridade de atualização*: em cenários de divergência entre a entrada manual e o carregamento em lote via planilha, os dados do arquivo mais recente prevalecem, sobrescrevendo registros prévios e atualizando o histórico.
*Imutabilidade da auditoria*: o registro histórico de modificações é permanente, sendo vedada a exclusão ou edição por qualquer perfil de acesso para assegurar a integridade do monitoramento decenal.
*Segurança de sessão*: visando a proteção de dados, a ausência de interação por 30 minutos acarreta a expiração automática do token de acesso e o retorno à página de autenticação.

## Classificação de Prioridades do Backlog

> A organização das demandas do backlog segue a escala de relevância definida nos requisitos do projeto:

Obrigatória (O): componentes vitais para a entrega do valor central da ferramenta.
Importante (I): funcionalidades que potencializam a eficiência operacional e o valor prático do sistema.
Desejável (D): melhorias focadas no refinamento da interface ou aspectos estéticos da plataforma.