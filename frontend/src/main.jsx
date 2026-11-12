import React, { StrictMode, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

// CSS 및 공통 레이아웃 스타일 적용
import './styles/layout.css';

// 페이지 컴포넌트
import LoginPage from '../pages/LoginPage';
import InvitationPage from '../pages/InvitationPage';
import HomePage from '../pages/HomePage';

// 에러 발생 시 노출할 Fallback 컴포넌트
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>
      <h2>일부 화면에 오류가 발생했습니다.</h2>
      <pre style={{ color: '#666' }}>{error.message}</pre>
      <button onClick={resetErrorBoundary}>다시 시도</button>
    </div>
  );
}

// 최상위 진입 컴포넌트 (디버그 메뉴 및 라우터 제어)
function RootApp() {
  const isDebugInitialized = useRef(false);

  // 모바일 디버그 메뉴 (?debug)
  useEffect(() => {
    if (isDebugInitialized.current) return;
    isDebugInitialized.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    const debug = urlParams.get('debug');

    if (debug === '1' || debug === 'on' || debug === 'true') {
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
	  <Route path="/invitation" element={<InvitationPage />} />
          <Route path="/home" element={<HomePage />} />

          {/* 예외 경로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

// React DOM 렌더링
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootApp />
  </StrictMode>
);
