const pool = require('../config/db');

class InvitationModel {
  // 초대장 상세 조회 (학교명 및 초대한 학생 이름 JOIN)
  static async findById(id) {
    const query = `
      SELECT 
        i.id, i.school_id, i.student_id, i.invited_from, i.is_rejected,
        s.name AS school_name,
        st.name AS inviter_name
      FROM invitations i
      JOIN schools s ON i.school_id = s.id
      LEFT JOIN students st ON i.invited_from = st.id
      WHERE i.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // 초대 거부 (is_rejected = true)
  static async rejectInvitation(id) {
    const result = await pool.query(
      'UPDATE invitations SET is_rejected = true WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  // 초대 수락 완료 후 초대장 삭제
  static async deleteInvitation(id) {
    const result = await pool.query(
      'DELETE FROM invitations WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
}

module.exports = InvitationModel;
