import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api';
import BASE_URL from '../../api';
import '../StudentPortal.css';

const BATCH_EMOJIS = ['🚀', '📚', '🎯', '⚡', '🔬', '💡', '🏆', '🌟'];

const getEmbedUrl = (url) => {
  if (!url) return '';
  try {
    let videoId = '';
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get('v');
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      return url;
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  } catch(e) {
    console.error(e);
    return '';
  }
};

// Mock Chapters List for Split-Screen Sidebar
const CHAPTERS = [
  { id: 'ch1', title: 'Chapter 01: Basic Mathematics & Vectors' },
  { id: 'ch2', title: 'Chapter 02: Kinematics (1D & 2D Motion)' },
  { id: 'ch3', title: 'Chapter 03: Newton\'s Laws of Motion & Friction' },
  { id: 'ch4', title: 'Chapter 04: Work, Energy, Power & Collision' }
];

// Mock Lectures List by Chapter
const LECTURES_DATA = {
  ch1: [
    { title: 'Lec 01: Resolution of Vectors & Components', duration: '1h 15m', status: 'Completed', date: 'Jul 01, 2026' },
    { title: 'Lec 02: Dot & Cross Product of Vectors', duration: '1h 20m', status: 'Completed', date: 'Jul 03, 2026' }
  ],
  ch2: [
    { title: 'Lec 03: Live - Kinematics Equations & Graphs', duration: '1h 30m', status: 'Live Now', date: 'Today 10:00 AM' },
    { title: 'Lec 04: Projectile Motion & Equation of Trajectory', duration: '1h 10m', status: 'Upcoming', date: 'Tomorrow 10:00 AM' }
  ],
  ch3: [
    { title: 'Lec 05: Newton\'s First & Second Laws of Motion', duration: '1h 15m', status: 'Upcoming', date: 'Jul 10, 2026' }
  ],
  ch4: []
};

// Mock Study Sheets / Notes by Chapter
const NOTES_DATA = {
  ch1: [
    { name: 'Vectors Basic Reference Formulas Sheet.pdf', size: '1.2 MB' },
    { name: 'Daily Practice Problem (DPP) 01 Solutions.pdf', size: '950 KB' }
  ],
  ch2: [
    { name: 'Kinematics 1D Equations Cheat Sheet.pdf', size: '2.4 MB' }
  ],
  ch3: [],
  ch4: []
};

// Mock Test Quizzes by Chapter
const QUIZZES_DATA = {
  ch1: [
    { title: 'Vector Concepts Assessment Test', questions: 15, marks: 30, completed: true, score: '28/30' }
  ],
  ch2: [
    { title: 'Kinematics Graphs Quiz', questions: 10, marks: 20, completed: false }
  ],
  ch3: [],
  ch4: []
};

