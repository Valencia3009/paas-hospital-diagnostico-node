
const { Pool } = require("pg");

// Configuración mediante variables de entorno
const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 5,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000
});

// Exportar la conexión para utilizarla en la API REST
module.exports = pool;
