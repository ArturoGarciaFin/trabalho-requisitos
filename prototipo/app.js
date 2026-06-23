/**
 * Plano Decenal - Monitoramento de Compromissos
 * JavaScript de Lógica de Negócio, Acessibilidade e Interface (app.js)
 * 
 * Este arquivo implementa os comportamentos necessários para o protótipo
 * em conformidade com as regras de Engenharia de Requisitos.
 */

// --- Variáveis Globais de Controle de Estado ---
let currentScreen = "hierarquia";
let loggedInUser = null;
let charts = {}; // Guarda as referências dos gráficos para posterior destruição
let sessionTimeoutTimer = null;
let sessionCountdownInterval = null;
const SESSION_TIMEOUT_SECONDS = 1800; // 30 minutos (RNF08)
let secondsRemaining = SESSION_TIMEOUT_SECONDS;
let isHighContrast = false;

// --- Inicialização da Aplicação ---
document.addEventListener("DOMContentLoaded", () => {
  inicializarEstado();
  carregarProblemasNoMenu();
  selecionarProblema(1); // Seleciona o primeiro problema por padrão
  preencherFiltrosDeBusca();
  applySearchFilters(); // Carrega tabela inicial de busca
  renderDashboardCharts(); // Carrega gráficos
  configurarEventosInatividade(); // Inicia monitoramento de timeout (RNF08)
  checarTokenSessao(); // Restaura login se houver token válido no sessionStorage
  
  // Atualiza as datas de alteração na interface (RF07)
  atualizarLabelsUltimaAtualizacao();
});

// Inicializa dados salvos ou configura dados padrão
function inicializarEstado() {
  if (!localStorage.getItem("db_problemas")) {
    window.salvarEstado();
  }
  // Aplica alto contraste se estava salvo
  isHighContrast = localStorage.getItem("high_contrast") === "true";
  if (isHighContrast) {
    document.body.classList.add("high-contrast");
  }
}

// Atualiza labels de última modificação (RF07)
function atualizarLabelsUltimaAtualizacao() {
  const dataFormatada = new Date(window.db.ultimoUpdate).toLocaleString("pt-BR");
  document.getElementById("header-last-update").textContent = dataFormatada;
  document.getElementById("footer-last-update").textContent = dataFormatada;
}

// Registrar Ações na Trilha de Auditoria Imutável (RF13)
function registrarAuditLog(usuario, acao, detalhes) {
  const novoLog = {
    id: window.db.logs.length + 1,
    usuario: usuario,
    acao: acao,
    dataHora: new Date().toISOString(),
    detalhes: detalhes
  };
  window.db.logs.unshift(novoLog); // Adiciona no início
  window.salvarEstado();
  atualizarAuditLogsUI();
  atualizarLabelsUltimaAtualizacao();
}

// --- 1. Sistema de Acessibilidade (RNF01, RF10) ---

function toggleContrast() {
  isHighContrast = !isHighContrast;
  if (isHighContrast) {
    document.body.classList.add("high-contrast");
  } else {
    document.body.classList.remove("high-contrast");
  }
  localStorage.setItem("high_contrast", isHighContrast);
}

function adjustFontSize(delta) {
  let currentScale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--font-scale")) || 1;
  currentScale = Math.min(Math.max(currentScale + delta, 0.7), 1.8);
  document.documentElement.style.setProperty("--font-scale", currentScale);
}

function resetFontSize() {
  document.documentElement.style.setProperty("--font-scale", 1);
}

// --- 2. Roteador de Navegação de Telas (SPA) (RF02) ---

function switchScreen(screenId, tabBtn) {
  // Verificação de permissões e segurança
  if (screenId === "gestor" || screenId === "auditoria") {
    if (!checarTokenSessao()) {
      alert("Acesso Negado: Esta área exige autenticação de gestor.");
      switchScreen("login", document.getElementById("tab-btn-gestor"));
      return;
    }
    
    if (screenId === "auditoria" && loggedInUser.perfil !== "SEDEF") {
      alert("Acesso Restrito: A trilha de auditoria e gestão de permissões é exclusiva do administrador SEDEF.");
      return;
    }
  }

  currentScreen = screenId;

  // Atualiza classe ativa nas abas do menu
  const tabs = document.querySelectorAll(".nav-tab-btn");
  tabs.forEach(tab => tab.classList.remove("active"));
  if (tabBtn) {
    tabBtn.classList.add("active");
  }

  // Alterna visibilidade das telas
  const screens = document.querySelectorAll(".app-screen");
  screens.forEach(screen => screen.classList.remove("active"));
  
  const targetScreen = document.getElementById(`screen-${screenId}`);
  if (targetScreen) {
    targetScreen.classList.add("active");
  }

  // Ações adicionais ao abrir telas específicas
  if (screenId === "dashboard") {
    renderDashboardCharts();
  } else if (screenId === "gestor") {
    adjustInsertFormFields();
  } else if (screenId === "auditoria") {
    atualizarAuditLogsUI();
    atualizarGerenciadorPermissoesUI();
  }
}

// --- 3. Renderização Hierárquica do Plano (RF01, RF02, RF03, RF14, RF16, RF17) ---

function carregarProblemasNoMenu() {
  const container = document.getElementById("problems-list-container");
  container.innerHTML = "";
  
  window.db.problemas.forEach(prob => {
    const btn = document.createElement("button");
    btn.className = "problem-item-btn";
    btn.id = `prob-btn-${prob.id}`;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", "false");
    btn.onclick = () => selecionarProblema(prob.id);
    
    btn.innerHTML = `
      <span style="font-weight: 500;">${prob.descricao.split(":")[0]}</span>
      <span class="problem-badge">ID: ${prob.id}</span>
    `;
    container.appendChild(btn);
  });
}

function selecionarProblema(id) {
  // Remove seleção antiga
  const btns = document.querySelectorAll(".problem-item-btn");
  btns.forEach(b => {
    b.classList.remove("selected");
    b.setAttribute("aria-selected", "false");
  });

  const selectedBtn = document.getElementById(`prob-btn-${id}`);
  if (selectedBtn) {
    selectedBtn.classList.add("selected");
    selectedBtn.setAttribute("aria-selected", "true");
  }

  renderizarArvoreHierarquica(id);
}

