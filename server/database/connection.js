const { Pool }  = require ('pg');
require ('dotenv').config();

//Database connection~
const {
    POSTGRES_HOST,
    POSTGRES_DB,
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_PORT
} = process.env;

const pool = new Pool({
    host: POSTGRES_HOST,
    database: POSTGRES_DB,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    port:POSTGRES_PORT,
    max: 20,
    idleTimeoutMillis: 20000,
});

// Test connections 
pool.query('SELECT * FROM USERS', (err, result) => 
    { if (err) { console.error('Error executing query:', err); } 
    else { console.log('Connected '); } });

module.exports = {pool}