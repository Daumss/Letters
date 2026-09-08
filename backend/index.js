require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const invitationRoutes = require('./routes/invitationRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'fallback_secret_key';

app.use(express.json());
app.use(cookieParser(COOKIE_SECRET));

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.use(session({
  secret: COOKIE_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// 라우트 등록
app.use('/api/auth', authRoutes);
app.use('/api/invitations', invitationRoutes);

// 앱 리슨을 1번만 수행하고 변수에 할당
const server = app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});

const gracefulShutdown = (signal) => {
  console.log(`\n[${signal}] 수신: 서버를 안전하게 종료합니다...`);

  server.close(async () => {
    console.log('HTTP 서버 종료 완료.');

    try {
      await pool.end();
      console.log('PostgreSQL 연결 풀 종료 완료.');
      process.exit(0);
    } catch (err) {
      console.error('DB 연결 종료 중 에러:', err);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error('강제 종료 진행 (타임아웃)');
    process.exit(1);
  }, 10000);
};

process.on('SIGHUP', () => gracefulShutdown('SIGHUP'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
