require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || undefined,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'letters',
  port: process.env.DB_PORT || 5432,
});

module.exports = pool;