function renderizarArvoreHierarquica(problemaId) {
  const container = document.getElementById("details-panel-container");
  const prob = window.db.problemas.find(p => p.id === problemaId);

  if (!prob) {
    container.innerHTML = "<p>Problema não encontrado.</p>";
    return;
  }

  let html = `
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 1.3rem; margin-bottom: 8px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;">
        ${prob.descricao}
      </h3>
    </div>
  `;

  // Renderiza Compromisso (RF01)
  const comp = prob.compromisso;
  if (comp) {
    html += `
      <div class="tree-node">
        <div class="node-title">
          <span class="node-type-badge badge-compromisso">Compromisso Decenal</span>
          <span>${comp.titulo}</span>
        </div>
        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-left: 8px; margin-bottom: 12px;">
          Eixo Associado: <strong>${comp.eixo}</strong>
        </div>
    `;

    // Renderiza Objetivos (RF02)
    if (comp.objetivos && comp.objetivos.length > 0) {
      comp.objetivos.forEach(obj => {
        html += `
          <div class="tree-node" style="margin-left: 16px;">
            <div class="node-title">
              <span class="node-type-badge badge-objetivo">Objetivo</span>
              <span>${obj.descricao}</span>
            </div>
        `;

        // Renderiza Linhas de Ação
        if (obj.linhasAcao && obj.linhasAcao.length > 0) {
          obj.linhasAcao.forEach(linha => {
            html += `
              <div class="tree-node" style="margin-left: 20px;">
                <div class="node-title">
                  <span class="node-type-badge badge-linha">Linha de Ação</span>
                  <span>${linha.descricao}</span>
                </div>
                
                <div class="action-card">
                  <!-- Atores Principais e Colaboradores (RF17) -->
                  <div class="action-actors">
                    <div class="actor-item">👤 Responsável Principal: <strong>${linha.responsavelPrincipal}</strong></div>
                    <div class="actor-item">👥 Colaboradores: <strong>${linha.colaboradores || "Nenhum cadastrado"}</strong></div>
                  </div>
            `;

            // Renderiza Tarefas (RF03, RF08)
            if (linha.tarefas && linha.tarefas.length > 0) {
              linha.tarefas.forEach(tarefa => {
                const statusClass = tarefa.status === "Concluída" ? "status-concluida" : 
                                    (tarefa.status === "Em Andamento" ? "status-em-andamento" : "status-nao-iniciada");
                
                html += `
                  <div class="task-box">
                    <div class="task-header">
                      <strong style="font-size: 0.9rem; color: var(--text-primary);">
                        📋 Tarefa ID #${tarefa.id}: ${tarefa.descricao}
                      </strong>
                      <span class="task-status-badge ${statusClass}">${tarefa.status}</span>
                    </div>
                    
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px;">
                      Progresso Físico: <strong>${tarefa.percentualConcluido}%</strong>
                    </div>
                    <div class="progress-bar-container" aria-label="Progresso da tarefa">
                      <div class="progress-bar-fill" style="width: ${tarefa.percentualConcluido}%"></div>
                    </div>
                    
                    <button class="btn-task-history" onclick="abrirHistoricoModal(${tarefa.id})">
                      🔎 Ver Histórico de Evolução
                    </button>
                `;

                // Renderiza Indicadores (RF14, RF16)
                if (tarefa.indicadores && tarefa.indicadores.length > 0) {
                  html += `<div class="indicators-list">`;
                  tarefa.indicadores.forEach(ind => {
                    const ultimoValorObj = ind.historicoValores && ind.historicoValores.length > 0 
                      ? ind.historicoValores[ind.historicoValores.length - 1] 
                      : { ano: "-", valor: "-" };
                      
                    html += `
                      <div class="indicator-item">
                        <div style="display: flex; justify-content: space-between; align-items: start; gap: 8px;">
                          <div>
                            <span class="node-type-badge badge-indicador" style="font-size: 0.65rem;">
                              Indicador ${ind.tipo}
                            </span>
                            <span style="font-weight: 500; font-size: 0.85rem; display: block; margin-top: 4px;">
                              ${ind.nome}
                            </span>
                          </div>
                          <div style="text-align: right; background-color: var(--bg-surface); padding: 4px 8px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                            <small style="display:block; font-size: 0.7rem; color: var(--text-light)">Valor (${ultimoValorObj.ano})</small>
                            <strong style="color: var(--primary-color); font-size: 0.95rem;">${ultimoValorObj.valor}%</strong>
                          </div>
                        </div>
                      </div>
                    `;
                  });
                  html += `</div>`; // Fim indicators-list
                }

                html += `</div>`; // Fim task-box
              });
            } else {
              html += `<p style="font-size:0.85rem; color:var(--text-light); margin-top:8px;">Nenhuma tarefa vinculada.</p>`;
            }

            html += `</div>`; // Fim action-card e tree-node Linha
          });
        } else {
          html += `<p style="font-size:0.85rem; color:var(--text-light); margin-left:20px;">Nenhuma linha de ação vinculada.</p>`;
        }

        html += `</div>`; // Fim tree-node Objetivo
      });
    }

    html += `</div>`; // Fim tree-node Compromisso
  }

  container.innerHTML = html;
}

// --- 4. Histórico da Tarefa (Modal de Evolução) (RF08) ---

function abrirHistoricoModal(tarefaId) {
  let tarefaEncontrada = null;
  // Busca a tarefa em toda a hierarquia
  window.db.problemas.forEach(p => {
    if (p.compromisso && p.compromisso.objetivos) {
      p.compromisso.objetivos.forEach(o => {
        if (o.linhasAcao) {
          o.linhasAcao.forEach(l => {
            if (l.tarefas) {
              const t = l.tarefas.find(tk => tk.id === tarefaId);
              if (t) tarefaEncontrada = t;
            }
          });
        }
      });
    }
  });

  if (!tarefaEncontrada) {
    alert("Erro: Tarefa não localizada.");
    return;
  }

  document.getElementById("modal-history-task-name").textContent = tarefaEncontrada.descricao;
  const timeline = document.getElementById("modal-history-timeline");
  timeline.innerHTML = "";

  if (!tarefaEncontrada.historico || tarefaEncontrada.historico.length === 0) {
    timeline.innerHTML = "<p>Nenhum histórico registrado para esta tarefa.</p>";
  } else {
    // Exibe do mais recente para o mais antigo
    [...tarefaEncontrada.historico].reverse().forEach(h => {
      const div = document.createElement("div");
      div.className = "timeline-item";
      div.innerHTML = `
        <div class="timeline-meta">${new Date(h.data).toLocaleString("pt-BR")} - por <strong>${h.usuario}</strong></div>
        <div style="font-weight: 600; font-size: 0.9rem;">Ação: ${h.acao}</div>
        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">
          Progresso: <strong>${h.percentual}%</strong> | Status: <strong>${h.status}</strong>
        </div>
      `;
      timeline.appendChild(div);
    });
  }

  document.getElementById("modal-history").style.display = "flex";
}

