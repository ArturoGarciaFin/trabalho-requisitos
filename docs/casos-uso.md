# Casos de Uso

## Atores do Sistema
Público Geral: Acesso livre sem necessidade de autenticação prévia, focado na visualização das ações, estrutura de compromissos e painéis gráficos.
Conselho Estadual/Secretarias: Usuários autenticados responsáveis pela operação, atualização de status e inserção de dados no sistema.
SEDEF (Administrador): Nível gerencial com permissões totais, responsável pela administração do sistema e controle de níveis de acesso.


## Catálogo de Casos de Uso


### Caso de Uso 1 - Visualizar Hierarquia do Plano
Ator Principal: Público Geral, Conselho Estadual/Secretarias e SEDEF.
Requisitos Vinculados: RF01, RF02.
Pré-condições: Nenhuma (disponibilidade aberta).
Fluxo Principal:
  1. O ator acessa a plataforma.
  2. O sistema exibe os 23 problemas públicos.
  3. O ator seleciona um problema.
  4. O sistema detalha hierarquicamente o Compromisso, Objetivo, Linhas de Ação, Tarefas e os Indicadores correspondentes àquela cadeia, exibindo os responsáveis de forma clara.

### Caso de Uso 2 - Realizar Pesquisa e Filtragem
Ator Principal: Público Geral, Conselho Estadual/Secretarias e SEDEF.
Requisitos Vinculados: RF04, RF05.
Pré-condições: Existência de dados previamente cadastrados no sistema.
Fluxo Principal:
  1. O ator insere termos-chave (títulos ou responsáveis) ou aplica múltiplos filtros (período, indicadores, eixos) na barra de pesquisa.
  2. O sistema cruza os dados e atualiza a tela com as informações correspondentes.
Fluxo Alternativo (Sem resultados):
  2a. O sistema exibe um alerta informativo caso a consulta não retorne resultados.

### Caso de Uso 3 - Acompanhar Evolução via Painéis Gráficos
Ator Principal: Público Geral, Conselho Estadual/Secretarias e SEDEF.
Requisitos Vinculados: RF03, RF14, RF15, RF16.
Pré-condições: O sistema deve possuir dados atualizados das tarefas.
Fluxo Principal:
  1. O ator acessa a área de gráficos.
  2. O sistema exibe o percentual concluído e o estado atual das atividades (não iniciada, em andamento, concluída).
  3. O ator interage aplicando filtros de segmentação por ano.
  4. O sistema atualiza os gráficos, diferenciando os tipos de indicadores com padrões cromáticos distintos.

### Caso de Uso 4 - Gerir Dados no Painel Administrativo
Ator Principal: Conselho Estadual / Secretarias.
Requisitos Vinculados: RF11, RF12, RF20.
Pré-condições: Usuário autenticado via Token JWT.
Fluxo Principal:
  1. O ator acessa a interface de edição/inserção de compromissos.
  2. O ator preenche os campos com os novos dados ou atualiza o status de uma tarefa.
  3. O ator submete a atualização.
  4. O sistema valida sistemicamente o preenchimento dos campos obrigatórios.
  5. O sistema salva a alteração e gera automaticamente um log de rastreabilidade (data, horário e autor).

### Caso de Uso 5 - Importar Planilhas em Massa
Ator Principal: Conselho Estadual / Secretarias.
Requisitos Vinculados: RF19.
Pré-condições: Usuário autenticado via Token JWT.
Fluxo Principal:
  1. O ator faz upload de um arquivo nos padrões CSV ou Excel.
  2. O sistema valida a consistência de carga e a hierarquia dos dados.
  3. O sistema atualiza o banco de dados processando as informações em lote.
Fluxo Alternativo (Falha na carga):
  2a. O sistema interrompe o processo e reporta erros caso detecte falhas na hierarquia.

### Caso de Uso 6 - Gerenciar Permissões de Usuários
Ator Principal: SEDEF (Administrador).
Requisitos Vinculados: RF09, RF18.
Pré-condições: Usuário autenticado com perfil exclusivo da camada gestora.
Fluxo Principal:
  1. O administrador acessa o painel de gerenciamento de permissões.
  2. O sistema lista os usuários cadastrados.
  3. O administrador altera o perfil de acesso (eleva ou reduz permissões) de um determinado usuário.
  4. O sistema salva as alterações e aplica as restrições ao usuário afetado.

### Caso de Uso 7 - Extrair Documentos de Monitoramento
Ator Principal: Público Geral, Conselho Estadual/Secretarias e SEDEF.
Requisitos Vinculados: RF06.
Pré-condições: O ator deve ter executado uma busca ou filtro válido.
Fluxo Principal:
  1. O ator seleciona a opção de exportação.
  2. O ator escolhe o formato desejado (PDF, CSV ou Excel).
  3. O sistema gera um documento contendo o reflexo preciso dos dados filtrados em tela.
  4. O sistema disponibiliza o arquivo finalizado para download do ator.