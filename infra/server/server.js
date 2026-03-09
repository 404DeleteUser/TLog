const express = require('express');
const cors = require('cors');
const path = require('path'); 

// 1. Caminho corrigido para a base de dados (voltamos de 'server' para 'infra', e entramos em 'database')
const pool = require('../database/database'); 

const app = express();

// ================= CONFIGURAÇÕES BASE =================
app.use(cors()); 
app.use(express.json()); 

// 2. Pasta estática: Voltamos 2 pastas (../../) para sair de 'infra/server', chegar à raiz e entrar em 'frontend'
app.use(express.static(path.join(__dirname, '../../frontend'), { index: false }));

// ================= ROTAS DE NAVEGAÇÃO =================

// 3. ROTA PRINCIPAL: Entrega a página de Login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/public/login.html'));
});

// 4. ROTA DA TRILHA: Entrega a página principal
app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/public/index.html'));
});

// ================= ROTAS DE API (BANCO DE DADOS) =================

// Validar o Login
app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const resultado = await pool.query(
            'SELECT * FROM usuario WHERE email = $1 AND senha = $2',
            [email, senha]
        );

        const usuario = resultado.rows[0];

        if (usuario) {
            delete usuario.senha;
            return res.json({ sucesso: true, mensagem: 'Login aprovado!', dados: usuario });
        } else {
            return res.status(401).json({ sucesso: false, erro: 'Email ou senha incorretos.' });
        }

    } catch (erro) {
        console.error('Erro no login:', erro);
        return res.status(500).json({ sucesso: false, erro: 'Erro interno no servidor.' });
    }
});

// Salvar uma nova demanda
app.post('/api/demandas', async (req, res) => {
    const { usuario_id, tipocategoria, descricao } = req.body;

    try {
        const resultado = await pool.query(
            'INSERT INTO demandas (usuario_id, tipocategoria, descricao) VALUES ($1, $2, $3) RETURNING *',
            [usuario_id, tipocategoria, descricao]
        );

        const novaDemanda = resultado.rows[0];

        return res.status(201).json({ 
            sucesso: true, 
            mensagem: 'Demanda salva com sucesso!', 
            dados: novaDemanda 
        });

    } catch (erro) {
        console.error('Erro ao salvar demanda:', erro);
        return res.status(500).json({ sucesso: false, erro: 'Erro ao salvar demanda no banco.' });
    }
});

// Listar todas as demandas
app.get('/api/demandas', async (req, res) => {
    try {
        const query = `
            SELECT 
                d.id, 
                d.tipocategoria, 
                d.descricao, 
                d.data_registro,
                u.nome_exibicao, 
                u.foto_perfil, 
                u.nucleo
            FROM demandas d
            INNER JOIN usuario u ON d.usuario_id = u.id
            ORDER BY d.data_registro DESC;
        `;

        const resultado = await pool.query(query);
        return res.status(200).json(resultado.rows);

    } catch (erro) {
        console.error('Erro ao buscar demandas:', erro);
        return res.status(500).json({ erro: 'Erro ao buscar demandas no banco.' });
    }
});

// ================= INICIAR SERVIDOR =================
app.listen(3000, () => {
    console.log('✅ Servidor rodando lindamente na porta 3000!');
});