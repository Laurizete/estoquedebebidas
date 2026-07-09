// =========================================================================
// 1. ESTRUTURA DE BANCO DE DADOS LOCAL (LOCALSTORAGE)
// =========================================================================

const dadosIniciaisProdutos = [
    { nome: "Cerveja Skol 600ml", categoria: "Alcoólica", marca: "Skol", preco: 6.00, qtd: 100, minimo: 20 },
    { nome: "Coca-Cola 2L", categoria: "Bebida Gaseificada", marca: "Coca-Cola", preco: 7.50, qtd: 60, minimo: 15 },
    { nome: "Água Mineral 500ml", categoria: "Sem Álcool", marca: "Crystal", preco: 1.50, qtd: 50, minimo: 60 },
    { nome: "Suco Del Valle 1L", categoria: "Bebida Infantil", marca: "Del Valle", preco: 4.80, qtd: 60, minimo: 10 },
    { nome: "Whisky Red Label 750ml", categoria: "Outros", marca: "Johnnie Walker", preco: 89.90, qtd: 5, minimo: 10 }
];

const dadosIniciaisCategorias = ["Alcoólica", "Bebida Gaseificada", "Sem Álcool", "Bebida Infantil", "Outros"];

let clientes = JSON.parse(localStorage.getItem('deposito_clientes')) || [];
let produtos = JSON.parse(localStorage.getItem('deposito_produtos')) || dadosIniciaisProdutos;
let categorias = JSON.parse(localStorage.getItem('deposito_categorias')) || dadosIniciaisCategorias;

function salvarDados() {
    localStorage.setItem('deposito_clientes', JSON.stringify(clientes));
    localStorage.setItem('deposito_produtos', JSON.stringify(produtos));
    localStorage.setItem('deposito_categorias', JSON.stringify(categorias));
}

// =========================================================================
// 2. SISTEMA DE AUTENTICAÇÃO (LOGIN E LOGOUT)
// =========================================================================

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

function handleLogout() {
    window.location.href = "login.html";
}

// =========================================================================
// 3. GERENCIADOR DE NAVEGAÇÃO PRINCIPAL (SPA)
// =========================================================================

