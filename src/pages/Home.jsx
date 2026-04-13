import React from 'react'
import { Link } from 'react-router-dom'
import logoImg from '../assets/logo.png'
import heroImg from '../assets/hero.png'

const Home = () => {
  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner container">
          <div className="logo-container">
            <img src={logoImg} alt="Bright Steps Coaching Logo" className="logo-main" />
          </div>
          
          <div className="nav-actions">
            <Link to="/login" className="btn-login">
              LOGIN
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-content animate-up">
            <div className="pill">Learn From The Best</div>
            <h2>Top Students from <span>IIT PATNA & BHU</span></h2>
            <p className="hero-tagline">
              Build Strong Basics • Think Smart • Learn with Confidence. 
              We provide the ultimate foundation for your child's success.
            </p>
            
            <div className="feature-pills">
              <span className="pill">Grades II - X</span>
              <span className="pill">Interactive Learning</span>
              <span className="pill">AI & Computer Tech</span>
            </div>

            <button className="btn-primary">
              BOOK FREE DEMO
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>

          <div className="hero-image-container">
            <img src={heroImg} alt="Students learning" className="hero-image" />
            <div className="floating-card card-1">
              <div style={{color: 'var(--primary)', fontWeight: 'bold'}}>95% Success Rate</div>
              <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>In School Exams</div>
            </div>
            <div className="floating-card card-2">
              <div style={{color: 'var(--primary)', fontWeight: 'bold'}}>IITian Mentors</div>
              <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Guiding your future</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features section-padding">
        <div className="container">
          <div className="section-title">
            <h2>Our Core Offerings</h2>
            <p>Empowering the next generation of leaders</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
              </div>
              <h3>Expert Faculty</h3>
              <p>Learn directly from IIT Patna & BHU alumni who understand the nuances of competitive foundation.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              </div>
              <h3>Full Syllabus</h3>
              <p>Comprehensive coverage for Grades II to X, ensuring no gaps in fundamental concepts.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
              </div>
              <h3>Digital Native</h3>
              <p>Specialized modules for Computer Science and AI knowledge, preparing students for the future.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <h3>Admissions Open</h3>
              <p>Enroll now for the current session. Limited seats available for personalized attention.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container cta-banner">
          <div>
            <h2>Start Your Learning Journey Today</h2>
            <p style={{color: 'var(--primary)', opacity: 0.8}}>Join Bright Steps Coaching for the Best Results</p>
          </div>
          <button className="btn-primary" style={{backgroundColor: 'var(--primary)'}}>
            ENROLL NOW
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container footer-grid">
          <div className="footer-logo">
            <h2>BRIGHT STEPS</h2>
            <p style={{opacity: 0.6}}>The Foundation of Excellence</p>
          </div>
          <div className="footer-address">
            <h4>Location</h4>
            <p>Maharaja Hata, Gali No 3.</p>
            <p>Near Math Café</p>
          </div>
          <div className="footer-contact">
            <h4>Quick Links</h4>
            <p><Link to="/admin-login" style={{color: 'rgba(255,255,255,0.6)', textDecoration: 'none'}}>Admin Login</Link></p>
            <p>Phone: +91 62873 47004</p>
          </div>
        </div>
        <div className="container copyright">
          <p>© 2026 Bright Steps Coaching. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home
