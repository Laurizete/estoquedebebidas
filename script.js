
// 1. BANCO DE DADOS LOCAL CENTRALIZADO 

const dadosIniciaisProdutos = [
    { nome: "Cerveja Skol 600ml", category: "Alcoólica", marca: "Skol", preco: 6.00, qtd: 100, minimo: 20 },
    { nome: "Coca-Cola 2L", category: "Bebida Gaseificada", marca: "Coca-Cola", preco: 7.50, qtd: 60, minimo: 15 },
    { nome: "Água Mineral 500ml", category: "Sem Álcool", marca: "Crystal", preco: 1.50, qtd: 50, minimo: 60 },
    { nome: "Suco Del Valle 1L", category: "Bebida Infantil", marca: "Del Valle", preco: 4.80, qtd: 60, minimo: 10 },
    { nome: "Whisky Red Label 750ml", category: "Outros", marca: "Johnnie Walker", preco: 89.90, qtd: 5, minimo: 10 }
];

const dadosIniciaisCategorias = ["Alcoólica", "Bebida Gaseificada", "Sem Álcool", "Bebida Infantil", "Outros"];
let indexClienteEdicao = null; // Guarda o índice do cliente que está sendo editado
let clientes = JSON.parse(localStorage.getItem('deposito_clientes')) || [];
let produtos = JSON.parse(localStorage.getItem('deposito_produtos')) || dadosIniciaisProdutos;
let categorias = JSON.parse(localStorage.getItem('deposito_categorias')) || dadosIniciaisCategorias;
let historico = JSON.parse(localStorage.getItem('deposito_historico')) || [];

function salvarDados() {
    localStorage.setItem('deposito_clientes', JSON.stringify(clientes));
    localStorage.setItem('deposito_produtos', JSON.stringify(produtos));
    localStorage.setItem('deposito_categorias', JSON.stringify(categorias));
    localStorage.setItem('deposito_historico', JSON.stringify(historico));
}

// 2. CONTROLE DE SESSÃO E ABAS INTERNAS

function handleLogin(event) {
    event.preventDefault();
    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    if (usuario === "teste" && senha === "1234") {
        window.location.href = "index.html";
    } else {
        alert("Usuário ou senha incorretos!");
    }
}

window.handleLogout = function() {
    window.location.href = "login.html";
}

function switchFormTab(targetForm) {
    const btnCliente = document.getElementById('tab-btn-cliente');
    const btnEstoque = document.getElementById('tab-btn-estoque');
    const formCliente = document.getElementById('section-form-cliente');
    const formEstoque = document.getElementById('section-form-estoque');

    if (!btnCliente) return;

    btnCliente.classList.remove('active');
    btnEstoque.classList.remove('active');
    formCliente.classList.remove('active');
    formEstoque.classList.remove('active');

    if (targetForm === 'cliente') {
        btnCliente.classList.add('active');
        formCliente.classList.add('active');
    } else {
        btnEstoque.classList.add('active');
        formEstoque.classList.add('active');
    }
}

// 3. IDENTIFICADOR DE PÁGINAS E RENDERIZADORES GLOBAIS

function atualizarPaineisDoSistema() {
    renderizarDashboard();
    renderizarEstoque();
    renderizarCategorias();
    renderizarClientes();
    renderizarHistorico();
    atualizarSelectsDeCategoria();
}

function identificarECarregarPaginaAtual() {
    const path = window.location.pathname;
    const pagina = path.substring(path.lastIndexOf("/") + 1);

    if (pagina === "index.html" || pagina === "") {
        renderizarDashboard();
    } else if (pagina === "clientes.html") {
        atualizarSelectsDeCategoria();
        renderizarClientes();
        
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('aba') === 'estoque') {
            switchFormTab('estoque');
        }
    } else if (pagina === "estoque.html") {
        atualizarSelectsDeCategoria();
        renderizarEstoque();
        document.getElementById('category-filter').addEventListener('change', renderizarEstoque);
    } else if (pagina === "categorias.html") {
        renderizarCategorias();
    } else if (pagina === "relatorios.html") {
        renderizarHistorico();
    }
}

