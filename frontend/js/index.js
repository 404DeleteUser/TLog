document.addEventListener('DOMContentLoaded', () => {
    
    // Pegando os elementos do DOM
    const btnNovaDemanda = document.getElementById('btnNovaDemanda');
    const modalDemanda = document.getElementById('modalDemanda');
    const btnCancelarModal = document.getElementById('btnCancelarModal');
    const formDemanda = document.getElementById('formDemanda');

    // Abre o modal ao clicar no "+"
    btnNovaDemanda.addEventListener('click', () => {
        modalDemanda.classList.remove('hidden');
    });

    // Fecha o modal ao clicar em "Cancelar"
    btnCancelarModal.addEventListener('click', () => {
        fecharModal();
    });

    // Fecha o modal se o usuário clicar fora da caixinha
    modalDemanda.addEventListener('click', (evento) => {
        if (evento.target === modalDemanda) {
            fecharModal();
        }
    });

    function fecharModal() {
        modalDemanda.classList.add('hidden');
        formDemanda.reset(); // Limpa os campos digitados
    }

// Ação de Salvar o formulário
    formDemanda.addEventListener('submit', async (evento) => {
        evento.preventDefault(); // Impede a página de recarregar
        
        const categoria = document.getElementById('categoria').value;
        const descricao = document.getElementById('descricao').value;

        // Pega os dados do usuário que fez o login
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

        if (!usuarioLogado) {
            alert('Erro: Usuário não está logado!');
            return;
        }

        const dadosEnvio = {
            usuario_id: usuarioLogado.id,
            tipocategoria: categoria,
            descricao: descricao
        };

        try {
            // 1. Envia para o Backend
            const resposta = await fetch('/api/demandas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosEnvio)
            });

            const retorno = await resposta.json();

            if (retorno.sucesso) {
                // 2. Se salvou no banco, adiciona na tela imediatamente!
                adicionarDemandaNaTela(retorno.dados, usuarioLogado);
                fecharModal();
            } else {
                alert('❌ Erro: ' + retorno.erro);
            }
        } catch (erro) {
            console.error('Erro na requisição:', erro);
            alert('Erro ao conectar com o servidor.');
        }
    });

    // Função para desenhar a nova demanda no topo da lista
    function adicionarDemandaNaTela(demanda, usuario) {
        // Encontra o primeiro grupo de linha do tempo (o dia mais recente na tela)
        const primeiraTimeline = document.querySelector('.timeline');
        
        if (!primeiraTimeline) return;

        // Pega a foto do usuário (se não tiver, usa o ícone padrão)
        const foto = usuario.foto_perfil ? usuario.foto_perfil : 'assets/iconUser.png';
        
        // Converte a categoria para minúsculo para aplicar a cor do CSS (ex: "Email" vira "email")
        const classeTag = `tag-${demanda.tipocategoria.toLowerCase()}`;

        // Cria o HTML da nova demanda
        const divDemanda = document.createElement('div');
        divDemanda.className = 'demanda-item';
        divDemanda.innerHTML = `
            <div class="demanda-avatar">
                <img src="${foto}" alt="Usuário">
            </div>
            <div class="demanda-header">
                <span class="demanda-user">${usuario.nome_exibicao}</span>
                <span class="tag ${classeTag}">${demanda.tipocategoria}</span>
                <span class="demanda-tempo">Agora</span>
            </div>
            <div class="demanda-assunto">${demanda.descricao}</div>
        `;

        // Insere a nova demanda no TOPO da linha do tempo
        primeiraTimeline.prepend(divDemanda);
    }

});