const SMyBatches = ({ studentData, setActiveSection }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Classroom Workspace State
  const [activeWorkspaceBatch, setActiveWorkspaceBatch] = useState(null);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [workspaceTab, setWorkspaceTab] = useState('classes');
  const [workspaceNotes, setWorkspaceNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Dynamic Syllabus States
  const [chapters, setChapters] = useState([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [lectures, setLectures] = useState([]);
  const [lecturesLoading, setLecturesLoading] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState(null);

  const enrolled = studentData?.enrolledBatches || [];

  useEffect(() => {
    const enrolledList = studentData?.enrolledBatches || [];
    fetchBatches(enrolledList);
  // Re-fetch whenever studentData changes so the enrolled list is always current
  }, [studentData]);

  useEffect(() => {
    if (activeWorkspaceBatch) {
      fetchWorkspaceNotes();
    }
  }, [activeWorkspaceBatch, workspaceTab]);

  useEffect(() => {
    if (activeWorkspaceBatch && selectedSubject) {
      fetchWorkspaceChapters();
    } else {
      setChapters([]);
      setSelectedChapterId(null);
    }
  }, [activeWorkspaceBatch, selectedSubject]);

  useEffect(() => {
    if (activeWorkspaceBatch && selectedSubject && selectedChapterId) {
      fetchWorkspaceLectures(selectedChapterId);
    } else {
      setLectures([]);
      setSelectedLecture(null);
    }
  }, [selectedChapterId]);

  const fetchWorkspaceNotes = async () => {
    setNotesLoading(true);
    try {
      const res = await apiFetch(`/materials?batchId=${activeWorkspaceBatch.id}`);
      if (res.ok) {
        setWorkspaceNotes(await res.json());
      }
    } catch(e) {
      console.error(e);
    } finally {
      setNotesLoading(false);
    }
  };

  const fetchWorkspaceChapters = async () => {
    if (!activeWorkspaceBatch || !selectedSubject) return;
    setChaptersLoading(true);
    try {
      const res = await apiFetch(`/chapters?batchId=${activeWorkspaceBatch.id}&subject=${selectedSubject}`);
      if (res.ok) {
        const data = await res.json();
        setChapters(data);
        if (data.length > 0) {
          setSelectedChapterId(data[0].id);
        } else {
          setSelectedChapterId(null);
        }
      }
    } catch(e) {
      console.error(e);
    } finally {
      setChaptersLoading(false);
    }
  };

  const fetchWorkspaceLectures = async (chId) => {
    if (!activeWorkspaceBatch || !selectedSubject || !chId) return;
    setLecturesLoading(true);
    try {
      const res = await apiFetch(`/lectures?batchId=${activeWorkspaceBatch.id}&subject=${selectedSubject}&chapterId=${chId}`);
      if (res.ok) {
        const data = await res.json();
        setLectures(data);
        if (data.length > 0) {
          setSelectedLecture(data[0]);
        } else {
          setSelectedLecture(null);
        }
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLecturesLoading(false);
    }
  };

  const fetchBatches = async (enrolledList) => {
    setLoading(true);
    try {
      const res = await apiFetch('/batches');
      if (res.ok) {
        const all = await res.json();
        // Filter to only enrolled batches using the passed enrolledList to avoid stale closure
        setBatches(all.filter(b => (enrolledList || []).includes(b.id)));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px', color: '#64748b' }}>
        <div className="sp-spinner" style={{ margin: '0 auto 16px' }}></div>
        Loading study portal...
      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <div className="sp-page">
        <div className="sp-empty">
          <div className="sp-empty-icon">🎒</div>
          <h3>No enrolled batches found</h3>
          <p>Explore our premium courses and enroll to unlock classes, worksheets, and online tests.</p>
          <button type="button" className="sp-empty-btn" onClick={() => setActiveSection('batches')}>
            Find a Batch
          </button>
        </div>
      </div>
    );
  }

  // Render the Immersive Classroom Workspace (Split Screen Layout)
  if (activeWorkspaceBatch) {
    // 1. If no subject selected yet, show Subjects Selection Hub
    if (!selectedSubject) {
      const batchSubjects = (activeWorkspaceBatch.subjects && activeWorkspaceBatch.subjects.length > 0)
        ? activeWorkspaceBatch.subjects
        : (activeWorkspaceBatch.subject ? [activeWorkspaceBatch.subject] : ['Science', 'Math', 'SST', 'English', 'Computer']);

      const SUBJECT_ICONS = {
        science: '🔬',
        math: '📐',
        mathematics: '📐',
        sst: '🌍',
        social: '🌍',
        english: '📚',
        computer: '💻',
        physics: '⚛️',
        chemistry: '🧪',
        biology: '🧬'
      };

      return (
        <div className="sp-page" style={{ animation: 'spPageFadeIn 0.3s var(--sp-ease)' }}>
          {/* Header Toolbar */}
          <div className="te-workspace-header-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '16px 28px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '28px', boxShadow: 'var(--sp-shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setActiveWorkspaceBatch(null)}
                style={{ background: '#f1f5f9', border: 'none', width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5" width="16" height="16"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{activeWorkspaceBatch.name}</h2>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '750', textTransform: 'uppercase' }}>Select a subject to enter classroom</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveWorkspaceBatch(null)}
              style={{ border: '1.5px solid #ef4444', color: '#ef4444', background: 'transparent', padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '750', cursor: 'pointer' }}
            >
              Exit Batch
            </button>
          </div>

          {/* Subjects Grid */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Batch Subjects Hub</h3>
            <p style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '24px' }}>Choose a subject card below to browse recorded lecture classes, download PDF worksheets, and attempt tests.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {batchSubjects.map((sub) => {
                const key = sub.toLowerCase();
                const icon = SUBJECT_ICONS[key] || '📘';
                return (
                  <div
                    key={sub}
                    onClick={() => setSelectedSubject(sub)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '24px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: 'var(--sp-shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '14px',
                      textAlign: 'center'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.boxShadow = 'var(--sp-shadow-md)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = 'var(--sp-shadow-sm)';
                    }}
                  >
                    <span style={{ fontSize: '48px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.08))' }}>{icon}</span>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{sub}</h4>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>Recorded Classes & DPPs</p>
                    </div>
                    <button
                      type="button"
                      style={{
                        marginTop: '8px',
                        border: 'none',
                        background: '#eff6ff',
                        color: '#3b82f6',
                        padding: '8px 16px',
                        borderRadius: '50px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Enter Classroom →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // 2. Classroom view with dynamic subject-specific generated contents
    const activeChapters = chapters;

    const activeLectures = lectures;
    const activeNotes = [];
    const activeQuizzes = [];

    // Filter database uploaded notes specifically for the active subject
    const filteredWorkspaceNotes = workspaceNotes.filter(note => 
      !note.subject || note.subject.toLowerCase() === selectedSubject.toLowerCase()
    );

    // Filter dynamic database schedule for the active subject
    const filteredSchedule = (activeWorkspaceBatch.schedule || []).filter(cls => 
      !cls.subject || cls.subject.toLowerCase() === selectedSubject.toLowerCase()
    );

    return (
      <div className="sp-page" style={{ animation: 'spPageFadeIn 0.3s var(--sp-ease)' }}>
        {/* Workspace Toolbar Header */}
        <div className="te-workspace-header-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '16px 28px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px', boxShadow: 'var(--sp-shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setSelectedSubject(null)}
              style={{ background: '#f1f5f9', border: 'none', width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5" width="16" height="16"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{activeWorkspaceBatch.name} Workspace</h2>
              <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '750', textTransform: 'uppercase' }}>Subject: {selectedSubject}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { setSelectedSubject(null); setActiveWorkspaceBatch(null); }}
            style={{ border: '1.5px solid #ef4444', color: '#ef4444', background: 'transparent', padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '750', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
          >
            Exit Workspace
          </button>
        </div>

        {/* Tab Selection */}
        <div className="te-workspace-tabs-scroll" style={{ display: 'flex', gap: '8px', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '12px', marginBottom: '24px' }}>
          {[
            { id: 'classes', label: '🎥 Lectures & Classes' },
            { id: 'notes', label: '📄 Worksheets & Notes' },
            { id: 'tests', label: '✍️ Chapter Tests & DPPs' },
            { id: 'schedule', label: '📅 Batch Schedule' }
          ].map(tab => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setWorkspaceTab(tab.id)}
              style={{
                border: 'none',
                background: workspaceTab === tab.id ? '#0f172a' : 'transparent',
                color: workspaceTab === tab.id ? '#ffffff' : '#64748b',
                padding: '8px 20px',
                borderRadius: '50px',
                fontSize: '13px',
                fontWeight: '750',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
          
        {/* Immersive Split-Screen Layout */}
        <div className="te-workspace-split-container">
          
          {/* Left Column: Chapters Navigator */}
          <div className="te-workspace-chapters-sidebar">
            <h4>Course Syllabus Chapters</h4>
            <div className="te-workspace-chapters-list">
              {activeChapters.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 12px', color: '#64748b', fontSize: '13px' }}>
                  📂 No chapters uploaded yet.
                </div>
              ) : (
                activeChapters.map(ch => (
                  <button
                    type="button"
                    key={ch.id}
                    className={`te-chapter-nav-btn ${selectedChapterId === ch.id ? 'active' : ''}`}
                    onClick={() => setSelectedChapterId(ch.id)}
                  >
                    {ch.title}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Dynamic tab content panel */}
          <div className="te-workspace-main-content-panel">
            {workspaceTab === 'classes' && (
              <div>
                <h3 className="te-workspace-section-title">Lecture Videos & Recordings</h3>
                
                {/* 1. YouTube Video Embed Player */}
                {selectedLecture && selectedLecture.youtubeUrl && (
                  <div style={{ background: '#0f172a', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px', boxShadow: 'var(--sp-shadow-md)' }}>
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                      <iframe
                        src={getEmbedUrl(selectedLecture.youtubeUrl)}
                        title={selectedLecture.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                      />
                    </div>
                    <div style={{ padding: '16px 20px', background: '#1e293b', color: '#ffffff' }}>
                      <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '750', textTransform: 'uppercase' }}>Now Playing lesson</span>
                      <h4 style={{ fontSize: '15px', fontWeight: '800', margin: '4px 0 0 0' }}>{selectedLecture.title}</h4>
                    </div>
                  </div>
                )}

                {/* 2. Lecture Cards List */}
                {activeLectures.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {activeLectures.map((cls, idx) => {
                      const isPlaying = selectedLecture && selectedLecture.id === cls.id;
                      return (
                        <div key={idx} className="sd-class-item" style={{ background: isPlaying ? '#eff6ff' : '#ffffff', border: isPlaying ? '1.5px solid #3b82f6' : '1px solid #e2e8f0', boxShadow: 'none' }}>
                          <div className="sd-class-indicator-col">
                            <span className="sd-class-time-bubble">{cls.duration}</span>
                            <span className={`te-status-badge ${cls.status === 'Live Now' ? 'good' : cls.status === 'Completed' ? 'at-risk' : 'behind'}`} style={{ fontSize: '9px', fontWeight: '750' }}>
                              {cls.status}
                            </span>
                          </div>
                          <div className="sd-class-details-col">
                            <div className="sd-class-primary">
                              <strong style={{ fontSize: '15px', color: isPlaying ? '#1e40af' : '#0f172a' }}>{cls.title}</strong>
                            </div>
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Broadcast Date: <strong>{cls.date}</strong></span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              if (cls.youtubeUrl) {
                                setSelectedLecture(cls);
                              } else {
                                alert(`🔗 Launching player for ${cls.title}...`);
                              }
                            }}
                            style={{
                              border: 'none',
                              background: cls.status === 'Upcoming' ? '#cbd5e1' : '#3b82f6',
                              color: '#ffffff',
                              padding: '10px 20px',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: '700',
                              cursor: cls.status === 'Upcoming' ? 'not-allowed' : 'pointer',
                              fontFamily: 'inherit'
                            }}
                            disabled={cls.status === 'Upcoming'}
                          >
                            {isPlaying ? 'Playing Now' : cls.status === 'Live Now' ? 'Join Live' : cls.status === 'Completed' ? 'Watch recording' : 'Scheduled'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <div style={{ fontSize: '40px', marginBottom: '8px' }}>📂</div>
                    <p style={{ fontSize: '14px', fontWeight: '600' }}>No lectures uploaded yet for this chapter.</p>
                  </div>
                )}
              </div>
            )}

            {workspaceTab === 'notes' && (
              <div>
                <h3 className="te-workspace-section-title">Notes, Formula Sheets & Worksheets</h3>
                
                {/* 1. Show Uploaded Batch Materials from Admin */}
                {filteredWorkspaceNotes.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '13px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Batch Documents from Teacher</h4>
                    {filteredWorkspaceNotes.map((note) => (
                      <div key={note.id} className="sd-class-item" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                        <div className="sd-class-indicator-col" style={{ minWidth: '40px' }}>
                          <span style={{ fontSize: '24px' }}>
                            {note.originalName?.toLowerCase().includes('drive') || note.fileUrl?.startsWith('http') ? '🔗' : '📄'}
                          </span>
                        </div>
                        <div className="sd-class-details-col">
                          <strong>{note.title}</strong>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Format: <strong>{note.originalName?.split('.').pop().toUpperCase() || 'PDF'}</strong> &bull; Subject: <strong>{note.subject}</strong></span>
                        </div>
                        <a
                          href={note.fileUrl?.startsWith('http') ? note.fileUrl : `${BASE_URL.endsWith('/api') ? BASE_URL.slice(0, -4) : BASE_URL}${note.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none', background: '#3b82f6', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' }}
                        >
                          {note.fileUrl?.startsWith('http') ? 'Open Link' : 'Download'}
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. Show Chapter Reference Materials (Fallback/Standard) */}
                {activeNotes.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ fontSize: '13px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Reference Chapter Guides</h4>
                    {activeNotes.map((note, idx) => (
                      <div key={idx} className="sd-class-item" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                        <div className="sd-class-indicator-col" style={{ minWidth: '40px' }}>
                          <span style={{ fontSize: '24px' }}>📄</span>
                        </div>
                        <div className="sd-class-details-col">
                          <strong>{note.name}</strong>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>File Size: <strong>{note.size}</strong></span>
                        </div>
                        <button
                          type="button"
                          onClick={() => alert(`Downloading reference guide: ${note.name}`)}
                          style={{ border: 'none', background: '#475569', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {filteredWorkspaceNotes.length === 0 && activeNotes.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <div style={{ fontSize: '40px', marginBottom: '8px' }}>📄</div>
                    <p style={{ fontSize: '14px', fontWeight: '600' }}>No worksheets uploaded yet for this chapter.</p>
                  </div>
                )}
              </div>
            )}

            {workspaceTab === 'tests' && (
              <div>
                <h3 className="te-workspace-section-title">Chapter Assessments & Assignments</h3>
                {activeQuizzes.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {activeQuizzes.map((quiz, idx) => (
                      <div key={idx} className="sd-class-item" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                        <div className="sd-class-indicator-col">
                          <span style={{ fontSize: '24px' }}>✍️</span>
                        </div>
                        <div className="sd-class-details-col">
                          <strong>{quiz.title}</strong>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>{quiz.questions} Questions &bull; {quiz.marks} Marks</span>
                        </div>
                        {quiz.completed ? (
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '800', display: 'block' }}>Score: {quiz.score}</span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>Completed</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => alert(`Starting quiz: ${quiz.title}`)}
                            style={{ border: 'none', background: '#10b981', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}
                          >
                            Start Quiz
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <div style={{ fontSize: '40px', marginBottom: '8px' }}>✍️</div>
                    <p style={{ fontSize: '14px', fontWeight: '600' }}>No tests scheduled yet for this chapter.</p>
                  </div>
                )}
              </div>
            )}
            {workspaceTab === 'schedule' && (
              <div>
                <h3 className="te-workspace-section-title">Batch Lecture Schedule Calendar</h3>
                {filteredSchedule && filteredSchedule.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredSchedule.map((cls, idx) => (
                      <div key={idx} className="sd-class-item" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                        <div className="sd-class-indicator-col" style={{ minWidth: '40px' }}>
                          <span style={{ fontSize: '24px' }}>📅</span>
                        </div>
                        <div className="sd-class-details-col">
                          <strong>{cls.subject}</strong>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Instructor: <strong>{cls.teacher || 'Faculty'}</strong></span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ display: 'block', fontSize: '13px', fontWeight: '750', color: '#5b4fcf' }}>
                            {cls.date ? `${cls.date} (${cls.day})` : cls.day}
                          </span>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>⏰ {cls.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <div style={{ fontSize: '40px', marginBottom: '8px' }}>📅</div>
                    <p style={{ fontSize: '14px', fontWeight: '600' }}>No live classes scheduled for this batch yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="sp-page">
      {/* ── Heading ── */}
      <div className="te-dashboard-greeting" style={{ marginBottom: '24px' }}>
        <h2>My Batches</h2>
        <p>Manage, track, and watch lectures for your enrolled batches.</p>
      </div>

      <div className="batch-grid">
        {batches.map((batch, idx) => {
          const emoji = BATCH_EMOJIS[idx % BATCH_EMOJIS.length];

          return (
            <div key={batch.id} className="batch-card" style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
              {/* Image Banner */}
              <div className="batch-card-image" style={{ height: '165px' }}>
                {batch.image ? (
                  <img src={batch.image} alt={batch.name} />
                ) : (
                  <span style={{ fontSize: 52, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.1))' }}>{emoji}</span>
                )}
                {batch.tag && <span className="batch-card-tag" style={{ background: '#0f172a' }}>{batch.tag}</span>}
                <span style={{ position: 'absolute', top: 12, right: 12, background: '#10b981', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '50px' }}>
                  Enrolled
                </span>
              </div>

              {/* Card Body */}
              <div className="batch-card-body" style={{ padding: '24px' }}>
                <div className="batch-card-name" style={{ fontSize: '18px', fontWeight: '800' }}>{batch.name}</div>
                <div className="batch-card-meta" style={{ display: 'flex', gap: '6px', margin: '4px 0 10px' }}>
                  {batch.language && <span className="batch-card-badge" style={{ background: '#eff6ff', color: '#3b82f6' }}>{batch.language}</span>}
                  {batch.targetAudience && <span className="batch-card-for" style={{ color: '#64748b', fontWeight: '600' }}>{batch.targetAudience}</span>}
                </div>
              </div>

              {/* Action Button */}
              <div className="batch-card-actions" style={{ background: '#ffffff', padding: '16px 24px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  className="batch-btn-study"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', fontWeight: '750', padding: '12px' }}
                  onClick={() => {
                    setActiveWorkspaceBatch(batch);
                    setWorkspaceTab('classes');
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  STUDY NOW →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SMyBatches;
