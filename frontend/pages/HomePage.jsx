import React from 'react';
import Common from '../src/components/common';

export default function HomePage() {
  const handleLogout = () => {
    // 로그아웃 처리 로직
    window.location.href = '/login';
  };

  return (
    <Common user={{ isAdmin: false }} onLogout={handleLogout}>
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <h1>롤링페이퍼 메인 홈</h1>
        <p>환영합니다! 정상적으로 로그인 및 라우팅이 완료되었습니다.</p>
      </div>
    </Common>
  );
}

