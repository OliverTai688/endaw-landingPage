const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

console.log('Testing connection to:', process.env.DATABASE_URL);

pool.connect((err, client, release) => {
    if (err) {
        console.error('Connection error:', err.stack);
        process.exit(1);
    }
    console.log('Connected successfully!');
    client.query('SELECT NOW()', (err, res) => {
        release();
        if (err) {
            console.error('Query error:', err.stack);
            process.exit(1);
        }
        console.log('Query result:', res.rows[0]);
        process.exit(0);
    });
});
