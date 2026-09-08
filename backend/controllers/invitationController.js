const fs = require('fs');
const path = require('path');
const InvitationModel = require('../models/invitationModel');
const SchoolModel = require('../models/schoolModel');
const StudentModel = require('../models/studentModel');
const TeacherModel = require('../models/teacherModel');

const TEN_YEARS_MS = 315360000000;

// 초대장 정보 조회
exports.getInvitation = async (req, res) => {
  const { id } = req.params;
  try {
    const invitation = await InvitationModel.findById(id);
    if (!invitation) {
      return res.status(404).json({ error: '초대장을 찾을 수 없습니다.' });
    }
    
    // terms.txt 내용 함께 제공
    const termsPath = path.join(__dirname, '../terms.txt');
    const terms = fs.readFileSync(termsPath, 'utf8');

    res.json({ invitation, terms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '초대장 조회 실패' });
  }
};

// 초대장 거부
exports.rejectInvitation = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await InvitationModel.rejectInvitation(id);
    if (!updated) {
      return res.status(404).json({ error: '초대장을 찾을 수 없습니다.' });
    }
    res.json({ status: 'SUCCESS', message: '초대를 거부하였습니다.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '초대 거부 처리 실패' });
  }
};

// 초대장 수락 (약관 동의 시각 설정 + 회원가입/로그인 + 초대장 DB 삭제 + 쿠키 발급)
exports.acceptInvitation = async (req, res) => {
  const { id } = req.params;
  const { role, schoolName, gradYear, name, subject } = req.body;

  try {
    const invitation = await InvitationModel.findById(id);
    if (!invitation) {
      return res.status(404).json({ error: '유효하지 않거나 이미 처리된 초대장입니다.' });
    }

    let sessionValue;

    if (role === 'STUDENT') {
      let school = await SchoolModel.findByName(schoolName);
      let schoolId = school ? school.id : null;

      if (!schoolId) {
        const newSchool = await SchoolModel.createSchool(schoolName);
        schoolId = newSchool.id;
      }

      let student = await StudentModel.findStudent(schoolId, gradYear, name);
      if (!student) {
        student = await StudentModel.createStudent(schoolId, gradYear, name);
      }
      sessionValue = `student_${student.id}`;

    } else {
      let teacher = await TeacherModel.findTeacher(name, subject);
      if (!teacher) {
        teacher = await TeacherModel.createTeacher(name, subject);
      }
      sessionValue = `teacher_${teacher.id}`;
    }

    // 약관 동의 및 회원 생성 완료 후 초대장 테이블에서 해당 행 삭제
    await InvitationModel.deleteInvitation(id);

    // 로그인 쿠키 설정
    res.cookie('user_session', sessionValue, { httpOnly: true, maxAge: TEN_YEARS_MS });
    res.json({ status: 'SUCCESS' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '초대 수락 및 가입 처리 실패' });
  }
};
