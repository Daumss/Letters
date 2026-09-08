import React, { useEffect, useRef } from 'react'; // useRef 추가
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import LoginPage from '../pages/LoginPage';
import InvitationPage from '../pages/InvitationPage';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>
      <h2>일부 화면에 오류가 발생했습니다.</h2>
      <pre style={{ color: '#666' }}>{error.message}</pre>
      <button onClick={resetErrorBoundary}>다시 시도</button>
    </div>
  );
}

function HomePage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>롤링페이퍼 메인 홈 (/home)</h1>
      <p>로그인 성공 후 이동된 페이지입니다.</p>
    </div>
  );
}

function App() {
  const isDebugInitialized = useRef(false);

  // debug menu
  useEffect(() => {
    if (isDebugInitialized.current) return; // 이미 실행되었다면 중단
    isDebugInitialized.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    const debug = urlParams.get('debug');

    if (debug === '1' || debug === 'on') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/eruda';
      script.onload = function () {
        window.eruda.init();
      };
      document.body.appendChild(script);
    }
  }, []);

  return (
    <BrowserRouter>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/invitation" element={<InvitationPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
