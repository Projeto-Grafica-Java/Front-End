// Seleciona elementos do DOM
const btnAdicionar = document.getElementById("btnAdicionar");
const modal = document.getElementById("modalProduto");
const spanClose = document.getElementsByClassName("close")[0];

// Função para abrir o modal
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
        newRow.innerHTML = `
            <td><input type="checkbox"></td>
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

// função pra remover produto
document.getElementById('btnRemoverSelecionado').onclick = function() {
    const tableBody = document.getElementById('productTableBody');
    const rows = tableBody.querySelectorAll('tr');

    const idsToDelete = [];
    rows.forEach(row => {
        // verif se o checkbox da linha esta marcado
        const checkbox = row.querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.checked){
            const productId = row.getAttribute('data-id')
            if (productId) {
                idsToDelete.push(productId);
            }
        }
    });

    if (idsToDelete.length === 0){
        console.log("Nenhum produto selecionado para remoção");
        return;
    }

    // req
    fetch('http://localhost:8080/api/estoque', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: idsToDelete }) // Envia os IDs para o backend
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Erro ao remover os produtos.");
        }
        return response.json();
    })
    .then(data => {
        console.log('Produtos removidos com sucesso:', data);

        // Remove as linhas da tabela somente após a confirmação do backend
        rows.forEach(row => {
            const productId = row.getAttribute('data-id');
            if (idsToDelete.includes(productId)) {
                tableBody.removeChild(row);
            }
        });
    })
    .catch(error => {
        console.error('Erro ao remover produtos:', error);
    });
};

// Seleção de todos os checkboxes
document.getElementById('selectAll').onclick = function() {
    const checkboxes = document.querySelectorAll('#productTableBody input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = this.checked);
};
