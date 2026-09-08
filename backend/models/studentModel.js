const pool = require('../config/db');

class StudentModel {
  static async findStudent(schoolId, gradYear, name) {
    const result = await pool.query(
      'SELECT id FROM students WHERE school_id = $1 AND grad_year = $2 AND name = $3',
      [schoolId, gradYear, name]
    );
    return result.rows[0];
  }

  static async createStudent(schoolId, gradYear, name) {
    const result = await pool.query(
      'INSERT INTO students (school_id, grad_year, name, terms) VALUES ($1, $2, $3, NOW()) RETURNING id',
      [schoolId, gradYear, name]
    );
    return result.rows[0];
  }
}

module.exports = StudentModel;
