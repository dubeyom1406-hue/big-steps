import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './AdminDashboard.css'
import { apiFetch } from '../api'

const AdminDashboard = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalStudents: 0, revenue: 0, activeCourses: 12 })
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Get Stats (Protected)
      const statsRes = await apiFetch('/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 2. Get Recent Students (Protected)
      const studentsRes = await apiFetch('/students');
      if (studentsRes.ok) {
        const allStudents = await studentsRes.json();
        setStudents(allStudents.slice(0, 10));
      }

    } catch (error) {
      console.error("Error fetching dashboard data: ", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if(window.confirm("Delete this student record?")) {
      try {
        const response = await apiFetch(`/students/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            fetchData(); // Refresh stats
        }
      } catch (error) {
        console.error("Error deleting student: ", error);
        alert(error.message);
      }
    }
  }

  return (
      <main className="db-main" style={{ marginTop: '0' }}>
        <header className="db-header">
          <div className="db-header-left">
            <h1>Welcome, Admin</h1>
            <p>Here's what's happening at Bright Steps today.</p>
          </div>
          <div className="db-header-right">
            <div className="db-user-pill">
              <div className="db-user-avatar">AD</div>
              <span>Faculty Admin</span>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="db-stats-grid">
          <div className="db-stat-card">
            <div className="db-stat-icon">🎓</div>
            <div className="db-stat-info">
              <h3>{stats.totalStudents}</h3>
              <p>Total Students</p>
            </div>
          </div>
          <div className="db-stat-card">
            <div className="db-stat-icon">💰</div>
            <div className="db-stat-info">
              <h3>₹{stats.revenue}</h3>
              <p>Revenue</p>
            </div>
          </div>
          <div className="db-stat-card">
            <div className="db-stat-icon">📁</div>
            <div className="db-stat-info">
              <h3>{stats.activeCourses}</h3>
              <p>Active Courses</p>
            </div>
          </div>
        </section>

        {/* Recent Activity / Content Table Placeholder */}
        <section className="db-content-area">
          <div className="db-table-header">
            <h2>Recent Admissions</h2>
            <Link to="/admission" className="db-btn-add" style={{textDecoration: 'none'}}>+ New Admission</Link>
          </div>
          <div className="db-table-placeholder">
              <div className="db-table-row header">
                <span>Name</span><span>Class</span><span>Date</span><span>Action</span>
              </div>
              {students.length > 0 ? (
                students.slice(0, 10).map(s => (
                  <div key={s.id} className="db-table-row">
                    <span className="db-student-name">{s.studentName}</span>
                    <span>Grade {s.classGrade}</span>
                    <span>{s.registrationDate}</span>
                    <div className="db-table-actions">
                      <button className="db-btn-edit">View</button>
                      <button className="db-btn-delete" onClick={() => handleDelete(s.id)}>Delete</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="db-no-data">No admissions yet. Add some from the Admission Form!</div>
              )}
          </div>
        </section>
      </main>
  )
}

export default AdminDashboard
