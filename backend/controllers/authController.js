const fs = require('fs');
const path = require('path');
const StudentModel = require('../models/studentModel');
const TeacherModel = require('../models/teacherModel');
const SchoolModel = require('../models/schoolModel');

const TEN_YEARS_MS = 315360000000;

exports.checkAuth = (req, res) => {
  if (req.cookies && req.cookies.user_session) {
    return res.json({ hasCookie: true, user: req.cookies.user_session });
  }
  res.json({ hasCookie: false });
};

exports.searchSchools = async (req, res) => {
  const { query } = req.query;
  if (!query) return res.json([]);

  try {
    const schools = await SchoolModel.searchByName(query);
    res.json(schools);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '학교 검색 실패' });
  }
};

exports.login = async (req, res) => {
  const { role, schoolName, gradYear, name, subject } = req.body;

  try {
    let school = await SchoolModel.findByName(schoolName);
    let schoolId = school ? school.id : null;

    if (role === 'STUDENT') {
      let student = null;
      if (schoolId) {
        student = await StudentModel.findStudent(schoolId, gradYear, name);
      }

      if (student) {
        res.cookie('user_session', `student_${student.id}`, { httpOnly: true, maxAge: TEN_YEARS_MS });
        return res.json({ status: 'SUCCESS' });
      }

      req.session.pendingUser = { role, schoolName, schoolId, gradYear, name };

    } else if (role === 'TEACHER') {
      let teacher = null;
      if (schoolId) {
        teacher = await TeacherModel.findTeacher(schoolId, name, subject);
      }

      if (teacher) {
        res.cookie('user_session', `teacher_${teacher.id}`, { httpOnly: true, maxAge: TEN_YEARS_MS });
        return res.json({ status: 'SUCCESS' });
      }

      req.session.pendingUser = { role, schoolName, schoolId, name, subject };
    }

    const termsPath = path.join(__dirname, '../terms.txt');
    const terms = fs.readFileSync(termsPath, 'utf8');

    res.json({ status: 'REQUIRE_CONSENT', terms });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '로그인 처리 실패' });
  }
};

exports.consent = async (req, res) => {
  const pendingUser = req.session.pendingUser;

  if (!pendingUser) {
    return res.status(400).json({ error: '인증 세션이 만료되었습니다. 다시 시도해 주세요.' });
  }

  try {
    let sessionValue;
    let schoolId = pendingUser.schoolId;

    if (!schoolId) {
      const newSchool = await SchoolModel.createSchool(pendingUser.schoolName);
      schoolId = newSchool.id;
    }

    if (pendingUser.role === 'STUDENT') {
      const newStudent = await StudentModel.createStudent(
        schoolId, 
        pendingUser.gradYear, 
        pendingUser.name
      );
      sessionValue = `student_${newStudent.id}`;
    } else {
      const newTeacher = await TeacherModel.createTeacher(
        schoolId, 
        pendingUser.name, 
        pendingUser.subject
      );
      sessionValue = `teacher_${newTeacher.id}`;
    }

    req.session.destroy();
    res.cookie('user_session', sessionValue, { httpOnly: true, maxAge: TEN_YEARS_MS });
    res.json({ status: 'SUCCESS' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '회원가입 처리 실패' });
  }
};
