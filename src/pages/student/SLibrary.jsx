import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api';
import BASE_URL from '../../api';
import '../StudentPortal.css';

const SLibrary = ({ studentData }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [activeSubject, setActiveSubject] = useState('All');

  useEffect(() => {
    fetchMaterials();
  }, [studentData]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const classGrade = studentData?.classGrade;
      const url = classGrade ? `/materials?classGrade=${classGrade}` : '/materials';
      const res = await apiFetch(url);
      if (res.ok) setMaterials(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // Compute unique subjects dynamically
  const subjectsList = ['All', ...new Set(materials.map(m => m.subject).filter(Boolean))];

  const filtered = materials.filter(m => {
    const matchesSearch = m.title?.toLowerCase().includes(search.toLowerCase()) ||
                          m.subject?.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = activeSubject === 'All' || m.subject === activeSubject;
    return matchesSearch && matchesSubject;
  });

  const getFileIcon = (name = '') => {
    if (name.toLowerCase().includes('drive') || name.startsWith('http')) return '🔗';
    const ext = name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return '📄';
    if (['jpg','jpeg','png','gif','webp'].includes(ext)) return '🖼️';
    if (['mp4','mkv','avi'].includes(ext)) return '🎥';
    return '📁';
  };

  const getFileLabel = (name = '') => {
    if (name.toLowerCase().includes('drive') || name.startsWith('http')) return 'LINK';
    const ext = name.split('.').pop().toUpperCase();
    return ext || 'FILE';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px', color: '#64748b' }}>
        <div className="sp-spinner" style={{ margin: '0 auto 16px' }}></div>
        Loading study materials...
      </div>
    );
  }

  return (
    <div className="sp-page">
      {/* ── Heading ── */}
      <div className="te-dashboard-greeting" style={{ marginBottom: '24px' }}>
        <h2>Library Feed</h2>
        <p>Access reference documents, worksheets, and lecture notes.</p>
      </div>

      {/* ── Search bar ── */}
      <div className="lib-search-bar" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px', marginBottom: '16px', boxShadow: 'var(--sp-shadow-sm)' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          type="text"
          placeholder="Search reference notes by title or subject keyword..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '14px', color: '#0f172a', fontFamily: 'inherit' }}
        />
      </div>

      {/* ── Subject Chips ── */}
      {subjectsList.length > 1 && (
        <div className="sp-filter-chips" style={{ marginBottom: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {subjectsList.map(subj => (
            <button
              type="button"
              key={subj}
              onClick={() => setActiveSubject(subj)}
              className={`sp-chip ${activeSubject === subj ? 'active' : ''}`}
            >
              {subj}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="sp-empty">
          <div className="sp-empty-icon">📚</div>
          <h3>{search || activeSubject !== 'All' ? 'No matching materials' : 'No Study Materials'}</h3>
          <p>Try modifying your search query or subject filters.</p>
        </div>
      ) : (
        <div className="te-activities-card" style={{ padding: '24px' }}>
          <div className="te-table-wrap">
            <table className="te-table">
              <thead>
                <tr>
                  <th>Material Document</th>
                  <th>Subject</th>
                  <th>Grade Access</th>
                  <th>File Format</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id}>
                    <td data-label="Document">
                      <div className="te-student-cell">
                        <div className="te-student-pic" style={{ background: '#eff6ff', color: '#3b82f6', fontSize: '18px' }}>
                          {getFileIcon(m.originalName || m.fileUrl)}
                        </div>
                        <div className="te-student-name-block">
                          <strong style={{ fontSize: '14px', color: '#0f172a' }}>{m.title}</strong>
                        </div>
                      </div>
                    </td>
                    <td data-label="Subject">
                      <span className="batch-card-badge" style={{ background: '#eff6ff', color: '#3b82f6', fontWeight: '700' }}>
                        {m.subject}
                      </span>
                    </td>
                    <td data-label="Grade" style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>
                      Class {Array.isArray(m.classes) ? m.classes.join(', ') : m.classes}
                    </td>
                    <td data-label="Format" style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>
                      {getFileLabel(m.originalName || m.fileUrl)}
                    </td>
                    <td data-label="Action">
                      <a
                        href={m.fileUrl?.startsWith('http') ? m.fileUrl : `${BASE_URL.endsWith('/api') ? BASE_URL.slice(0, -4) : BASE_URL}${m.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          textDecoration: 'none',
                          background: '#3b82f6',
                          color: '#fff',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        {m.fileUrl?.startsWith('http') ? 'Open Link' : 'Download PDF'}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SLibrary;