function closeHistoryModal() {
  document.getElementById("modal-history").style.display = "none";
}

// --- 5. Sistema de Pesquisa e Filtragem Cruzada (RF04, RF05) ---

function preencherFiltrosDeBusca() {
  const selectEixo = document.getElementById("filter-eixo");
  selectEixo.innerHTML = '<option value="">Todos os Eixos</option>';
  EIXOS.forEach(e => {
    const opt = document.createElement("option");
    opt.value = e;
    opt.textContent = e;
    selectEixo.appendChild(opt);
  });
}

function clearSearchFilters() {
  document.getElementById("search-form").reset();
  applySearchFilters();
}

function applySearchFilters() {
  const query = document.getElementById("filter-query").value.toLowerCase().trim();
  const eixo = document.getElementById("filter-eixo").value;
  const status = document.getElementById("filter-status").value;
  const tipoInd = document.getElementById("filter-tipo-ind").value;

  const tbody = document.getElementById("results-table-body");
  tbody.innerHTML = "";

  let totalLinhas = 0;

  window.db.problemas.forEach(prob => {
    // Verifica eixo
    const comp = prob.compromisso;
    if (eixo && comp.eixo !== eixo) return;

    if (comp && comp.objetivos) {
      comp.objetivos.forEach(obj => {
        if (obj.linhasAcao) {
          obj.linhasAcao.forEach(linha => {
            if (linha.tarefas) {
              linha.tarefas.forEach(tarefa => {
                // Filtro status
                if (status && tarefa.status !== status) return;

                // Filtro tipo indicador
                if (tipoInd) {
                  const possuiTipo = tarefa.indicadores && tarefa.indicadores.some(i => i.tipo === tipoInd);
                  if (!possuiTipo) return;
                }

                // Busca Textual por Palavra-Chave (RF04)
                if (query) {
                  const matchProblema = prob.descricao.toLowerCase().includes(query);
                  const matchCompromisso = comp.titulo.toLowerCase().includes(query);
                  const matchObjetivo = obj.descricao.toLowerCase().includes(query);
                  const matchLinha = linha.descricao.toLowerCase().includes(query);
                  const matchResponsavel = linha.responsavelPrincipal.toLowerCase().includes(query) || (linha.colaboradores && linha.colaboradores.toLowerCase().includes(query));
                  const matchTarefa = tarefa.descricao.toLowerCase().includes(query);
                  
                  if (!matchProblema && !matchCompromisso && !matchObjetivo && !matchLinha && !matchResponsavel && !matchTarefa) {
                    return; // Não deu match
                  }
                }

                // Renderiza a linha correspondente
                totalLinhas++;
                const tr = document.createElement("tr");
                const statusClass = tarefa.status === "Concluída" ? "status-concluida" : 
                                    (tarefa.status === "Em Andamento" ? "status-em-andamento" : "status-nao-iniciada");
                
                const indTexto = tarefa.indicadores && tarefa.indicadores.length > 0
                  ? tarefa.indicadores.map(i => `${i.nome} (${i.tipo})`).join("<br>")
                  : "Nenhum";

                tr.innerHTML = `
                  <td>
                    <strong>${prob.descricao.split(":")[0]}</strong><br>
                    <small style="color:var(--text-secondary)">${comp.titulo}</small>
                  </td>
                  <td>${obj.descricao}</td>
                  <td>
                    <strong>${linha.descricao}</strong><br>
                    <small>Resp: ${linha.responsavelPrincipal}</small>
                  </td>
                  <td>${tarefa.descricao}</td>
                  <td><span class="task-status-badge ${statusClass}">${tarefa.status}</span></td>
                  <td><strong>${tarefa.percentualConcluido}%</strong></td>
                  <td><small>${indTexto}</small></td>
                `;
                tbody.appendChild(tr);
              });
            }
          });
        }
      });
    }
  });

  const emptyState = document.getElementById("results-empty-state");
  const tableElement = document.getElementById("results-table-element");
  
  if (totalLinhas === 0) {
    emptyState.style.display = "block";
    tableElement.style.display = "none";
  } else {
    emptyState.style.display = "none";
    tableElement.style.display = "table";
  }
}

// --- 6. Exportação de Dados e Integridade (RF06, RNF04) ---

