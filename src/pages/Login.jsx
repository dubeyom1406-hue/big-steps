import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoImg from '../assets/logo.png'
import './Login.css'
import { apiFetch } from '../api'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
        const response = await apiFetch('/auth/student-login', {
            method: 'POST',
            body: JSON.stringify({ loginId, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            localStorage.setItem('user_token', data.token);
            localStorage.setItem('student_data', JSON.stringify(data.student));
            alert(`Welcome back, ${data.student.studentName}!`);
            navigate('/student-dashboard');
        } else {
            alert(data.message || "Login failed. Check Login ID and Password.");
        }

    } catch (err) {
      console.error("Login Error:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sl-page">

      {/* ── LEFT PANEL ── */}
      <div className="sl-left">

        {/* Animated background orbs */}
        <div className="sl-orb sl-orb-1"></div>
        <div className="sl-orb sl-orb-2"></div>
        <div className="sl-orb sl-orb-3"></div>


        {/* Floating particles */}
        <div className="sl-particles">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`sl-particle sl-p${i + 1}`}></div>
          ))}
        </div>

        <div className="sl-left-inner">
          {/* Book icon with glow ring */}
          <div className="sl-icon-wrap">
            <div className="sl-icon-ring"></div>
            <span className="sl-book-icon">🕮</span>
          </div>

          <h1 className="sl-headline">
            <span className="sl-hello">Hello,</span><br />
            <span className="sl-brand-name">Bright Steps</span>
            <span className="sl-wave">👋</span>
          </h1>

          <p className="sl-sub">
            Expert faculty from&nbsp;
            <span className="sl-highlight">IIT Patna & BHU</span>.
            Build strong basics, think smart and learn with confidence.
          </p>

          {/* Feature badges */}
          <div className="sl-badges">
            <div className="sl-badge">🎓 IIT Faculty</div>
            <div className="sl-badge">📚 Grades II – X</div>
            <div className="sl-badge">🤖 AI & Tech</div>
          </div>
        </div>

      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="sl-right">
        <div className="sl-form-wrap">

          <div className="sl-wordmark">
            <img src={logoImg} alt="Bright Steps" className="sl-logo" />
          </div>

          <h2 className="sl-title">Welcome Back! <span>✦</span></h2>
          <p className="sl-hint">
            New student?&nbsp;
            <a href="#">Contact our office to register.</a>
          </p>

          <form className="sl-form" onSubmit={handleStudentLogin}>
            <div className="sl-input-group">
              <span className="sl-in-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <input 
                className="sl-input" 
                type="text" 
                placeholder="Student Login ID" 
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                required
              />
            </div>

            <div className="sl-pass-wrap sl-input-group">
              <span className="sl-in-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <input
                className="sl-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Student Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" className="sl-eye" onClick={() => setShowPassword(!showPassword)}>
                {showPassword
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>

            <div className="sl-form-row">
              <label className="sl-check"><input type="checkbox" /> Remember me</label>
              <a href="#" className="sl-forgot-link">Forgot Password?</a>
            </div>

            <button type="submit" className="sl-btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login Now'}
              {!loading && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
