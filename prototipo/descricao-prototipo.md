# Protótipo do Sistema de Monitoramento do Plano Decenal

Este diretório contém o protótipo evolutivo desenvolvido em conformidade com os requisitos levantados no projeto de Engenharia de Requisitos. O foco do protótipo é demonstrar visualmente e por meio de simulações em tela a aderência total às regras de negócio e de navegação especificadas.

---

## 1. Estrutura de Arquivos

O protótipo é construído com tecnologia Web nativa (Vanilla), o que significa que **não requer compilação ou instalação de dependências locais**. Os arquivos incluídos são:

*   **[`index.html`](file:///home/bizio/Repos/trabalho-requisitos/prototipo/index.html)**: Contém a estrutura do portal e das seções simuladas da SPA.
*   **[`style.css`](file:///home/bizio/Repos/trabalho-requisitos/prototipo/style.css)**: Implementa a identidade visual responsiva, animações e o modo de Alto Contraste.
*   **[`dados.js`](file:///home/bizio/Repos/trabalho-requisitos/prototipo/dados.js)**: Armazena os dados mockados em formato JSON, simulando o banco de dados.
*   **[`app.js`](file:///home/bizio/Repos/trabalho-requisitos/prototipo/app.js)**: Implementa o controle de navegação, simulações de autenticação JWT, expiração de sessão, upload de planilhas, geração de logs e filtros de busca.

---

## 2. Como Executar e Testar o Protótipo

Como o sistema foi concebido sem dependências de compilação, para rodá-lo:
1. Navegue até o diretório do protótipo.
2. Dê um duplo clique no arquivo **[`index.html`](file:///home/bizio/Repos/trabalho-requisitos/prototipo/index.html)** no seu gerenciador de arquivos (ou clique no link). Ele será aberto instantaneamente no seu navegador de internet padrão.
3. Para simular a área do Gestor ou do SEDEF, clique na aba **"Área do Gestor"** no menu e utilize as credenciais descritas na tela de Login.

---

## 3. Mapeamento de Requisitos Implementados

| Código | Descrição | Onde Verificar no Protótipo |
| :--- | :--- | :--- |
| **RF01** | Visualizar 23 problemas públicos vinculados a Compromissos. | Na aba principal **"Plano Decenal (Hierarquia)"**, a lista lateral exibe exatamente os 23 problemas de 1 a 23. |
| **RF02** | Visualização hierárquica completa: Problema ➔ Compromisso ➔ Objetivo ➔ Linha ➔ Tarefa ➔ Indicadores. | Ao selecionar qualquer problema no menu lateral da aba principal, a árvore interativa expande e desenha toda essa árvore estruturada na tela. |
| **RF03** | Monitoramento de Tarefas e status. | Cada caixa de Tarefa na árvore exibe seu status em uma etiqueta colorida e uma barra de progresso baseada no percentual concluído. |
| **RF04** | Pesquisa por termos-chave e responsáveis. | Na aba **"Pesquisa e Filtros"**, digite um termo na barra de busca (ex: "Educação", "Saúde" ou um nome de responsável como "SEDUC"). O sistema filtra em tempo real. |
| **RF05** | Filtros múltiplos (eixos, status, tipo de indicador). | Na aba **"Pesquisa e Filtros"**, combine os seletores de eixos temáticos e status das tarefas para exibir apenas o conjunto correspondente. |
| **RF06** | Exportação de dados (PDF, CSV, Excel). | No topo da tabela na aba **"Pesquisa e Filtros"**, clique nos botões de exportação. O navegador fará o download real do relatório refletindo os filtros aplicados. |
| **RF07** | Data/Hora da última atualização. | Visível no topo do cabeçalho da página ("Última atualização") e no rodapé. Atualiza sempre que novos dados são inseridos ou modificados. |
| **RF08** | Histórico de alterações e evolução das tarefas. | Na árvore de detalhes, clique no botão **"Ver Histórico de Evolução"** em qualquer tarefa. Um modal será aberto exibindo a linha do tempo de modificações. |
| **RF09** | Painel do Administrador para gerenciar acessos. | Efetue login como administrador (SEDEF) e clique na aba **"Auditoria (SEDEF)"** que surgirá no menu. Você poderá alterar o nível de permissões de outros usuários. |
| **RF10** | Modo de alto contraste. | No topo superior direito, clique em **"Alto Contraste ◐"**. Toda a paleta de cores será convertida para preto/amarelo de alta acessibilidade. |
| **RF11** | Login de usuários. | Na aba **"Área do Gestor"**, preencha as credenciais mockadas fornecidas na própria página para obter autenticação. |
| **RF12** | Cadastro manual de novos elementos respeitando a hierarquia. | Acesse a **"Área do Gestor"** (logado) ➔ Utilize o formulário **"Inserção Manual de Dados"**, selecione o nível que deseja criar e preencha os dados vinculando-os ao elemento pai correspondente. |
| **RF13** | Registro permanente de logs de auditoria. | Visível no painel administrativo **"Auditoria (SEDEF)"**. Registra data, hora, usuário e detalhes de qualquer ação que modifique o estado do sistema. |
| **RF14** | Exibição de gráficos de progresso. | Na aba **"Dashboard de Evolução"**, consulte os gráficos interativos de distribuição de tarefas por status e tipos de indicadores. |
| **RF15** | Filtrar gráficos do Dashboard por ano. | Na aba **"Dashboard de Evolução"**, mude o ano no seletor "Ano de Referência" para ver a consolidação estatística daquele período. |
| **RF16** | Diferenciar indicadores visualmente por tipo. | Os indicadores na árvore de hierarquia e nos resultados de busca exibem uma etiqueta discriminando se são do tipo **Quantitativo** ou **Qualitativo**, além de serem consolidados separadamente nos gráficos. |
| **RF17** | Responsável Principal e Colaboradores. | Na visualização de cada Linha de Ação na árvore, essas entidades aparecem listadas explicitamente sob a descrição. |
| **RF18** | Três camadas de perfis de usuários (SEDEF, Conselho, Público). | **Público**: acesso livre apenas a visualização, filtros e dashboards. **Conselho**: acesso a cadastros manuais e uploads. **SEDEF**: acesso a auditorias e controle de acessos. |
| **RF19** | Carga de planilhas. | Na **"Área do Gestor"** (logado), arraste ou selecione um arquivo `.csv` na zona de upload. O protótipo validará as linhas antes de aplicar as atualizações. |
| **RF20** | Alteração de dados via interface. | Formulários de cadastros e importação permitem a sobreposição e reescrita de dados salvos. |
| **RNF01** | Princípios do Design Universal. | Barra superior de acessibilidade contendo: atalhos de teclado (accesskey), botões para redimensionar dinamicamente o tamanho da fonte (A+/A-) e cores contrastantes. |
| **RNF02** | Responsividade. | O CSS foi estruturado utilizando Flexbox e CSS Grid combinados com Media Queries, adaptando a tela para celulares, tablets e desktops. |
| **RNF08** | Encerramento automático de sessão por inatividade. | Após login, se o usuário não mover o mouse ou interagir por 30 minutos, o sistema expira o token e efetua o logout de segurança automática. |
| **RNF10** | Utilização de Tokens JWT para autenticação. | O login gera uma string criptografada em Base64 no formato padrão JWT contendo a assinatura e expiração, que é validada nas transições de telas protegidas. |
