const pool = require('../config/db');

class TeacherModel {
  static async findTeacher(schoolId, name, subject) {
    const query = `
      SELECT t.id, t.name, t.subject 
      FROM teachers t
      JOIN teacher_schools ts ON t.id = ts.teacher_id
      WHERE ts.school_id = $1 AND t.name = $2 AND t.subject = $3
    `;
    const result = await pool.query(query, [schoolId, name, subject]);
    return result.rows[0];
  }

  static async createTeacher(schoolId, name, subject) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const teacherResult = await client.query(
        'INSERT INTO teachers (name, subject, terms) VALUES ($1, $2, NOW()) RETURNING id',
        [name, subject]
      );
      const teacherId = teacherResult.rows[0].id;

      await client.query(
        'INSERT INTO teacher_schools (teacher_id, school_id) VALUES ($1, $2)',
        [teacherId, schoolId]
      );

      await client.query('COMMIT');
      return { id: teacherId };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = TeacherModel;
