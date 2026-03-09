// ==========================================
// 1. VERIFICAÇÃO DE SEGURANÇA (FECHADURA)
// ==========================================
const usuarioString = localStorage.getItem('usuarioLogado');

if (!usuarioString) {
    // Se não estiver logado, chuta de volta para a tela de login
    window.location.href = '/';
} else {
    document.addEventListener('DOMContentLoaded', () => {
        
        // Pegando os elementos do DOM
        const btnNovaDemanda = document.getElementById('btnNovaDemanda');
        const modalDemanda = document.getElementById('modalDemanda');
        const btnCancelarModal = document.getElementById('btnCancelarModal');
        const formDemanda = document.getElementById('formDemanda');
        
        // Proteção extra: Procura pelo timelinePrincipal, se não achar, procura pelo muralContainer!
        const timelinePrincipal = document.getElementById('timelinePrincipal') || document.getElementById('muralContainer');

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
            
            // Reseta o visual do Select Customizado
            const triggerText = document.getElementById('selectTrigger').querySelector('span');
            triggerText.textContent = 'Selecione uma categoria...';
            document.getElementById('selectTrigger').classList.remove('has-value');
        }

        // Ação de Salvar o formulário no Banco de Dados
        formDemanda.addEventListener('submit', async (evento) => {
            evento.preventDefault(); 
            
            const categoria = document.getElementById('categoria').value;
            const descricao = document.getElementById('descricao').value;
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
                const resposta = await fetch('/api/demandas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosEnvio)
                });

                const retorno = await resposta.json();

                if (retorno.sucesso) {
                    // Se salvou no banco, atualiza a lista!
                    carregarDemandas();
                    fecharModal();
                } else {
                    alert('❌ Erro: ' + retorno.erro);
                }
            } catch (erro) {
                console.error('Erro na requisição:', erro);
                alert('Erro ao conectar com o servidor.');
            }
        });

        // --- LÓGICA DE BUSCAR DEMANDAS DO BANCO ---
  async function carregarDemandas() {
            try {
                const resposta = await fetch('/api/demandas');
                const demandas = await resposta.json();

                muralContainer.innerHTML = ''; // Limpa a tela

                if (demandas.length === 0) {
                    muralContainer.innerHTML = '<p style="color: #8b949e; padding-left: 20px;">Nenhuma demanda registrada ainda.</p>';
                    return;
                }

                let mesAtual = '';
                let diaAtual = '';
                let timelineAtual = null; 

                const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

                demandas.forEach(demanda => {
                    const dataObj = new Date(demanda.data_registro);
                    const nomeMesDemanda = nomesMeses[dataObj.getMonth()];
                    const nomeDiaDemanda = `Dia ${dataObj.getDate()}`;

                    // Se mudou o MÊS
                    if (nomeMesDemanda !== mesAtual) {
                        mesAtual = nomeMesDemanda;
                        
                        const h1Mes = document.createElement('h1');
                        h1Mes.className = 'mes-titulo';
                        h1Mes.textContent = mesAtual;
                        muralContainer.appendChild(h1Mes);
                        
                        diaAtual = ''; // Reseta o dia para forçar a criação do título
                    }

                    // Se mudou o DIA
                    if (nomeDiaDemanda !== diaAtual) {
                        diaAtual = nomeDiaDemanda;

                        const divDiaGrupo = document.createElement('div');
                        divDiaGrupo.className = 'dia-grupo';

                        const h2Dia = document.createElement('h2');
                        h2Dia.className = 'dia-titulo';
                        h2Dia.textContent = diaAtual;

                        timelineAtual = document.createElement('div');
                        timelineAtual.className = 'timeline';

                        divDiaGrupo.appendChild(h2Dia);
                        divDiaGrupo.appendChild(timelineAtual);
                        muralContainer.appendChild(divDiaGrupo);
                    }

                    // Monta a Demanda
                    const foto = demanda.foto_perfil ? demanda.foto_perfil : '../assets/iconUser.png';
                    const textoNucleo = demanda.nucleo ? demanda.nucleo : 'Sem Núcleo';
                    const classeTag = `tag-${textoNucleo.toLowerCase().replace(/\s+/g, '')}`;

                    // Extraindo a hora formatada para aparecer no canto direito
                    const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                    const divDemanda = document.createElement('div');
                    divDemanda.className = 'demanda-item';
                    
                    // Aqui está a mágica do novo layout!
                    divDemanda.innerHTML = `
                        <div class="demanda-avatar">
                            <img src="${foto}" alt="Usuário">
                        </div>
                        <div class="demanda-header">
                            <span class="demanda-user">${demanda.nome_exibicao}</span>
                            <span class="tag ${classeTag}">${textoNucleo}</span>
                            <span class="demanda-tempo">${horaFormatada} p.m</span>
                        </div>
                        <div class="demanda-assunto">
                            ${demanda.tipocategoria}: ${demanda.descricao}
                        </div>
                    `;

                    timelineAtual.appendChild(divDemanda);
                });

            } catch (erro) {
                console.error('Erro ao carregar a lista:', erro);
                muralContainer.innerHTML = '<p style="color: red; padding-left: 20px;">Erro ao carregar as demandas.</p>';
            }
        }

        // Chama a função assim que a página abrir!
        carregarDemandas();

        // --- LÓGICA DO SELECT CUSTOMIZADO ---
        const customSelect = document.getElementById('customSelect');
        const selectTrigger = document.getElementById('selectTrigger');
        const selectOptions = document.getElementById('selectOptions');
        const inputCategoria = document.getElementById('categoria');
        const opcoes = document.querySelectorAll('.option');
        const triggerText = selectTrigger.querySelector('span');

        selectTrigger.addEventListener('click', (evento) => {
            evento.stopPropagation();
            selectOptions.classList.toggle('hidden');
            selectTrigger.classList.toggle('open');
        });

        opcoes.forEach(opcao => {
            opcao.addEventListener('click', () => {
                const valorReal = opcao.getAttribute('data-value');
                const textoExibido = opcao.textContent;

                triggerText.textContent = textoExibido;
                selectTrigger.classList.add('has-value');
                inputCategoria.value = valorReal;

                selectOptions.classList.add('hidden');
                selectTrigger.classList.remove('open');
            });
        });

        document.addEventListener('click', (evento) => {
            if (!customSelect.contains(evento.target)) {
                selectOptions.classList.add('hidden');
                selectTrigger.classList.remove('open');
            }
        });
    });
}