function exportData(formato) {
  // Extrai as linhas atualmente visíveis na tabela de busca para simular integridade total
  const rows = document.querySelectorAll("#results-table-body tr");
  if (rows.length === 0) {
    alert("Aviso: Não há dados no conjunto atual para exportar. Aplique outros filtros.");
    return;
  }

  let exportContent = "";
  const filename = `plano_decenal_export_${new Date().toISOString().split('T')[0]}.${formato.toLowerCase()}`;

  if (formato === "CSV" || formato === "Excel") {
    // Cabeçalho
    exportContent = "Problema;Compromisso;Objetivo;LinhaAcao;Responsavel;Tarefa;Status;Progresso\n";
    rows.forEach(row => {
      const cols = row.querySelectorAll("td");
      if (cols.length >= 6) {
        const probCompText = cols[0].innerText.replace(/\n/g, " - ").replace(/;/g, ",");
        const objText = cols[1].innerText.replace(/;/g, ",");
        const linhaRespText = cols[2].innerText.replace(/\n/g, " - ").replace(/;/g, ",");
        const tarefaText = cols[3].innerText.replace(/;/g, ",");
        const statusText = cols[4].innerText;
        const progressoText = cols[5].innerText;
        exportContent += `"${probCompText}";"${objText}";"${linhaRespText}";"${tarefaText}";"${statusText}";"${progressoText}"\n`;
      }
    });
  } else if (formato === "PDF") {
    exportContent = "=== RELATÓRIO DO MONITORAMENTO DECENAL DE POLÍTICAS PÚBLICAS ===\n\n";
    exportContent += `Última atualização do sistema: ${new Date(window.db.ultimoUpdate).toLocaleString("pt-BR")}\n`;
    exportContent += `Total de registros exportados: ${rows.length}\n\n`;
    rows.forEach((row, i) => {
      const cols = row.querySelectorAll("td");
      if (cols.length >= 6) {
        exportContent += `${i+1}. TAREFA: ${cols[3].innerText} [${cols[4].innerText}] - Progresso: ${cols[5].innerText}\n`;
        exportContent += `   Hierarquia: ${cols[0].innerText.split("\n")[0]} > ${cols[1].innerText} > ${cols[2].innerText.split("\n")[0]}\n\n`;
      }
    });
  }

  // Gera o download do arquivo de forma real no navegador para garantir a integridade técnica (RNF04)
  const blob = new Blob([exportContent], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();

  // Registrar ação de exportação na Auditoria (RF13)
  const usuarioLogadoNome = loggedInUser ? loggedInUser.nome : "Público Geral";
  registrarAuditLog(usuarioLogadoNome, `Exportação de Relatório`, `Exportou ${rows.length} linhas de dados em formato ${formato}`);

  // Abre Modal de confirmação
  document.getElementById("export-filename").textContent = filename;
  document.getElementById("modal-export").style.display = "flex";
}

function closeExportModal() {
  document.getElementById("modal-export").style.display = "none";
}

// --- 7. Dashboard Geral e Gráficos de Progresso (RF14, RF15, RF16) ---

function renderDashboardCharts() {
  const selectedYear = parseInt(document.getElementById("dashboard-year").value);
  
  let totalTasks = 0;
  let completedTasks = 0;
  let inProgressTasks = 0;
  let notStartedTasks = 0;
  let sumProgress = 0;

  let totalIndicators = 0;
  let quantIndicators = 0;
  let qualIndicators = 0;

  // Percorre dados mockados acumulando métricas do ano selecionado
  window.db.problemas.forEach(prob => {
    if (prob.compromisso && prob.compromisso.objetivos) {
      prob.compromisso.objetivos.forEach(o => {
        if (o.linhasAcao) {
          o.linhasAcao.forEach(l => {
            if (l.tarefas) {
              l.tarefas.forEach(t => {
                totalTasks++;
                sumProgress += t.percentualConcluido;

                if (t.status === "Concluída") completedTasks++;
                else if (t.status === "Em Andamento") inProgressTasks++;
                else notStartedTasks++;

                // Indicadores
                if (t.indicadores) {
                  t.indicadores.forEach(ind => {
                    totalIndicators++;
                    if (ind.tipo === "Quantitativo") quantIndicators++;
                    else qualIndicators++;
                  });
                }
              });
            }
          });
        }
      });
    }
  });

  const avgProgress = totalTasks > 0 ? Math.round(sumProgress / totalTasks) : 0;

  // Atualiza métricas na interface
  document.getElementById("dashboard-metric-progress").textContent = `${avgProgress}%`;
  document.getElementById("dashboard-metric-tasks").textContent = totalTasks;
  document.getElementById("dashboard-metric-completed").textContent = completedTasks;
  document.getElementById("dashboard-metric-pending").textContent = inProgressTasks;

  // --- Destruição e Re-criação de Gráficos de Status ---
  if (charts.status) {
    charts.status.destroy();
  }
  
  const ctxStatus = document.getElementById("chart-status-distribution").getContext("2d");
  
  // Customização de Cores Base ou Alto Contraste (RF10/RNF01)
  const colorsStatus = isHighContrast
    ? ["#ffffff", "#ffff00", "#ff0000"] // Contraste
    : ["#10b981", "#f59e0b", "#ef4444"]; // Normal

  charts.status = new Chart(ctxStatus, {
    type: 'doughnut',
    data: {
      labels: ['Concluída', 'Em Andamento', 'Não Iniciada'],
      datasets: [{
        data: [completedTasks, inProgressTasks, notStartedTasks],
        backgroundColor: colorsStatus,
        borderWidth: isHighContrast ? 2 : 1,
        borderColor: isHighContrast ? "#ffff00" : "#ffffff"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: isHighContrast ? '#ffff00' : '#475569'
          }
        }
      }
    }
  });

  // --- Gráfico de Tipo de Indicadores (RF16) ---
  if (charts.types) {
    charts.types.destroy();
  }

  const ctxType = document.getElementById("chart-type-distribution").getContext("2d");
  const colorsType = isHighContrast
    ? ["#00ffff", "#ffff00"]
    : ["#0d9488", "#0ea5e9"];

  charts.types = new Chart(ctxType, {
    type: 'bar',
    data: {
      labels: ['Quantitativo', 'Qualitativo'],
      datasets: [{
        label: 'Quantidade de Indicadores por Tipo (RF16)',
        data: [quantIndicators, qualIndicators],
        backgroundColor: colorsType,
        borderWidth: isHighContrast ? 2 : 0,
        borderColor: isHighContrast ? "#ffff00" : "transparent"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: isHighContrast ? '#ffff00' : '#475569',
            stepSize: 1
          },
          grid: {
            color: isHighContrast ? '#555555' : '#e2e8f0'
          }
        },
        x: {
          ticks: {
            color: isHighContrast ? '#ffff00' : '#475569'
          },
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

// --- 8. Autenticação Simulada via Token JWT (RF11, RNF10, RNF08) ---

function authenticateUser() {
  const email = document.getElementById("login-email").value.toLowerCase().trim();
  const password = document.getElementById("login-password").value;

  const user = window.db.usuarios.find(u => u.email === email && u.senha === password);

  if (user) {
    // Simula uma string JWT básica: header.payload.signature encoded em Base64
    const simulatedHeader = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const simulatedPayload = btoa(JSON.stringify({ userId: user.id, name: user.nome, role: user.perfil, exp: Date.now() + 1800000 }));
    const simulatedSignature = btoa("valid_requisitos_signature");
    const mockJwtToken = `${simulatedHeader}.${simulatedPayload}.${simulatedSignature}`;

    // Armazena no SessionStorage
    sessionStorage.setItem("jwt_token", mockJwtToken);
    sessionStorage.setItem("user", JSON.stringify(user));
    
    loggedInUser = user;

    // Atualiza a visualização do cabeçalho
    atualizarCardUsuarioLogado();

    // Log na auditoria (RF13)
    registrarAuditLog(user.nome, "Login no Sistema", `Usuário com perfil ${user.perfil} efetuou login gerando Token JWT.`);

    // Habilita telas com base na permissão
    document.getElementById("btn-logout").style.display = "block";
    if (user.perfil === "SEDEF") {
      document.getElementById("tab-li-auditoria").style.display = "block";
    }

    // Limpa formulário e redireciona
    document.getElementById("login-email").value = "";
    document.getElementById("login-password").value = "";
    
    // Inicia temporizador de inatividade (RNF08)
    iniciarContadorSessao();

    switchScreen("gestor", document.getElementById("tab-btn-gestor"));
  } else {
    alert("Falha na autenticação: E-mail ou senha inválidos. Verifique as credenciais no rodapé do formulário.");
    registrarAuditLog("Público Geral", "Falha de Login", `Tentativa frustrada de autenticação com o email: ${email}`);
  }
}

function checarTokenSessao() {
  const token = sessionStorage.getItem("jwt_token");
  const userStr = sessionStorage.getItem("user");
  
  if (token && userStr) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        // Valida expiração teórica contida no token
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp > Date.now()) {
          loggedInUser = JSON.parse(userStr);
          atualizarCardUsuarioLogado();
          document.getElementById("btn-logout").style.display = "block";
          
          if (loggedInUser.perfil === "SEDEF") {
            document.getElementById("tab-li-auditoria").style.display = "block";
          }
          
          iniciarContadorSessao();
          return true;
        }
      }
    } catch(e) {
      console.error("Token de sessão corrompido");
    }
  }
  return false;
}

function atualizarCardUsuarioLogado() {
  const nameCard = document.getElementById("user-status-name");
  const dotCard = document.getElementById("user-status-dot");
  
  if (loggedInUser) {
    nameCard.textContent = `${loggedInUser.nome} [${loggedInUser.perfil}]`;
    dotCard.style.backgroundColor = loggedInUser.perfil === "SEDEF" ? "var(--color-danger)" : "var(--color-warning)";
  } else {
    nameCard.textContent = "Público Geral (Não Autenticado)";
    dotCard.style.backgroundColor = "var(--text-light)";
  }
}

function logout(auto = false) {
  const anteriorUsuario = loggedInUser ? loggedInUser.nome : "Desconhecido";
  
  // Limpa tokens
  sessionStorage.removeItem("jwt_token");
  sessionStorage.removeItem("user");
  loggedInUser = null;

  // Reseta interface do menu e estado
  document.getElementById("btn-logout").style.display = "none";
  document.getElementById("tab-li-auditoria").style.display = "none";
  document.getElementById("session-alert").style.display = "none";
  atualizarCardUsuarioLogado();

  // Limpa intervalos ativos
  clearInterval(sessionTimeoutTimer);
  clearInterval(sessionCountdownInterval);

  if (auto) {
    alert("Sua sessão expirou devido a 30 minutos de inatividade. Efetue login novamente para continuar.");
    registrarAuditLog(anteriorUsuario, "Expiração de Sessão", "Expiração automática por inatividade de 30 minutos.");
  } else {
    registrarAuditLog(anteriorUsuario, "Logout Voluntário", "O usuário clicou em Sair.");
  }

  switchScreen("hierarquia", document.querySelector(".nav-tab-btn"));
}

// --- 9. Temporizador de Inatividade de Sessão (RNF08, Regra de Negócio) ---

function iniciarContadorSessao() {
  clearInterval(sessionTimeoutTimer);
  clearInterval(sessionCountdownInterval);
  
  secondsRemaining = SESSION_TIMEOUT_SECONDS;
  
  // Verifica a cada segundo se chegou ao fim
  sessionTimeoutTimer = setInterval(() => {
    secondsRemaining--;
    
    // Exibe banner de aviso se restarem menos de 60 segundos
    if (secondsRemaining <= 60 && secondsRemaining > 0) {
      document.getElementById("session-alert").style.display = "block";
      document.getElementById("session-countdown").textContent = secondsRemaining;
    }

    if (secondsRemaining <= 0) {
      logout(true); // Efetua logout automático
    }
  }, 1000);
}

function resetInactivityTimer() {
  if (loggedInUser) {
    secondsRemaining = SESSION_TIMEOUT_SECONDS;
    document.getElementById("session-alert").style.display = "none";
  }
}

function configurarEventosInatividade() {
  // Reinicia o contador se houver interação do usuário (movimento do mouse, cliques, teclas)
  const eventos = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  eventos.forEach(ev => {
    document.addEventListener(ev, resetInactivityTimer, true);
  });
}

// --- 10. Cadastro Manual e Validação Hierárquica Rígida (RF12, RF20, Regra de Negócio) ---

function adjustInsertFormFields() {
  const level = document.getElementById("insert-level").value;
  const container = document.getElementById("dynamic-insert-fields");
  container.innerHTML = "";

  if (level === "problema") {
    container.innerHTML = `
      <div class="form-group" style="margin-top:12px;">
        <label for="new-prob-desc">Descrição do Problema Público (23 Problemas Máx)</label>
        <textarea id="new-prob-desc" class="form-control" rows="2" required placeholder="Ex: Problema 24: Baixo acesso a atividades culturais na infância"></textarea>
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label for="new-comp-title">Título do Compromisso Decenal Associado</label>
        <textarea id="new-comp-title" class="form-control" rows="2" required placeholder="Ex: Compromisso 24: Ampliar em 60% a cobertura de editais infantis no estado"></textarea>
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label for="new-comp-eixo">Eixo Temático</label>
        <select id="new-comp-eixo" class="form-control" required>
          ${EIXOS.map(e => `<option value="${e}">${e}</option>`).join("")}
        </select>
      </div>
    `;
  } else if (level === "objetivo") {
    // Popula select com os compromissos cadastrados no sistema respeitando a hierarquia rígida
    const optionsComp = window.db.problemas.map(p => `
      <option value="${p.id}">Compromisso ${p.id} - ${p.compromisso.titulo.substring(0, 50)}...</option>
    `).join("");

    container.innerHTML = `
      <div class="form-group" style="margin-top:12px;">
        <label for="parent-prob-id">Vincular ao Compromisso Decenal (Hierarquia)</label>
        <select id="parent-prob-id" class="form-control" required>
          ${optionsComp}
        </select>
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label for="new-obj-desc">Descrição do Novo Objetivo</label>
        <textarea id="new-obj-desc" class="form-control" rows="2" required placeholder="Ex: Objetivo X.X: Criar 4 novos centros culturais integrados"></textarea>
      </div>
    `;
  } else if (level === "linha") {
    // Popula select de objetivos
    let optionsObj = "";
    window.db.problemas.forEach(p => {
      p.compromisso.objetivos.forEach(o => {
        optionsObj += `<option value="${o.id}">Compromisso ${p.id} -> Obj ${o.id}: ${o.descricao.substring(0, 50)}...</option>`;
      });
    });

    container.innerHTML = `
      <div class="form-group" style="margin-top:12px;">
        <label for="parent-obj-id">Vincular ao Objetivo (Hierarquia)</label>
        <select id="parent-obj-id" class="form-control" required>
          ${optionsObj}
        </select>
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label for="new-linha-desc">Diretriz da Linha de Ação</label>
        <textarea id="new-linha-desc" class="form-control" rows="2" required placeholder="Ex: Linha de Ação X.X.X: Construção de bibliotecas em municípios de baixa renda"></textarea>
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label for="new-linha-resp">Secretaria/Órgão Responsável Principal (RF17)</label>
        <input type="text" id="new-linha-resp" class="form-control" required placeholder="Ex: Secretaria de Cultura">
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label for="new-linha-colabs">Órgãos Colaboradores (separados por vírgula) (RF17)</label>
        <input type="text" id="new-linha-colabs" class="form-control" placeholder="Ex: Prefeituras Municipais, SEDEF">
      </div>
    `;
  } else if (level === "tarefa") {
    // Popula select de Linhas de Ação
    let optionsLinhas = "";
    window.db.problemas.forEach(p => {
      p.compromisso.objetivos.forEach(o => {
        o.linhasAcao.forEach(l => {
          optionsLinhas += `<option value="${l.id}">Obj ${o.id} -> Linha ${l.id}: ${l.descricao.substring(0, 50)}...</option>`;
        });
      });
    });

    container.innerHTML = `
      <div class="form-group" style="margin-top:12px;">
        <label for="parent-linha-id">Vincular à Linha de Ação (Hierarquia)</label>
        <select id="parent-linha-id" class="form-control" required>
          ${optionsLinhas}
        </select>
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label for="new-task-desc">Descrição da Nova Tarefa</label>
        <textarea id="new-task-desc" class="form-control" rows="2" required placeholder="Ex: Tarefa X.X.X.X: Licitar materiais de obra"></textarea>
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label for="new-task-status">Status Inicial</label>
        <select id="new-task-status" class="form-control" required>
          <option value="Não Iniciada">Não Iniciada</option>
          <option value="Em Andamento">Em Andamento</option>
          <option value="Concluída">Concluída</option>
        </select>
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label for="new-task-percent">Percentual Concluído (%)</label>
        <input type="number" id="new-task-percent" class="form-control" min="0" max="100" value="0" required>
      </div>
    `;
  } else if (level === "indicador") {
    // Popula select de Tarefas
    let optionsTarefas = "";
    window.db.problemas.forEach(p => {
      p.compromisso.objetivos.forEach(o => {
        o.linhasAcao.forEach(l => {
          l.tarefas.forEach(t => {
            optionsTarefas += `<option value="${t.id}">Linha ${l.id} -> Tarefa #${t.id}: ${t.descricao.substring(0, 50)}...</option>`;
          });
        });
      });
    });

    container.innerHTML = `
      <div class="form-group" style="margin-top:12px;">
        <label for="parent-task-id">Vincular à Tarefa Monitorada (Hierarquia)</label>
        <select id="parent-task-id" class="form-control" required>
          ${optionsTarefas}
        </select>
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label for="new-ind-name">Nome do Indicador</label>
        <textarea id="new-ind-name" class="form-control" rows="2" required placeholder="Ex: Percentual de municípios com bibliotecas ativas"></textarea>
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label for="new-ind-tipo">Tipo do Indicador (Diferenciação Visual RNF01/RF16)</label>
        <select id="new-ind-tipo" class="form-control" required>
          <option value="Quantitativo">Quantitativo (Métricas numéricas)</option>
          <option value="Qualitativo">Qualitativo (Avaliação de percepção)</option>
        </select>
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label for="new-ind-val">Valor Atual (%)</label>
        <input type="number" id="new-ind-val" class="form-control" min="0" max="100" value="0" required>
      </div>
    `;
  }
}

function submitManualData() {
  const level = document.getElementById("insert-level").value;
  const usuarioLogadoNome = loggedInUser ? loggedInUser.nome : "Gestor Autenticado";

  if (level === "problema") {
    const desc = document.getElementById("new-prob-desc").value.trim();
    const compTitle = document.getElementById("new-comp-title").value.trim();
    const compEixo = document.getElementById("new-comp-eixo").value;

    const novoId = window.db.problemas.length + 1;
    const novoProblema = {
      id: novoId,
      descricao: desc,
      compromisso: {
        titulo: compTitle,
        eixo: compEixo,
        objetivos: []
      }
    };

    window.db.problemas.push(novoProblema);
    window.salvarEstado();
    
    registrarAuditLog(usuarioLogadoNome, "Cadastro de Problema/Compromisso", `Cadastrado Problema #${novoId} vinculado ao Compromisso.`);
    alert("Problema e Compromisso cadastrados com sucesso na base decenária!");
  } 
  else if (level === "objetivo") {
    const probId = parseInt(document.getElementById("parent-prob-id").value);
    const desc = document.getElementById("new-obj-desc").value.trim();

    const prob = window.db.problemas.find(p => p.id === probId);
    if (!prob) return;

    const novoId = 100 + Math.floor(Math.random() * 900); // Gera ID aleatório para protótipo
    const novoObjetivo = {
      id: novoId,
      descricao: desc,
      linhasAcao: []
    };

    prob.compromisso.objetivos.push(novoObjetivo);
    window.salvarEstado();
    
    registrarAuditLog(usuarioLogadoNome, "Cadastro de Objetivo", `Novo Objetivo #${novoId} vinculado ao Compromisso #${probId}.`);
    alert("Objetivo cadastrado e vinculado na hierarquia!");
  } 
  else if (level === "linha") {
    const objId = parseInt(document.getElementById("parent-obj-id").value);
    const desc = document.getElementById("new-linha-desc").value.trim();
    const resp = document.getElementById("new-linha-resp").value.trim();
    const colabs = document.getElementById("new-linha-colabs").value.trim();

    let objetivoPai = null;
    window.db.problemas.forEach(p => {
      p.compromisso.objetivos.forEach(o => {
        if (o.id === objId) objetivoPai = o;
      });
    });

    if (!objetivoPai) return;

    const novoId = 1000 + Math.floor(Math.random() * 9000);
    const novaLinha = {
      id: novoId,
      descricao: desc,
      responsavelPrincipal: resp,
      colaboradores: colabs,
      tarefas: []
    };

    objetivoPai.linhasAcao.push(novaLinha);
    window.salvarEstado();

    registrarAuditLog(usuarioLogadoNome, "Cadastro de Linha de Ação", `Nova Linha de Ação #${novoId} vinculada ao Objetivo #${objId}.`);
    alert("Linha de Ação adicionada com sucesso!");
  } 
  else if (level === "tarefa") {
    const linhaId = parseInt(document.getElementById("parent-linha-id").value);
    const desc = document.getElementById("new-task-desc").value.trim();
    const status = document.getElementById("new-task-status").value;
    const percent = parseInt(document.getElementById("new-task-percent").value);

    let linhaPai = null;
    window.db.problemas.forEach(p => {
      p.compromisso.objetivos.forEach(o => {
        o.linhasAcao.forEach(l => {
          if (l.id === linhaId) linhaPai = l;
        });
      });
    });

    if (!linhaPai) return;

    const novoId = 10000 + Math.floor(Math.random() * 90000);
    const novaTarefa = {
      id: novoId,
      descricao: desc,
      status: status,
      percentualConcluido: percent,
      historico: [
        { data: new Date().toISOString(), usuario: usuarioLogadoNome, acao: "Criação da tarefa", status: status, percentual: percent }
      ],
      indicadores: []
    };

    linhaPai.tarefas.push(novaTarefa);
    window.salvarEstado();

    registrarAuditLog(usuarioLogadoNome, "Cadastro de Tarefa", `Nova Tarefa #${novoId} vinculada à Linha de Ação #${linhaId}.`);
    alert("Tarefa cadastrada com sucesso!");
  } 
  else if (level === "indicador") {
    const tarefaId = parseInt(document.getElementById("parent-task-id").value);
    const nome = document.getElementById("new-ind-name").value.trim();
    const tipo = document.getElementById("new-ind-tipo").value;
    const val = parseFloat(document.getElementById("new-ind-val").value);

    let tarefaPai = null;
    window.db.problemas.forEach(p => {
      p.compromisso.objetivos.forEach(o => {
        o.linhasAcao.forEach(l => {
          l.tarefas.forEach(t => {
            if (t.id === tarefaId) tarefaPai = t;
          });
        });
      });
    });

    if (!tarefaPai) return;

    const novoId = 20000 + Math.floor(Math.random() * 80000);
    const novoIndicador = {
      id: novoId,
      nome: nome,
      tipo: tipo,
      historicoValores: [
        { ano: 2026, valor: val }
      ]
    };

    tarefaPai.indicadores.push(novoIndicador);
    window.salvarEstado();

    registrarAuditLog(usuarioLogadoNome, "Cadastro de Indicador", `Novo Indicador #${novoId} vinculado à Tarefa #${tarefaId}.`);
    alert("Indicador anexado à tarefa com sucesso!");
  }

  // Reseta campos, atualiza árvore e dashboards
  document.getElementById("data-insert-form").reset();
  carregarProblemasNoMenu();
  selecionarProblema(1);
  preencherFiltrosDeBusca();
  applySearchFilters();
  renderDashboardCharts();
  adjustInsertFormFields();
}

// --- 11. Importação em Lote via CSV com Validação Rígida (RF19, Regras de Negócio) ---

// Gera modelo de planilha CSV para facilitar testes do usuário (RF19)
function downloadSampleCSV() {
  const content = "id_tarefa;descricao;status;percentual;responsavel\n" +
                  "10001;Tarefa 1.1.1.1: Implementar sistema online de alerta de infrequência;Em Andamento;90;Secretaria de Educação (SEDUC)\n" +
                  "10002;Tarefa 1.1.1.2: Capacitação de conselheiros tutelares em busca ativa;Concluída;100;Conselho Estadual\n" +
                  "10003;Tarefa 2.1.1.1: Distribuição mensal de cestas nutricionais específicas;Concluída;100;Secretaria de Saúde (SES)";
  
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "modelo_importacao_monitoramento.csv";
  link.click();
}

// Eventos de arrastar e soltar (Drag and Drop UI)
const dragDropZone = document.getElementById("drag-drop-zone");
if (dragDropZone) {
  ['dragenter', 'dragover'].forEach(eventName => {
    dragDropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dragDropZone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dragDropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dragDropZone.classList.remove('dragover');
    }, false);
  });

  dragDropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0 && files[0].name.endsWith(".csv")) {
      document.getElementById("csv-file-input").files = files;
      processarPlanilhaCSV(files[0]);
    } else {
      alert("Apenas arquivos .CSV são aceitos para processamento.");
    }
  }, false);
}

