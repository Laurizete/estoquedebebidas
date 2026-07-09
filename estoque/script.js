// =========================================================================
// 1. BANCO DE DADOS LOCAL CENTRALIZADO (LOCALSTORAGE)
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
// 2. CONTROLE DE SESSÃO
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

// Alternador de abas internas (somente na clientes.html)
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

// =========================================================================
// 3. ENGENHARIA DE CORRESPONDÊNCIA E RENDERIZAÇÃO
// =========================================================================
function identificarECarregarPaginaAtual() {
    const path = window.location.pathname;
    const pagina = path.substring(path.lastIndexOf("/") + 1);

    if (pagina === "index.html" || pagina === "") {
        renderizarDashboard();
    } else if (pagina === "clientes.html") {
        atualizarSelectsDeCategoria();
        renderizarClientes();
        
        // Verifica se veio redirecionado para abrir direto na aba de estoque
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
}

function renderizarEstoque() {
    const tabelaBody = document.querySelector('.stock-table tbody');
    if (!tabelaBody) return;

    tabelaBody.innerHTML = '';
    const filtroCategoria = document.getElementById('category-filter')?.value || 'Todas';
    let totalQtd = 0; let totalValor = 0; let totalItensFiltrados = 0;

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

    if (document.getElementById('rodape-total-un')) {
        document.querySelector('.total-items').innerText = `Total de itens: ${totalItensFiltrados}`;
        document.getElementById('rodape-total-un').innerText = totalQtd;
        document.getElementById('rodape-total-rs').innerText = totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    }
}

function renderizarCategorias() {
    const tabelaBody = document.querySelector('.stock-table tbody');
    if (!tabelaBody) return;
    tabelaBody.innerHTML = '';

    categorias.forEach((cat, index) => {
        const qtdAtrelados = produtos.filter(p => p.categoria === cat).length;
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>📁</td><td><strong>${cat}</strong></td><td>${qtdAtrelados} produtos</td><td><div class="action-buttons"><button class="btn-action btn-delete" onclick="removerCategoria(${index})"><i class="fa-solid fa-trash"></i></button></div></td>`;
        tabelaBody.appendChild(tr);
    });
}

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
        tr.innerHTML = `<td><strong>${c.nome}</strong></td><td>${c.telefone}</td><td>${c.endereco}</td><td>${c.email}</td><td><div class="action-buttons"><button class="btn-action btn-delete" onclick="removerCliente(${index})"><i class="fa-solid fa-trash"></i></button></div></td>`;
        tabelaBody.appendChild(tr);
    });
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

// =========================================================================
// 4. TRATAMENTO DE INPUTS E PERSISTÊNCIA
// =========================================================================
function handleFormAction(event, entity) {
    event.preventDefault();
    const campos = event.target.elements;

    if (entity === 'Cliente') {
        clientes.push({ nome: campos[0].value, telefone: document.getElementById('phone-field').value, endereco: campos[2].value, email: campos[3].value || 'Não informado' });
        salvarDados();
        alert('Cliente cadastrado com sucesso!');
        renderizarClientes();
    } else if (entity === 'Produto') {
        produtos.push({ nome: campos[0].value, categoria: campos[1].value, marca: campos[2].value, preco: parseFloat(campos[3].value), qtd: parseInt(campos[4].value), minimo: parseInt(campos[5].value) });
        salvarDados();
        alert('Produto adicionado ao estoque!');
    }
    event.target.reset();
}

function adicionarCategoriaPrompt() {
    const novaCat = prompt("Digite o nome da nova categoria:");
    if (novaCat && novaCat.trim() !== "") {
        if (categorias.includes(novaCat.trim())) return alert("Categoria já existente.");
        categorias.push(novaCat.trim());
        salvarDados();
        identificarECarregarPaginaAtual();
    }
}

function removerProduto(index) {
    if (confirm('Excluir produto?')) { produtos.splice(index, 1); salvarDados(); renderizarEstoque(); }
}
function removerCategoria(index) {
    if (confirm('Excluir categoria?')) { categorias.splice(index, 1); salvarDados(); renderizarCategorias(); }
}
// Corrigido o escopo global da remoção do cliente
window.removerCliente = function(index) {
    if (confirm('Excluir cliente?')) { clientes.splice(index, 1); salvarDados(); renderizarClientes(); }
}

// =========================================================================
// 5. RELATÓRIOS SEGUROS
// =========================================================================
function gerarRelatorioEstoque() {
    const win = window.open('', '_blank');
    let html = "<h2>Relatório de Estoque</h2><table border='1' width='100%'><thead><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Qtd</th></tr></thead><tbody>";
    produtos.forEach(p => { html += `<tr><td>${p.nome}</td><td>${p.categoria}</td><td>R$ ${p.preco.toFixed(2)}</td><td>${p.qtd}</td></tr>`; });
    html += "</tbody></table><script>window.onload=function(){window.print();}</script>";
    win.document.write(html); win.document.close();
}

function gerarRelatorioClientes() {
    const win = window.open('', '_blank');
    let html = "<h2>Relatório de Clientes</h2><table border='1' width='100%'><thead><tr><th>Nome</th><th>Telefone</th><th>Endereço</th></tr></thead><tbody>";
    clientes.forEach(c => { html += `<tr><td>${c.nome}</td><td>${c.telefone}</td><td>${c.endereco}</td></tr>`; });
    html += "</tbody></table><script>window.onload=function(){window.print();}</script>";
    win.document.write(html); win.document.close();
}

// =========================================================================
// 6. DISPARADORES INICIAIS
// =========================================================================
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

window.addEventListener('DOMContentLoaded', identificarECarregarPaginaAtual);