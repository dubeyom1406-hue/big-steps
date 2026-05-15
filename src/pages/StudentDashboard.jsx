import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import '../pages/AdminDashboard.css';
import './StudentDashboard.css';
import { apiFetch } from '../api';

const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

const StudentDashboard = () => {
    const [studentData, setStudentData] = useState(null);
    const [activeMenu, setActiveMenu] = useState('overview');
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [materials, setMaterials] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const data = localStorage.getItem('student_data');
        if (!data) {
            navigate('/login');
            return;
        }
        const student = JSON.parse(data);
        setStudentData(student);
        
        // Fetch fresh profile data to reflect any updates made by Admin (e.g. Class update)
        const fetchFreshProfile = async () => {
            try {
                const res = await apiFetch(`/students/${student.id}`);
                if (res.ok) {
                    const freshStudent = await res.json();
                    setStudentData(freshStudent);
                    localStorage.setItem('student_data', JSON.stringify(freshStudent));
                    fetchMaterials(freshStudent.classGrade);
                } else {
                    // Fallback to local data
                    fetchMaterials(student.classGrade);
                }
            } catch(e) {
                console.error("Error fetching fresh profile", e);
                fetchMaterials(student.classGrade);
            }
        };

        fetchFreshProfile();
    }, [navigate]);

    const fetchMaterials = async (classGrade) => {
        if (!classGrade) return;
        try {
            // Student doesn't need auth token for materials GET API based on our backend code, but we can pass token if needed.
            const res = await apiFetch(`/materials?classGrade=${classGrade}`);
            if (res.ok) {
                setMaterials(await res.json());
            }
        } catch (error) {
            console.error("Failed to fetch materials", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user_token');
        localStorage.removeItem('student_data');
        navigate('/login');
    };

    if (!studentData) return <div className="sd-loading">Loading Dashboard...</div>;

    const renderContent = () => {
        switch(activeMenu) {
            case 'overview': {
                const enrolledCount = studentData.subjects
                    ? (studentData.subjects.allSubjects ? 6 : Object.values(studentData.subjects).filter(Boolean).length)
                    : 0;
                const paidCount = studentData.paidMonths ? studentData.paidMonths.length : 0;
                const quotes = [
                    "Success is the sum of small efforts, repeated day in and day out.",
                    "The expert in anything was once a beginner.",
                    "Don't watch the clock; do what it does. Keep going.",
                    "Education is the most powerful weapon you can use to change the world.",
                ];
                const todayQuote = quotes[new Date().getDate() % quotes.length];

                return (
                    <div className="ov-container">

                        {/* ─ STATS ROW ─ */}
                        <div className="ov-stats-row">
                            <div className="ov-stat-card" style={{background:'linear-gradient(135deg,#667eea,#764ba2)'}}>
                                <span className="ov-stat-icon">📚</span>
                                <div>
                                    <h2>{enrolledCount}</h2>
                                    <p>Subjects Enrolled</p>
                                </div>
                            </div>
                            <div className="ov-stat-card" style={{background:'linear-gradient(135deg,#f093fb,#f5576c)'}}>
                                <span className="ov-stat-icon">💰</span>
                                <div>
                                    <h2>₹{studentData.monthlyFee || 0}</h2>
                                    <p>Monthly Fee</p>
                                </div>
                            </div>
                            <div className="ov-stat-card" style={{background:'linear-gradient(135deg,#43e97b,#38f9d7)'}}>
                                <span className="ov-stat-icon">✅</span>
                                <div>
                                    <h2>{paidCount}/12</h2>
                                    <p>Months Fee Paid</p>
                                </div>
                            </div>
                            <div className="ov-stat-card" style={{background:'linear-gradient(135deg,#4facfe,#00f2fe)'}}>
                                <span className="ov-stat-icon">🏫</span>
                                <div>
                                    <h2>Class {studentData.classGrade || 'N/A'}</h2>
                                    <p>Current Class</p>
                                </div>
                            </div>
                        </div>

                        {/* ─ INFO CARDS ROW ─ */}
                        <div className="ov-info-row">
                            <div className="ov-info-card">
                                <div className="ov-info-header">
                                    <span>👤</span> Student Info
                                </div>
                                <div className="ov-info-grid">
                                    <div className="ov-info-item">
                                        <label>Full Name</label>
                                        <strong>{studentData.studentName || 'N/A'}</strong>
                                    </div>
                                    <div className="ov-info-item">
                                        <label>Father's Name</label>
                                        <strong>{studentData.fatherName || 'N/A'}</strong>
                                    </div>
                                    <div className="ov-info-item">
                                        <label>School</label>
                                        <strong>{studentData.schoolName || 'N/A'}</strong>
                                    </div>
                                    <div className="ov-info-item">
                                        <label>Batch Timing</label>
                                        <strong>{studentData.batchTiming || 'Not Assigned'}</strong>
                                    </div>
                                    <div className="ov-info-item">
                                        <label>Mobile</label>
                                        <strong>{studentData.mobile || 'N/A'}</strong>
                                    </div>
                                    <div className="ov-info-item">
                                        <label>Login ID</label>
                                        <strong>{studentData.loginId}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="ov-right-col">
                                {/* Fee Progress */}
                                <div className="ov-fee-card">
                                    <div className="ov-info-header">💳 Fee Progress (2024-25)</div>
                                    <div className="ov-fee-bar-wrap">
                                        <div className="ov-fee-bar" style={{width: `${(paidCount/12)*100}%`}}></div>
                                    </div>
                                    <p className="ov-fee-label">{paidCount} of 12 months paid</p>
                                </div>

                                <div className="ov-quote-card">
                                    <span className="ov-quote-icon">🌟</span>
                                    <p className="ov-quote-text">"{todayQuote}"</p>
                                    <small>— Quote of the Day</small>
                                </div>
                            </div>
                        </div>

                    </div>
                );
            }
            case 'subjects': {
                const subjectColors = {
                    'Mathematics': { bg: 'linear-gradient(135deg, #f093fb, #f5576c)', icon: '📐', accent: '#f5576c' },
                    'English':     { bg: 'linear-gradient(135deg, #4facfe, #00f2fe)', icon: '📖', accent: '#4facfe' },
                    'Science':     { bg: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)', icon: '🔬', accent: '#0f3460' },
                    'SST':         { bg: 'linear-gradient(135deg, #fa709a, #fee140)', icon: '🌍', accent: '#fa709a' },
                    'GK':          { bg: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', icon: '🧠', accent: '#a18cd1' },
                    'Hindi':       { bg: 'linear-gradient(135deg, #ff9a9e, #fecfef)', icon: '📝', accent: '#ff9a9e' },
                };
                const getTeacher = (subName) => {
                    const s = subName.toLowerCase();
                    if (s.includes('math'))    return 'Raushan Sir';
                    if (s.includes('science')) return 'Om Sir';
                    if (s.includes('english')) return 'Arpit Sir';
                    if (s.includes('sst'))     return 'Rishav, Om & Raushan Sir';
                    if (s.includes('gk'))      return 'Rishav, Om & Raushan Sir';
                    return 'Respective Faculty';
                };
                const allSubjectList = [
                    { id: 'math',    name: 'Mathematics' },
                    { id: 'english', name: 'English'     },
                    { id: 'science', name: 'Science'     },
                    { id: 'sst',     name: 'SST'         },
                    { id: 'gk',      name: 'GK'          },
                    { id: 'hindi',   name: 'Hindi'       },
                ];

                // ── SUBJECT DETAIL VIEW ──
                if (selectedSubject) {
                    const sub = selectedSubject;
                    const color = subjectColors[sub.name] || { bg: 'linear-gradient(135deg,#667eea,#764ba2)', icon: '📚', accent: '#667eea' };
                    const subMaterials = materials.filter(m =>
                        m.subject && m.subject.toLowerCase() === sub.name.toLowerCase()
                    );
                    const isEnrolled = !!(studentData.subjects?.allSubjects || studentData.subjects?.[sub.id]);

                    return (
                        <div className="sd-subject-detail">

                            {/* Back Button */}
                            <button className="sd-back-btn" onClick={() => setSelectedSubject(null)}>
                                ← Back to Subjects
                            </button>

                            {/* Hero Banner */}
                            <div className="sd-detail-hero-v2" style={{ background: color.bg }}>
                                <div className="sd-hero-pattern"></div>
                                <div className="sd-hero-content">
                                    <div className="sd-hero-left">
                                        <span className="sd-hero-icon-big">{color.icon}</span>
                                        <div>
                                            <h2>{sub.name}</h2>
                                            <p className="sd-hero-teacher">👨‍🏫 {getTeacher(sub.name)}</p>
                                            <span className={`sd-hero-enroll-tag ${isEnrolled ? 'enrolled' : 'not-enrolled'}`}>
                                                {isEnrolled ? '✅ Enrolled' : '⛔ Not Enrolled'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="sd-hero-stats">
                                        <div className="sd-hero-stat">
                                            <strong>{subMaterials.length}</strong>
                                            <span>Study Materials</span>
                                        </div>
                                        <div className="sd-hero-stat">
                                            <strong>{subMaterials.length > 0 ? 'Active' : 'Pending'}</strong>
                                            <span>Content Status</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Materials Section */}
                            <div className="sd-detail-section">
                                <div className="sd-section-header">
                                    <span className="sd-section-dot" style={{background: color.accent}}></span>
                                    <h3>📝 Notes & Study Materials</h3>
                                    <span className="sd-section-count">{subMaterials.length} files</span>
                                </div>

                                {subMaterials.length === 0 ? (
                                    <div className="sd-detail-empty-v2">
                                        <div className="sd-empty-illustration">
                                            <span className="sd-empty-icon">📭</span>
                                            <div className="sd-empty-circles">
                                                <span></span><span></span><span></span>
                                            </div>
                                        </div>
                                        <h4>No Materials Yet</h4>
                                        <p>Your teacher hasn't uploaded any notes for this subject yet. Check back soon!</p>
                                    </div>
                                ) : (
                                    <div className="sd-notes-grid">
                                        {subMaterials.map((mat, idx) => (
                                            <div key={mat.id} className="sd-note-card" style={{'--accent': color.accent}}>
                                                <div className="sd-note-top" style={{background: color.bg}}>
                                                    <span className="sd-note-num">#{idx + 1}</span>
                                                    <span className="sd-note-file-icon">📄</span>
                                                </div>
                                                <div className="sd-note-body">
                                                    <h4 className="sd-note-title">{mat.title}</h4>
                                                    <div className="sd-note-meta">
                                                        <span>📅 {new Date(mat.createdAt).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}</span>
                                                        <span className="sd-note-type">PDF</span>
                                                    </div>
                                                </div>
                                                <a
                                                    href={`https://big-steps.onrender.com${mat.fileUrl}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="sd-note-btn"
                                                    style={{background: color.bg}}
                                                >
                                                    📖 Open Notes
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Teacher Info Card */}
                            <div className="sd-teacher-card" style={{borderColor: color.accent}}>
                                <div className="sd-teacher-avatar" style={{background: color.bg}}>👨‍🏫</div>
                                <div className="sd-teacher-info">
                                    <h4>{getTeacher(sub.name)}</h4>
                                    <p>{sub.name} Faculty — Bright Steps Coaching</p>
                                    <p className="sd-teacher-note">📞 Contact your teacher through the coaching center for any doubts.</p>
                                </div>
                            </div>

                        </div>
                    );
                }

                // ── SUBJECTS GRID VIEW ──
                return (
                    <div className="sd-subjects-container">
                        <h3>📚 My Study Portal</h3>
                        <div className="sd-subjects-card-grid">
                            {allSubjectList.map((sub) => {
                                const isEnrolled = !!(studentData.subjects?.allSubjects || studentData.subjects?.[sub.id]);
                                const subMaterials = materials.filter(m =>
                                    m.subject && m.subject.toLowerCase() === sub.name.toLowerCase()
                                );
                                const color = subjectColors[sub.name] || { bg: 'linear-gradient(135deg, #667eea, #764ba2)', icon: '📚' };
                                return (
                                    <div
                                        key={sub.id}
                                        className={`sd-sub-square ${isEnrolled ? 'enrolled' : 'not-enrolled'}`}
                                        onClick={() => setSelectedSubject(sub)}
                                    >
                                        <div className="sd-sub-square-banner" style={{ background: color.bg }}>
                                            <span className="sd-sub-square-icon">{color.icon}</span>
                                            {!isEnrolled && <span className="sd-sub-lock-badge">⛔ Not Enrolled</span>}
                                        </div>
                                        <div className="sd-sub-square-body">
                                            <h4>{sub.name}</h4>
                                            <p className="sd-sub-teacher">By {getTeacher(sub.name)}</p>
                                            <div className="sd-sub-mat-count">
                                                {subMaterials.length > 0
                                                    ? <span className="sd-mat-pill">{subMaterials.length} Material{subMaterials.length > 1 ? 's' : ''}</span>
                                                    : <span className="sd-mat-pill empty">No Materials</span>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            }

            case 'schedule':
                return (
                    <div className="sd-card">
                        <h3>My Schedule & Batch</h3>
                        <p className="sd-highlight">{studentData.batchTiming || 'Not assigned yet'}</p>
                        <p><strong>Days:</strong> {studentData.days || 'N/A'}</p>
                        <p style={{marginTop: '10px', fontSize: '1rem', color: '#64748b'}}>School: {studentData.schoolName || 'N/A'}</p>
                    </div>
                );
            case 'fee':
                return (
                    <div className="sd-card">
                        <h3>My Fee Status (2024-25)</h3>
                        <div className="sd-fee-grid">
                            {months.map((month, index) => {
                                const isPaid = studentData.paidMonths && studentData.paidMonths.includes(index);
                                return (
                                    <div key={index} className={`sd-fee-month-card ${isPaid ? 'paid' : 'due'}`}>
                                        <h4>{month}</h4>
                                        <div className="sd-fee-status">
                                            {isPaid ? (
                                                <><span className="icon">✅</span> Paid</>
                                            ) : (
                                                <><span className="icon">⚠️</span> Due</>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            case 'profile':
                return (
                    <div className="sd-profile-section">
                        <div className="sd-card">
                            <h3>Personal Details</h3>
                            <div className="sd-details-grid">
                                <div className="sd-detail-item"><span>Full Name</span><strong>{studentData.studentName}</strong></div>
                                <div className="sd-detail-item"><span>Date of Birth</span><strong>{studentData.dob || 'N/A'}</strong></div>
                                <div className="sd-detail-item"><span>Gender</span><strong>{studentData.gender || 'N/A'}</strong></div>
                                <div className="sd-detail-item"><span>Class Grade</span><strong>{studentData.classGrade || 'N/A'}</strong></div>
                                <div className="sd-detail-item"><span>School Name</span><strong>{studentData.schoolName || 'N/A'}</strong></div>
                                <div className="sd-detail-item"><span>Admission Date</span><strong>{studentData.admissionDate || 'N/A'}</strong></div>
                            </div>
                        </div>

                        <div className="sd-card">
                            <h3>Family & Contact Details</h3>
                            <div className="sd-details-grid">
                                <div className="sd-detail-item"><span>Father's Name</span><strong>{studentData.fatherName || 'N/A'}</strong></div>
                                <div className="sd-detail-item"><span>Mother's Name</span><strong>{studentData.motherName || 'N/A'}</strong></div>
                                <div className="sd-detail-item"><span>Mobile No.</span><strong>{studentData.mobile || 'N/A'}</strong></div>
                                <div className="sd-detail-item"><span>Email</span><strong>{studentData.email || 'N/A'}</strong></div>
                                <div className="sd-detail-item"><span>Guardian Name</span><strong>{studentData.guardianName || 'N/A'}</strong></div>
                                <div className="sd-detail-item"><span>Guardian Mobile</span><strong>{studentData.guardianMobile || 'N/A'}</strong></div>
                                <div className="sd-detail-item full-width"><span>Address</span><strong>{studentData.address || 'N/A'}</strong></div>
                            </div>
                        </div>
                        
                        <div className="sd-card">
                            <h3>Account Information</h3>
                            <div className="sd-details-grid">
                                <div className="sd-detail-item"><span>Login ID</span><strong>{studentData.loginId}</strong></div>
                                <div className="sd-detail-item"><span>Password</span><strong>********</strong></div>
                                <div className="sd-detail-item"><span>Registration Date</span><strong>{studentData.registrationDate || 'N/A'}</strong></div>
                            </div>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className={`db-container layout-container ${isMobileMenuOpen ? 'mobile-menu-active' : ''}`}>
            {/* Hamburger Button (Mobile) */}
            <button 
                className="db-hamburger" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Menu"
            >
                {isMobileMenuOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
                )}
            </button>

            {/* Overlay (Mobile) */}
            <div 
                className={`db-overlay ${isMobileMenuOpen ? 'show' : ''}`} 
                onClick={() => setIsMobileMenuOpen(false)}
            ></div>

            {/* Sidebar like Admin Panel */}
            <aside 
                className={`db-sidebar ${isSidebarExpanded ? 'expanded' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}
                onMouseEnter={() => setIsSidebarExpanded(true)}
                onMouseLeave={() => setIsSidebarExpanded(false)}
            >
                <div className="db-side-top">
                    <img src={logoImg} alt="Logo" className="db-side-logo" />
                </div>

                <nav className="db-nav">
                    <div 
                        className={`db-nav-item ${activeMenu === 'overview' ? 'active' : ''}`}
                        onClick={() => { setActiveMenu('overview'); setIsMobileMenuOpen(false); }}
                    >
                        <span className="db-nav-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                        </span>
                        <span className="db-nav-label">Overview</span>
                    </div>

                    <div 
                        className={`db-nav-item ${activeMenu === 'subjects' ? 'active' : ''}`}
                        onClick={() => { setActiveMenu('subjects'); setIsMobileMenuOpen(false); }}
                    >
                        <span className="db-nav-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                            </svg>
                        </span>
                        <span className="db-nav-label">My Subjects</span>
                    </div>

                    <div 
                        className={`db-nav-item ${activeMenu === 'schedule' ? 'active' : ''}`}
                        onClick={() => { setActiveMenu('schedule'); setIsMobileMenuOpen(false); }}
                    >
                        <span className="db-nav-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </span>
                        <span className="db-nav-label">Schedule</span>
                    </div>

                    <div 
                        className={`db-nav-item ${activeMenu === 'fee' ? 'active' : ''}`}
                        onClick={() => { setActiveMenu('fee'); setIsMobileMenuOpen(false); }}
                    >
                        <span className="db-nav-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path>
                            </svg>
                        </span>
                        <span className="db-nav-label">Fee Status</span>
                    </div>
                </nav>

                <div className="db-side-bottom">
                    <div 
                        className={`db-nav-item ${activeMenu === 'profile' ? 'active' : ''}`}
                        onClick={() => { setActiveMenu('profile'); setIsMobileMenuOpen(false); }}
                    >
                        <span className="db-nav-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </span>
                        <span className="db-nav-label">Profile</span>
                    </div>

                    <div className="db-logout" onClick={handleLogout} style={{cursor: 'pointer'}}>
                        <span className="db-nav-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16 17 21 12 16 7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                        </span>
                        <span className="db-nav-label">Logout</span>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="layout-content">
                <div className="sd-content-area">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
