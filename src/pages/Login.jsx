import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoImg from '../assets/logo.png'
import './Login.css'
import { apiFetch } from '../api'

const Login = () => {
  const [loginMethod, setLoginMethod] = useState('id') // 'id' or 'email'
  const [showPassword, setShowPassword] = useState(false)
  const [loginId, setLoginId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // OTP specific states
  const [otp, setOtp] = useState('')
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [timer, setTimer] = useState(0)
  const [otpLoading, setOtpLoading] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const navigate = useNavigate()

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const startTimer = () => {
    setTimer(30);
  };

  // Login ID + Password Auth
  const handleIdLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const response = await apiFetch('/auth/student-login', {
        method: 'POST',
        body: JSON.stringify({ loginId: loginId.trim(), password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('user_token', data.token);
        localStorage.setItem('student_data', JSON.stringify(data.student));
        navigate('/student-dashboard');
      } else {
        setErrorMsg(data.message || "Invalid Login ID or Password. Please try again.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setErrorMsg("Connection failure. Unable to reach server.");
    } finally {
      setLoading(false);
    }
  }

  // Request OTP Email Flow
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email) return;
    setOtpLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await apiFetch('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setShowOtpInput(true);
        startTimer();
        setSuccessMsg(data.message || "OTP code sent! Check your server logs.");
      } else {
        setErrorMsg(data.message || "Email address is not registered under any student.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to connect to OTP verification service.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP and Sign In
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!email || !otp) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await apiFetch('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() })
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        localStorage.setItem('user_token', data.token);
        localStorage.setItem('student_data', JSON.stringify(data.student));
        navigate('/student-dashboard');
      } else {
        setErrorMsg(data.message || "Incorrect verification code. Please check and try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Connection error. Could not verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-login-container light-theme">
      {/* Light Pastel Background Accents */}
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>
      <div className="bg-glow bg-glow-3"></div>

      {/* Floating Action Header */}
      <header className="login-header-actions">
        <Link to="/" className="btn-back-home">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Home
        </Link>
        <Link to="/admin-login" className="btn-switch-portal">
          Admin Portal
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        </Link>
      </header>

      <main className="login-card-wrapper">
        <div className="login-glass-card">
          
          {/* Logo & Subtitle */}
          <div className="login-brand-section">
            <div className="brand-logo-glow">
              <img src={logoImg} alt="Bright Steps" className="brand-logo" />
            </div>
            <h1 className="login-main-title">Student Login</h1>
            <p className="login-main-subtitle">Access your classes, materials, and learning schedules</p>
          </div>



          {/* Toggle Tab Swiper (only show if not in OTP input screen) */}
          {!showOtpInput && (
            <div className="login-method-switch">
              <button 
                type="button" 
                className={`method-btn ${loginMethod === 'id' ? 'active' : ''}`}
                onClick={() => {
                  setLoginMethod('id');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                Login ID
              </button>
              <button 
                type="button" 
                className={`method-btn ${loginMethod === 'email' ? 'active' : ''}`}
                onClick={() => {
                  setLoginMethod('email');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                Email Address
              </button>
              <div className={`method-slider-bg ${loginMethod}`} />
            </div>
          )}

          {/* Messages Alerts */}
          {errorMsg && (
            <div className="login-error-alert animate-fade-in">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="alert-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="login-success-alert animate-fade-in">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="success-alert-icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Login ID + Password Form */}
          {loginMethod === 'id' && (
            <form className="login-form-fields" onSubmit={handleIdLogin}>
              <div className="input-field-container">
                <label className="input-field-label">Student Login ID</label>
                <div className="input-field-wrapper">
                  <span className="input-field-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </span>
                  <input 
                    type="text" 
                    placeholder="Enter your student ID" 
                    value={loginId}
                    onChange={e => setLoginId(e.target.value)}
                    className="styled-text-input"
                    required
                  />
                </div>
              </div>

              <div className="input-field-container">
                <div className="label-with-aside">
                  <label className="input-field-label">Password</label>
                  <a href="#forgot" className="forgot-password-link" onClick={(e) => { e.preventDefault(); alert("Please contact the institute administrator to reset your password."); }}>Forgot?</a>
                </div>
                <div className="input-field-wrapper">
                  <span className="input-field-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </span>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="styled-text-input"
                    required
                  />
                  <button 
                    type="button" 
                    className="btn-toggle-password" 
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

              <div className="login-extra-options">
                <label className="remember-me-checkbox">
                  <input type="checkbox" className="styled-checkbox" />
                  <span>Keep me logged in</span>
                </label>
              </div>

              <button type="submit" className="btn-submit-login" disabled={loading}>
                {loading ? (
                  <div className="loader-spinner"></div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="submit-arrow"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Email OTP Login - Step 1: Input Email */}
          {loginMethod === 'email' && !showOtpInput && (
            <form className="login-form-fields" onSubmit={handleSendOtp}>
              <div className="input-field-container">
                <label className="input-field-label">Registered Email Address</label>
                <div className="input-field-wrapper">
                  <span className="input-field-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </span>
                  <input 
                    type="email" 
                    placeholder="student@example.com" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="styled-text-input"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-submit-login" disabled={otpLoading}>
                {otpLoading ? (
                  <div className="loader-spinner"></div>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="submit-arrow"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Email OTP Login - Step 2: Input Verification Code */}
          {loginMethod === 'email' && showOtpInput && (
            <form className="login-form-fields" onSubmit={handleVerifyOtp}>
              
              <div className="otp-sent-details">
                <p>We've sent a 6-digit OTP code to:</p>
                <strong>{email}</strong>
                <button type="button" className="btn-change-email" onClick={() => { setShowOtpInput(false); setOtp(''); setErrorMsg(''); setSuccessMsg(''); }}>
                  Change Email
                </button>
              </div>

              <div className="input-field-container">
                <label className="input-field-label">6-Digit Verification Code</label>
                <div className="input-field-wrapper">
                  <span className="input-field-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  </span>
                  <input 
                    type="text" 
                    placeholder="Enter 6-digit OTP" 
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="styled-text-input otp-digits-input"
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="otp-timer-action">
                {timer > 0 ? (
                  <span className="otp-countdown">Resend code in <strong>{timer}s</strong></span>
                ) : (
                  <button type="button" className="btn-resend-otp" onClick={() => handleSendOtp(null)} disabled={otpLoading}>
                    {otpLoading ? 'Sending...' : 'Resend Verification Code'}
                  </button>
                )}
              </div>

              <button type="submit" className="btn-submit-login" disabled={loading}>
                {loading ? (
                  <div className="loader-spinner"></div>
                ) : (
                  <>
                    <span>Verify & Sign In</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="submit-arrow"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer note */}
          <footer className="login-card-footer">
            <p>New student? Please reach out to our office desk to register and verify your details.</p>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default Login