function handleFileSelect(input) {
  if (input.files.length > 0) {
    processarPlanilhaCSV(input.files[0]);
  }
}

function processarPlanilhaCSV(file) {
  const feedback = document.getElementById("upload-feedback");
  feedback.style.display = "block";
  feedback.className = "upload-feedback-box";
  feedback.innerHTML = "Lendo e validando estrutura do arquivo...";

  const reader = new FileReader();
  reader.readAsText(file, "UTF-8");
  
  reader.onload = function(evt) {
    const csvData = evt.target.result;
    
    // Processamento usando a biblioteca PapaParse (importada via CDN)
    Papa.parse(csvData, {
      delimiter: ";",
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        validarEImportarDados(results.data);
      },
      error: function(err) {
        exibirFeedbackUpload(false, `Erro ao processar CSV: ${err.message}`);
      }
    });
  };
}

function validarEImportarDados(rows) {
  const usuarioLogadoNome = loggedInUser ? loggedInUser.nome : "Gestor Autenticado";
  const logsDeErros = [];
  const atualizacoesExecutar = [];

  // 1. Valida estrutura de cabeçalho
  if (rows.length === 0) {
    exibirFeedbackUpload(false, "Erro: A planilha está vazia.");
    return;
  }
  
  const headers = Object.keys(rows[0]);
  const colunasObrigatorias = ["id_tarefa", "status", "percentual"];
  const faltamColunas = colunasObrigatorias.filter(c => !headers.includes(c));

  if (faltamColunas.length > 0) {
    exibirFeedbackUpload(false, `Erro de Colunas: Cabeçalhos obrigatórios não encontrados (${faltamColunas.join(", ")}). Certifique-se de usar ponto-e-vírgula ';' como delimitador.`);
    return;
  }

  // 2. Valida integridade e hierarquia de cada registro (Regra de Negócio: "consistência de carga: interrupção do processo e reporte de erros em caso de falhas na hierarquia")
  rows.forEach((row, index) => {
    const linhaNum = index + 2; // Linha da planilha (1-based + cabeçalho)
    const idTarefa = parseInt(row.id_tarefa);
    const status = row.status ? row.status.trim() : "";
    const percentual = parseInt(row.percentual);

    // Validações de Campo
    if (isNaN(idTarefa)) {
      logsDeErros.push(`Linha ${linhaNum}: ID da tarefa inválido.`);
      return;
    }
    if (!["Não Iniciada", "Em Andamento", "Concluída"].includes(status)) {
      logsDeErros.push(`Linha ${linhaNum}: Status '${status}' inválido. Deve ser 'Não Iniciada', 'Em Andamento' ou 'Concluída'.`);
      return;
    }
    if (isNaN(percentual) || percentual < 0 || percentual > 100) {
      logsDeErros.push(`Linha ${linhaNum}: Percentual '${row.percentual}' inválido. Deve ser um número de 0 a 100.`);
      return;
    }

    // Busca tarefa correspondente na hierarquia para verificar integridade da referência
    let tarefaEncontrada = null;
    window.db.problemas.forEach(p => {
      if (p.compromisso && p.compromisso.objetivos) {
        p.compromisso.objetivos.forEach(o => {
          if (o.linhasAcao) {
            o.linhasAcao.forEach(l => {
              if (l.tarefas) {
                const t = l.tarefas.find(tk => tk.id === idTarefa);
                if (t) tarefaEncontrada = t;
              }
            });
          }
        });
      }
    });

    if (!tarefaEncontrada) {
      logsDeErros.push(`Linha ${linhaNum}: Erro de Hierarquia! A tarefa ID #${idTarefa} não existe na estrutura hierárquica cadastrada.`);
    } else {
      // Registra a atualização para executar apenas se o lote inteiro estiver correto (Atomicidade da carga)
      atualizacoesExecutar.push({
        refTarefa: tarefaEncontrada,
        status: status,
        percentual: percentual,
        descricao: row.descricao || tarefaEncontrada.descricao,
        responsavel: row.responsavel || ""
      });
    }
  });

  // 3. Verifica se houve falhas
  if (logsDeErros.length > 0) {
    // Interrompe e reporta erros para manter consistência de dados
    let errorHtml = "<strong>Carga Cancelada! Detectamos inconsistências:</strong><ul style='margin-left:16px; margin-top:8px;'>";
    logsDeErros.slice(0, 5).forEach(err => errorHtml += `<li>${err}</li>`);
    if (logsDeErros.length > 5) errorHtml += `<li>... e mais ${logsDeErros.length - 5} erros.</li>`;
    errorHtml += "</ul>";
    exibirFeedbackUpload(false, errorHtml);
    return;
  }

  // 4. Executa atualizações e grava histórico (Regra de Negócio: arquivo mais recente prevalece e atualiza histórico)
  atualizacoesExecutar.forEach(up => {
    const statusAnterior = up.refTarefa.status;
    const percentualAnterior = up.refTarefa.percentualConcluido;
    
    // Atualiza
    up.refTarefa.status = up.status;
    up.refTarefa.percentualConcluido = up.percentual;
    if (up.descricao) up.refTarefa.descricao = up.descricao;

    // Registra alteração no histórico específico da tarefa (RF08)
    up.refTarefa.historico.push({
      data: new Date().toISOString(),
      usuario: usuarioLogadoNome,
      acao: "Atualização via Carga em Lote (Planilha)",
      status: up.status,
      percentual: up.percentual
    });

    registrarAuditLog(usuarioLogadoNome, "Atualização de Tarefa via Planilha", `Tarefa ID #${up.refTarefa.id} progresso atualizado de ${percentualAnterior}% para ${up.percentual}% via carga de arquivo CSV.`);
  });

  window.salvarEstado();

  // Recarrega visualizações
  carregarProblemasNoMenu();
  selecionarProblema(1);
  applySearchFilters();
  renderDashboardCharts();

  exibirFeedbackUpload(true, `Sucesso! Planilha carregada. ${atualizacoesExecutar.length} tarefas foram atualizadas na estrutura decenal.`);
}

