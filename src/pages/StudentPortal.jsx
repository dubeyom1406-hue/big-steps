import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import './StudentPortal.css';
import { apiFetch } from '../api';
import SDashboard from './student/SDashboard';
import SBatches from './student/SBatches';
import SMyBatches from './student/SMyBatches';
import SLibrary from './student/SLibrary';
import STest from './student/STest';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'batches', label: 'Explore Batches' },
  { id: 'my-batches', label: 'My Batches' },
  { id: 'library', label: 'Library' },
  { id: 'test', label: 'Test Series' }
];

const INITIAL_NOTIFICATIONS = [
  { id: 1, text: '🎓 Welcome to the new Bright Steps portal!', time: '1 hour ago', read: false },
  { id: 2, text: '📅 IIT Patna faculty batch starts this Monday.', time: '2 hours ago', read: false },
  { id: 3, text: '📚 Physics study notes uploaded in Library.', time: '1 day ago', read: true }
];

const StudentPortal = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [studentData, setStudentData] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem('student_data');
    if (!data) { navigate('/login'); return; }
    const initialData = JSON.parse(data);
    setStudentData(initialData);

    // Sync student details live from backend database (e.g. batch pre-enrollments)
    const refreshStudentData = async () => {
      try {
        const res = await apiFetch(`/students/${initialData.id}`);
        if (res.ok) {
          const freshData = await res.json();
          setStudentData(freshData);
          localStorage.setItem('student_data', JSON.stringify(freshData));
        }
      } catch(e) {
        console.error("Failed to refresh student details:", e);
      }
    };
    refreshStudentData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('student_data');
    navigate('/login');
  };

  const updateStudentData = (updated) => {
    setStudentData(updated);
    localStorage.setItem('student_data', JSON.stringify(updated));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderContent = () => {
    if (!studentData) return null;
    switch (activeSection) {
      case 'dashboard':   return <SDashboard studentData={studentData} setActiveSection={setActiveSection} />;
      case 'batches':     return <SBatches studentData={studentData} updateStudentData={updateStudentData} setActiveSection={setActiveSection} />;
      case 'my-batches':  return <SMyBatches studentData={studentData} setActiveSection={setActiveSection} />;
      case 'library':     return <SLibrary studentData={studentData} />;
      case 'test':        return <STest studentData={studentData} />;
      default:            return <SDashboard studentData={studentData} setActiveSection={setActiveSection} />;
    }
  };

  if (!studentData) {
    return (
      <div className="sp-loading">
        <div className="sp-spinner"></div>
        <p>Loading portal...</p>
      </div>
    );
  }

  const initials = studentData.studentName
    ? studentData.studentName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'ST';

  return (
    <div className="sp-root" onClick={() => { setShowNotifications(false); setShowSettings(false); }}>
      {/* ── TOP HORIZONTAL HEADER (TechEdu Style) ── */}
      <header className="sp-top-nav-bar">
        {/* Left: Brand Logo & Title */}
        <div className="sp-brand-col" onClick={() => setActiveSection('dashboard')}>
          <img src={logoImg} alt="Bright Steps" className="sp-brand-logo-img" />
          <span className="sp-brand-name">BrightSteps</span>
        </div>

        {/* Center: Rounded Pill Nav Navigation */}
        <nav className="sp-top-nav-pills">
          {NAV_ITEMS.map(item => (
            <button
              type="button"
              key={item.id}
              className={`sp-nav-pill-btn ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right: Circular Icon Actions & Profile Bubble */}
        <div className="sp-header-actions-col">
          {/* Search Icon */}
          <button type="button" className="sp-header-circle-btn" onClick={() => alert('Search feature coming soon!')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>

          {/* Notifications Button */}
          <button
            type="button"
            className={`sp-header-circle-btn ${unreadCount > 0 ? 'has-unreads' : ''}`}
            onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); setShowSettings(false); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="20" height="20">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>

          {/* Settings Button */}
          <button
            type="button"
            className="sp-header-circle-btn"
            onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); setShowNotifications(false); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="20" height="20">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>

          {/* User Profile Avatar with custom letter placeholder */}
          <div className="sp-header-profile-avatar" onClick={handleLogout} title="Click to Logout">
            {initials}
          </div>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="sp-notif-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="sp-notif-header">
                <h4>Notifications</h4>
                {unreadCount > 0 && <button className="sp-notif-clear" onClick={markAllRead}>Mark read</button>}
              </div>
              <div className="sp-notif-list">
                {notifications.map(n => (
                  <div key={n.id} className="sp-notif-item">
                    {!n.read && <div className="sp-notif-dot" />}
                    <div className="sp-notif-text">
                      <p>{n.text}</p>
                      <span>{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings / Dropdown Menu */}
          {showSettings && (
            <div className="sp-notif-dropdown" style={{ width: '200px' }} onClick={(e) => e.stopPropagation()}>
              <div className="sp-notif-header">
                <h4>Student Profile</h4>
              </div>
              <div style={{ padding: '8px' }}>
                <div style={{ padding: '8px 12px', fontSize: '13px', borderBottom: '1px solid #f1f5f9' }}>
                  <strong>{studentData.studentName}</strong>
                  <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>Class Grade: {studentData.classGrade}</div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{ width: '100%', padding: '10px', background: 'none', border: 'none', textAlign: 'left', color: '#ef4444', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Logout Session
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="sp-portal-main-viewport">
        <div className="sp-portal-container">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <div className="sp-bottom-nav-bar">
        {NAV_ITEMS.map(item => {
          let icon = null;
          if (item.id === 'dashboard') {
            icon = (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            );
          } else if (item.id === 'batches') {
            icon = (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            );
          } else if (item.id === 'my-batches') {
            icon = (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2.5 3 6 3s6-1 6-3v-5"/>
              </svg>
            );
          } else if (item.id === 'library') {
            icon = (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            );
          } else if (item.id === 'test') {
            icon = (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M9 12l2 2 4-4"/>
              </svg>
            );
          }

          return (
            <button
              type="button"
              key={item.id}
              className={`sp-bottom-nav-btn ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <div className="sp-bottom-nav-icon">{icon}</div>
              <span className="sp-bottom-nav-lbl">
                {item.id === 'batches' ? 'Explore' : item.id === 'test' ? 'Tests' : item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StudentPortal;
