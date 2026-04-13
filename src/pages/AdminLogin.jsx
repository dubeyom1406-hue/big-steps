import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoImg from '../assets/logo.png'
import './AdminLogin.css'
import { apiFetch } from '../api'

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
        const response = await apiFetch('/auth/admin-login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            localStorage.setItem('admin_token', data.token);
            localStorage.setItem('admin_user', JSON.stringify(data.admin));
            navigate('/admin-dashboard');
        } else {
            alert(data.message || "Invalid Credentials.");
        }
    } catch (error) {
        console.error("Auth error:", error);
        alert(error.message);
    } finally {
        setIsLoggingIn(false);
    }
  }

  return (
    <div className="al-page">

      {/* ── LEFT PANEL ── */}
      <div className="al-left">

        {/* Animated background orbs */}
        <div className="al-orb al-orb-1"></div>
        <div className="al-orb al-orb-2"></div>

        {/* Floating particles */}
        <div className="al-particles">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`al-particle al-p${i + 1}`}></div>
          ))}
        </div>

        <div className="al-left-inner">
          {/* Shield icon with glow ring */}
          <div className="al-icon-wrap">
            <div className="al-icon-ring"></div>
            <span className="al-shield-icon">🛡️</span>
          </div>

          <h1 className="al-headline">
            <span className="al-hello">Admin,</span><br />
            <span className="al-brand-name">Portal Access</span>
            <span className="al-wave">🔐</span>
          </h1>

          <p className="al-sub">
            Secure administrative control center. Authorized faculty can manage classes, students, and curriculum records.
          </p>

          {/* Admin badges */}
          <div className="al-badges">
            <div className="al-badge">⚡ High Security</div>
            <div className="al-badge">📊 Data Manager</div>
            <div className="al-badge">🔑 Staff Only</div>
          </div>
        </div>

      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="al-right">
        <div className="al-form-wrap">

          <div className="al-wordmark">
            <img src={logoImg} alt="Bright Steps" className="al-logo" />
          </div>

          <h2 className="al-title">Staff Login <span>✦</span></h2>
          <p className="al-hint">
            Accessing the dashboard?&nbsp;
            <Link to="/login">Switch to Student Login</Link>
          </p>

          <form className="al-form" onSubmit={handleLogin}>
            <div className="al-input-group">
              <span className="al-in-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <input 
                className="al-input" 
                type="text" 
                placeholder="Admin Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="al-pass-wrap al-input-group">
              <span className="al-in-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <input
                className="al-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" className="al-eye" onClick={() => setShowPassword(!showPassword)}>
                {showPassword
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>

            <div className="al-form-row">
              <label className="al-check"><input type="checkbox" /> Secure Auth</label>
            </div>

            <button type="submit" className="al-btn-primary">
              Authorize Access
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </button>

            <div style={{marginTop: '30px', textAlign: 'center'}}>
               <Link to="/" style={{fontSize: '0.85rem', color: '#6b7280', textDecoration: 'none'}}>← Back to Homepage</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
