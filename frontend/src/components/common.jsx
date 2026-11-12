import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/layout.css';

export default function Common({ user, onLogout, children }) {
  const navigate = useNavigate();

  // --- 네비게이션 바 스크롤 감지 로직 ---
  const [visible, setVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      const isVisible = prevScrollPos > currentScrollPos || currentScrollPos < 10;
      setVisible(isVisible);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- 푸터 연도 계산 ---
  const currentYear = new Date().getFullYear();
  const yearDisplay = currentYear > 2026 ? `2026~${currentYear}` : '2026';

  return (
    <div className="layout-root">
      {/* 1. 공통 반응형 네비게이션 바 */}
      <nav className={`nav-bar ${visible ? 'nav-visible' : 'nav-hidden'}`}>
        <div className="nav-container">
          {/* PC 상단바 전용: 왼쪽 끝 파비콘 로고 (누르면 /home 이동) */}
          <button 
            className="nav-brand" 
            onClick={() => navigate('/home')} 
            title="홈으로 이동"
          >
            <img src="/favicon.png" alt="Favicon" className="nav-favicon" />
          </button>

          {/* 기존 메뉴 아이콘 영역 */}
          <div className="nav-menu-group">
            {/* 편지 로고 */}
            <button className="nav-item" onClick={() => alert('편지 작성 기능 준비 중입니다.')} title="편지 작성">
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span className="nav-label">편지</span>
            </button>

            {/* 사람들 로고 */}
            <button className="nav-item" onClick={() => alert('사람 목록 기능 준비 중입니다.')} title="사람 목록">
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span className="nav-label">목록</span>
            </button>

            {/* 계정 로고 & 드롭다운 */}
            <div className="nav-item-wrapper" ref={dropdownRef}>
              <button className="nav-item" onClick={() => setDropdownOpen(!dropdownOpen)} title="계정">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="nav-label">계정</span>
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <button className="dropdown-item" onClick={() => { setDropdownOpen(false); alert('내 정보 페이지 준비 중'); }}>
                    내 정보
                  </button>

                  {user?.isAdmin && (
                    <button className="dropdown-item" onClick={() => { setDropdownOpen(false); alert('관리자 페이지 준비 중'); }}>
                      관리
                    </button>
                  )}

                  <div className="dropdown-divider" />

                  <button className="dropdown-item danger" onClick={() => { setDropdownOpen(false); onLogout(); }}>
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 2. 본문 컨텐츠 수신 영역 */}
      <main className="main-content">
        {children}
      </main>

      {/* 3. 공통 푸터 */}
      <footer className="footer-container">
        <div className="footer-content">
          <p className="copyright">
            © {yearDisplay} Letters. All rights reserved.
          </p>
          <div className="footer-links">
            <a
              href="https://raw.githubusercontent.com/Daumss/Letters/refs/heads/main/LICENSE"
              rel="noopener noreferrer"
              className="footer-link"
            >
              LICENSE
            </a>
            <span className="divider">•</span>
            <a
              href="https://github.com/Daumss/Letters"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              Source Code
            </a>
            <span className="divider">•</span>
            <span className="contact-placeholder">Contact (Image)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
