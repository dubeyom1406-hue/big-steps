import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api';
import '../StudentPortal.css';

const BATCH_EMOJIS = ['🚀', '📚', '🎯', '⚡', '🔬', '💡', '🏆', '🌟'];

const SBatches = ({ studentData, updateStudentData, setActiveSection }) => {
  const [batches, setBatches]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState('');
  const [enrolling, setEnrolling] = useState(null);

  // Search & Filter State
  const [search, setSearch]       = useState('');
  const [langFilter, setLangFilter] = useState('All');

  // Sliding Drawer State
  const [drawerBatch, setDrawerBatch] = useState(null);

  const enrolled = studentData?.enrolledBatches || [];

  useEffect(() => { fetchBatches(); }, []);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/batches');
      if (res.ok) setBatches(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleEnroll = async (batchId) => {
    if (!studentData?.id) { showToast('⚠️ Student data missing. Please login again.'); return; }
    if (enrolled.includes(batchId)) { showToast('Already enrolled in this batch!'); return; }

    setEnrolling(batchId);
    try {
      const res = await apiFetch(`/students/${studentData.id}/enroll`, {
        method: 'POST',
        body: JSON.stringify({ batchId }),
      });
      if (res.ok) {
        const data = await res.json();
        const updatedStudent = { ...studentData, enrolledBatches: data.enrolledBatches };
        updateStudentData(updatedStudent);
        showToast('🎉 Enrolled successfully! Check My Batches.');
        if (drawerBatch && drawerBatch.id === batchId) {
          setDrawerBatch(prev => ({ ...prev, isEnrolled: true }));
        }
      } else {
        showToast('❌ Enrollment failed. Please try again.');
      }
    } catch (e) {
      showToast('❌ Network error. Please try again.');
    } finally {
      setEnrolling(null);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.name?.toLowerCase().includes(search.toLowerCase()) ||
                          batch.targetAudience?.toLowerCase().includes(search.toLowerCase());
    const matchesLang = langFilter === 'All' || batch.language === langFilter;
    return matchesSearch && matchesLang;
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px', color: '#64748b' }}>
        <div className="sp-spinner" style={{ margin: '0 auto 16px' }}></div>
        Loading explore batches...
      </div>
    );
  }

  return (
    <div className="sp-page">
      {toast && <div className="sp-toast">{toast}</div>}

      {/* ── Heading ── */}
      <div className="te-dashboard-greeting" style={{ marginBottom: '24px' }}>
        <h2>Explore Batches</h2>
        <p>Browse, select, and enroll in premium course offerings.</p>
      </div>

      {/* ── Search & Filters Bar ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '16px 24px',
        border: '1px solid #e2e8f0',
        marginBottom: '28px',
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        alignItems: 'center',
        boxShadow: 'var(--sp-shadow-sm)'
      }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Search batches by name or keyword..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '14px', fontFamily: 'inherit', color: '#0f172a' }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: '750', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.2px' }}>Language:</span>
          {['All', 'Hinglish', 'Hindi', 'English'].map(lang => (
            <button
              type="button"
              key={lang}
              onClick={() => setLangFilter(lang)}
              style={{
                border: 'none',
                background: langFilter === lang ? '#0f172a' : '#f1f5f9',
                color: langFilter === lang ? '#ffffff' : '#475569',
                padding: '8px 16px',
                borderRadius: '50px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'inherit'
              }}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {filteredBatches.length === 0 ? (
        <div className="sp-empty">
          <div className="sp-empty-icon">🔍</div>
          <h3>No matching batches found</h3>
          <p>Try modifying your search query or filters.</p>
        </div>
      ) : (
        <div className="batch-grid">
          {filteredBatches.map((batch, idx) => {
            const isEnrolled = enrolled.includes(batch.id);
            const emoji = BATCH_EMOJIS[idx % BATCH_EMOJIS.length];
            return (
              <div key={batch.id} className="batch-card" style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                {/* Image */}
                <div className="batch-card-image" style={{ height: '165px' }}>
                  {batch.image ? (
                    <img src={batch.image} alt={batch.name} />
                  ) : (
                    <span style={{ fontSize: 52, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.1))' }}>{emoji}</span>
                  )}
                  {batch.tag && <span className="batch-card-tag" style={{ background: '#0f172a', fontWeight: '700' }}>{batch.tag}</span>}
                  {batch.isOnline && <span className="batch-card-online" style={{ background: '#3b82f6' }}>LIVE</span>}
                </div>

                {/* Body */}
                <div className="batch-card-body" style={{ padding: '20px' }}>
                  <div className="batch-card-name" style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>{batch.name}</div>
                  
                  {/* Subject and Instructor block */}
                  {(batch.subject || batch.teacherName) && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', margin: '8px 0 2px', fontSize: '12px', fontWeight: '700' }}>
                      {batch.subject && <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '3px 8px', borderRadius: '6px' }}>📘 {batch.subject}</span>}
                      {batch.teacherName && <span style={{ color: '#5b4fcf' }}>👨‍🏫 {batch.teacherName}</span>}
                    </div>
                  )}

                  <div className="batch-card-meta" style={{ display: 'flex', gap: '6px', margin: '4px 0 8px' }}>
                    {batch.language && <span className="batch-card-badge" style={{ background: '#eff6ff', color: '#3b82f6' }}>{batch.language}</span>}
                    {batch.targetAudience && <span className="batch-card-for" style={{ color: '#64748b', fontWeight: '600' }}>{batch.targetAudience}</span>}
                  </div>
                  {batch.description && <p className="batch-card-desc" style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>{batch.description}</p>}
                  
                  {batch.price !== undefined && (
                    <div className="batch-card-price" style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '14px' }}>
                      <span className="price" style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>₹{Number(batch.price).toLocaleString('en-IN')}</span>
                      {batch.mrp && <span className="mrp" style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '13px' }}>₹{Number(batch.mrp).toLocaleString('en-IN')}</span>}
                      {batch.discount && <span className="discount" style={{ background: '#ecfdf5', color: '#10b981', fontWeight: '700', padding: '3px 8px', borderRadius: '6px' }}>{batch.discount}% OFF</span>}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="batch-card-actions" style={{ background: '#ffffff', padding: '16px 20px', borderTop: '1px solid #e2e8f0' }}>
                  {isEnrolled ? (
                    <button type="button" className="batch-btn-study" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', fontWeight: '750' }} onClick={() => setActiveSection('my-batches')}>
                      ✅ Unlocked • STUDY
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="batch-btn-explore"
                        style={{ border: '1.5px solid #0f172a', color: '#0f172a', fontWeight: '750' }}
                        onClick={() => setDrawerBatch({ ...batch, emoji })}
                      >
                        EXPLORE
                      </button>
                      <button
                        type="button"
                        className="batch-btn-buy"
                        style={{ background: '#3b82f6', fontWeight: '750' }}
                        onClick={() => handleEnroll(batch.id)}
                        disabled={enrolling === batch.id}
                      >
                        {enrolling === batch.id ? 'Enrolling…' : 'BUY NOW'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Exploration Slide-In Drawer ── */}
      {drawerBatch && (
        <div className="sp-drawer-overlay" onClick={() => setDrawerBatch(null)}>
          <div className="sp-drawer" onClick={e => e.stopPropagation()}>
            <div className="sp-drawer-header">
              <h3>Course Exploration</h3>
              <button type="button" className="sp-drawer-close" onClick={() => setDrawerBatch(null)}>✕</button>
            </div>

            <div className="sp-drawer-body">
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <span style={{ fontSize: 72 }}>{drawerBatch.emoji}</span>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '12px' }}>{drawerBatch.name}</h2>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
                  <span className="batch-card-badge">{drawerBatch.language}</span>
                  <span className="batch-card-for" style={{ display: 'flex', alignItems: 'center' }}>{drawerBatch.targetAudience}</span>
                </div>
              </div>

              {/* Price Details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Batch Fee</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontSize: '22px', fontWeight: '850', color: '#0f172a' }}>₹{drawerBatch.price}</span>
                    {drawerBatch.mrp && <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '13px' }}>₹{drawerBatch.mrp}</span>}
                  </div>
                </div>
                {drawerBatch.discount && (
                  <span style={{ background: '#ecfdf5', color: '#10b981', fontSize: '12px', fontWeight: '700', padding: '6px 12px', borderRadius: '50px' }}>
                    {drawerBatch.discount}% Discount
                  </span>
                )}
              </div>

              {/* Overview */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Batch Overview</h4>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                  {drawerBatch.description || 'Join this batch to receive premium, highly-structured daily lectures designed to help you ace your board and entrance preparation exams.'}
                </p>
              </div>

              {/* Meet Your Faculty Section */}
              {(() => {
                const facultyList = [];
                const seenTeachers = new Set();
                
                if (drawerBatch.subjectsInfo && drawerBatch.subjectsInfo.length > 0) {
                  drawerBatch.subjectsInfo.forEach(info => {
                    if (info.teacherName && !seenTeachers.has(info.teacherName)) {
                      facultyList.push({
                        name: info.teacherName,
                        subject: info.subject || 'Lead Faculty',
                        qualification: info.teacherQualification || 'Lead Instructor'
                      });
                      seenTeachers.add(info.teacherName);
                    }
                  });
                }
                
                // Fallback to legacy fields if subjectsInfo is empty
                if (facultyList.length === 0) {
                  if (drawerBatch.teacherName) {
                    facultyList.push({
                      name: drawerBatch.teacherName,
                      subject: drawerBatch.subject || 'Lead Faculty',
                      qualification: drawerBatch.teacherQualification || 'Lead Instructor'
                    });
                    seenTeachers.add(drawerBatch.teacherName);
                  }
                  
                  (drawerBatch.schedule || []).forEach(cls => {
                    if (cls.teacher && !seenTeachers.has(cls.teacher)) {
                      facultyList.push({
                        name: cls.teacher,
                        subject: cls.subject,
                        qualification: 'Subject Expert'
                      });
                      seenTeachers.add(cls.teacher);
                    }
                  });
                }

                if (facultyList.length === 0) return null;

                return (
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '16px', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.2px' }}>
                      Meet Your Faculty Team
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {facultyList.map((fac, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800', flexShrink: 0 }}>
                            {fac.name ? fac.name[0] : '👨‍🏫'}
                          </div>
                          <div>
                            <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>{fac.name}</strong>
                            <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '750', display: 'block', marginTop: '1px' }}>
                              {fac.subject} Expert
                            </span>
                            {fac.qualification && (
                              <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '1px', fontWeight: '600' }}>
                                🎓 {fac.qualification}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Objectives */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>What you will get:</h4>
                <div className="sp-drawer-feature-list">
                  <div className="sp-drawer-feature">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>
                    Daily Live & Interactive Classes
                  </div>
                  <div className="sp-drawer-feature">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>
                    Topic-wise Mock Test Series
                  </div>
                  <div className="sp-drawer-feature">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>
                    Premium PDF Study Materials & Notes
                  </div>
                </div>
              </div>

              {/* Weekly Schedule in Drawer */}
              {drawerBatch.schedule && drawerBatch.schedule.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Weekly Schedule</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {drawerBatch.schedule.map((cls, idx) => (
                      <div key={idx} style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '13px', display: 'block', color: '#0f172a' }}>{cls.subject}</strong>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>by {cls.teacher}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#3b82f6', display: 'block' }}>{cls.day}</span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>⏰ {cls.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom actions */}
            <div style={{ padding: '20px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                style={{ flex: '1 1 120px', padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '10px', fontWeight: 700, color: '#475569', cursor: 'pointer', fontFamily: 'inherit' }}
                onClick={() => setDrawerBatch(null)}
              >
                Close Details
              </button>
              {enrolled.includes(drawerBatch.id) ? (
                <button
                  type="button"
                  style={{ flex: '1.5 1 150px', padding: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '10px', fontWeight: 700, color: '#ffffff', cursor: 'pointer', fontFamily: 'inherit' }}
                  onClick={() => { setDrawerBatch(null); setActiveSection('my-batches'); }}
                >
                  Enter Classroom
                </button>
              ) : (
                <button
                  type="button"
                  style={{ flex: '1.5 1 150px', padding: '12px', background: '#3b82f6', border: 'none', borderRadius: '10px', fontWeight: 700, color: '#ffffff', cursor: 'pointer', fontFamily: 'inherit' }}
                  onClick={() => handleEnroll(drawerBatch.id)}
                  disabled={enrolling === drawerBatch.id}
                >
                  {enrolling === drawerBatch.id ? 'Processing...' : 'BUY BATCH NOW'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SBatches;
