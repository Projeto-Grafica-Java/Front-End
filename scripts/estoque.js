// Seleciona elementos do DOM
const btnAdicionar = document.getElementById("btnAdicionar");
const modal = document.getElementById("modalProduto");
const spanClose = document.getElementsByClassName("close")[0];
const submitProductBtn = document.getElementById('submitProductBtn');
const btnRemoverSelecionado = document.getElementById('btnRemoverSelecionado');
const btnEditarProduto = document.getElementById('btnEditarProduto');
const selectAllCheckbox = document.getElementById('selectAll');

let currentEditingProductId = null; // ID do produto sendo editado

// --------------------------- MODAL ADICIONAR PRODUTO --------------------------- //

// Função para abrir o modal
btnAdicionar.onclick = function() {
    console.log("Abrindo o modal...");
    modal.style.display = "block";
};

// Função para fechar o modal ao clicar no "x" ou fora do modal
spanClose.onclick = closeModal;
window.onclick = function(event) {
    if (event.target === modal) {
        closeModal();
    }
};

// Função para fechar o modal
function closeModal() {
    console.log("Fechando o modal...");
    modal.style.display = "none";
}

// Função para adicionar um novo produto
submitProductBtn.onclick = function() {
    console.log("Botão 'Cadastrar' clicado");

    // Coleta os valores dos campos de entrada
    const newProduct = {
        productName: document.getElementById('productName').value,
        codigo: document.getElementById('codigo').value,
        medidas: document.getElementById('medidas').value,
        vendas: document.getElementById('vendas').value,
        quantidade: document.getElementById('quantidade').value,
        data: new Date().toISOString().split('T')[0] // Data atual
    };

    // Verificar se os campos estão preenchidos
    if (Object.values(newProduct).some(value => !value)) {
        console.error("Preencha todos os campos antes de cadastrar.");
        return;
    }

    console.log("Enviando requisição para o backend...");
    fetch('http://localhost:8080/api/estoque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
    })
    .then(handleResponse)
    .then(data => {
        addProductToTable(data);
        closeModal(); // Fecha o modal
    })
    .catch(handleError);
};

// Função para adicionar produto à tabela
function addProductToTable(data) {
    const tableBody = document.getElementById('productTableBody');
    const newRow = tableBody.insertRow();
    newRow.setAttribute('data-id', data.id); // Assumindo que o backend retorna um ID
    newRow.innerHTML = `
        <td><input type="checkbox" class="select-product"></td>
        <td>${data.productName}</td>
        <td>${data.codigo}</td>
        <td>${data.medidas}</td>
        <td>${data.vendas}</td>
        <td>${data.quantidade}</td>
        <td>${data.data}</td>
    `;
    console.log("Produto adicionado à tabela");
}

// --------------------------- REMOVER PRODUTO --------------------------- //

// Função para remover produtos selecionados
btnRemoverSelecionado.onclick = function() {
    const idsToDelete = Array.from(document.querySelectorAll('#productTableBody input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.closest('tr').getAttribute('data-id'));

    if (idsToDelete.length === 0) {
        console.log("Nenhum produto selecionado para remoção");
        return;
    }

    fetch('http://localhost:8080/api/estoque', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsToDelete })
    })
    .then(handleResponse)
    .then(data => {
        removeProductsFromTable(idsToDelete);
    })
    .catch(handleError);
};

// Função para remover produtos da tabela
function removeProductsFromTable(idsToDelete) {
    const tableBody = document.getElementById('productTableBody');
    idsToDelete.forEach(id => {
        const row = tableBody.querySelector(`tr[data-id='${id}']`);
        if (row) {
            tableBody.removeChild(row);
        }
    });
    console.log('Produtos removidos com sucesso');
}

// --------------------------- MODAL EDITAR PRODUTO --------------------------- //

// Função para abrir o modal de edição
btnEditarProduto.onclick = openEditModal;

function openEditModal() {
    const selectedCheckboxes = Array.from(document.querySelectorAll('.select-product:checked'));

    if (selectedCheckboxes.length === 1) {
        currentEditingProductId = selectedCheckboxes[0].closest('tr').getAttribute('data-id');
        const currentQuantity = selectedCheckboxes[0].closest('tr').querySelector('td:nth-child(6)').innerText;
        document.getElementById('editQuantidade').value = currentQuantity;

        const modalEdit = document.getElementById('modalEditProduto');
        modalEdit.style.display = 'block'; // Exibe o modal
    } else {
        alert("Selecione apenas um produto para editar.");
    }
}

// Função para fechar o modal de edição
document.getElementById('modalEditClose').onclick = function() {
    document.getElementById('modalEditProduto').style.display = 'none'; // Oculta o modal
};

// Evento para o botão de salvar no modal de edição
document.getElementById('submitEditProductBtn').onclick = function() {
    const updatedQuantity = document.getElementById('editQuantidade').value;

    if (!updatedQuantity) {
        console.error("A quantidade não pode estar vazia.");
        return;
    }

    fetch(`http://localhost:8080/api/estoque/${currentEditingProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantidade: updatedQuantity })
    })
    .then(handleResponse)
    .then(data => {
        const row = document.querySelector(`tr[data-id='${currentEditingProductId}']`);
        row.querySelector('td:nth-child(6)').innerText = updatedQuantity;
        closeModal(); // Fecha o modal após a atualização
    })
    .catch(handleError);
};

// --------------------------- FUNÇÕES AUXILIARES --------------------------- //

// Função para tratar a resposta da requisição
function handleResponse(response) {
    if (!response.ok) {
        throw new Error("Erro na requisição: " + response.status);
    }
    return response.json();
}

// Função para tratar erros
function handleError(error) {
    console.error("Erro:", error);
}

// Habilitar/Desabilitar botão de editar
function toggleEditButton() {
    const selectedCheckboxes = Array.from(document.querySelectorAll('.select-product:checked'));
    btnEditarProduto.disabled = selectedCheckboxes.length !== 1;
}

// Escuta mudanças nos checkboxes para habilitar/desabilitar o botão de editar
document.querySelectorAll('.select-product').forEach(checkbox => {
    checkbox.addEventListener('change', toggleEditButton);
});

// Seleção de todos os checkboxes
selectAllCheckbox.onclick = function() {
    const checkboxes = document.querySelectorAll('#productTableBody input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = this.checked);
};
