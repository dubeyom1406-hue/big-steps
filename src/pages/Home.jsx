import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import logoImg from '../assets/logo.png'
import './LandingPage.css'

// ── Scroll Reveal Hook ──
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('visible'); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

// ── Scroll Reveal Component ──
function Reveal({ children, className = '', delay = '' }) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`lp-reveal ${delay} ${className}`}>
      {children}
    </div>
  );
}

// ── Data ──
const programs = [
  {
    label: 'Grades II – V', labelColor: 'indigo',
    icon: '🌱', iconBg: 'bg-indigo',
    title: 'Foundation Builders',
    desc: 'Lay the strongest academic base with interactive lessons covering Maths, EVS, English and Hindi. Small batches ensure personal attention.',
    tags: ['Maths', 'EVS', 'English', 'Hindi', 'Reasoning'],
    featured: false,
  },
  {
    label: 'Grades VI – X', labelColor: 'yellow',
    icon: '🚀', iconBg: 'bg-yellow',
    title: 'Board Excellence Program',
    desc: 'Structured board preparation with chapter-wise notes, mock tests, and doubt-clearing sessions. Score above 90% with confidence.',
    tags: ['Science', 'Maths', 'Social', 'Languages', 'Mock Tests'],
    featured: true,
  },
  {
    label: 'All Grades', labelColor: 'teal',
    icon: '💻', iconBg: 'bg-teal',
    title: 'Coding & Digital Skills',
    desc: 'Future-ready coding curriculum including Python, Scratch, logical thinking and AI basics. Designed for students who want to lead tomorrow.',
    tags: ['Python', 'Scratch', 'AI Basics', 'Logic', 'Projects'],
    featured: false,
  },
];

const features = [
  {
    icon: '👨‍🏫', box: 'y',
    title: 'Expert & Caring Educators',
    desc: "Our teachers are passionate about nurturing each student's curiosity. Friendly, supportive, and highly qualified.",
  },
  {
    icon: '📊', box: 'i',
    title: 'Progress Tracked, Every Step',
    desc: 'Regular assessments and parent-friendly progress reports keep everyone aligned and motivated.',
  },
  {
    icon: '🧠', box: 't',
    title: 'Concept-First Approach',
    desc: 'We believe in understanding over memorisation. Every topic is taught from first principles.',
  },
  {
    icon: '📚', box: 'o',
    title: 'Rich Study Materials',
    desc: 'Custom notes, digital materials, and practice sets — everything curated specifically for the curriculum.',
  },
];

const testimonials = [
  {
    quote: "My daughter struggled with Maths since Grade III. After joining Bright Steps, she not only cleared her board exam but topped her school. The teachers are incredible.",
    name: 'Priya Sharma',
    role: 'Parent · Grade X Student',
    initials: 'PS',
    gradient: 'linear-gradient(135deg, #4361EE, #06D6A0)',
  },
  {
    quote: "The coding classes are amazing! My son now builds his own small games and is so excited about technology. This has opened a new world for him.",
    name: 'Rakesh Mishra',
    role: 'Parent · Grade VII Student',
    initials: 'RM',
    gradient: 'linear-gradient(135deg, #FFD200, #FF8C00)',
  },
  {
    quote: "What sets Bright Steps apart is how they truly care. The batch sizes are small, the attention is personal, and the results speak for themselves.",
    name: 'Sunita Verma',
    role: 'Parent · Grades IV & VI Students',
    initials: 'SV',
    gradient: 'linear-gradient(135deg, #FF8C00, #ff4d6d)',
  },
];

