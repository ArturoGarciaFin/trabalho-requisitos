# RF11, RNF08 e RNF10 (Login, JWT e Sessão):
      • Como Verificar: Ao tentar abrir a aba "Área do Gestor" sem autenticação, o protótipo redirecionará para o
      formulário. O login simula a criação de um token JWT no  sessionStorage . Se você permanecer sem mover o
      mouse/digitar, o sistema inicia um aviso de expiração nos últimos 60 segundos do temporizador e efetua o
      logout automático após a contagem regressiva de inatividade (30 minutos no padrão real).
## VERIFICAÇÃO: Falta testar a inatividade, mas de resto funciona exatamente como mencionado

# RF12, RF20 e Regra de Negócio (Cadastro Hierárquico):
      • Como Verificar: Faça login e, na "Área do Gestor", tente cadastrar dados. O formulário ajusta os campos de
      forma que você seja obrigado a selecionar um elemento "pai" para vincular o novo registro, prevenindo quebras
      na hierarquia.
## VERIFICAÇÃO: A hierarquia está sendo seguida e não é possível quebrá-la, porém, ao criar uma nova tarefa/indicador/objetivo/linha de ação, um de seus respectivos "pais" possíveis já é selecionado, de forma que um usuário desatento possa se confundir e registrar um filho em uma hierarquia errada. O ideal seria iniciar o selecionador de tarefas vazio, e não permitir que o dado seja inserido sem que uma opção seja selecionada. Outro problema é a falta de uma barra de pesquisas na seleção: a medida que mais dados são criados, selecioná-los dessa forma ficaria desnecessáriamente complicado

# RF19 e Regra de Negócio (Carga via Planilha):
      • Como Verificar: Baixe a planilha modelo contendo dados de teste, faça alterações e faça o upload na Área do
      Gestor. Se você tentar carregar uma linha contendo um ID de tarefa que não existe na hierarquia, o protótipo
      interrompe o processo, não salva nada na base (atomicidade da carga) e exibe os erros em vermelho.
## VERIFICAÇÃO: Funciona para tarefas, mas a logica das outras modalidades e da hierarquia ainda não foi testada, e o site não fornece um exemplo de CSV mais complexo. (verificar se a estrutura do projeto exige algo mais complexo ou apenas um csv contendo as tarefas)

# RF09 e RF13 (Administração SEDEF e Auditoria):
      • Como Verificar: Faça login como SEDEF ( sedef@governo.gov.br  /  admin ). A aba "Auditoria" aparecerá. Você poderá promover/rebaixar permissões de usuários e ver a tabela imutável contendo o log cronológico detalhado de todas as operações administrativas executadas no sistema.
## VERIFICAÇÃO: *POSSÍVEL BUG* Talvez eu houvesse batido o tempo de inatividade, mas ao tentar acessar o painel mencionado pela primeira vez (usando a conta SEDEF), o acesso não foi permitido. Ao Logar novamente, não houve nenhum problema.

# RNF01 e RF10 (Acessibilidade e Alto Contraste):
      • Como Verificar: Use a barra de acessibilidade no topo. Clique em "Alto Contraste ◐" para aplicar o tema de
      cores preto/amarelo, aumente/diminua a fonte com os botões "A +" / "A -" e use a tecla  Tab  para navegar com
      focos destacados visualmente.
## VERIFICAÇÃO: **PROBLEMA** Alto contraste funciona corretamente, mas nem todos os textos mudam de tamanho. Também existe um botão "Normal" ao lado de "A -" que, além de não fazer nada, é  redundante, já que o botão de "Alto Contraste" já funciona como um switch, ligando e desligando a opção.

# RNF02 (Responsividade):
      • Como Verificar: Diminua a largura do navegador. Os menus de grade divididos passarão a se empilhar
      verticalmente para caber em dispositivos móveis sem perdas na visualização.
## VERIFICAÇÃO: **PEQUENO PROBLEMA** Funciona bem para quase todos os elementos da tela, porém a barra horizontal de seleção de telas não se adapta de forma responsiva quando o navegador fica muito pequeno. Por enquanto, é melhor dar prioridade aos outros problemas, possívelmente mudando o design da aplicação apenas depois que tudo estiver corrigido.
