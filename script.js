
// 1. GERENCIADOR DO FLUXO DE AUTENTICAÇÃO (LOGIN / LOGOUT)

function handleLogin(event) {
    event.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    if (usuario === "teste" && senha === "1234") {
        document.getElementById('view-login').classList.remove('active-view');
        document.getElementById('main-system-container').classList.add('active-view');
        navigate('clientes');
    } else {
        alert("Usuário ou senha incorretos!");
    }
}
function handleLogout() {
    // Esconde o painel administrativo do sistema
    document.getElementById('main-system-container').classList.remove('active-view');
    
    // Traz de volta o card de login na tela
    document.getElementById('view-login').classList.add('active-view');
}


// 2. GERENCIADOR DE NAVEGAÇÃO PRINCIPAL DO SCRIPT SPA

function navigate(viewName) {
    // Remove classe ativa de todas as opções da barra lateral
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    // Oculta todas as sub-views do painel
    document.querySelectorAll('.app-view').forEach(view => view.classList.remove('active-view'));

    const title = document.getElementById('page-title');

    if (viewName === 'clientes') {
        document.getElementById('menu-clientes').classList.add('active');
        document.getElementById('view-cadastro').classList.add('active-view');
        title.innerText = "Cadastro";
        switchFormTab('cliente'); 
    } 
    else if (viewName === 'estoque') {
        document.getElementById('menu-estoque').classList.add('active');
        document.getElementById('view-estoque-lista').classList.add('active-view');
        title.innerText = "Estoque";
    }
    else {
        title.innerText = viewName.charAt(0).toUpperCase() + viewName.slice(1);
        alert(`Você clicou na seção: ${viewName}.\nNeste protótipo, utilize 'Clientes (Cadastro)' ou 'Estoque (Lista)'.`);
    }
}


// 3. ALTERNADOR DE SUB-ABAS INTERNAS (TELA DE CADASTRO)

function switchFormTab(targetForm) {
    const btnCliente = document.getElementById('tab-btn-cliente');
    const btnEstoque = document.getElementById('tab-btn-estoque');
    const formCliente = document.getElementById('section-form-cliente');
    const formEstoque = document.getElementById('section-form-estoque');

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

// Atalho do botão da tabela para pular à aba de cadastro
function goToAddProduct() {
    navigate('clientes');
    switchFormTab('estoque');
}


// 4. MÁSCARA AUTOMÁTICA DE TELEFONE CELULAR

document.getElementById('phone-field').addEventListener('input', (e) => {
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

// Manipulador padrão de envio de cadastros
function handleFormAction(event, entity) {
    event.preventDefault();
    alert(`${entity} salvo com sucesso no banco de dados simulado!`);
    event.target.reset();
}