function navigate(viewName) {
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.app-view').forEach(view => view.classList.remove('active-view'));

    const title = document.getElementById('page-title');

    const views = {
        'dashboard': { menuId: null, viewId: 'view-dashboard', title: 'Dashboard' },
        'clientes': { menuId: 'menu-clientes', viewId: 'view-cadastro', title: 'Cadastro' },
        'estoque': { menuId: 'menu-estoque', viewId: 'view-estoque-lista', title: 'Estoque' },
        'categorias': { menuId: 'menu-categorias', viewId: 'view-categorias', title: 'Categorias' },
        'relatorios': { menuId: 'menu-relatorios', viewId: 'view-relatorios', title: 'Relatórios' }
    };

    const target = views[viewName];

    if (target) {
        if (target.menuId) {
            const menuEl = document.getElementById(target.menuId);
            if (menuEl) menuEl.classList.add('active');
        } else {
            const dashMenu = Array.from(document.querySelectorAll('.menu-item')).find(item => item.getAttribute('onclick').includes('dashboard'));
            if (dashMenu) dashMenu.classList.add('active');
        }

        const viewEl = document.getElementById(target.viewId);
        if (viewEl) viewEl.classList.add('active-view');
        
        title.innerText = target.title;

        if (viewName === 'clientes') {
            switchFormTab('cliente');
        }

        atualizarPaineisDoSistema();
    }
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

function goToAddProduct() {
    navigate('clientes');
    switchFormTab('estoque');
}

// =========================================================================
// 4. RENDERIZADORES E PROCESSADORES DE DADOS DINÂMICOS
// =========================================================================

function atualizarPaineisDoSistema() {
    renderizarDashboard();
    renderizarEstoque();
    renderizarCategorias();
    renderizarClientes();
    atualizarSelectsDeCategoria();
}

// --- DASHBOARD ---
function renderizarDashboard() {
    let totalQtd = 0;
    let totalValor = 0;
    let alertasCriticos = 0;

    produtos.forEach(p => {
        totalQtd += parseInt(p.qtd);
        totalValor += (p.preco * p.qtd);
        if (parseInt(p.qtd) <= parseInt(p.minimo)) {
            alertasCriticos++;
        }
    });

    const dashContainer = document.getElementById('view-dashboard');
    if (!dashContainer) return;

    dashContainer.querySelector('.blue-card h2').innerText = `${totalQtd} un.`;
    dashContainer.querySelector('.green-card h2').innerText = `R$ ${totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    const alertaCard = dashContainer.querySelectorAll('.summary-card')[2];
    if (alertaCard) {
        alertaCard.querySelector('h2').innerText = `${alertasCriticos} Itens`;
        alertaCard.style.borderLeft = alertasCriticos > 0 ? "5px solid #df2121" : "5px solid #4caf50";
    }
}

// --- ESTOQUE (TABELA FILTRADA APENAS POR CATEGORIA) ---
function renderizarEstoque() {
    const tabelaBody = document.querySelector('#view-estoque-lista .stock-table tbody');
    if (!tabelaBody) return;

    tabelaBody.innerHTML = '';
    
    const filtroCategoria = document.getElementById('category-filter')?.value || 'Todas';

    let totalQtd = 0;
    let totalValor = 0;
    let totalItensFiltrados = 0;

    produtos.forEach((p, index) => {
        const atendeCategoria = (filtroCategoria === 'Todas' || p.categoria === filtroCategoria);

        if (!atendeCategoria) {
            return; 
        }

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
            <td>${p.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            <td>${valorTotalProduto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            <td>${p.marca}</td>
            <td><span class="${textQtyClass}">${p.qtd} un.</span></td>
            <td class="text-out">-</td>
            <td class="text-in">-</td>
            <td>
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

    const totalItensLabel = document.querySelector('#view-estoque-lista .table-footer .total-items');
    if (totalItensLabel) totalItensLabel.innerText = `Total de itens: ${totalItensFiltrados}`;

    const cardsRodape = document.querySelectorAll('#view-estoque-lista .table-footer .summary-card h2');
    if (cardsRodape.length >= 2) {
        cardsRodape[0].innerText = totalQtd;
        cardsRodape[1].innerText = totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    }
}

// --- CATEGORIAS (TABELA) ---
function renderizarCategorias() {
    const viewCat = document.getElementById('view-categorias');
    if (!viewCat) return;
    
    const tabelaBody = viewCat.querySelector('.stock-table tbody');
    if (!tabelaBody) return;

    tabelaBody.innerHTML = '';

    categorias.forEach((cat, index) => {
        const qtdProdutosAtrelados = produtos.filter(p => p.categoria === cat).length;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>📁</td>
            <td><strong>${cat}</strong></td>
            <td>${qtdProdutosAtrelados} produtos</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-delete" onclick="removerCategoria(${index})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        `;
        tabelaBody.appendChild(tr);
    });
}

