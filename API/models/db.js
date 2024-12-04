// models/db.js
const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectTimeout: process.env.DB_CONNECTION_TIMEOUT,
    acquireTimeout: process.env.DB_ACQUIRE_TIMEOUT,
    timeout: process.env.DB_TIMEOUT,
    reconnect: process.env.DB_RECONNECT
});

db.connect((err) => {
    if (err) throw err;
    console.log(`MySQL Connected...`);
});

module.exports = db;
