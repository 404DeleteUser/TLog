const express = require('express');
const cors = require('cors');
const pool = require('../database/database');

const app = express();

// Configurações base
app.use(cors()); // Permite que o frontend (em outra porta) converse com este backend
app.use(express.json()); // Permite receber dados no formato JSON

// Rota para validar o Login
app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;

    // Rota que vai servir a tela da Trilha
    app.get('/app', (req, res) => {
    // Esse caminho faz o backend "voltar" uma pasta, entrar no frontend e pegar o app.html
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

    try {
        // Consulta no banco de dados (o $1 e $2 evitam ataques de SQL Injection)
        const resultado = await pool.query(
            'SELECT * FROM usuario WHERE email = $1 AND senha = $2',
            [email, senha]
        );

        const usuario = resultado.rows[0];

        if (usuario) {
            // Se achou o usuário, removemos a senha do retorno por segurança e enviamos os dados
            delete usuario.senha;
            return res.json({ sucesso: true, mensagem: 'Login aprovado!', dados: usuario });
        } else {
            // Se não achou, credenciais estão erradas
            return res.status(401).json({ sucesso: false, erro: 'Email ou senha incorretos.' });
        }

    } catch (erro) {
        console.error('Erro no login:', erro);
        return res.status(500).json({ sucesso: false, erro: 'Erro interno no servidor.' });
    }
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});

// Rota para salvar uma nova demanda
app.post('/api/demandas', async (req, res) => {
    const { usuario_id, tipocategoria, descricao } = req.body;

    try {
        // Inserindo no banco de dados e retornando o que foi inserido (RETURNING *)
        const resultado = await pool.query(
            'INSERT INTO demandas (usuario_id, tipocategoria, descricao) VALUES ($1, $2, $3) RETURNING *',
            [usuario_id, tipocategoria, descricao]
        );

        const novaDemanda = resultado.rows[0];

        // Responde ao frontend que deu tudo certo
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