function renderizarDashboard() {
    let totalQtd = 0; let totalValor = 0; let alertasCriticos = 0;
    produtos.forEach(p => {
        totalQtd += parseInt(p.qtd); totalValor += (p.preco * p.qtd);
        if (parseInt(p.qtd) <= parseInt(p.minimo)) alertasCriticos++;
    });

    if (document.getElementById('dash-total-qtd')) {
        document.getElementById('dash-total-qtd').innerText = `${totalQtd} un.`;
        document.getElementById('dash-total-valor').innerText = `R$ ${totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        document.getElementById('dash-total-alertas').innerText = `${alertasCriticos} Itens`;
        document.getElementById('dash-alerta-card').style.borderLeft = alertasCriticos > 0 ? "5px solid #df2121" : "5px solid #4caf50";
    }
    
    const hItens = document.getElementById('header-total-itens');
    const hUnidades = document.getElementById('header-total-unidades');
    const hFinanceiro = document.getElementById('header-total-financeiro');

    if (hItens) hItens.innerText = produtos.length;
    if (hUnidades) hUnidades.innerText = `${totalQtd} un.`;
    if (hFinanceiro) hFinanceiro.innerText = `R$ ${totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

function renderizarEstoque() {
    const tabelaBody = document.querySelector('.stock-table tbody');
    if (!tabelaBody) return;

    tabelaBody.innerHTML = '';
    const filtroCategoria = document.getElementById('category-filter')?.value || 'Todas';
    
    let totalQtd = 0; 
    let totalValor = 0; 
    let totalItensFiltrados = 0;

    produtos.forEach((p, index) => {
        if (filtroCategoria !== 'Todas' && p.categoria !== filtroCategoria) return;

        totalItensFiltrados++;
        totalQtd += parseInt(p.qtd);
        const valorTotalProduto = p.preco * p.qtd;
        totalValor += valorTotalProduto;

        let statusBadge = `<span class="status-badge status-in-stock">Em estoque</span>`;
        let textQtyClass = "text-qty-green";
        if (parseInt(p.qtd) === 0) {
            statusBadge = `<span class="status-badge status-critical">Sem Estoque</span>`;
            textQtyClass = "text-qty-red";
        } else if (parseInt(p.qtd) <= parseInt(p.minimo)) {
            statusBadge = `<span class="status-badge status-low">Baixo estoque</span>`;
            textQtyClass = "text-qty-orange";
        }

        const emoji = p.categoria.includes("Alcoól") ? "🍺" : p.categoria.includes("Gase") ? "🥤" : "💧";

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><div class="product-cell"><span class="emoji-icon">${emoji}</span> ${p.nome}</div></td>
            <td>${statusBadge}</td>
            <td><div class="category-cell">${p.categoria}</div></td>
            <td>R$ ${p.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            <td>R$ ${valorTotalProduto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            <td>${p.marca}</td>
            <td><span class="${textQtyClass}">${p.qtd} un.</span></td>
            
            <td style="text-align: center;">
                <button class="btn-action" onclick="darSaida(${index})" style="background: #fee2e2; color: #ef4444; border-radius: 4px; padding: 4px 8px; font-weight: bold; cursor:pointer; border:none;"><i class="fa-solid fa-minus"></i> Saída</button>
            </td>
            <td style="text-align: center;">
                <button class="btn-action" onclick="darEntrada(${index})" style="background: #dcfce7; color: #22c55e; border-radius: 4px; padding: 4px 8px; font-weight: bold; cursor:pointer; border:none;"><i class="fa-solid fa-plus"></i> Entrada</button>
            </td>
            
            <td style="text-align: center;">
                <div class="action-buttons">
                    <button class="btn-action btn-delete" onclick="removerProduto(${index})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        `;
        tabelaBody.appendChild(tr);
    });

    if (totalItensFiltrados === 0) {
        tabelaBody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: #94a3b8; padding: 20px;">Nenhum produto cadastrado nesta categoria.</td></tr>`;
    }

    const hItens = document.getElementById('header-total-itens');
    const hUnidades = document.getElementById('header-total-unidades');
    const hFinanceiro = document.getElementById('header-total-financeiro');

    if (hItens) hItens.innerText = totalItensFiltrados;
    if (hUnidades) hUnidades.innerText = `${totalQtd} un.`;
    if (hFinanceiro) hFinanceiro.innerText = `R$ ${totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function renderizarCategorias() {
    const tabelaBody = document.querySelector('.stock-table tbody');
    if (!tabelaBody) return;
    tabelaBody.innerHTML = '';

    let totalQtd = 0; let totalValor = 0;
    produtos.forEach(p => { totalQtd += parseInt(p.qtd); totalValor += (p.preco * p.qtd); });

    categorias.forEach((cat, index) => {
        const qtdAtrelados = produtos.filter(p => p.categoria === cat).length;
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>📁</td><td><strong>${cat}</strong></td><td>${qtdAtrelados} produtos</td><td><div class="action-buttons"><button class="btn-action btn-delete" onclick="removerCategoria(${index})"><i class="fa-solid fa-trash"></i></button></div></td>`;
        tabelaBody.appendChild(tr);
    });

    const hItens = document.getElementById('header-total-itens');
    const hUnidades = document.getElementById('header-total-unidades');
    const hFinanceiro = document.getElementById('header-total-financeiro');

    if (hItens) hItens.innerText = produtos.length;
    if (hUnidades) hUnidades.innerText = `${totalQtd} un.`;
    if (hFinanceiro) hFinanceiro.innerText = `R$ ${totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

function renderizarClientes() {
    const tabelaBody = document.querySelector('#tabela-clientes tbody');
    if (!tabelaBody) return;
    tabelaBody.innerHTML = '';

    let totalQtd = 0; let totalValor = 0;
    produtos.forEach(p => { totalQtd += parseInt(p.qtd); totalValor += (p.preco * p.qtd); });

    if (clientes.length === 0) {
        tabelaBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 15px;">Nenhum cliente cadastrado ainda.</td></tr>`;
    } else {
        clientes.forEach((c, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${c.nome}</strong></td>
                <td>${c.telefone}</td>
                <td>${c.endereco}</td>
                <td>${c.email}</td>
                <td>
                    <div class="action-buttons" style="display: flex; gap: 8px; justify-content: center;">
                        <!-- NOVO BOTÃO DE EDITAR -->
                        <button class="btn-action" onclick="prepararEdicaoCliente(${index})" style="background: #fef3c7; color: #d97706; border-radius: 4px; padding: 4px 8px; cursor: pointer; border: none;"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-action btn-delete" onclick="removerCliente(${index})" style="border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            tabelaBody.appendChild(tr);
        });
    }

    const hItens = document.getElementById('header-total-itens');
    const hUnidades = document.getElementById('header-total-unidades');
    const hFinanceiro = document.getElementById('header-total-financeiro');

    if (hItens) hItens.innerText = produtos.length;
    if (hUnidades) hUnidades.innerText = `${totalQtd} un.`;
    if (hFinanceiro) hFinanceiro.innerText = `R$ ${totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

function renderizarHistorico() {
    const tabelaBody = document.querySelector('#tabela-historico tbody');
    if (!tabelaBody) return;
    tabelaBody.innerHTML = '';

    let totalQtd = 0; let totalValor = 0;
    produtos.forEach(p => { totalQtd += parseInt(p.qtd); totalValor += (p.preco * p.qtd); });

    if (historico.length === 0) {
        tabelaBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 20px;">Nenhuma movimentação realizada ainda.</td></tr>`;
    } else {
        historico.forEach(h => {
            const corTipo = h.tipo === 'Entrada' ? '#22c55e' : '#ef4444';
            const bgTipo = h.tipo === 'Entrada' ? '#dcfce7' : '#fee2e2';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${h.data}</td>
                <td><strong>${h.produto}</strong></td>
                <td><span style="background: ${bgTipo}; color: ${corTipo}; padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 12px;">${h.tipo}</span></td>
                <td style="font-weight: 600;">${h.quantidade} un.</td>
                <td style="color: #64748b;">${h.usuario}</td>
            `;
            tabelaBody.appendChild(tr);
        });
    }

    const hItens = document.getElementById('header-total-itens');
    const hUnidades = document.getElementById('header-total-unidades');
    const hFinanceiro = document.getElementById('header-total-financeiro');

    if (hItens) hItens.innerText = produtos.length;
    if (hUnidades) hUnidades.innerText = `${totalQtd} un.`;
    if (hFinanceiro) hFinanceiro.innerText = `R$ ${totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

function atualizarSelectsDeCategoria() {
    const selectForm = document.getElementById('form-produto-categoria');
    const selectFiltro = document.getElementById('category-filter');

    if (selectForm) {
        selectForm.innerHTML = '<option value="" disabled selected>Selecione a categoria</option>';
        categorias.forEach(cat => { selectForm.innerHTML += `<option value="${cat}">${cat}</option>`; });
    }
    if (selectFiltro) {
        const antigoValor = selectFiltro.value;
        selectFiltro.innerHTML = '<option value="Todas">Todas</option>';
        categorias.forEach(cat => { selectFiltro.innerHTML += `<option value="${cat}">${cat}</option>`; });
        if(antigoValor) selectFiltro.value = antigoValor;
    }
}

// 
// 4. MOVIMENTAÇÕES DE ESTOQUE (ENTRADA E SAÍDA)
//
window.darEntrada = function(index) {
    const qtdInformada = prompt(`Dar ENTRADA para: ${produtos[index].nome}\nDigite a quantidade comprada/recebida:`);
    if (qtdInformada === null) return; 
    
    const quantidade = parseInt(qtdInformada);
    if (isNaN(quantidade) || quantidade <= 0) {
        alert("Por favor, digite um número inteiro válido e maior que zero.");
        return;
    }

    produtos[index].qtd = parseInt(produtos[index].qtd) + quantidade;
    
    historico.unshift({
        data: new Date().toLocaleString('pt-BR'),
        produto: produtos[index].nome,
        tipo: 'Entrada',
        quantidade: quantidade,
        usuario: 'Administrador'
    });

    salvarDados();
    atualizarPaineisDoSistema();
    alert(`Entrada registrada com sucesso!`);
}

window.darSaida = function(index) {
    const qtdInformada = prompt(`Registrar SAÍDA para: ${produtos[index].nome}\nDigite a quantidade vendida/retirada:`);
    if (qtdInformada === null) return; 

    const quantidade = parseInt(qtdInformada);
    if (isNaN(quantidade) || quantity <= 0) {
        alert("Por favor, digite um número inteiro válido e maior que zero.");
        return;
    }

    if (quantidade > parseInt(produtos[index].qtd)) {
        alert(`Operação cancelada! Estoque insuficiente.\nSaldo atual: ${produtos[index].qtd} un.`);
        return;
    }

    produtos[index].qtd = parseInt(produtos[index].qtd) - quantidade;
    
    historico.unshift({
        data: new Date().toLocaleString('pt-BR'),
        produto: produtos[index].nome,
        tipo: 'Saída',
        quantidade: quantidade,
        usuario: 'Administrador'
    });

    salvarDados();
    atualizarPaineisDoSistema();
    alert(`Saída registrada com sucesso!`);
}

//
// 5. PROCESSAMENTO DE FORMULÁRIOS E EXCLUSÕES
//
function handleFormAction(event, entity) {
    event.preventDefault();
    const campos = event.target.elements;

    if (entity === 'Cliente') {
        const nome = campos[0].value;
        const telefone = document.getElementById('phone-field').value;
        const endereco = campos[2].value;
        const email = campos[3].value || 'Não informado';

        if (indexClienteEdicao !== null) {
            // MODO EDIÇÃO: Atualiza o cliente existente
            clientes[indexClienteEdicao] = { nome, telefone, endereco, email };
            indexClienteEdicao = null; // Reseta o estado
            alert('Cliente atualizado com sucesso!');
            
            // Restaura o botão original
            const btnSalvar = document.getElementById('btn-salvar-cliente');
            if (btnSalvar) {
                btnSalvar.innerHTML = `<i class="fa-solid fa-check"></i> Salvar Cliente`;
                btnSalvar.style.background = '#2563eb';
            }
        } else {
            // MODO NOVO: Adiciona um novo registro
            clientes.push({ nome, telefone, endereco, email });
            alert('Cliente cadastrado com sucesso!');
        }
        salvarDados();
        renderizarClientes();
    } else if (entity === 'Produto') {
        produtos.push({ nome: campos[0].value, categoria: campos[1].value, marca: campos[2].value, preco: parseFloat(campos[3].value), qtd: parseInt(campos[4].value), minimo: parseInt(campos[5].value) });
        salvarDados();
        alert('Produto adicionado ao estoque!');
    }
    event.target.reset();
    atualizarPaineisDoSistema();
}

function adicionarCategoriaPrompt() {
    const novaCat = prompt("Digite o nome da nova categoria:");
    if (novaCat && novaCat.trim() !== "") {
        if (categorias.includes(novaCat.trim())) return alert("Categoria já existente.");
        categorias.push(novaCat.trim());
        salvarDados();
        atualizarPaineisDoSistema();
    }
}

function removerProduto(index) {
    if (confirm('Excluir produto do catálogo?')) { produtos.splice(index, 1); salvarDados(); atualizarPaineisDoSistema(); }
}
function removerCategoria(index) {
    if (confirm('Excluir categoria?')) { categorias.splice(index, 1); salvarDados(); atualizarPaineisDoSistema(); }
}
window.removerCliente = function(index) {
    if (confirm('Excluir cliente?')) { clientes.splice(index, 1); salvarDados(); atualizarPaineisDoSistema(); }
}

// 
// 6. GERADOR DE RELATÓRIOS (IMPRESSÃO / PDF)
// 
function gerarRelatorioEstoque() {
    const win = window.open('', '_blank');
    let html = "<h2>Relatório de Estoque - Depósito JP</h2><table border='1' width='100%' style='border-collapse:collapse; font-family:sans-serif;'><thead><tr style='background:#f1f5f9;'><th>Produto</th><th>Categoria</th><th>Preço</th><th>Qtd em Estoque</th></tr></thead><tbody>";
    produtos.forEach(p => { html += `<tr><td style='padding:8px;'>${p.nome}</td><td style='padding:8px;'>${p.categoria}</td><td style='padding:8px;'>R$ ${p.preco.toFixed(2)}</td><td style='padding:8px;'>${p.qtd} un.</td></tr>`; });
    html += "</tbody></table><script>window.onload=function(){window.print();}</script>";
    win.document.write(html); win.document.close();
}

function gerarRelatorioClientes() {
    const win = window.open('', '_blank');
    let html = "<h2>Relatório de Clientes - Depósito JP</h2><table border='1' width='100%' style='border-collapse:collapse; font-family:sans-serif;'><thead><tr style='background:#f1f5f9;'><th>Nome</th><th>Telefone</th><th>Endereço</th></tr></thead><tbody>";
    clientes.forEach(c => { html += `<tr><td style='padding:8px;'><strong>${c.nome}</strong></td><td style='padding:8px;'>${c.telefone}</td><td style='padding:8px;'>${c.endereco}</td></tr>`; });
    html += "</tbody></table><script>window.onload=function(){window.print();}</script>";
    win.document.write(html); win.document.close();
}

function gerarRelatorioHistorico() {
    const win = window.open('', '_blank');
    let linhasTabela = '';
    
    if (historico.length === 0) {
        linhasTabela = `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 15px;">Nenhuma movimentação registrada no sistema.</td></tr>`;
    } else {
        historico.forEach(h => {
            const corTipo = h.tipo === 'Entrada' ? '#16a34a' : '#dc2626';
            linhasTabela += `<tr><td style="padding: 8px; border: 1px solid #cbd5e1;">${h.data}</td><td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>${h.produto}</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1; color: ${corTipo}; font-weight: bold;">${h.tipo}</td><td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">${h.quantidade} un.</td><td style="padding: 8px; border: 1px solid #cbd5e1; color: #475569;">${h.usuario}</td></tr>`;
        });
    }

    let html = `<html><head><title>Extrato de Movimentações - Depósito JP</title><style>body { font-family: Arial, sans-serif; padding: 20px; color: #333; } h2 { text-align: center; color: #1e293b; border-bottom: 2px solid #334155; padding-bottom: 10px; margin-bottom: 5px; } p.sub { text-align: center; color: #64748b; font-size: 13px; margin-top: 0; margin-bottom: 20px; } table { width: 100%; border-collapse: collapse; margin-top: 10px; } th { background: #f1f5f9; color: #334155; font-weight: bold; padding: 10px; border: 1px solid #cbd5e1; text-align: left; } tr:nth-child(even) { background: #f8fafc; }</style></head><body><h2>Depósito de Bebidas JP</h2><p class="sub">Relatório de Auditoria: Histórico Completo de Entradas e Saídas<br>Gerado em: ${new Date().toLocaleString('pt-BR')}</p><table><thead><tr><th>Data / Hora Exata</th><th>Produto</th><th>Operação</th><th>Quantidade</th><th>Responsável</th></tr></thead><tbody>${linhasTabela}</tbody></table><script>window.onload = function() { window.print(); }</script></body></html>`;
    win.document.write(html); win.document.close();
}

// 
// 7. MÁSCARAS E EVENTOS DE INICIALIZAÇÃO
// 
const phoneField = document.getElementById('phone-field');
if (phoneField) {
    phoneField.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, ''); let formatted = '';
        if (value.length > 0) {
            formatted = `(${value.substring(0, 2)}`;
            if (value.length > 2) {
                formatted += `) ${value.substring(2, 7)}`;
                if (value.length > 7) formatted += `-${value.substring(7, 11)}`;
            }
        }
        e.target.value = formatted;
    });
}
// Puxa os dados da tabela para os inputs e altera o texto do botão salvar
window.prepararEdicaoCliente = function(index) {
    indexClienteEdicao = index;
    const cliente = clientes[index];

    // Preenche os campos do formulário HTML usando os IDs corretos
    document.getElementById('cliente-nome').value = cliente.nome;
    document.getElementById('phone-field').value = cliente.telefone;
    document.getElementById('cliente-endereco').value = cliente.endereco;
    document.getElementById('cliente-email').value = cliente.email === 'Não informado' ? '' : cliente.email;

    // Altera o texto do botão principal para avisar que está editando
    const btnSalvar = document.getElementById('btn-salvar-cliente');
    if (btnSalvar) {
        btnSalvar.innerHTML = `<i class="fa-solid fa-check"></i> Atualizar Cliente`;
        btnSalvar.style.background = '#d97706'; // Muda para tom laranja/laranja escuro de edição
    }
    
    // Rola a tela suavemente para cima até o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Reseta o modo de edição quando o formulário for limpo
window.cancelarEdicaoCliente = function() {
    indexClienteEdicao = null;
    const btnSalvar = document.getElementById('btn-salvar-cliente');
    if (btnSalvar) {
        btnSalvar.innerHTML = `<i class="fa-solid fa-check"></i> Salvar Cliente`;
        btnSalvar.style.background = '#2563eb'; // Volta para o azul padrão
    }
}
window.addEventListener('DOMContentLoaded', identificarECarregarPaginaAtual);