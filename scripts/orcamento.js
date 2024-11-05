// Seleciona elementos do DOM
const btnAdicionar = document.getElementById("btnAdicionar");
const modal = document.getElementById("modalProduto");
const spanClose = document.getElementsByClassName("close")[0];
const modalEdit = document.getElementById('modalEditProduto');

// Função para abrir o modal de adicionar produto
btnAdicionar.onclick = function() {
    console.log("Abrindo o modal...");
    modal.style.display = "block";
};

// Função para fechar o modal ao clicar no "x"
spanClose.onclick = function() {
    console.log("Fechando o modal ao clicar no 'x'");
    modal.style.display = "none";
};

// Fechar o modal ao clicar fora dele
window.onclick = function(event) {
    if (event.target == modal) {
        console.log("Fechando o modal ao clicar fora dele");
        modal.style.display = "none";
    }
};

// Função para adicionar um novo produto
document.getElementById('submitProductBtn').onclick = function() {
    console.log("Botão 'Cadastrar' clicado");

    // Coleta os valores dos campos de entrada
    const productName = document.getElementById('productName').value;
    const productCode = document.getElementById('codigo').value;
    const productMeasures = document.getElementById('medidas').value;
    const productSales = document.getElementById('vendas').value;
    const productQuantity = document.getElementById('quantidade').value;

    console.log("Valores do formulário:", { productName, productCode, productMeasures, productSales, productQuantity });

    // Verificar se os campos estão preenchidos
    if (!productName || !productCode || !productMeasures || !productSales || !productQuantity) {
        console.error("Preencha todos os campos antes de cadastrar.");
        return;
    }

    // Obter a data atual
    const currentDate = new Date().toISOString().split('T')[0];
    console.log("Data atual:", currentDate);

    // Criar objeto do novo produto
    const newProduct = {
        productName: productName,
        codigo: productCode,
        medidas: productMeasures,
        vendas: productSales,
        quantidade: productQuantity,
        data: currentDate
    };

    console.log("Enviando requisição para o backend...");
    fetch('http://localhost:8080/api/estoque', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct)
    })
    .then(response => {
        console.log("Resposta recebida:", response);
        if (!response.ok) {
            throw new Error("Erro na requisição: " + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log("Sucesso:", data);
        const tableBody = document.getElementById('productTableBody');
        const newRow = tableBody.insertRow();
        newRow.setAttribute('data-id', data.id); // Supondo que o ID é retornado no objeto data
        newRow.innerHTML = `
            <td><input type="checkbox" class="select-product"></td>
            <td>${data.productName}</td>
            <td>${data.codigo}</td>
            <td>${data.medidas}</td>
            <td>${data.vendas}</td>
            <td>${data.quantidade}</td>
            <td>${data.data}</td>
        `;

        // Fechar o modal
        modal.style.display = 'none';
        console.log("Produto adicionado à tabela e modal fechado");
    })
    .catch((error) => {
        console.error("Erro ao enviar produto:", error);
    });
};

// Função para remover produto
document.getElementById('btnRemoverSelecionado').onclick = function() {
    const tableBody = document.getElementById('productTableBody');
    const rows = tableBody.querySelectorAll('tr');

    const idsToDelete = [];
    rows.forEach(row => {
        const checkbox = row.querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.checked) {
            const productId = row.getAttribute('data-id');
            if (productId) {
                idsToDelete.push(productId);
            }
        }
    });

    if (idsToDelete.length === 0) {
        console.log("Nenhum produto selecionado para remoção");
        return;
    }

    fetch('http://localhost:8080/api/estoque', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: idsToDelete })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Erro ao remover os produtos.");
        }
        return response.json();
    })
    .then(data => {
        console.log('Produtos removidos com sucesso:', data);
        idsToDelete.forEach(id => {
            const row = Array.from(rows).find(row => row.getAttribute('data-id') === id);
            if (row) {
                tableBody.removeChild(row);
            }
        });
    })
    .catch(error => {
        console.error('Erro ao remover produtos:', error);
    });
};

let currentEditingProductId = null; // Para armazenar o ID do produto sendo editado

// Função para abrir o modal de edição
function openEditModal() {
    const checkboxes = document.querySelectorAll('.select-product');
    const selectedCheckboxes = Array.from(checkboxes).filter(checkbox => checkbox.checked);

    if (selectedCheckboxes.length === 1) {
        currentEditingProductId = selectedCheckboxes[0].closest('tr').getAttribute('data-id'); // Obtém o ID do produto
        const currentQuantity = selectedCheckboxes[0].closest('tr').querySelector('td:nth-child(6)').innerText; // Obtém a quantidade atual

        // Preenche o campo de quantidade no modal de edição
        document.getElementById('editQuantidade').value = currentQuantity;

        modalEdit.style.display = 'block'; // Exibe o modal
    } else {
        alert("Selecione apenas um produto para editar.");
    }
}

// Função para fechar o modal ao clicar no "x"
spanClose.onclick = function() {
    console.log("Fechando o modal ao clicar no 'x'");
    modal.style.display = "none";
};

// Fechar o modal ao clicar fora dele
window.onclick = function(event) {
    if (event.target == modal) {
        console.log("Fechando o modal ao clicar fora dele");
        modal.style.display = "none";
    }
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
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantidade: updatedQuantity })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Erro ao atualizar o produto.");
        }
        return response.json();
    })
    .then(data => {
        console.log("Produto atualizado com sucesso:", data);

        // Atualiza a quantidade na tabela
        const row = document.querySelector(`tr[data-id='${currentEditingProductId}']`);
        row.querySelector('td:nth-child(6)').innerText = updatedQuantity; // Atualiza a quantidade na tabela

        fecharEditModal(); // Fecha o modal após a atualização
    })
    .catch(error => {
        console.error("Erro ao atualizar produto:", error);
    });
};

// Adiciona evento ao botão de editar
document.getElementById('btnEditarProduto').onclick = function() {
    openEditModal();
};

// Função para fechar o modal de edição ao clicar no "x"
document.getElementById('modalEditClose').onclick = function() {
    fecharEditModal();
};

// Modifique a função toggleEditButton para verificar a classe correta
function toggleEditButton() {
    const checkboxes = document.querySelectorAll('.select-product');
    const editButton = document.getElementById('btnEditarProduto');
    const selectedCheckboxes = Array.from(checkboxes).some(checkbox => checkbox.checked);
    editButton.disabled = !selectedCheckboxes; // Habilita o botão se algum checkbox estiver selecionado
    editButton.classList.toggle('disabled', !selectedCheckboxes);
}

// Escuta mudanças nos checkboxes para habilitar/desabilitar o botão de editar
document.querySelectorAll('.select-product').forEach(checkbox => {
    checkbox.addEventListener('change', toggleEditButton);
});

// Seleção de todos os checkboxes
document.getElementById('selectAll').onclick = function() {
    const checkboxes = document.querySelectorAll('#productTableBody input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = this.checked);
};

// Adiciona evento de fechamento ao clicar fora do modal de edição
window.onclick = function(event) {
    if (event.target == modalEdit) {
        fecharEditModal();
    }
};
