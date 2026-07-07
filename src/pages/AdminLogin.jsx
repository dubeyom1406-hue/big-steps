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
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setErrorMsg('');
    
    try {
        const response = await apiFetch('/auth/admin-login', {
          method: 'POST',
          body: JSON.stringify({ username: username.trim(), password })
        });

        // Defensive: ensure the server returned JSON before calling .json()
        const ct = response.headers.get('content-type') || '';
        let data;
        if (ct.includes('application/json')) {
          data = await response.json();
        } else {
          // Non-JSON (likely HTML error page) — read text for diagnostics
          const text = await response.text();
          throw new Error(`Server returned non-JSON response (status ${response.status}): ${text.slice(0,200)}`);
        }

        if (response.ok && data.success) {
          localStorage.setItem('admin_token', data.token);
          localStorage.setItem('admin_user', JSON.stringify(data.admin));
          navigate('/admin-dashboard');
        } else {
          setErrorMsg(data.message || "Invalid credentials. Please contact administration if you forgot details.");
        }
    } catch (error) {
        console.error("Auth error:", error);
        setErrorMsg(error.message || "Authentication failed. Server could not be reached.");
    } finally {
        setIsLoggingIn(false);
    }
  }

  return (
    <div className="new-admin-container light-theme">
      {/* Security Cyber Glows */}
      <div className="admin-glow admin-glow-1"></div>
      <div className="admin-glow admin-glow-2"></div>

      {/* Floating Header Actions */}
      <header className="admin-header-actions">
        <Link to="/" className="btn-admin-back-home">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Home
        </Link>
        <Link to="/login" className="btn-switch-student-portal">
          Student Portal
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </Link>
      </header>

      <main className="admin-card-wrapper">
        <div className="admin-glass-card">
          
          {/* Badge indicator */}
          <div className="admin-security-badge">
            <span className="security-pulse"></span>
            <span>SECURE GATEWAY</span>
          </div>

          {/* Logo & Subtitle */}
          <div className="admin-brand-section">
            <div className="admin-logo-glow">
              <img src={logoImg} alt="Bright Steps" className="admin-logo" />
            </div>
            <h1 className="admin-main-title">Admin Control</h1>
            <p className="admin-main-subtitle">Access student rosters, subject planning & analytics</p>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="admin-error-alert animate-fade-in">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="alert-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form className="admin-form-fields" onSubmit={handleLogin}>
            
            {/* Username Input */}
            <div className="admin-input-container">
              <label className="admin-input-label">Admin Username</label>
              <div className="admin-input-wrapper">
                <span className="admin-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </span>
                <input 
                  type="text" 
                  placeholder="Enter username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="styled-admin-input"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="admin-input-container">
              <label className="admin-input-label">Security Password</label>
              <div className="admin-input-wrapper">
                <span className="admin-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </span>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="styled-admin-input"
                  required
                />
                <button 
                  type="button" 
                  className="btn-admin-toggle-password" 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Authenticate Button */}
            <button type="submit" className="btn-submit-admin" disabled={isLoggingIn}>
              {isLoggingIn ? (
                <div className="admin-loader-spinner"></div>
              ) : (
                <>
                  <span>Authorize Access</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="admin-submit-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </>
              )}
            </button>
          </form>

          {/* Secure details */}
          <footer className="admin-card-footer">
            <p>Access requires valid faculty credentials. Session logs are monitored for auditing.</p>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default AdminLogin
