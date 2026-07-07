import React from 'react';
import '../StudentPortal.css';

const STest = ({ studentData }) => {
  const enrolled = studentData?.enrolledBatches || [];

  // Mock list of tests assigned
  const mockTests = [
    { title: 'Weekly Assessment Test - Physics', duration: '45 mins', marks: '50 marks', status: 'Good', dotClass: 'good' },
    { title: 'Trigonometry board level test', duration: '60 mins', marks: '100 marks', status: 'Behind', dotClass: 'behind' },
    { title: 'Mock Test Series - Biology', duration: '90 mins', marks: '200 marks', status: 'Good', dotClass: 'good' },
  ];

  return (
    <div className="sp-page">
      {/* ── Heading ── */}
      <div className="te-dashboard-greeting" style={{ marginBottom: '24px' }}>
        <h2>Test Series</h2>
        <p>Complete assigned assessments and track your test progress.</p>
      </div>

      {enrolled.length === 0 ? (
        <div className="sp-empty">
          <div className="sp-empty-icon">📝</div>
          <h3>No Tests Available</h3>
          <p>Enroll in a batch to access test series.<br />Tests will appear here once assigned by your instructor.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Assessment List Table */}
          <div className="te-activities-card" style={{ padding: '24px' }}>
            <h3 className="sp-section-title" style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>
              Assigned Assessments
            </h3>

            <div className="te-table-wrap">
              <table className="te-table">
                <thead>
                  <tr>
                    <th>Exam Assessment</th>
                    <th>Time Duration</th>
                    <th>Total Marks</th>
                    <th>Performance Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTests.map((row, i) => (
                    <tr key={i}>
                      <td data-label="Test">
                        <div className="te-student-cell">
                          <div className="te-student-pic" style={{ background: '#eff6ff', color: '#3b82f6', fontSize: '18px' }}>
                            ✍️
                          </div>
                          <div className="te-student-name-block">
                            <strong>{row.title}</strong>
                          </div>
                        </div>
                      </td>
                      <td data-label="Duration" style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                        {row.duration}
                      </td>
                      <td data-label="Marks" style={{ fontSize: '13px', fontWeight: 650, color: '#0f172a' }}>
                        {row.marks}
                      </td>
                      <td data-label="Status">
                        <span className={`te-status-badge ${row.dotClass}`}>
                          <span className="te-status-dot" />
                          {row.status}
                        </span>
                      </td>
                      <td data-label="Action">
                        <button
                          type="button"
                          onClick={() => alert(`Attempting ${row.title}...`)}
                          style={{
                            border: 'none',
                            background: '#10b981',
                            color: '#fff',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          Start Exam
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Premium banner at bottom */}
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            borderRadius: '24px',
            padding: '48px 32px',
            textAlign: 'center',
            color: '#fff',
            boxShadow: 'var(--sp-shadow-lg)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🚀</div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.5px' }}>Assessment Center</h2>
            <p style={{ opacity: 0.9, fontSize: 14, lineHeight: 1.6, maxWidth: 440, margin: '0 auto', fontWeight: '400' }}>
              We are finalizing an amazing interactive examination module. Soon you can attempt timed tests, check solutions, and analyze your performance rank.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default STest;
