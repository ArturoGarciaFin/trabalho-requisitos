// Banco de dados simulado em memória para o protótipo do Plano Decenal

// Perfis de usuários (RF18)
const USUARIOS_INICIAIS = [
  { id: 1, nome: "Ana Silva (SEDEF)", email: "sedef@governo.gov.br", senha: "admin", perfil: "SEDEF" },
  { id: 2, nome: "Carlos Souza (Conselho Estadual)", email: "conselho@conselho.gov.br", senha: "conselho", perfil: "CONSELHO" },
  { id: 3, nome: "Mariana Costa (Secretaria)", email: "secretaria@estado.gov.br", senha: "secretaria", perfil: "CONSELHO" }
];

// Eixos do Plano Decenal
const EIXOS = [
  "Eixo 1: Promoção dos Direitos de Crianças e Adolescentes",
  "Eixo 2: Proteção e Defesa no Enfrentamento das Violências",
  "Eixo 3: Protagonismo e Participação de Crianças e Adolescentes",
  "Eixo 4: Controle Social e Gestão da Política"
];

// Estrutura hierárquica inicial de dados (RF01, RF02, RF03, RF14, RF16, RF17)
const PROBLEMAS_INICIAIS = [
  {
    id: 1,
    descricao: "Problema 1: Evasão escolar no ensino fundamental e médio",
    compromisso: {
      titulo: "Compromisso 1: Garantir 100% de permanência escolar de crianças e adolescentes até 2030",
      eixo: EIXOS[0],
      objetivos: [
        {
          id: 101,
          descricao: "Objetivo 1.1: Reduzir a evasão escolar na rede pública estadual em 50%",
          linhasAcao: [
            {
              id: 1001,
              descricao: "Linha de Ação 1.1.1: Busca ativa escolar e acompanhamento familiar",
              responsavelPrincipal: "Secretaria de Educação (SEDUC)",
              colaboradores: "Conselho Tutelar, Secretarias Municipais de Assistência Social",
              tarefas: [
                {
                  id: 10001,
                  descricao: "Tarefa 1.1.1.1: Implementar sistema online de alerta de infrequência",
                  status: "Em Andamento", // "Não Iniciada", "Em Andamento", "Concluída"
                  percentualConcluido: 75,
                  historico: [
                    { data: "2026-01-10T09:00:00Z", usuario: "Mariana Costa (Secretaria)", acao: "Criação da tarefa", status: "Não Iniciada", percentual: 0 },
                    { data: "2026-03-15T14:30:00Z", usuario: "Mariana Costa (Secretaria)", acao: "Início do desenvolvimento do sistema", status: "Em Andamento", percentual: 30 },
                    { data: "2026-05-20T10:15:00Z", usuario: "Carlos Souza (Conselho)", acao: "Integração das primeiras 100 escolas", status: "Em Andamento", percentual: 75 }
                  ],
                  indicadores: [
                    {
                      id: 20001,
                      nome: "Taxa de cobertura do sistema de alerta nas escolas estaduais",
                      tipo: "Quantitativo", // Quantitativo ou Qualitativo
                      historicoValores: [
                        { ano: 2024, valor: 10 },
                        { ano: 2025, valor: 45 },
                        { ano: 2026, valor: 75 }
                      ]
                    }
                  ]
                },
                {
                  id: 10002,
                  descricao: "Tarefa 1.1.1.2: Capacitação de conselheiros tutelares em busca ativa",
                  status: "Concluída",
                  percentualConcluido: 100,
                  historico: [
                    { data: "2025-10-01T08:00:00Z", usuario: "Ana Silva (SEDEF)", acao: "Criação da tarefa", status: "Não Iniciada", percentual: 0 },
                    { data: "2025-11-15T16:00:00Z", usuario: "Mariana Costa (Secretaria)", acao: "Oficinas regionais realizadas", status: "Concluída", percentual: 100 }
                  ],
                  indicadores: [
                    {
                      id: 20002,
                      nome: "Percentual de conselhos tutelares capacitados",
                      tipo: "Quantitativo",
                      historicoValores: [
                        { ano: 2024, valor: 0 },
                        { ano: 2025, valor: 100 }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 2,
    descricao: "Problema 2: Elevado índice de desnutrição infantil em comunidades tradicionais",
    compromisso: {
      titulo: "Compromisso 2: Garantir segurança alimentar e nutricional na primeira infância",
      eixo: EIXOS[0],
      objetivos: [
        {
          id: 102,
          descricao: "Objetivo 2.1: Erradicar a desnutrição grave em crianças menores de 5 anos até 2030",
          linhasAcao: [
            {
              id: 1002,
              descricao: "Linha de Ação 2.1.1: Distribuição integrada de suplementos alimentares e acompanhamento médico descentralizado",
              responsavelPrincipal: "Secretaria de Saúde (SES)",
              colaboradores: "Lideranças Comunitárias, Emater, Funai",
              tarefas: [
                {
                  id: 10003,
                  descricao: "Tarefa 2.1.1.1: Distribuição mensal de cestas nutricionais específicas",
                  status: "Em Andamento",
                  percentualConcluido: 60,
                  historico: [
                    { data: "2026-02-01T10:00:00Z", usuario: "Mariana Costa (Secretaria)", acao: "Início do programa emergencial", status: "Em Andamento", percentual: 60 }
                  ],
                  indicadores: [
                    {
                      id: 20003,
                      nome: "Número de famílias tradicionais atendidas pelo programa",
                      tipo: "Quantitativo",
                      historicoValores: [
                        { ano: 2025, valor: 150 },
                        { ano: 2026, valor: 480 }
                      ]
                    },
                    {
                      id: 20004,
                      nome: "Redução percentual de casos clínicos de desnutrição grave",
                      tipo: "Qualitativo",
                      historicoValores: [
                        { ano: 2025, valor: 5 },
                        { ano: 2026, valor: 25 }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 3,
    descricao: "Problema 3: Subnotificação de casos de violência doméstica e abuso sexual",
    compromisso: {
      titulo: "Compromisso 3: Fortalecer a rede de denúncias e acolhimento institucional",
      eixo: EIXOS[1],
      objetivos: [
        {
          id: 103,
          descricao: "Objetivo 3.1: Aumentar em 80% a identificação precoce de abusos infanto-juvenis",
          linhasAcao: [
            {
              id: 1003,
              descricao: "Linha de Ação 3.1.1: Implantação de canais de denúncia escolares anônimos e seguros",
              responsavelPrincipal: "Secretaria de Justiça e Direitos Humanos (SJDH)",
              colaboradores: "Secretaria de Educação, Ministério Público",
              tarefas: [
                {
                  id: 10004,
                  descricao: "Tarefa 3.1.1.1: Criação do aplicativo de denúncia seguro 'Fale Sem Medo'",
                  status: "Não Iniciada",
                  percentualConcluido: 0,
                  historico: [
                    { data: "2026-06-01T11:00:00Z", usuario: "Ana Silva (SEDEF)", acao: "Planejamento inicial aprovado", status: "Não Iniciada", percentual: 0 }
                  ],
                  indicadores: [
                    {
                      id: 20005,
                      nome: "Efetivação de canais escolares",
                      tipo: "Qualitativo",
                      historicoValores: [
                        { ano: 2026, valor: 0 }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  },
  // Problemas de 4 a 23 com dados mockados para atender ao RF01 (23 problemas públicos obrigatórios)
  ...Array.from({ length: 20 }, (_, i) => {
    const id = i + 4;
    // Distribuindo nos eixos
    const eixoIdx = (id % 4);
    return {
      id: id,
      descricao: `Problema ${id}: Problema público correspondente à vulnerabilidade de crianças/adolescentes sob o Eixo ${eixoIdx + 1}`,
      compromisso: {
        titulo: `Compromisso ${id}: Compromisso Decenal associado ao problema ${id} e políticas de proteção`,
        eixo: EIXOS[eixoIdx],
        objetivos: [
          {
            id: 100 + id,
            descricao: `Objetivo ${id}.1: Objetivo específico para mitigar o problema público ${id}`,
            linhasAcao: [
              {
                id: 1000 + id,
                descricao: `Linha de Ação ${id}.1.1: Diretriz para a implantação de programas setoriais do Eixo ${eixoIdx + 1}`,
                responsavelPrincipal: id % 2 === 0 ? "Secretaria de Assistência Social (SEAS)" : "Secretaria de Cultura e Esporte (SECE)",
                colaboradores: "Prefeituras Municipais, Organizações da Sociedade Civil",
                tarefas: [
                  {
                    id: 10000 + id,
                    descricao: `Tarefa ${id}.1.1.1: Executar monitoramento e implantação piloto das metas`,
                    status: id % 3 === 0 ? "Concluída" : (id % 3 === 1 ? "Em Andamento" : "Não Iniciada"),
                    percentualConcluido: id % 3 === 0 ? 100 : (id % 3 === 1 ? 40 : 0),
                    historico: [
                      { data: "2026-04-10T08:00:00Z", usuario: "Ana Silva (SEDEF)", acao: "Criação automática", status: "Não Iniciada", percentual: 0 }
                    ],
                    indicadores: [
                      {
                        id: 20000 + id,
                        nome: `Indicador ${id}: Nível de conformidade do programa ${id}`,
                        tipo: id % 2 === 0 ? "Quantitativo" : "Qualitativo",
                        historicoValores: [
                          { ano: 2025, valor: id * 2 },
                          { ano: 2026, valor: id * 2.5 }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    };
  })
];

// Logs iniciais de auditoria (RF13)
const LOGS_INICIAIS = [
  { id: 1, usuario: "Ana Silva (SEDEF)", acao: "Login no sistema", dataHora: "2026-06-23T14:00:00Z", detalhes: "Login efetuado com sucesso via formulário" },
  { id: 2, usuario: "Carlos Souza (Conselho)", acao: "Alteração de Status", dataHora: "2026-06-23T15:30:00Z", detalhes: "Tarefa 1.1.1.1 progresso atualizado de 30% para 75%" },
  { id: 3, usuario: "Ana Silva (SEDEF)", acao: "Criação de Compromisso", dataHora: "2026-06-23T16:15:00Z", detalhes: "Problema 3 e Compromisso 3 cadastrados via interface" }
];

// Exportando os dados para escopo global do navegador
window.db = {
  usuarios: JSON.parse(localStorage.getItem("db_usuarios")) || USUARIOS_INICIAIS,
  problemas: JSON.parse(localStorage.getItem("db_problemas")) || PROBLEMAS_INICIAIS,
  logs: JSON.parse(localStorage.getItem("db_logs")) || LOGS_INICIAIS,
  ultimoUpdate: localStorage.getItem("db_ultimo_update") || "2026-06-23T16:15:00Z"
};

// Função para persistir alterações no LocalStorage
window.salvarEstado = function() {
  localStorage.setItem("db_usuarios", JSON.stringify(window.db.usuarios));
  localStorage.setItem("db_problemas", JSON.stringify(window.db.problemas));
  localStorage.setItem("db_logs", JSON.stringify(window.db.logs));
  const data = new Date().toISOString();
  window.db.ultimoUpdate = data;
  localStorage.setItem("db_ultimo_update", data);
};
