# Histórias de Usuário

## Exemplos de histórias de usuários, detalhando casos de uso

### Painel de Visualização do Plano
Detalhamento: ferramenta voltada ao público geral para navegação na estrutura de compromissos e acompanhamento das políticas de proteção.
Nível de relevância: Mandatória.
Associação técnica: RF01 e RF02.
Parâmetros de validação:
Disponibilidade aberta: acesso sem necessidade de credenciais ou autenticação prévia.
Estrutura navegável: exibição organizada conforme a hierarquia de problemas, metas e tarefas.
Identificação de atores: visualização clara das entidades responsáveis e colaboradores.


### Sistema de Pesquisa e Filtragem
Detalhamento: capacidade de localização ágil de dados através de termos-chave e critérios específicos para gestores e cidadãos.
Nível de relevância: Mandatória.
Associação técnica: RF04 e RF05.
Parâmetros de validação:
Abrangência da busca: pesquisa funcional sobre títulos de ações e nomes de responsáveis.
Cruzamento de dados: aplicação de filtros múltiplos por períodos, indicadores e eixos.
Feedback visual: exibição de alerta informativo caso a consulta não retorne resultados.


### Painéis Gráficos de Evolução
Detalhamento: monitoramento visual por indicadores para permitir uma análise intuitiva do cumprimento das metas decenais.
Nível de relevância: Importante.
Associação técnica: RF03, RF15, RF16 e RF17.
Parâmetros de validação:
Métricas de conclusão: gráficos que apontam percentuais e o estado atual das atividades.
Interatividade temporal: filtros que permitem a segmentação dos dados exibidos por ano.
Diferenciação visual: uso de padrões cromáticos para distinguir as tipologias de indicadores.


### Gestão de Dados via Painel Administrativo
Detalhamento: inserção e atualização de status de compromissos diretamente pela interface para uso das secretarias e conselhos.
Nível de relevância: Mandatória.
Associação técnica: RF11, RF12 e RF18.
Parâmetros de validação:
Segurança de acesso: obrigatoriedade de autenticação via Token JWT para realizar edições.
Rastreabilidade: geração automática de logs com data, horário e autor da modificação.
Integridade: validação sistêmica do preenchimento de campos obrigatórios antes do salvamento.


### Importação em Massa de Planilhas
Detalhamento: processamento em lote de informações de monitoramento para otimizar a atualização de grandes volumes de dados.
Nível de relevância: Importante.
Associação técnica: RF19.
Parâmetros de validação:
Formatos suportados: compatibilidade com extensões CSV e arquivos do padrão Excel.
Consistência de carga: interrupção do processo e reporte de erros em caso de falhas na hierarquia.
Política de escrita: obediência às normas de sobreposição de registros preexistentes.


### Gerenciamento de Permissões
Detalhamento: controle de níveis de acesso e privilégios de usuários para assegurar a proteção das informações na plataforma.
Nível de relevância: Mandatória.
Associação técnica: RF09.
Parâmetros de validação:
Restrição de perfil: painel de administração acessível exclusivamente para a camada gestora.
Gestão de hierarquia: capacidade de alteração entre os diversos perfis de acesso do sistema.


### Extração de Documentos
Detalhamento: funcionalidade para exportar dados processados em formatos locais para fins de auditoria e análises externas.
Nível de relevância: Desejável.
Associação técnica: RF06.
Parâmetros de validação:
Variedade de arquivos: disponibilidade de exportação para PDF, CSV e Excel.
Fidelidade dos dados: o conteúdo exportado deve refletir precisamente os filtros aplicados em tela.