// ── Main Component ──
const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [enquiry, setEnquiry] = useState({
    studentName: '',
    phone: '',
    grade: '',
    subject: '',
    message: ''
  });

  const handleEnquirySubmit = (e) => {
    e.preventDefault();
    const to = "brightstepsfoundationclasses@gmail.com";
    const subject = `Admission Enquiry for ${enquiry.studentName}`;
    const body = `Hello Bright Steps Team,

I would like to make an enquiry for admission. Here are the details:

- Student Name: ${enquiry.studentName}
- Parent's Phone: ${enquiry.phone}
- Class/Grade: ${enquiry.grade || 'Not Selected'}
- Preferred Subject: ${enquiry.subject || 'Not Selected'}
- Message: ${enquiry.message || 'None'}

Please reach out to me.

Thank you!`;

    const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  // Splash screen logic
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => {
      setFadeOut(true);
      const remove = setTimeout(() => {
        setShowSplash(false);
        document.body.style.overflow = '';
      }, 600);
      return () => clearTimeout(remove);
    }, 2000);
    return () => { clearTimeout(timer); document.body.style.overflow = ''; };
  }, []);

  // Navbar scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* ── SPLASH SCREEN ── */}
      {showSplash && (
        <div className={`splash-container ${fadeOut ? 'fade-out' : ''}`}>
          <div className="splash-logo-wrapper">
            <div className="splash-glow"></div>
            <img src={logoImg} alt="Bright Steps Logo" className="splash-logo" />
          </div>
        </div>
      )}

      <div className="lp-root">

        {/* ══════════════════════════════
            NAVBAR
        ══════════════════════════════ */}
        <nav className={`lp-nav ${scrolled ? 'lp-nav-scrolled' : ''}`}>
          <div className="lp-nav-inner">
            <img src={logoImg} alt="Bright Steps Coaching" className="lp-logo" />

            {/* Desktop Links */}
            <div className="lp-nav-links">
              <Link to="/login" className="lp-nav-btn lp-btn-attractive-gradient">
                ✦ Student Login
              </Link>
            </div>

            {/* Hamburger */}
            <div
              className={`lp-hamburger ${isMenuOpen ? 'open' : ''}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`lp-mobile-menu ${isMenuOpen ? 'open' : ''}`}>
            <Link to="/login" className="lp-nav-btn lp-btn-attractive-gradient" style={{ textAlign: 'center', justifyContent: 'center' }}
              onClick={() => setIsMenuOpen(false)}>
              ✦ Student Login
            </Link>
          </div>
        </nav>

        {/* ══════════════════════════════
            HERO SECTION
        ══════════════════════════════ */}
        <section className="lp-hero">
          <div className="lp-hero-bg">
            <div className="lp-hero-grid-pattern"></div>
          </div>

          {/* Floating orbs */}
          <div className="lp-float-orb lp-orb-1"></div>
          <div className="lp-float-orb lp-orb-2"></div>

          <div className="lp-container">
            <div className="lp-hero-inner">

              {/* Left: Content */}
              <div className="lp-hero-content">
                <div className="lp-hero-badge">
                  <span className="lp-hero-badge-dot"></span>
                  Admissions Open · 2025–26 Session
                </div>

                <h1 className="lp-hero-title">
                  Where Strong{' '}
                  <span className="lp-underline-word">Foundations</span>
                  <br />
                  Build{' '}
                  <span className="lp-highlight">Bright Futures</span>
                </h1>

                <p className="lp-hero-desc">
                  Bright Steps Coaching Centre — a place where students from Grade II to X discover
                  the joy of learning. Expert teachers, small batches, personalised attention,
                  and a proven approach to academic excellence.
                </p>

                <div className="lp-hero-actions">
                  <Link to="/login" className="lp-btn-hero-primary">
                    Get Started Free
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </Link>
                  <a href="#programs" className="lp-btn-hero-secondary">
                    Explore Programs
                  </a>
                </div>

                <div className="lp-hero-trust">
                  <div className="lp-trust-avatars">
                    {['RS', 'MP', 'AK', 'SK'].map((init, i) => (
                      <div key={i} className="lp-trust-avatar" style={{ zIndex: 4 - i,
                        background: ['linear-gradient(135deg,#4361EE,#06D6A0)', 'linear-gradient(135deg,#FFD200,#FF8C00)',
                          'linear-gradient(135deg,#FF8C00,#ff4d6d)', 'linear-gradient(135deg,#06D6A0,#4361EE)'][i] }}>
                        {init}
                      </div>
                    ))}
                  </div>
                  <div className="lp-trust-text">
                    <strong>500+ students</strong> are already learning<br />
                    with Bright Steps this year ⭐
                  </div>
                </div>
              </div>

              {/* Right: Visual card */}
              <div className="lp-hero-visual">
                <div className="lp-hero-card">
                  <div className="lp-grade-list">
                    {[
                      { icon: '🌱', color: 'yellow', title: 'Foundation Programme', sub: 'Grades II – V', badge: 'Seats Open' },
                      { icon: '🚀', color: 'indigo', title: 'Board Excellence', sub: 'Grades VI – X', badge: 'Seats Open' },
                      { icon: '💻', color: 'teal', title: 'Coding & Digital Skills', sub: 'All Grades', badge: 'New Batch' },
                      { icon: '📐', color: 'orange', title: 'Speed Maths Crash Course', sub: 'Grades IV – VIII', badge: 'Weekend' },
                    ].map((item, i) => (
                      <div key={i} className="lp-grade-item">
                        <div className={`lp-grade-icon ${item.color}`}>{item.icon}</div>
                        <div className="lp-grade-info">
                          <h4>{item.title}</h4>
                          <span>{item.sub}</span>
                        </div>
                        <div className="lp-grade-badge">{item.badge}</div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>



        {/* ══════════════════════════════
            PROGRAMS SECTION
        ══════════════════════════════ */}
        <section className="lp-programs" id="programs">
          <div className="lp-container">
            <Reveal className="lp-section-header">
              <div className="lp-section-tag">Our Programs</div>
              <h2 className="lp-section-title">
                Learning Paths for Every{' '}
                <span className="lp-highlight">Young Mind</span>
              </h2>
              <p className="lp-section-subtitle">
                From building the basics to cracking boards and learning to code — we have a
                carefully crafted programme that fits your child's needs.
              </p>
            </Reveal>

            <div className="lp-programs-grid">
              {programs.map((prog, i) => (
                <Reveal key={i} delay={`lp-reveal-delay-${i + 1}`}>
                  <div className={`lp-program-card ${prog.featured ? 'featured' : ''}`}>
                    <div className={`lp-program-label ${prog.labelColor}`}>{prog.label}</div>
                    <div className={`lp-program-icon ${prog.iconBg}`}>{prog.icon}</div>
                    <h3>{prog.title}</h3>
                    <p>{prog.desc}</p>
                    <div className="lp-program-tags">
                      {prog.tags.map((tag, j) => (
                        <span key={j} className="lp-program-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════
            WHY CHOOSE US
        ══════════════════════════════ */}
        <section className="lp-features">
          <div className="lp-container">
            <div className="lp-features-inner">

              {/* Left — Checklist */}
              <Reveal className="lp-features-left">
                <div className="lp-section-tag">Why Bright Steps</div>
                <h2>
                  Teaching That Goes{' '}
                  <span style={{ background: 'linear-gradient(135deg,#FFD200,#FF8C00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Beyond Textbooks
                  </span>
                </h2>
                <p>
                  We don't just prepare students for exams. We inspire a lifelong love of learning.
                  Our structured, concept-driven approach ensures every child walks in curious and
                  walks out confident.
                </p>
                <div className="lp-check-list">
                  {features.map((f, i) => (
                    <div key={i} className="lp-check-item">
                      <div className="lp-check-icon">✓</div>
                      <div className="lp-check-text">
                        <h4>{f.icon} {f.title}</h4>
                        <p>{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>

              {/* Right — Dark Feature Card */}
              <Reveal className="lp-reveal-delay-2">
                <div className="lp-feature-dark-card">
                  <div className="lp-fdc-header">
                    <div className="lp-fdc-badge">✦ OUR APPROACH</div>
                    <h3>What Makes Us Different</h3>
                    <p>A coaching that truly cares about every child's growth — not just marks.</p>
                  </div>
                  <div className="lp-fdc-list">
                    {[
                      { icon: '👨‍🏫', text: 'Small batches — personal attention for every student' },
                      { icon: '📐', text: 'Concept-first teaching, not rote learning' },
                      { icon: '📊', text: 'Regular tests & parent progress updates' },
                      { icon: '📚', text: 'Custom notes & digital study materials' },
                      { icon: '💻', text: 'Coding & AI skills for future-ready students' },
                      { icon: '❤️', text: 'Friendly, supportive & passionate educators' },
                    ].map((item, i) => (
                      <div key={i} className="lp-fdc-item">
                        <span className="lp-fdc-emoji">{item.icon}</span>
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="lp-fdc-footer">
                    <span>📍 Maharaja Hata, Gali No. 3 &nbsp;·&nbsp; 📞 <a href="tel:+916287347004" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 'bold' }}>+91 62873 47004</a></span>
                  </div>
                </div>
              </Reveal>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════
            ENQUIRY SECTION
        ══════════════════════════════ */}
        <section className="lp-enquiry">
          <div className="lp-container">
            <Reveal className="lp-section-header">
              <div className="lp-section-tag">Get In Touch</div>
              <h2 className="lp-section-title">
                Book a{' '}
                <span className="lp-highlight">Free Demo Class</span>
              </h2>
              <p className="lp-section-subtitle">
                Interested? Drop your details below and we'll reach out to schedule a free demo session for your child.
              </p>
            </Reveal>

            <Reveal className="lp-reveal-delay-1">
              <div className="lp-enquiry-card">
                <div className="lp-enquiry-left">
                  <h3>📍 Visit Us</h3>
                  <p>Maharaja Hata, Gali No. 3<br />Near Math Café</p>
                  <h3>📞 Call Us</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    <a href="tel:+916287347004" style={{ textDecoration: 'none', color: '#ffffff', fontWeight: 'bold' }}>📞 +91 62873 47004</a>
                    <a href="tel:+919504961730" style={{ textDecoration: 'none', color: '#ffffff', fontWeight: 'bold' }}>📞 +91 95049 61730</a>
                    <a href="tel:+919931426338" style={{ textDecoration: 'none', color: '#ffffff', fontWeight: 'bold' }}>📞 +91 99314 26338</a>
                  </div>
                  <h3>🕐 Class Timings</h3>
                  <div className="lp-timing-list">
                    <div className="lp-timing-item">
                      <span>Evening Batch</span><span>4:00 PM – 6:00 PM</span>
                    </div>
                  </div>
                </div>

                <form className="lp-enquiry-form" onSubmit={handleEnquirySubmit}>
                  <div className="lp-form-row">
                    <div className="lp-form-group">
                      <label>Student Name</label>
                      <input 
                        type="text" 
                        placeholder="Enter student's name" 
                        value={enquiry.studentName}
                        onChange={e => setEnquiry({...enquiry, studentName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="lp-form-group">
                      <label>Parent's Phone</label>
                      <input 
                        type="tel" 
                        placeholder="+91 XXXXX XXXXX" 
                        value={enquiry.phone}
                        onChange={e => setEnquiry({...enquiry, phone: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="lp-form-row">
                    <div className="lp-form-group">
                      <label>Class / Grade</label>
                      <select 
                        value={enquiry.grade}
                        onChange={e => setEnquiry({...enquiry, grade: e.target.value})}
                      >
                        <option value="">Select Grade</option>
                        {['Grade II','Grade III','Grade IV','Grade V','Grade VI','Grade VII','Grade VIII','Grade IX','Grade X'].map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                    <div className="lp-form-group">
                      <label>Preferred Subject</label>
                      <select 
                        value={enquiry.subject}
                        onChange={e => setEnquiry({...enquiry, subject: e.target.value})}
                      >
                        <option value="">Select Subject</option>
                        {['Mathematics','Science','English','Hindi','Social Science','Computer / Coding','All Subjects'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="lp-form-group">
                    <label>Message (Optional)</label>
                    <textarea 
                      placeholder="Any specific requirement or question?" 
                      rows={3}
                      value={enquiry.message}
                      onChange={e => setEnquiry({...enquiry, message: e.target.value})}
                    ></textarea>
                  </div>
                  <button type="submit" className="lp-btn-hero-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Send Enquiry
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </form>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══════════════════════════════
            CTA SECTION
        ══════════════════════════════ */}
        <section className="lp-cta">
          <div className="lp-container">
            <Reveal>
              <div className="lp-cta-inner">
                <div className="lp-cta-glow"></div>
                <div className="lp-cta-tag">Limited Seats Available</div>
                <h2>
                  Give Your Child the<br />
                  <span style={{ background: 'linear-gradient(135deg,#FFD200,#FF8C00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Head Start They Deserve
                  </span>
                </h2>
                <p>
                  Join Bright Steps today. Book a free demo session and experience the difference
                  quality teaching makes.
                </p>
                <div className="lp-cta-actions">
                  <Link to="/login" className="lp-btn-cta-primary">
                    Book Free Demo Session
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </Link>
                  <a href="tel:+916287347004" className="lp-btn-cta-secondary">
                    📞 Call Us Now
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══════════════════════════════
            FOOTER
        ══════════════════════════════ */}
        <footer className="lp-footer">
          <div className="lp-container">
            <div className="lp-footer-grid">

              {/* Brand */}
              <div className="lp-footer-brand">
                <img src={logoImg} alt="Bright Steps Logo" />
                <p>
                  Bright Steps Coaching Centre — nurturing young minds in Maharaja Hata
                  with quality education for Grades II to X and digital skills.
                </p>
                <div className="lp-footer-social">
                  {['📘', '📸', '▶️', '📞'].map((icon, i) => (
                    <a key={i} href="#" className="lp-social-btn">{icon}</a>
                  ))}
                </div>
              </div>

              {/* Programs */}
              <div className="lp-footer-col">
                <h4>Programs</h4>
                <ul>
                  <li><a href="#programs">Foundation (Gr. II–V)</a></li>
                  <li><a href="#programs">Board Prep (Gr. VI–X)</a></li>
                  <li><a href="#programs">Coding & AI Basics</a></li>
                  <li><a href="#programs">Speed Maths</a></li>
                </ul>
              </div>

              {/* Portal */}
              <div className="lp-footer-col">
                <h4>Portal</h4>
                <ul>
                  <li><Link to="/login">Student Login</Link></li>
                </ul>
              </div>

              {/* Contact */}
              <div className="lp-footer-col">
                <h4>Contact</h4>
                <ul>
                  <li><a href="tel:+916287347004">📞 +91 62873 47004</a></li>
                  <li><a href="tel:+919504961730">📞 +91 95049 61730</a></li>
                  <li><a href="tel:+919931426338">📞 +91 99314 26338</a></li>
                  <li><a href="#">Maharaja Hata, Gali No. 3</a></li>
                  <li><a href="#">Near Math Café</a></li>
                </ul>
              </div>

            </div>

            <div className="lp-footer-bottom">
              <span>© 2026 Bright Steps Coaching. All rights reserved.</span>
              <div className="lp-footer-bottom-right">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Use</a>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
};

export default Home;
