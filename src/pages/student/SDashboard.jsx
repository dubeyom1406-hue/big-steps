import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api';
import '../StudentPortal.css';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const SDashboard = ({ studentData, setActiveSection }) => {
  const [batches, setBatches]           = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todaysClasses, setTodaysClasses] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showWeeklySchedule, setShowWeeklySchedule] = useState(false);

  // Calendar state
  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());

  // Generate current week dates for slider
  const [weekDates, setWeekDates] = useState([]);

  useEffect(() => {
    fetchBatches();
    generateWeek();
  }, []);

  useEffect(() => {
    if (batches.length >= 0) computeClasses(selectedDate, batches, selectedBatchId);
  }, [batches, selectedDate, studentData]);

  useEffect(() => {
    // Recompute classes when selected batch changes
    if (batches.length >= 0) computeClasses(selectedDate, batches, selectedBatchId);
  }, [selectedBatchId]);

  const generateWeek = () => {
    const current = new Date();
    // Get start of week (Sunday)
    const sunday = new Date(current.setDate(current.getDate() - current.getDay()));
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      days.push(d);
    }
    setWeekDates(days);
  };

  // Build calendar grid for current month view
  const getCalendarDays = () => {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(calendarYear, calendarMonth, 0).getDate();
    const cells = [];
    // Leading days from prev month
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ date: new Date(calendarYear, calendarMonth - 1, daysInPrevMonth - i), faded: true });
    }
    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(calendarYear, calendarMonth, d), faded: false });
    }
    // Trailing days to fill last row
    const trailing = 42 - cells.length;
    for (let d = 1; d <= trailing; d++) {
      cells.push({ date: new Date(calendarYear, calendarMonth + 1, d), faded: true });
    }
    return cells;
  };

  const prevMonth = () => {
    if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); }
    else setCalendarMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); }
    else setCalendarMonth(m => m + 1);
  };


  const fetchBatches = async () => {
    try {
      const res = await apiFetch('/batches');
      if (res.ok) {
        const data = await res.json();
        setBatches(data);
      }
    } catch (e) {
      console.error('Fetch batches error:', e);
    } finally {
      setLoading(false);
    }
  };

  const computeClasses = (date, batchList, batchFilterId = null) => {
    const dayName = DAYS[date.getDay()];
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const selectedDateString = `${yyyy}-${mm}-${dd}`;

    const enrolled = studentData?.enrolledBatches || [];
    let myBatches = batchList.filter(b => enrolled.includes(b.id));
    if (batchFilterId) {
      myBatches = myBatches.filter(b => b.id === batchFilterId);
    }
    const classes = [];
    myBatches.forEach(batch => {
      (batch.schedule || []).forEach(cls => {
        const dateMatches = cls.date && cls.date === selectedDateString;
        const dayMatches = !cls.date && cls.day === dayName;
        if (dateMatches || dayMatches) {
          classes.push({ ...cls, batchName: batch.name });
        }
      });
    });
    classes.sort((a, b) => a.time.localeCompare(b.time));
    setTodaysClasses(classes);
  };

  // Helper: check if a given date has an event for the selected batch
  const selectedBatch = batches.find(b => b.id === selectedBatchId);
  const dateHasEventForSelected = (date) => {
    if (!selectedBatch) return false;
    const dayName = DAYS[date.getDay()];
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dstr = `${yyyy}-${mm}-${dd}`;
    return (selectedBatch.schedule || []).some(cls => (cls.date && cls.date === dstr) || (!cls.date && cls.day === dayName));
  };

  const dateLabel = (() => {
    const today = new Date();
    const t     = new Date(selectedDate);
    t.setHours(0,0,0,0); today.setHours(0,0,0,0);
    const diff = (t - today) / 86400000;
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff === -1) return 'Yesterday';
    return `${selectedDate.getDate()} ${MONTH_NAMES[selectedDate.getMonth()]}`;
  })();

  const enrolledCount = studentData?.enrolledBatches?.length || 0;

  // Semicircular progress calculations
  const totalSyllabusProgress = 55;
  const strokeDashoffset = 157.07 - (totalSyllabusProgress / 100) * 157.07;

  return (
    <div className="sp-page sd-page">
      {/* ── 1. Greeting Header ── */}
      <div className="te-dashboard-greeting">
        <h2>Hi, {studentData?.studentName?.split(' ')[0] || 'Robert'}</h2>
        <p>Welcome back — <strong>Student</strong> progress overview.</p>
      </div>

      {/* ── 2. Unified Statistics banner ── */}
      <div className="te-unified-stats-card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 280px', minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span className="te-stat-lbl">My Batches</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                value={selectedBatchId || ''}
                onChange={(e) => setSelectedBatchId(e.target.value || null)}
                style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff' }}
              >
                <option value="">-- Select Batch --</option>
                {batches.filter(b => (studentData?.enrolledBatches || []).includes(b.id)).map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(batches.filter(b => (studentData?.enrolledBatches || []).includes(b.id))).map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBatchId(b.id)}
                className={`batch-chip ${selectedBatchId === b.id ? 'active' : ''}`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: '1 1 280px', minWidth: '280px' }}>
          <div className="selected-batch-banner">
            {selectedBatch ? selectedBatch.name : 'No batch selected'}
          </div>
        </div>
      </div>

      {/* ── 3. Main Dashboard Grid ── */}
      <div className="te-dashboard-grid">
        {/* Left Column: Batch Offerings & Upcoming Events */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Batch Offerings Quick Grid */}
          <div>
            <h3 className="sp-section-title" style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>
              Batch Offerings
            </h3>
            <div className="te-offerings-row-grid">
              {/* Card 1: All Classes */}
              <div className="te-offering-item-card" onClick={() => setActiveSection('my-batches')}>
                <div className="te-offering-icon-wrap" style={{ background: '#fef2f2', color: '#ef4444' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="20" height="20">
                    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                  </svg>
                </div>
                <span className="te-offering-lbl">All Classes</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>
              </div>

              {/* Card 2: All Tests */}
              <div className="te-offering-item-card" onClick={() => setActiveSection('test')}>
                <div className="te-offering-icon-wrap" style={{ background: '#fdf2f8', color: '#e91e63' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="20" height="20">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <span className="te-offering-lbl">All Tests</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>
              </div>

              {/* Card 3: My Doubts */}
              <div className="te-offering-item-card" onClick={() => alert('Doubt section coming soon!')}>
                <div className="te-offering-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="20" height="20">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <span className="te-offering-lbl">My Doubts</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>
              </div>


            </div>
          </div>

          {/* Upcoming Events Section */}
          <div>
            <h3 className="sp-section-title" style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>
              Upcoming Events ({todaysClasses.length})
            </h3>

            {loading ? (
              <div className="sp-card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading calendar events...</div>
            ) : todaysClasses.length === 0 ? (
              /* Symmetrical Empty state layout matching screenshot */
              <div className="sp-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 24px', gap: '16px', position: 'relative' }}>
                {/* Clock graphic with colorful accent feathers */}
                <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                  <svg viewBox="0 0 100 100" width="100" height="100">
                    {/* Feather/petals background */}
                    <path d="M22 62 C18 52, 28 42, 38 48 C34 58, 26 62, 22 62 Z" fill="#6366f1" opacity="0.15" />
                    <path d="M78 62 C82 52, 72 42, 62 48 C66 58, 74 62, 78 62 Z" fill="#ec4899" opacity="0.15" />
                    <path d="M50 20 C60 10, 72 20, 64 30 C58 26, 52 22, 50 20 Z" fill="#eab308" opacity="0.2" />
                    
                    {/* Clock body */}
                    <circle cx="50" cy="55" r="25" stroke="#3b82f6" strokeWidth="3" fill="#ffffff" />
                    <line x1="50" y1="55" x2="50" y2="40" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
                    <line x1="50" y1="55" x2="65" y2="55" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="50" cy="55" r="3" fill="#0f172a" />
                  </svg>
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>No upcoming events,</h4>
                  <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Perfect time to catch up on pending work!</p>
                </div>

                {/* Avatar/Mascot bubble on bottom-right matching screenshot */}
                <div className="te-mascot-face-bubble">
                  👤
                </div>
              </div>
            ) : (
              /* Class list */
              <div className="sp-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {todaysClasses.map((cls, i) => (
                  <div key={i} className="sd-class-item" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                    <div className="sd-class-indicator-col">
                      <span className="sd-class-time-bubble">{cls.time}</span>
                      <span className="sd-live-pulse-badge">
                        <span className="pulse-dot" /> LIVE
                      </span>
                    </div>
                    <div className="sd-class-details-col">
                      <div className="sd-class-primary">
                        <strong>{cls.subject} Lecture</strong>
                        <span className="sd-class-batch-badge">{cls.batchName}</span>
                      </div>
                      <div className="sd-class-instructor">
                        <div className="instructor-avatar">{cls.teacher[0]}</div>
                        <span>{cls.teacher}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="sd-join-class-btn"
                      onClick={() => setActiveSection('my-batches')}
                    >
                      Join Class
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* View Weekly Schedule outlined button */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
              <button
                type="button"
                className="te-weekly-schedule-outline-btn"
                onClick={() => setShowWeeklySchedule(!showWeeklySchedule)}
              >
                {showWeeklySchedule ? '✕ Hide Schedule Details' : 'View Weekly Schedule'}
              </button>
            </div>
          </div>

          {/* Expandable Weekly Calendar/Schedules Slider */}
          {showWeeklySchedule && (
            <div className="te-activities-card" style={{ animation: 'spPageFadeIn 0.2s' }}>
              <h3 className="sp-section-title" style={{ fontSize: '16px', fontWeight: 800, marginBottom: '14px' }}>
                Weekly Selector Slider
              </h3>
              <div className="sd-week-slider">
                {weekDates.map((d, i) => {
                  const isActive = d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth();
                  const isToday = d.getDate() === new Date().getDate() && d.getMonth() === new Date().getMonth();
                  return (
                    <button
                      type="button"
                      key={i}
                      className={`sd-week-day-card ${isActive ? 'active' : ''} ${isToday ? 'is-today' : ''}`}
                      onClick={() => setSelectedDate(d)}
                    >
                      <span className="sd-week-day-lbl">{DAYS[d.getDay()].slice(0,3)}</span>
                      <span className="sd-week-date-num">{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>

              {/* Full Month Calendar */}
              <div className="sd-calendar-wrap">
                <div className="sd-cal-header">
                  <button type="button" className="sd-cal-nav-btn" onClick={prevMonth}>‹</button>
                  <span className="sd-cal-month-label">
                    {MONTH_NAMES[calendarMonth]} {calendarYear}
                  </span>
                  <button type="button" className="sd-cal-nav-btn" onClick={nextMonth}>›</button>
                </div>

                {/* Day labels */}
                <div className="sd-cal-grid">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(dl => (
                    <div key={dl} className="sd-cal-day-label">{dl}</div>
                  ))}

                  {/* Date cells */}
                  {getCalendarDays().map((cell, idx) => {
                    const isSelected =
                      cell.date.getDate() === selectedDate.getDate() &&
                      cell.date.getMonth() === selectedDate.getMonth() &&
                      cell.date.getFullYear() === selectedDate.getFullYear();
                    const isTd =
                      cell.date.getDate() === today.getDate() &&
                      cell.date.getMonth() === today.getMonth() &&
                      cell.date.getFullYear() === today.getFullYear();
                    return (
                      <button
                        type="button"
                        key={idx}
                        className={`sd-cal-cell${cell.faded ? ' faded' : ''}${isSelected ? ' selected' : ''}${isTd && !isSelected ? ' is-today' : ''}${dateHasEventForSelected(cell.date) ? ' has-event' : ''}`}
                        onClick={() => {
                          setSelectedDate(cell.date);
                          // Sync calendar month if clicking trailing/leading day
                          setCalendarMonth(cell.date.getMonth());
                          setCalendarYear(cell.date.getFullYear());
                        }}
                      >
                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                          <span>{cell.date.getDate()}</span>
                          {dateHasEventForSelected(cell.date) && (
                            <span className="sd-event-dot" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}



        </div>

        {/* Right Column: Arc Progress Gauge & Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          


          {/* Activity Feed */}
          <div className="te-activity-card">
            <div className="te-activity-header">
              <h3>Recent Activity</h3>
              <span onClick={() => setActiveSection('library')}>View All</span>
            </div>
            <span className="te-activity-subtitle">Last updated and notification</span>

            <div className="te-activity-list">
              <div className="te-activity-item">
                <div className="te-activity-icon check">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="14" height="14">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div className="te-activity-details">
                  <strong>Assignment Submitted</strong>
                  <p>Sarah Johnson submitted "Full-Stack Project #3"</p>
                  <span>5 minutes ago</span>
                </div>
              </div>

              <div className="te-activity-item">
                <div className="te-activity-icon warning">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <div className="te-activity-details">
                  <strong>Low Attendance Alert</strong>
                  <p>3 students missed "Front-End Development" class</p>
                  <span>15 minutes ago</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SDashboard;
