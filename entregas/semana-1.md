# Entrega Semana 1

## Escopo

> Um sistema que consiste em criar uma plataforma de monitoramento de compromissos decenais da criança e do adolescente. O objetivo principal do sistema é fornecer uma ferramenta para rastrear políticas públicas voltada a esse público-alvo.

**As seguintes características se encontram no escopo:**

*Visualização hierárquica:* uma representação estruturada e navegável do fluxo.
*Gestão de progresso:* um acompanhamento de indicadores de desempenho através de gráficos e métricas de conclusão.
*Auditoria:* registro completo do histórico de alterações, controle de logs e exibição da última atualização de dados.
*Mecanismos de busca e filtro:* pesquisa filtrada por palavras-chave, eixos, responsáveis e períodos temporais.
*Controle de acesso:* painel administrativo para gestão de usuários, controle de permissões em múltiplos níveis e inserção ou edição de dados.
*Inclusão e extração de dados:* compatibilidade com recursos de acessibilidade como alto contraste.
Exportação de dados: funcionalidade de exportação de documentos em diversas extensões, como PDF, CSV e Excel.

**O seguinte está fora do escopo:**

Conexão automática com bases de dados externas pertencentes a órgãos ministeriais ou secretarias não contempladas na documentação.
Recursos de interação em tempo real, como chats, para troca de mensagens entre os utilizadores da plataforma.

## Atores

**Ator 1** - Público Geral:
*Perfil*: Acesso anônimo/público.
*Permissões*: Visualizar a estrutura hierárquica dos problemas públicos, aplicar buscas e filtros, visualizar gráficos de indicadores, acompanhar o progresso e exportar dados públicos. Não pode alterar nenhuma informação.

**Ator 2** - Conselho Estadual e Secretarias:
*Perfil*: Usuários autenticados representantes dos órgãos executores.
*Permissões*: Além do acesso público, possuem permissão para inserir e alterar dados de problemas, compromissos, objetivos e tarefas por meio da interface gráfica ou upload de planilhas. Atualizam o progresso e o status das tarefas sob sua responsabilidade.

**Ator 3** - SEDEF (Administrador):
*Perfil*: Instância máxima de controle e administração do sistema.
*Permissões*: Acesso ao Painel Administrativo. Permissão para elevar ou reduzir privilégios de usuários, gerenciar o cadastro de membros das secretarias e visualizar o histórico de alterações.