// db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'aszampias',
  host: 'localhost',
  database: 'zebra',
  password: 'postgres',
  port: 5432, // Default Postgres port
});

// Export a query function to easily interact with the pool
module.exports = {
  query: (text, params) => pool.query(text, params),
};