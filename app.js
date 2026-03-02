// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD_aqjSiKYSIK_bNYDBpXU6AQco-s5Sm9Y",
    authDomain: "multicomandasete.firebaseapp.com",
    databaseURL: "https://multicomandasete-default-rtdb.firebaseio.com",
    projectId: "multicomandasete",
    storageBucket: "multicomandasete.firebasestorage.app",
    messagingSenderId: "925014010053",
    appId: "1:925014010053:web:f4634413dd540f8c14a8ac",
    measurementId: "G-5YK8CGYTV9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Global Variables
let currentUser = null;
let mesas = {};
let config = {
    totalMesas: 12,
    visualizacao: 'grade',
    filtroAtual: 'todas'
};
let timers = {};
let currentMesaSelecionada = null;

// Aguardar DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, iniciando app...');
    checkSavedSession();
    setupEventListeners();
});

// Check for saved session
function checkSavedSession() {
    const savedUser = localStorage.getItem('multicoma_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        document.getElementById('loginModal').classList.remove('active');
        document.getElementById('mainSection').classList.add('active');
        updateUserInfo();
        carregarConfiguracao();
        setupRealtimeListeners();
    }
}

// Setup Event Listeners
function setupEventListeners() {
    console.log('Configurando event listeners...');
    
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    
    // Cadastro Form
    const cadastroForm = document.getElementById('cadastroForm');
    if (cadastroForm) cadastroForm.addEventListener('submit', handleCadastro);
    
    // Logout Button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    
    // Configurar Mesas
    const configBtn = document.getElementById('configurarMesasBtn');
    if (configBtn) {
        configBtn.addEventListener('click', () => {
            const total = parseInt(document.getElementById('quantidadeMesas').value);
            config.totalMesas = total;
            localStorage.setItem('multicoma_config', JSON.stringify(config));
            inicializarMesas();
        });
    }
    
    // Abrir Múltiplas Mesas
    const multiBtn = document.getElementById('abrirMultiplasBtn');
    if (multiBtn) multiBtn.addEventListener('click', abrirMultiplasModal);
    
    // Multi Mesa Form
    const multiForm = document.getElementById('multiMesaForm');
    if (multiForm) multiForm.addEventListener('submit', handleAbrirMultiplas);
    
    // Fechar Mesa Form
    const fecharForm = document.getElementById('fecharMesaForm');
    if (fecharForm) fecharForm.addEventListener('submit', handleFecharMesa);
    
    // Editar Item Form
    const editarForm = document.getElementById('editarItemForm');
    if (editarForm) editarForm.addEventListener('submit', handleEditarItem);
    
    // Gorjeta calculation
    const gorjetaPercent = document.getElementById('fecharGorjetaPercent');
    const fecharValor = document.getElementById('fecharValor');
    if (gorjetaPercent) gorjetaPercent.addEventListener('input', calcularGorjeta);
    if (fecharValor) fecharValor.addEventListener('input', calcularGorjeta);
    
    // Click outside modals
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

// Setup Realtime Listeners
function setupRealtimeListeners() {
    if (!currentUser) return;
    
    try {
        const mesasRef = database.ref(`garcons/${currentUser.id}/mesas`);
        mesasRef.on('value', (snapshot) => {
            mesas = snapshot.val() || {};
            atualizarInterface();
            iniciarTimers();
        });
    } catch (error) {
        console.error('Erro ao configurar listeners:', error);
    }
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const usuario = document.getElementById('loginUsuario').value;
    const senha = document.getElementById('loginSenha').value;
    
    try {
        // Buscar usuário no Firebase
        const usuariosRef = database.ref('usuarios');
        const snapshot = await usuariosRef.orderByChild('usuario').equalTo(usuario).once('value');
        
        let usuarioEncontrado = null;
        snapshot.forEach(child => {
            const data = child.val();
            if (data.senha === senha) {
                usuarioEncontrado = {
                    id: child.key,
                    ...data
                };
            }
        });
        
        if (usuarioEncontrado) {
            currentUser = {
                id: usuarioEncontrado.id,
                nome: usuarioEncontrado.nome,
                usuario: usuarioEncontrado.usuario
            };
            
            localStorage.setItem('multicoma_user', JSON.stringify(currentUser));
            
            document.getElementById('loginModal').classList.remove('active');
            document.getElementById('mainSection').classList.add('active');
            updateUserInfo();
            carregarConfiguracao();
            setupRealtimeListeners();
        } else {
            alert('Usuário ou senha inválidos!');
        }
        
    } catch (error) {
        alert('Erro ao fazer login: ' + error.message);
    }
}

// Handle Cadastro
async function handleCadastro(e) {
    e.preventDefault();
    
    const nome = document.getElementById('cadastroNome').value;
    const usuario = document.getElementById('cadastroUsuario').value;
    const senha = document.getElementById('cadastroSenha').value;
    const confirmarSenha = document.getElementById('cadastroConfirmarSenha').value;
    
    if (senha !== confirmarSenha) {
        alert('As senhas não conferem!');
        return;
    }
    
    try {
        // Verificar se usuário já existe
        const usuariosRef = database.ref('usuarios');
        const snapshot = await usuariosRef.orderByChild('usuario').equalTo(usuario).once('value');
        
        if (snapshot.exists()) {
            alert('Usuário já existe!');
            return;
        }
        
        // Criar novo usuário
        const novoUsuario = {
            nome: nome,
            usuario: usuario,
            senha: senha,
            criadoEm: new Date().toISOString()
        };
        
        const newUserRef = await usuariosRef.push(novoUsuario);
        
        alert('Cadastro realizado com sucesso! Faça o login.');
        fecharModal('cadastroModal');
        document.getElementById('loginModal').classList.add('active');
        
    } catch (error) {
        alert('Erro ao cadastrar: ' + error.message);
    }
}

// Mostrar Cadastro
function mostrarCadastro() {
    document.getElementById('loginModal').classList.remove('active');
    document.getElementById('cadastroModal').classList.add('active');
}

// Logout Handler
function handleLogout() {
    const atendimentosHoje = contarAtendimentosHoje();
    const valorHoje = calcularFaturamentoHoje();
    
    const modalHtml = `
        <div id="logoutModal" class="modal" style="display: flex; z-index: 2000;">
            <div class="modal-content" style="max-width: 450px;">
                <div class="modal-header">
                    <h2><i class="fas fa-sign-out-alt"></i> Sair do Sistema</h2>
                </div>
                <div class="modal-body" style="padding: 20px;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <h4 style="margin-bottom: 10px;">Resumo do Dia:</h4>
                        <p><i class="fas fa-receipt"></i> Atendimentos hoje: <strong>${atendimentosHoje}</strong></p>
                        <p><i class="fas fa-dollar-sign"></i> Faturamento: <strong>${formatCurrency(valorHoje)}</strong></p>
                    </div>
                    
                    <p style="margin-bottom: 20px;">O que deseja fazer com estes dados?</p>
                    
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <button id="logoutManterHistorico" class="btn-primary" style="width: 100%; padding: 15px;">
                            <i class="fas fa-save"></i> Manter no Histórico
                        </button>
                        <button id="logoutApagarHoje" class="btn-warning" style="width: 100%; padding: 15px; background: #e67e22;">
                            <i class="fas fa-trash-alt"></i> Apagar Dados de Hoje
                        </button>
                        <button id="logoutCancelar" class="btn-secondary" style="width: 100%; padding: 15px;">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const oldModal = document.getElementById('logoutModal');
    if (oldModal) oldModal.remove();
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    document.getElementById('logoutManterHistorico').addEventListener('click', () => {
        realizarLogout(false);
        document.getElementById('logoutModal').remove();
    });
    
    document.getElementById('logoutApagarHoje').addEventListener('click', () => {
        if (confirm('Tem certeza que deseja apagar todos os atendimentos de hoje?')) {
            realizarLogout(true);
            document.getElementById('logoutModal').remove();
        }
    });
    
    document.getElementById('logoutCancelar').addEventListener('click', () => {
        document.getElementById('logoutModal').remove();
    });
}

// Realizar Logout
function realizarLogout(apagarHoje) {
    if (apagarHoje) {
        const hoje = new Date().toDateString();
        const mesasParaManter = {};
        
        Object.keys(mesas).forEach(key => {
            const mesa = mesas[key];
            
            if (mesa.status === 'fechada' && mesa.fechadaEm && 
                new Date(mesa.fechadaEm).toDateString() === hoje) {
                // Não incluir - vai apagar
            } 
            else if (mesa.status === 'ativa') {
                mesa.status = 'fechada';
                mesa.fechadaEm = new Date().toISOString();
                mesa.valorTotal = mesa.valorTotal || 0;
                mesa.observacoes = (mesa.observacoes || '') + ' - Fechada automática (logout)';
                
                if (!mesa.historico) mesa.historico = [];
                mesa.historico.push({
                    data: new Date().toISOString(),
                    acao: 'Mesa fechada automaticamente no logout',
                    usuario: currentUser?.nome || 'Sistema'
                });
                
                mesasParaManter[key] = mesa;
            }
            else {
                mesasParaManter[key] = mesa;
            }
        });
        
        mesas = mesasParaManter;
        
        if (currentUser) {
            database.ref(`garcons/${currentUser.id}/mesas`).set(mesas);
        }
    }
    
    Object.values(timers).forEach(timer => clearInterval(timer));
    timers = {};
    
    currentUser = null;
    localStorage.removeItem('multicoma_user');
    mesas = {};
    
    document.getElementById('mainSection').classList.remove('active');
    document.getElementById('loginModal').classList.add('active');
}

// Load saved configuration
function carregarConfiguracao() {
    const savedConfig = localStorage.getItem('multicoma_config');
    if (savedConfig) {
        config = { ...config, ...JSON.parse(savedConfig) };
        const input = document.getElementById('quantidadeMesas');
        if (input) input.value = config.totalMesas;
    }
    inicializarMesas();
}

// Initialize default mesas
function inicializarMesas() {
    const novasMesas = {};
    
    for (let i = 1; i <= config.totalMesas; i++) {
        if (!mesas[i]) {
            novasMesas[i] = {
                numero: i,
                status: 'livre',
                historico: []
            };
        } else {
            novasMesas[i] = mesas[i];
        }
    }
    
    Object.keys(mesas).forEach(key => {
        if (parseInt(key) > config.totalMesas) {
            if (mesas[key].status !== 'livre' && mesas[key].status !== 'fechada') {
                config.totalMesas = Math.max(config.totalMesas, parseInt(key));
            }
        }
    });
    
    mesas = novasMesas;
    salvarMesas();
}

// Update User Info
function updateUserInfo() {
    const userName = document.getElementById('userName');
    if (userName && currentUser) {
        userName.textContent = currentUser.nome;
    }
}

// Atualizar Interface
function atualizarInterface() {
    atualizarStats();
    renderizarGradeMesas();
    atualizarDashboardMini();
}

// Atualizar Stats
function atualizarStats() {
    const totalMesas = Object.keys(mesas).length;
    const ativas = Object.values(mesas).filter(m => m.status === 'ativa').length;
    const fechadas = Object.values(mesas).filter(m => m.status === 'fechada').length;
    
    const totalEl = document.getElementById('totalMesas');
    const activeEl = document.getElementById('activeTables');
    const closedEl = document.getElementById('closedTables');
    const revenueEl = document.getElementById('todayRevenue');
    
    if (totalEl) totalEl.textContent = totalMesas;
    if (activeEl) activeEl.textContent = ativas;
    if (closedEl) closedEl.textContent = fechadas;
    
    const hoje = new Date().toDateString();
    const faturamentoHoje = Object.values(mesas)
        .filter(m => m.status === 'fechada' && m.fechadaEm && new Date(m.fechadaEm).toDateString() === hoje)
        .reduce((sum, m) => sum + (m.valorTotal || 0), 0);
    
    if (revenueEl) revenueEl.textContent = formatCurrency(faturamentoHoje);
}

// Renderizar Grade de Mesas
function renderizarGradeMesas() {
    const container = document.getElementById('mesasGrid');
    if (!container) return;
    
    container.className = `mesas-grid ${config.visualizacao === 'lista' ? 'lista-view' : ''}`;
    
    let mesasFiltradas = Object.values(mesas).sort((a, b) => a.numero - b.numero);
    
    switch(config.filtroAtual) {
        case 'ativas':
            mesasFiltradas = mesasFiltradas.filter(m => m.status === 'ativa');
            break;
        case 'fechadas':
            mesasFiltradas = mesasFiltradas.filter(m => m.status === 'fechada');
            break;
        case 'minhas':
            mesasFiltradas = mesasFiltradas.filter(m => m.garcomId === currentUser?.id);
            break;
    }
    
    if (mesasFiltradas.length === 0) {
        container.innerHTML = '<p class="empty-msg">Nenhuma mesa encontrada</p>';
        return;
    }
    
    let html = '';
    mesasFiltradas.forEach(mesa => {
        const tempo = calcularTempoDecorrido(mesa);
        const isMinha = mesa.garcomId === currentUser?.id;
        
        html += `
            <div class="mesa-card ${mesa.status} ${isMinha ? 'minha-mesa' : ''} ${config.visualizacao}" 
                 onclick="abrirDetalhesMesa(${mesa.numero})">
                <div class="mesa-numero">Mesa ${mesa.numero}</div>
                <div class="mesa-status status-${mesa.status}">
                    ${getStatusText(mesa.status)}
                </div>
                ${mesa.status === 'ativa' ? `
                    <div class="mesa-tempo">${tempo}</div>
                ` : ''}
                <div class="mesa-info">
                    ${mesa.pessoas ? `<p><i class="fas fa-users"></i> ${mesa.pessoas} pessoas</p>` : ''}
                    ${mesa.garcomNome ? `<p><i class="fas fa-user"></i> ${mesa.garcomNome}</p>` : ''}
                    ${mesa.valorTotal ? `<p><i class="fas fa-dollar-sign"></i> ${formatCurrency(mesa.valorTotal)}</p>` : ''}
                </div>
                ${isMinha ? '<div class="mesa-badge badge-minha" title="Sua mesa"></div>' : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Abrir Detalhes da Mesa
function abrirDetalhesMesa(numero) {
    currentMesaSelecionada = numero;
    const mesa = mesas[numero];
    
    document.getElementById('modalMesaNumero').textContent = numero;
    document.getElementById('modalStatus').textContent = getStatusText(mesa.status);
    document.getElementById('modalGarcom').textContent = mesa.garcomNome || '-';
    document.getElementById('modalPessoas').textContent = mesa.pessoas || 0;
    document.getElementById('modalAbertura').textContent = mesa.abertaEm ? 
        new Date(mesa.abertaEm).toLocaleString('pt-BR') : '-';
    
    // Atualizar consumo
    atualizarListaConsumo();
    
    // Atualizar histórico
    const historicoLista = document.getElementById('modalHistorico');
    if (historicoLista) {
        if (mesa.historico && mesa.historico.length > 0) {
            historicoLista.innerHTML = mesa.historico.slice(-5).map(item => `
                <div class="historico-item">
                    <span>${new Date(item.data).toLocaleString('pt-BR')}</span>
                    <span>${item.acao}</span>
                    <span>${item.usuario}</span>
                </div>
            `).join('');
        } else {
            historicoLista.innerHTML = '<p class="empty-msg">Nenhum histórico disponível</p>';
        }
    }
    
    // Mostrar/esconder botões
    const btnAbrir = document.getElementById('btnAbrirMesa');
    const btnPausar = document.getElementById('btnPausar');
    const btnFechar = document.getElementById('btnFechar');
    const btnCancelar = document.getElementById('btnCancelar');
    const btnTransferir = document.getElementById('btnTransferir');
    
    if (btnAbrir) btnAbrir.style.display = mesa.status === 'livre' ? 'block' : 'none';
    if (btnPausar) btnPausar.style.display = mesa.status === 'ativa' ? 'block' : 'none';
    if (btnFechar) btnFechar.style.display = mesa.status === 'ativa' ? 'block' : 'none';
    if (btnCancelar) btnCancelar.style.display = mesa.status === 'ativa' ? 'block' : 'none';
    if (btnTransferir) btnTransferir.style.display = mesa.status === 'ativa' ? 'block' : 'none';
    
    if (mesa.status === 'ativa') {
        iniciarTimerMesa(numero);
    }
    
    document.getElementById('mesaModal').classList.add('active');
}

// Atualizar Lista de Consumo
function atualizarListaConsumo() {
    const mesa = mesas[currentMesaSelecionada];
    const consumoLista = document.getElementById('modalConsumo');
    
    if (consumoLista) {
        if (mesa.consumo && mesa.consumo.length > 0) {
            let consumoHtml = '';
            let total = 0;
            mesa.consumo.forEach((item, index) => {
                total += item.valor;
                consumoHtml += `
                    <div class="consumo-item" style="display: flex; justify-content: space-between; align-items: center;">
                        <span>${item.nome} - ${formatCurrency(item.valor)}</span>
                        <div>
                            <button class="btn-small" onclick="editarItem(${index})" style="margin-right: 5px;">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-small" onclick="excluirItem(${index})" style="background: var(--danger);">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            consumoLista.innerHTML = consumoHtml;
            document.getElementById('modalTotal').textContent = formatCurrency(total);
        } else {
            consumoLista.innerHTML = '<p class="empty-msg">Nenhum item consumido</p>';
            document.getElementById('modalTotal').textContent = formatCurrency(0);
        }
    }
}

// Editar Item
function editarItem(index) {
    const mesa = mesas[currentMesaSelecionada];
    const item = mesa.consumo[index];
    
    document.getElementById('editarItemIndex').value = index;
    document.getElementById('editarItemNome').value = item.nome;
    document.getElementById('editarItemValor').value = item.valor;
    
    document.getElementById('editarItemModal').classList.add('active');
}

// Excluir Item
function excluirItem(index) {
    if (confirm('Tem certeza que deseja excluir este item?')) {
        const mesa = mesas[currentMesaSelecionada];
        const itemExcluido = mesa.consumo[index];
        
        // Remover item
        mesa.consumo.splice(index, 1);
        
        // Recalcular total
        mesa.valorTotal = mesa.consumo.reduce((sum, item) => sum + item.valor, 0);
        
        // Registrar no histórico
        mesa.historico.push({
            data: new Date().toISOString(),
            acao: `Item excluído: ${itemExcluido.nome} - ${formatCurrency(itemExcluido.valor)}`,
            usuario: currentUser.nome
        });
        
        salvarMesas();
        atualizarListaConsumo();
    }
}

// Handle Editar Item
function handleEditarItem(e) {
    e.preventDefault();
    
    const index = parseInt(document.getElementById('editarItemIndex').value);
    const nome = document.getElementById('editarItemNome').value;
    const valor = parseFloat(document.getElementById('editarItemValor').value);
    
    const mesa = mesas[currentMesaSelecionada];
    const itemAntigo = mesa.consumo[index];
    
    // Atualizar item
    mesa.consumo[index] = {
        ...itemAntigo,
        nome: nome,
        valor: valor
    };
    
    // Recalcular total
    mesa.valorTotal = mesa.consumo.reduce((sum, item) => sum + item.valor, 0);
    
    // Registrar no histórico
    mesa.historico.push({
        data: new Date().toISOString(),
        acao: `Item editado: ${itemAntigo.nome} → ${nome} (${formatCurrency(itemAntigo.valor)} → ${formatCurrency(valor)})`,
        usuario: currentUser.nome
    });
    
    salvarMesas();
    fecharModal('editarItemModal');
    atualizarListaConsumo();
}

// Abrir Mesa Modal
function abrirMesaModal() {
    if (!currentMesaSelecionada) return;
    
    const pessoas = prompt('Número de pessoas:', '2');
    if (pessoas === null) return;
    
    const mesa = mesas[currentMesaSelecionada];
    mesa.status = 'ativa';
    mesa.abertaEm = new Date().toISOString();
    mesa.pessoas = parseInt(pessoas) || 1;
    mesa.garcomId = currentUser.id;
    mesa.garcomNome = currentUser.nome;
    mesa.consumo = [];
    mesa.valorTotal = 0;
    
    if (!mesa.historico) mesa.historico = [];
    mesa.historico.push({
        data: new Date().toISOString(),
        acao: 'Mesa aberta',
        usuario: currentUser.nome
    });
    
    salvarMesas();
    fecharModal('mesaModal');
}

// Fechar Mesa Modal
function fecharMesaModal() {
    if (!currentMesaSelecionada) return;
    
    const mesa = mesas[currentMesaSelecionada];
    document.getElementById('fecharMesaNumero').textContent = currentMesaSelecionada;
    
    const totalConsumo = mesa.consumo?.reduce((sum, item) => sum + item.valor, 0) || 0;
    document.getElementById('fecharValor').value = totalConsumo.toFixed(2);
    
    const resumo = document.getElementById('fecharResumo');
    if (mesa.consumo && mesa.consumo.length > 0) {
        resumo.innerHTML = mesa.consumo.map(item => `
            <div class="consumo-item">
                <span>${item.nome}</span>
                <span>${formatCurrency(item.valor)}</span>
            </div>
        `).join('');
    } else {
        resumo.innerHTML = '<p class="empty-msg">Nenhum consumo registrado</p>';
    }
    
    calcularGorjeta();
    document.getElementById('fecharMesaModal').classList.add('active');
}

// Handle Fechar Mesa
function handleFecharMesa(e) {
    e.preventDefault();
    
    if (!currentMesaSelecionada) return;
    
    const mesa = mesas[currentMesaSelecionada];
    const valor = parseFloat(document.getElementById('fecharValor').value);
    const gorjeta = parseFloat(document.getElementById('fecharGorjetaValor').value);
    const pagamento = document.getElementById('fecharPagamento').value;
    const feedback = document.getElementById('fecharFeedback').value;
    
    const tempoDecorrido = calcularMinutosDecorridos(mesa);
    
    mesa.status = 'fechada';
    mesa.fechadaEm = new Date().toISOString();
    mesa.valorTotal = valor + gorjeta;
    mesa.gorjeta = gorjeta;
    mesa.pagamento = pagamento;
    mesa.feedback = feedback;
    mesa.tempoDecorrido = tempoDecorrido;
    
    mesa.historico.push({
        data: new Date().toISOString(),
        acao: `Mesa fechada - Total: ${formatCurrency(valor + gorjeta)}`,
        usuario: currentUser.nome
    });
    
    salvarMesas();
    
    if (timers[currentMesaSelecionada]) {
        clearInterval(timers[currentMesaSelecionada]);
        delete timers[currentMesaSelecionada];
    }
    
    fecharModal('fecharMesaModal');
    fecharModal('mesaModal');
}

// Abrir Múltiplas Mesas Modal
function abrirMultiplasModal() {
    const selector = document.getElementById('multiMesaSelector');
    
    let html = '';
    for (let i = 1; i <= config.totalMesas; i++) {
        const mesa = mesas[i];
        if (mesa && mesa.status === 'livre') {
            html += `
                <label class="mesa-checkbox">
                    <input type="checkbox" name="mesas" value="${i}">
                    Mesa ${i}
                </label>
            `;
        }
    }
    
    selector.innerHTML = html || '<p>Nenhuma mesa livre disponível</p>';
    document.getElementById('multiMesaModal').classList.add('active');
}

// Handle Abrir Múltiplas
function handleAbrirMultiplas(e) {
    e.preventDefault();
    
    const checkboxes = document.querySelectorAll('input[name="mesas"]:checked');
    const pessoas = document.getElementById('multiPessoas').value;
    const obs = document.getElementById('multiObs').value;
    
    if (checkboxes.length === 0) {
        alert('Selecione pelo menos uma mesa');
        return;
    }
    
    checkboxes.forEach(cb => {
        const numero = cb.value;
        const mesa = mesas[numero];
        
        mesa.status = 'ativa';
        mesa.abertaEm = new Date().toISOString();
        mesa.pessoas = parseInt(pessoas);
        mesa.garcomId = currentUser.id;
        mesa.garcomNome = currentUser.nome;
        mesa.consumo = [];
        mesa.observacoes = obs;
        
        if (!mesa.historico) mesa.historico = [];
        mesa.historico.push({
            data: new Date().toISOString(),
            acao: 'Mesa aberta (múltiplas)',
            usuario: currentUser.nome
        });
    });
    
    salvarMesas();
    fecharModal('multiMesaModal');
}

// Timer Functions
function iniciarTimers() {
    Object.values(mesas).forEach(mesa => {
        if (mesa.status === 'ativa') {
            iniciarTimerMesa(mesa.numero);
        }
    });
}

function iniciarTimerMesa(numero) {
    if (timers[numero]) clearInterval(timers[numero]);
    
    timers[numero] = setInterval(() => {
        if (currentMesaSelecionada === numero) {
            const mesa = mesas[numero];
            const tempo = calcularTempoDecorrido(mesa);
            const modalTempo = document.getElementById('modalTempo');
            if (modalTempo) modalTempo.textContent = tempo;
        }
    }, 1000);
}

function calcularTempoDecorrido(mesa) {
    if (!mesa.abertaEm) return '00:00:00';
    
    const inicio = new Date(mesa.abertaEm).getTime();
    const agora = new Date().getTime();
    const diff = Math.floor((agora - inicio) / 1000);
    
    const horas = Math.floor(diff / 3600);
    const minutos = Math.floor((diff % 3600) / 60);
    const segundos = diff % 60;
    
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
}

function calcularMinutosDecorridos(mesa) {
    if (!mesa.abertaEm) return 0;
    
    const inicio = new Date(mesa.abertaEm).getTime();
    const fim = new Date().getTime();
    return Math.round((fim - inicio) / 60000);
}

// Dashboard Mini
function atualizarDashboardMini() {
    const mesasAtivas = Object.values(mesas).filter(m => m.status === 'ativa');
    const mesasFechadasHoje = Object.values(mesas).filter(m => 
        m.status === 'fechada' && 
        m.fechadaEm &&
        new Date(m.fechadaEm).toDateString() === new Date().toDateString()
    );
    
    const tempos = mesasFechadasHoje.map(m => m.tempoDecorrido || 0);
    const tempoMedio = tempos.length > 0 ? 
        Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length) : 0;
    
    const tickets = mesasFechadasHoje.map(m => m.valorTotal || 0);
    const ticketMedio = tickets.length > 0 ? 
        tickets.reduce((a, b) => a + b, 0) / tickets.length : 0;
    
    const ocupacao = config.totalMesas > 0 ? (mesasAtivas.length / config.totalMesas) * 100 : 0;
    const gorjetas = mesasFechadasHoje.reduce((sum, m) => sum + (m.gorjeta || 0), 0);
    
    document.getElementById('avgTimeMini').textContent = tempoMedio + ' min';
    document.getElementById('avgTicketMini').textContent = formatCurrency(ticketMedio);
    document.getElementById('ocupacaoMini').textContent = Math.round(ocupacao) + '%';
    document.getElementById('gorjetasMini').textContent = formatCurrency(gorjetas);
}

// Contar atendimentos do dia
function contarAtendimentosHoje() {
    const hoje = new Date().toDateString();
    let count = 0;
    
    Object.values(mesas).forEach(mesa => {
        if (mesa.status === 'fechada' && mesa.fechadaEm && 
            new Date(mesa.fechadaEm).toDateString() === hoje) {
            count++;
        }
    });
    
    return count;
}

// Calcular faturamento do dia
function calcularFaturamentoHoje() {
    const hoje = new Date().toDateString();
    
    return Object.values(mesas)
        .filter(m => m.status === 'fechada' && m.fechadaEm && 
                    new Date(m.fechadaEm).toDateString() === hoje)
        .reduce((sum, m) => sum + (m.valorTotal || 0), 0);
}

// Adicionar Item
function adicionarItem() {
    if (!currentMesaSelecionada) return;
    
    const nome = prompt('Nome do item:');
    if (!nome) return;
    
    const valor = parseFloat(prompt('Valor (R$):'));
    if (isNaN(valor)) return;
    
    const mesa = mesas[currentMesaSelecionada];
    if (!mesa.consumo) mesa.consumo = [];
    
    mesa.consumo.push({ nome, valor, data: new Date().toISOString() });
    mesa.valorTotal = (mesa.valorTotal || 0) + valor;
    
    mesa.historico.push({
        data: new Date().toISOString(),
        acao: `Item adicionado: ${nome} - ${formatCurrency(valor)}`,
        usuario: currentUser.nome
    });
    
    salvarMesas();
    atualizarListaConsumo();
}

// Pausar Tempo
function pausarTempo() {
    if (!currentMesaSelecionada) return;
    
    const mesa = mesas[currentMesaSelecionada];
    mesa.status = 'pausada';
    
    if (timers[currentMesaSelecionada]) {
        clearInterval(timers[currentMesaSelecionada]);
        delete timers[currentMesaSelecionada];
    }
    
    mesa.historico.push({
        data: new Date().toISOString(),
        acao: 'Tempo pausado',
        usuario: currentUser.nome
    });
    
    salvarMesas();
    abrirDetalhesMesa(currentMesaSelecionada);
}

// Cancelar Mesa
function cancelarMesa() {
    if (!currentMesaSelecionada || !confirm('Tem certeza que deseja cancelar esta mesa?')) return;
    
    const mesa = mesas[currentMesaSelecionada];
    mesa.status = 'livre';
    mesa.garcomId = null;
    mesa.garcomNome = null;
    mesa.abertaEm = null;
    mesa.pessoas = null;
    mesa.consumo = [];
    mesa.valorTotal = 0;
    
    mesa.historico.push({
        data: new Date().toISOString(),
        acao: 'Mesa cancelada',
        usuario: currentUser.nome
    });
    
    if (timers[currentMesaSelecionada]) {
        clearInterval(timers[currentMesaSelecionada]);
        delete timers[currentMesaSelecionada];
    }
    
    salvarMesas();
    fecharModal('mesaModal');
}

// Transferir Mesa (versão melhorada)
async function transferirMesa() {
    if (!currentMesaSelecionada) return;
    
    const novoUsuario = prompt('Usuário do garçom para transferir:');
    if (!novoUsuario) return;
    
    try {
        // Verificar se o usuário existe
        const usuariosRef = database.ref('usuarios');
        const snapshot = await usuariosRef.orderByChild('usuario').equalTo(novoUsuario).once('value');
        
        let usuarioEncontrado = null;
        snapshot.forEach(child => {
            usuarioEncontrado = {
                id: child.key,
                ...child.val()
            };
        });
        
        if (!usuarioEncontrado) {
            alert('Usuário não encontrado!');
            return;
        }
        
        const mesa = mesas[currentMesaSelecionada];
        const garcomAntigo = mesa.garcomNome;
        
        mesa.garcomId = usuarioEncontrado.id;
        mesa.garcomNome = usuarioEncontrado.nome;
        
        mesa.historico.push({
            data: new Date().toISOString(),
            acao: `Mesa transferida de ${garcomAntigo} para ${usuarioEncontrado.nome}`,
            usuario: currentUser.nome
        });
        
        salvarMesas();
        abrirDetalhesMesa(currentMesaSelecionada);
        alert(`Mesa transferida para ${usuarioEncontrado.nome} com sucesso!`);
        
    } catch (error) {
        alert('Erro ao transferir mesa: ' + error.message);
    }
}

// Helper Functions
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function getStatusText(status) {
    const texts = {
        'livre': 'Livre',
        'ativa': 'Ativa',
        'pausada': 'Pausada',
        'fechada': 'Fechada'
    };
    return texts[status] || status;
}

function filtrarMesas(filtro) {
    config.filtroAtual = filtro;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase().includes(filtro));
    });
    
    renderizarGradeMesas();
}

function mudarVisualizacao(tipo) {
    config.visualizacao = tipo;
    
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerHTML.includes(tipo));
    });
    
    renderizarGradeMesas();
}

function calcularGorjeta() {
    const valor = parseFloat(document.getElementById('fecharValor').value) || 0;
    const percent = parseFloat(document.getElementById('fecharGorjetaPercent').value) || 0;
    
    const gorjeta = valor * (percent / 100);
    document.getElementById('fecharGorjetaValor').value = gorjeta.toFixed(2);
    document.getElementById('fecharTotalFinal').textContent = formatCurrency(valor + gorjeta);
}

function salvarMesas() {
    if (!currentUser) return;
    
    database.ref(`garcons/${currentUser.id}/mesas`).set(mesas);
    atualizarInterface();
}

function fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
    
    if (modalId === 'mesaModal') {
        currentMesaSelecionada = null;
    }
}

// Export functions to global scope
window.abrirDetalhesMesa = abrirDetalhesMesa;
window.abrirMesaModal = abrirMesaModal;
window.fecharMesaModal = fecharMesaModal;
window.filtrarMesas = filtrarMesas;
window.mudarVisualizacao = mudarVisualizacao;
window.fecharModal = fecharModal;
window.adicionarItem = adicionarItem;
window.pausarTempo = pausarTempo;
window.cancelarMesa = cancelarMesa;
window.transferirMesa = transferirMesa;
window.mostrarCadastro = mostrarCadastro;
window.editarItem = editarItem;
window.excluirItem = excluirItem;