// --- CLIENTES (TABELA) ---
function renderizarClientes() {
    const tabelaBody = document.querySelector('#tabela-clientes tbody');
    if (!tabelaBody) return;

    tabelaBody.innerHTML = '';

    if (clientes.length === 0) {
        tabelaBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 15px;">Nenhum cliente cadastrado ainda.</td></tr>`;
        return;
    }

    clientes.forEach((c, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${c.nome}</strong></td>
            <td>${c.telefone}</td>
            <td>${c.endereco}</td>
            <td>${c.email}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-delete" onclick="removerCliente(${index})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        `;
        tabelaBody.appendChild(tr);
    });
}

function atualizarSelectsDeCategoria() {
    const selectForm = document.querySelector('#section-form-estoque select');
    const selectFiltro = document.getElementById('category-filter');

    if (selectForm) {
        const valorSelecionadoAnteriormente = selectForm.value;
        selectForm.innerHTML = '<option value="" disabled selected>Selecione a categoria</option>';
        categorias.forEach(cat => {
            selectForm.innerHTML += `<option value="${cat}">${cat}</option>`;
        });
        if(valorSelecionadoAnteriormente) selectForm.value = valorSelecionadoAnteriormente;
    }

    if (selectFiltro) {
        const valorFiltroAnterior = selectFiltro.value;
        selectFiltro.innerHTML = '<option value="Todas">Todas</option>';
        categorias.forEach(cat => {
            selectFiltro.innerHTML += `<option value="${cat}">${cat}</option>`;
        });
        if(valorFiltroAnterior) selectFiltro.value = valorFiltroAnterior;
    }
}

// =========================================================================
// 5. PROCESSAMENTO DE FORMULÁRIOS (CADASTROS REAIS)
// =========================================================================

function handleFormAction(event, entity) {
    event.preventDefault();
    const campos = event.target.elements;

    if (entity === 'Cliente') {
        const novoCliente = {
            nome: campos[0].value,
            telefone: document.getElementById('phone-field').value,
            endereco: campos[2].value,
            email: campos[3].value || 'Não informado'
        };
        clientes.push(novoCliente);
        salvarDados();
        alert(`Cliente "${novoCliente.nome}" cadastrado com sucesso!`);
        
    } else if (entity === 'Produto') {
        const novoProduto = {
            nome: campos[0].value,
            categoria: campos[1].value,
            marca: campos[2].value,
            preco: parseFloat(campos[3].value),
            qtd: parseInt(campos[4].value),
            minimo: parseInt(campos[5].value)
        };
        produtos.push(novoProduto);
        salvarDados();
        alert(`Produto "${novoProduto.nome}" adicionado ao estoque!`);
    }

    event.target.reset();
    atualizarPaineisDoSistema();
}

function adicionarCategoriaPrompt() {
    const novaCat = prompt("Digite o nome da nova categoria de bebidas:");
    if (novaCat && novaCat.trim() !== "") {
        const nomeFormatado = novaCat.trim();
        if (categorias.includes(nomeFormatado)) {
            alert("Esta categoria já existe!");
            return;
        }
        categorias.push(nomeFormatado);
        salvarDados();
        atualizarPaineisDoSistema();
    }
}

// =========================================================================
// 6. FUNÇÕES DE EXCLUSÃO DE DADOS
// =========================================================================

function removerProduto(index) {
    if (confirm(`Deseja realmente excluir o produto "${produtos[index].nome}"?`)) {
        produtos.splice(index, 1);
        salvarDados();
        atualizarPaineisDoSistema();
    }
}

// =========================================================================
// 7. GERADOR DE RELATÓRIOS PARA IMPRESSÃO / PDF (CORRIGIDO)
// =========================================================================

function gerarRelatorioEstoque() {
    const janelaRelatorio = window.open('', '_blank');
    let htmlContent = "<h2>Relatório de Estoque</h2><table border='1' width='100%'><thead><tr><th>Produto</th><th>Categoria</th><th>Marca</th><th>Preço</th><th>Qtd</th></tr></thead><tbody>";
    
    produtos.forEach(p => {
        htmlContent += "<tr><td>" + p.nome + "</td><td>" + p.categoria + "</td><td>" + p.marca + "</td><td>R$ " + p.preco.toFixed(2) + "</td><td>" + p.qtd + "</td></tr>";
    });

    htmlContent += "</tbody></table><script>window.onload=function(){window.print();}</script>";
    janelaRelatorio.document.write(htmlContent);
    janelaRelatorio.document.close();
}

function gerarRelatorioClientes() {
    const janelaRelatorio = window.open('', '_blank');
    let htmlContent = "<h2>Relatório de Clientes</h2><table border='1' width='100%'><thead><tr><th>Nome</th><th>Telefone</th><th>Endereço</th><th>E-mail</th></tr></thead><tbody>";
    
    clientes.forEach(c => {
        htmlContent += "<tr><td>" + c.nome + "</td><td>" + c.telefone + "</td><td>" + c.endereco + "</td><td>" + c.email + "</td></tr>";
    });

    htmlContent += "</tbody></table><script>window.onload=function(){window.print();}</script>";
    janelaRelatorio.document.write(htmlContent);
    janelaRelatorio.document.close();
}

function removerCategoria(index) {
    if (confirm(`Deseja remover a categoria "${categorias[index]}"?\nOs produtos existentes não serão excluídos.`)) {
        categorias.splice(index, 1);
        salvarDados();
        atualizarPaineisDoSistema();
    }
}

function removerCliente(index) {
    if (confirm(`Deseja realmente excluir o cliente "${clientes[index].nome}"?`)) {
        clientes.splice(index, 1);
        salvarDados();
        atualizarPaineisDoSistema();
    }
}

// =========================================================================
// 8. CONFIGURAÇÕES DE EVENTOS E INICIALIZAÇÃO
// =========================================================================

const phoneField = document.getElementById('phone-field');
if (phoneField) {
    phoneField.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, ''); 
        let formatted = '';
        if (value.length > 0) {
            formatted = `(${value.substring(0, 2)}`;
            if (value.length > 2) {
                formatted += `) ${value.substring(2, 7)}`;
                if (value.length > 7) {
                    formatted += `-${value.substring(7, 11)}`;
                }
            }
        }
        e.target.value = formatted;
    });
}

window.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('main-system-container')) {
        const btnCat = document.querySelector('#view-categorias .btn-primary');
        if (btnCat) btnCat.setAttribute('onclick', 'adicionarCategoriaPrompt()');

        const selectFiltro = document.getElementById('category-filter');
        if (selectFiltro) {
            selectFiltro.addEventListener('change', renderizarEstoque);
        }

        navigate('dashboard');
    }
});