function exibirFeedbackUpload(sucesso, mensagem) {
  const feedback = document.getElementById("upload-feedback");
  feedback.style.display = "block";
  if (sucesso) {
    feedback.className = "upload-feedback-box upload-feedback-success";
  } else {
    feedback.className = "upload-feedback-box upload-feedback-error";
  }
  feedback.innerHTML = mensagem;
}

// --- 12. Painel Administrativo de Usuários e Permissões (RF09) ---

function atualizarGerenciadorPermissoesUI() {
  const tbody = document.getElementById("user-permissions-tbody");
  tbody.innerHTML = "";

  window.db.usuarios.forEach(u => {
    const tr = document.createElement("tr");
    
    // Impede alterar o próprio perfil para evitar lock de permissão
    const isSelf = loggedInUser && loggedInUser.id === u.id;
    const actionsHtml = isSelf 
      ? `<em>Você (Conectado)</em>` 
      : `
        <select class="form-control" style="padding: 4px 8px; font-size: 0.8rem; width: auto;" onchange="alterarPerfilUsuario(${u.id}, this.value)">
          <option value="SEDEF" ${u.perfil === "SEDEF" ? "selected" : ""}>SEDEF (Super Admin)</option>
          <option value="CONSELHO" ${u.perfil === "CONSELHO" ? "selected" : ""}>Conselho Estadual / Secretarias</option>
          <option value="PUBLICO" ${u.perfil === "PUBLICO" ? "selected" : ""}>Público Geral</option>
        </select>
      `;

    tr.innerHTML = `
      <td><strong>${u.nome}</strong></td>
      <td><code>${u.email}</code></td>
      <td><span class="task-status-badge ${u.perfil === 'SEDEF' ? 'status-nao-iniciada' : 'status-em-andamento'}">${u.perfil}</span></td>
      <td>${actionsHtml}</td>
    `;
    tbody.appendChild(tr);
  });
}

