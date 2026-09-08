const pool = require('../config/db');

exports.searchByName = async (query) => {
  const result = await pool.query(
    'SELECT id, name FROM schools WHERE name LIKE $1 LIMIT 10',
    [`%${query}%`]
  );
  return result.rows;
};

exports.findByName = async (name) => {
  const result = await pool.query(
    'SELECT id, name FROM schools WHERE name = $1',
    [name]
  );
  return result.rows[0];
};

exports.createSchool = async (name) => {
  const result = await pool.query(
    'INSERT INTO schools (name) VALUES ($1) RETURNING id, name',
    [name]
  );
  return result.rows[0];
};
