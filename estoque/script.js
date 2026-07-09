// 1. SISTEMA DE AUTENTICAÇÃO (LOGIN E LOGOUT)

function handleLogin(event) {
    event.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    if (usuario === "teste" && senha === "1234") {
        // Redireciona o usuário para o arquivo do sistema principal
        window.location.href = "index.html";
    } else {
        alert("Usuário ou senha incorretos!");
    }
}

function handleLogout() {
    // Redireciona o usuário de volta para a tela de login
    window.location.href = "login.html";
}


// 2. GERENCIADOR DE NAVEGAÇÃO PRINCIPAL DO SISTEMA

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

    // Se esses elementos não existirem na página atual, sai da função
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

// Atalho do botão da tabela para pular à aba de cadastro
function goToAddProduct() {
    navigate('clientes');
    switchFormTab('estoque');
}


// 4. MÁSCARA AUTOMÁTICA DE TELEFONE CELULAR

// Mudança: Verifica se o campo existe antes de adicionar o evento (evita erros no login.html)
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

// Manipulador padrão de envio de cadastros
function handleFormAction(event, entity) {
    event.preventDefault();
    alert(`${entity} salvo com sucesso no banco de dados!`);
    event.target.reset();
}
// Executa automaticamente assim que a página index.html termina de carregar
window.addEventListener('DOMContentLoaded', () => {
    // Verifica se estamos na página do sistema (onde o menu-clientes existe)
    if (document.getElementById('menu-clientes')) {
        navigate('clientes');
    }
});
