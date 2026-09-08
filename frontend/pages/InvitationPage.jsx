import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function InvitationPage() {
  const [searchParams] = useSearchParams();
  const invitationId = searchParams.get('id');

  const [invitation, setInvitation] = useState(null);
  const [terms, setTerms] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [role, setRole] = useState('STUDENT');
  const [gradYear, setGradYear] = useState('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [showConsentModal, setShowConsentModal] = useState(false);

  useEffect(() => {
    if (!invitationId) {
      setErrorMsg('유효한 초대장 ID가 없습니다.');
      setLoading(false);
      return;
    }

    fetch(`/api/invitations/${invitationId}`)
      .then((res) => {
        if (!res.ok) throw new Error('초대장 정보를 불러올 수 없습니다.');
        return res.json();
      })
      .then((data) => {
        setInvitation(data.invitation);
        setTerms(data.terms);
        setLoading(false);
      })
      .catch((err) => {
        setErrorMsg(err.message);
        setLoading(false);
      });
  }, [invitationId]);

  const handleReject = async () => {
    if (!window.confirm('초대를 거부하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/invitations/${invitationId}/reject`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        alert('초대를 거부했습니다.');
        window.location.href = '/';
      } else {
        alert(data.error || '거부 처리 실패');
      }
    } catch (err) {
      alert(`[오류] ${err.message}`);
    }
  };

  const handleAcceptClick = () => {
    if (!name.trim()) {
      alert('성명을 입력해 주세요.');
      return;
    }
    if (role === 'STUDENT' && gradYear.length !== 4) {
      alert('졸업년도를 4자리로 정확히 입력해 주세요.');
      return;
    }
    if (role === 'TEACHER' && !subject.trim()) {
      alert('담당 과목을 입력해 주세요.');
      return;
    }
    setShowConsentModal(true);
  };

  const handleFinalAccept = async () => {
    const payload = role === 'STUDENT'
      ? { role, schoolName: invitation.school_name, gradYear, name }
      : { role, schoolName: invitation.school_name, name, subject };

    try {
      const res = await fetch(`/api/invitations/${invitationId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.status === 'SUCCESS') {
        alert('초대를 수락하고 가입 및 로그인이 완료되었습니다.');
        window.location.href = '/home';
      } else {
        alert(data.error || '수락 처리 실패');
      }
    } catch (err) {
      alert(`[오류] ${err.message}`);
    }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>초대장을 불러오는 중...</div>;
  if (errorMsg) return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{errorMsg}</div>;
  if (invitation.is_rejected) return <div style={{ padding: '20px', textAlign: 'center' }}>이미 거부 처리된 초대장입니다.</div>;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ width: '360px', padding: '24px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>롤링페이퍼 초대장</h2>
        <p><strong>학교:</strong> {invitation.school_name}</p>
        {invitation.inviter_name && <p><strong>초대자:</strong> {invitation.inviter_name} 학생</p>}

        <hr style={{ margin: '16px 0' }} />

        <h3>내 정보 입력</h3>
        <div style={{ display: 'flex', marginBottom: '12px' }}>
          <button 
            type="button"
            style={{ flex: 1, fontWeight: role === 'STUDENT' ? 'bold' : 'normal', padding: '6px' }}
            onClick={() => setRole('STUDENT')}
          >
            졸업생
          </button>
          <button 
            type="button"
            style={{ flex: 1, fontWeight: role === 'TEACHER' ? 'bold' : 'normal', padding: '6px' }}
            onClick={() => setRole('TEACHER')}
          >
            선생님
          </button>
        </div>

        {role === 'STUDENT' ? (
          <>
            <input 
              type="text" 
              placeholder="졸업년도 4자리" 
              maxLength={4}
              value={gradYear}
              onChange={(e) => setGradYear(e.target.value.replace(/[^0-9]/g, ''))}
              style={{ width: '100%', padding: '8px', marginBottom: '8px', boxSizing: 'border-box' }}
            />
            <input 
              type="text" 
              placeholder="성명" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '8px', boxSizing: 'border-box' }}
            />
          </>
        ) : (
          <>
            <input 
              type="text" 
              placeholder="성명" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '8px', boxSizing: 'border-box' }}
            />
            <input 
              type="text" 
              placeholder="담당 과목 (필수 입력)" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '8px', boxSizing: 'border-box' }}
            />
          </>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button 
            onClick={handleReject} 
            style={{ flex: 1, padding: '10px', background: '#f44336', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            거부
          </button>
          <button 
            onClick={handleAcceptClick} 
            style={{ flex: 1, padding: '10px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            수락 및 동의
          </button>
        </div>
      </div>

      {showConsentModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
        }}>
          <div style={{ background: '#fff', padding: '24px', width: '320px', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>이용약관 동의</h3>
            <textarea 
              value={terms} 
              readOnly 
              style={{ width: '100%', height: '150px', boxSizing: 'border-box', resize: 'none' }} 
            />
            <button 
              onClick={handleFinalAccept} 
              style={{ width: '100%', padding: '10px', marginTop: '12px', cursor: 'pointer' }}
            >
              동의하고 가입 수락
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
