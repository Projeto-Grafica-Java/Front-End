document.querySelector('.formulario').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(this);

    const data = {
        clientName: formData.get('clientName'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        material: formData.get('material'),
        paperType: formData.get('paperType'),
        format: formData.get('format'),
        dimension: formData.get('dimension'),
        finishing: formData.get('finishing'),
        quantity: formData.get('quantity'),
        notes: formData.get('notes'),
        artwork: formData.get('artwork'), 
    };

    fetch('http://localhost:8080/api/orcamentos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        alert("Formulário enviado com sucesso!");
        this.reset();
    })
    .catch((error) => {
        console.error('Error:', error);
        alert("Erro ao enviar o formulário."); 
    });
});
