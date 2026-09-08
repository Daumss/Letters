-- 1. 학교 테이블
CREATE TABLE IF NOT EXISTS schools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 학생 테이블 (고유 ID + 이름/졸업년도 정렬 인덱스)
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,              -- 고유 식별 번호
    school_id INT REFERENCES schools(id) ON DELETE CASCADE,
    grad_year INT NOT NULL,              -- 졸업년도
    name VARCHAR(50) NOT NULL,           -- 이름
    class_info VARCHAR(20),              -- 동명이인 구별용 (예: 3반)
    photo_url TEXT,                      -- 졸업사진 이미지 URL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 이름/졸업년도 순 빠른 정렬을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_students_sort 
ON students (school_id, name ASC, grad_year ASC);

-- 3. 선생님 테이블
CREATE TABLE IF NOT EXISTS teachers (
    id SERIAL PRIMARY KEY,
    school_id INT REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    subject VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 학생 세션 & 초대 상태 테이블
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id INT REFERENCES schools(id) ON DELETE CASCADE,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'Not Invited', -- Not Invited, Sent, Joined, Written, Declined
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. 롤링페이퍼 편지 테이블 (한 학생이 여러 선생님에게 각각 작성)
CREATE TABLE IF NOT EXISTS letters (
    id SERIAL PRIMARY KEY,
    invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE, -- 작성한 학생 세션
    teacher_id INT REFERENCES teachers(id) ON DELETE CASCADE,        -- 받는 선생님
    content TEXT NOT NULL,                                           -- 편지 내용 (마크다운)
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 한 학생이 같은 선생님에게 중복 편지를 작성하는 것 방지
    UNIQUE(invitation_id, teacher_id)
);