function alterarPerfilUsuario(idUsuario, novoPerfil) {
  const usuario = window.db.usuarios.find(u => u.id === idUsuario);
  if (!usuario) return;

  const perfilAnterior = usuario.perfil;
  usuario.perfil = novoPerfil;
  
  window.salvarEstado();
  atualizarGerenciadorPermissoesUI();

  // Log de auditoria
  const executor = loggedInUser ? loggedInUser.nome : "SEDEF Administrador";
  registrarAuditLog(executor, "Alteração de Nível de Permissão", `Alterado perfil de ${usuario.nome} de '${perfilAnterior}' para '${novoPerfil}'`);
  
  alert(`Perfil de ${usuario.nome} atualizado para ${novoPerfil} com sucesso!`);
}

// --- 13. Exibição da Trilha de Auditoria Imutável (RF13) ---

function atualizarAuditLogsUI() {
  const tbody = document.getElementById("audit-logs-tbody");
  tbody.innerHTML = "";

  window.db.logs.forEach(l => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><small style="color:var(--text-light)">#${l.id}</small></td>
      <td><strong>${l.usuario}</strong></td>
      <td><span class="node-type-badge badge-linha" style="font-size:0.7rem;">${l.acao}</span></td>
      <td><small>${new Date(l.dataHora).toLocaleString("pt-BR")}</small></td>
      <td><span style="font-size:0.85rem;">${l.detalhes}</span></td>
    `;
    tbody.appendChild(tr);
  });
}
