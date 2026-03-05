const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Carrega o arquivo .env que esta em outra pasta
dotenv.config({path: path.resolve(__dirname, '../docker/.env')});

const pool = new Pool ({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
});

pool.connect()
    .then(() => console.log('Conectado ao PostgreSQL'))
    .catch(err => console.log('Erro na coneç=xão', err.stack));

module.exports = pool
