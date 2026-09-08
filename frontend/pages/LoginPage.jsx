import React, { useState, useEffect, useRef } from 'react';

export default function LoginPage() {
  const [role, setRole] = useState('STUDENT');
  
  const [schoolName, setSchoolName] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [showTerms, setShowTerms] = useState(false);
  const [termsContent, setTermsContent] = useState('');

  const gradYearRef = useRef(null);
  const studentNameRef = useRef(null);
  const teacherNameRef = useRef(null);
  const submitBtnRef = useRef(null);

  // 현재 URL의 쿼리 스트링(예: ?debug=1)을 포함하여 /home으로 이동하는 헬퍼 함수
  const redirectToHome = () => {
    const searchParams = window.location.search; // 예: "?debug=1"
    window.location.href = `/home${searchParams}`;
  };

  useEffect(() => {
    fetch('/api/auth/check', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.hasCookie) redirectToHome(); // 수정: 쿠키가 있어 홈으로 갈 때 파라미터 유지
      })
      .catch(() => {});
  }, []);

  const isOnlyConsonant = (text) => /^[ㄱ-ㅎ]+$/.test(text);
  const handleSchoolChange = (e) => {
    const value = e.target.value;
    setSchoolName(value);

    if (value.trim() && !isOnlyConsonant(value.trim())) {
      fetch(`/api/auth/schools/search?query=${encodeURIComponent(value)}`)
        .then((res) => res.json())
        .then((data) => setSchoolOptions(data))
        .catch(() => setSchoolOptions([]));
    } else {
      setSchoolOptions([]);
    }
  };

  const handleGradYearChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setGradYear(value);
    if (value.length === 4 && studentNameRef.current) {
      studentNameRef.current.focus();
    }
  };

  const requestPermissionsAndRedirect = async () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      alert('롤링페이퍼 답장 알림을 받기 위해 알림 권한이 필요합니다.');
      await Notification.requestPermission();
    }
    redirectToHome(); // 수정: 로그인 성공 후 홈으로 갈 때 파라미터 유지
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (role === 'STUDENT' && gradYear.length !== 4) {
      alert('졸업년도는 정확히 4자리 숫자로 입력해야 합니다. (예: 2020)');
      if (gradYearRef.current) gradYearRef.current.focus();
      return;
    }

    if (role === 'TEACHER' && !subject.trim()) {
      alert('담당 과목을 입력해 주세요.');
      return;
    }

    const payload = role === 'STUDENT' 
      ? { role, schoolName, gradYear, name } 
      : { role, schoolName, name, subject };

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.status === 'SUCCESS') {
        await requestPermissionsAndRedirect();
      } else if (data.status === 'REQUIRE_CONSENT') {
        setTermsContent(data.terms);
        setShowTerms(true);
      } else {
        alert(data.error || '로그인 처리 실패');
      }
    } catch (err) {
      alert(`[오류 발생] ${err.message || err}`);
    }
  };

  const handleAgreeTerms = async () => {
    try {
      const res = await fetch('/api/auth/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await res.json();

      if (data.status === 'SUCCESS') {
        setShowTerms(false);
        await requestPermissionsAndRedirect();
      } else {
        alert(data.error || '회원가입 처리 실패');
      }
    } catch (err) {
      alert(`[오류 발생] ${err.message || err}`);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: '360px', padding: '24px', border: '1px solid #ccc', borderRadius: '8px' }}>
        
        <div style={{ display: 'flex', marginBottom: '16px' }}>
          <button 
            type="button"
            style={{ flex: 1, fontWeight: role === 'STUDENT' ? 'bold' : 'normal', padding: '8px' }}
            onClick={() => setRole('STUDENT')}
          >
            졸업생
          </button>
          <button 
            type="button"
            style={{ flex: 1, fontWeight: role === 'TEACHER' ? 'bold' : 'normal', padding: '8px' }}
            onClick={() => setRole('TEACHER')}
          >
            선생님
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {role === 'STUDENT' ? (
            <>
              <div style={{ position: 'relative', marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="학교명"
                  value={schoolName}
                  onChange={handleSchoolChange}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px' }}
                  required
                />
                {schoolOptions.length > 0 && (
                  <ul style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    background: '#fff', border: '1px solid #ccc', listStyle: 'none',
                    margin: 0, padding: 0, maxHeight: '120px', overflowY: 'auto', zIndex: 10
                  }}>
                    {schoolOptions.map((item) => (
                      <li 
                        key={item.id} 
                        style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                        onClick={() => {
                          setSchoolName(item.name);
                          setSchoolOptions([]);
                          if (gradYearRef.current) gradYearRef.current.focus();
                        }}
                      >
                        {item.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div style={{ marginBottom: '10px' }}>
                <input
                  ref={gradYearRef}
                  type="text"
                  inputMode="numeric"
                  placeholder="졸업년도 4자리"
                  maxLength={4}
                  value={gradYear}
                  onChange={handleGradYearChange}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <input
                  ref={studentNameRef}
                  type="text"
                  placeholder="성명"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px' }}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div style={{ position: 'relative', marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="학교명"
                  value={schoolName}
                  onChange={handleSchoolChange}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px' }}
                  required
                />
                {schoolOptions.length > 0 && (
                  <ul style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    background: '#fff', border: '1px solid #ccc', listStyle: 'none',
                    margin: 0, padding: 0, maxHeight: '120px', overflowY: 'auto', zIndex: 10
                  }}>
                    {schoolOptions.map((item) => (
                      <li 
                        key={item.id} 
                        style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                        onClick={() => {
                          setSchoolName(item.name);
                          setSchoolOptions([]);
                          if (teacherNameRef.current) teacherNameRef.current.focus();
                        }}
                      >
                        {item.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div style={{ marginBottom: '10px' }}>
                <input
                  ref={teacherNameRef}
                  type="text"
                  placeholder="성명"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="과목"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px' }}
                  required
                />
              </div>
            </>
          )}

          <button 
            ref={submitBtnRef}
            type="submit" 
            style={{ width: '100%', padding: '10px', marginTop: '10px', cursor: 'pointer' }}
          >
            로그인 / 가입
          </button>
        </form>
      </div>

      {showTerms && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
        }}>
          <div style={{ background: '#fff', padding: '24px', width: '320px', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>이용약관 동의</h3>
            <textarea 
              value={termsContent} 
              readOnly 
              style={{ width: '100%', height: '150px', boxSizing: 'border-box', resize: 'none' }} 
            />
            <button 
              onClick={handleAgreeTerms} 
              style={{ width: '100%', padding: '10px', marginTop: '12px', cursor: 'pointer' }}
            >
              동의
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
