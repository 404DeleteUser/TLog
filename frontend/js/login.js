console.log('O script de login está vivo!');
document.querySelector('.login-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita que a página recarregue

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        // Envia os dados para o nosso backend Node.js
        const resposta = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, senha: senha })
        });

        const retorno = await resposta.json();

        if (retorno.sucesso) {
            //salva os dados do usuario na memoria do navegador
            //usamos o JSON.stringfy para transformar o objeto em texto, pois o localStorage só aceita texto
            localStorage.setItem('usuarioLogado', JSON.stringify(retorno.dados));

            window.location.href = 'index.html'
            // Aqui salvaríamos os dados no navegador e mandaríamos para a tela da Trilha
        } else {
            alert(retorno.erro);
            document.getElementById('senha').value = '';
        }
    } catch (error) {
        alert('Erro ao tentar conectar com o servidor.');
    }
});