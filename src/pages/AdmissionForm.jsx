import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logoImg from '../assets/logo.png'
import './AdmissionForm.css'
import { apiFetch } from '../api'

const AdmissionForm = () => {
  const [form, setForm] = useState({
    studentName: '', fatherName: '', motherName: '',
    dob: '', gender: '', classGrade: '', schoolName: '',
    address: '', mobile: '', guardianName: '', guardianMobile: '', email: '',
    loginId: '', password: '',
    subjects: { math: false, english: false, science: false, sst: false, gk: false, hindi: false, allSubjects: false },
    batchTiming: '', days: '', admissionDate: '',
    admissionFee: '', monthlyFee: '', totalPaid: '', paymentMode: '',
    receiptNo: '', receiptDate: '', receivedFrom: '',
    receiptFor: { admissionFee: false, monthlyFee: false, other: false },
    receiptOther: '', amountPaid: '', receiptPaymentMode: '', amountInWords: '',
    photo: '', signature: '',
  })

  const [printFilter, setPrintFilter] = useState('all'); // 'all', 'form', 'receipt'
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.studentData) {
      const s = location.state.studentData;
      setForm({
        ...s,
        subjects: s.subjects || { math: false, english: false, science: false, sst: false, gk: false, hindi: false, allSubjects: false },
        receiptFor: s.receiptFor || { admissionFee: false, monthlyFee: false, other: false },
      });

      if (location.state.mode) {
        setPrintFilter(location.state.mode);
      }
    }
  }, [location.state]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setSubject = (key) => setForm(f => ({ ...f, subjects: { ...f.subjects, [key]: !f.subjects[key] } }))
  const setReceiptFor = (key) => setForm(f => ({ ...f, receiptFor: { ...f.receiptFor, [key]: !f.receiptFor[key] } }))

  const handleFileChange = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        set(key, reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  const handlePrint = (filter) => {
    setPrintFilter(filter)
    setTimeout(() => {
      window.print()
      setPrintFilter('all') // Reset after print dialog opens
    }, 100)
  }

  // UPDATED: Save or Update Student via Node.js Backend API
  const handleSaveStudent = async () => {
    if(!form.studentName) {
      alert("Please enter Student name!")
      return
    }
    
    setIsSaving(true);
    try {
      const isUpdate = !!form.id;
      const studentPayload = {
        ...form,
        registrationDate: form.registrationDate || new Date().toLocaleDateString('en-GB'), // Keep old or set new
      };

      const url = isUpdate ? `/students/${form.id}` : '/students';
      const method = isUpdate ? 'PUT' : 'POST';

      const response = await apiFetch(url, {
          method: method,
          body: JSON.stringify(studentPayload)
      });

      const data = await response.json();

      if (response.ok) {
          setShowModal(true);
      } else {
          alert(`Backend Error: ${data.message || "Failed to save data"}`);
      }
    } catch (error) {
      console.error("Admission Save Error:", error);
      alert(error.message);
    } finally {
      setIsSaving(false);
    }
  }


  const handleCloseModal = () => {
    setShowModal(false);
    // Clear the form only after they close the modal
    setForm({
      studentName: '', fatherName: '', motherName: '',
      dob: '', gender: '', classGrade: '', schoolName: '',
      address: '', mobile: '', guardianName: '', guardianMobile: '', email: '',
      loginId: '', password: '',
      subjects: { math: false, english: false, science: false, sst: false, gk: false, hindi: false, allSubjects: false },
      batchTiming: '', days: '', admissionDate: '',
      admissionFee: '', monthlyFee: '', totalPaid: '', paymentMode: '',
      receiptNo: '', receiptDate: '', receivedFrom: '',
      receiptFor: { admissionFee: false, monthlyFee: false, other: false },
      receiptOther: '', amountPaid: '', receiptPaymentMode: '', amountInWords: '',
      photo: '', signature: '',
    });
  }

  return (
    <div className="af-wrapper">
      
      {/* ── SUCCESS MODAL ── */}
      {showModal && (
        <div className="af-modal-overlay">
          <div className="af-modal">
            <div className="af-modal-icon">✅</div>
            <h2 className="af-modal-title">{form.id ? 'Student Updated Successfully!' : 'Student Added Successfully!'}</h2>
            <p className="af-modal-text">The data has been securely saved to the database. What would you like to do next?</p>
            
            <div className="af-modal-actions">
              <button className="af-print-btn blue" onClick={() => handlePrint('form')}>
                📄 Print Admission Form
              </button>
              <button className="af-print-btn red" onClick={() => handlePrint('receipt')}>
                🧾 Print Fee Receipt
              </button>
            </div>
            
            <button className="af-modal-close" onClick={handleCloseModal}>
              Done & Add Another Student
            </button>
          </div>
        </div>
      )}

      <div className={`af-page ${printFilter !== 'all' ? 'viewing-' + printFilter : ''}`} id="admission-print">
        
        {/* ── ADMISSION FORM SECTION ── */}
        {(printFilter === 'all' || printFilter === 'form') && (
          <div className="af-form-content">
            <div className="af-header">
          <div className="af-logo-block">
            <img src={logoImg} alt="Bright Steps" className="af-logo" />
            <div className="af-brand">
              <h1>BRIGHT STEPS COACHING</h1>
              <div className="af-tagline-bar">FOUNDATION CLASS</div>
              <p className="af-tagline-text">Build Strong Basics • Think Smart • Learn with Confidence</p>
            </div>
          </div>
          <div className="af-header-right">
            <div className="af-phone">📞 62873 47004</div>
            <div className="af-icons-row"><span>💡</span><span>🚀</span><span>📚</span></div>
          </div>
        </div>

        {/* ── FORM TITLE ── */}
        <div className="af-form-title">
          <div className="af-title-deco"><span>★</span><span>★</span><span>★</span></div>
          <h2>OFFICIAL ADMISSION FORM</h2>
          <div className="af-title-deco"><span>★</span><span>★</span><span>★</span></div>
          <div className="af-classes-badge">SESSION 2024-25</div>
        </div>

        <div className="af-form-meta no-print">
          <div className="af-meta-field">
            <label>Registration No:</label>
            <input className="af-input" placeholder="BS-2024-####" />
          </div>
          <div className="af-meta-field">
            <label>Date:</label>
            <input className="af-input" type="date" />
          </div>
        </div>

        {/* ── STUDENT DETAILS ── */}
        <div className="af-section-box">
          <div className="af-section-header blue">
            <span className="af-sec-icon">👤</span> STUDENT DETAILS
          </div>
          <div className="af-student-body">
            <div className="af-fields-col">
              <div className="af-field-row">
                <label>Student Name</label>
                <input className="af-input" value={form.studentName} onChange={e => set('studentName', e.target.value)} placeholder="Enter full name" />
              </div>
              <div className="af-field-row">
                <label>Father's Name</label>
                <input className="af-input" value={form.fatherName} onChange={e => set('fatherName', e.target.value)} placeholder="Enter father's name" />
              </div>
              <div className="af-field-row">
                <label>Mother's Name</label>
                <input className="af-input" value={form.motherName} onChange={e => set('motherName', e.target.value)} placeholder="Enter mother's name" />
              </div>
              <div className="af-field-row">
                <label>Date of Birth</label>
                <input className="af-input short" type="date" value={form.dob} onChange={e => set('dob', e.target.value)} />
                <label style={{marginLeft:'12px'}}>Gender:</label>
                <label className="af-radio-label"><input type="radio" name="gender" value="Male" onChange={e => set('gender', e.target.value)} /> Male</label>
                <label className="af-radio-label"><input type="radio" name="gender" value="Female" onChange={e => set('gender', e.target.value)} /> Female</label>
              </div>
              <div className="af-field-row">
                <label>Class (II to X)</label>
                <select className="af-input short" value={form.classGrade} onChange={e => set('classGrade', e.target.value)}>
                  <option value="">Select</option>
                  {['II','III','IV','V','VI','VII','VIII','IX','X'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="af-field-row">
                <label>School Name</label>
                <input className="af-input" value={form.schoolName} onChange={e => set('schoolName', e.target.value)} placeholder="Enter school name" />
              </div>
              <div className="af-field-row">
                <label>Student Login ID</label>
                <input className="af-input" value={form.loginId} onChange={e => set('loginId', e.target.value)} placeholder="e.g. STU001" required />
              </div>
              <div className="af-field-row">
                <label>Student Password</label>
                <input className="af-input" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Set password" required />
              </div>
            </div>
            <div className="af-photo-box" onClick={() => document.getElementById('photoInput').click()}>
              {form.photo ? (
                <img src={form.photo} alt="Student" className="af-photo-preview" />
              ) : (
                <>
                  <span>📷</span>
                  <p>Click to<br/>Upload<br/>Photo</p>
                </>
              )}
              <input 
                type="file" 
                id="photoInput" 
                hidden 
                accept="image/*" 
                onChange={(e) => handleFileChange(e, 'photo')} 
              />
            </div>
          </div>
        </div>

        {/* ── ROW 2: Contact + Course ── */}
        <div className="af-two-col">
          <div className="af-section-box">
            <div className="af-section-header yellow">
              <span className="af-sec-icon">📞</span> CONTACT DETAILS
            </div>
            <div className="af-fields-col">
              <div className="af-field-row">
                <label>Address</label>
                <input className="af-input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full address" />
              </div>
              <div className="af-field-row">
                <label>Mobile No.</label>
                <input className="af-input" type="tel" maxLength={10} value={form.mobile} onChange={e => set('mobile', e.target.value)} placeholder="Student/Parent" />
              </div>
              <div className="af-field-row">
                <label>Guardian Name</label>
                <input className="af-input" value={form.guardianName} onChange={e => set('guardianName', e.target.value)} placeholder="Guardian name" />
              </div>
              <div className="af-field-row">
                <label>Guardian Mobile</label>
                <input className="af-input" type="tel" maxLength={10} value={form.guardianMobile} onChange={e => set('guardianMobile', e.target.value)} placeholder="Guardian mobile" />
              </div>
              <div className="af-field-row">
                <label>Email (Optional)</label>
                <input className="af-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="Email address" />
              </div>
            </div>
          </div>

          <div className="af-section-box">
            <div className="af-section-header blue">
              <span className="af-sec-icon">📖</span> COURSE &amp; SUBJECT DETAILS
            </div>
            <div className="af-fields-col">
              <div className="af-field-row wrap">
                <label style={{width:'100%',marginBottom:'4px'}}>Choose Subjects (✓):</label>
                <label className="af-check-label"><input type="checkbox" checked={form.subjects.math} onChange={() => setSubject('math')} /> Math</label>
                <label className="af-check-label"><input type="checkbox" checked={form.subjects.english} onChange={() => setSubject('english')} /> English</label>
                <label className="af-check-label"><input type="checkbox" checked={form.subjects.science} onChange={() => setSubject('science')} /> Science</label>
                <label className="af-check-label"><input type="checkbox" checked={form.subjects.sst} onChange={() => setSubject('sst')} /> SST</label>
                <label className="af-check-label"><input type="checkbox" checked={form.subjects.gk} onChange={() => setSubject('gk')} /> GK</label>
                <label className="af-check-label"><input type="checkbox" checked={form.subjects.hindi} onChange={() => setSubject('hindi')} /> Hindi</label>
                <label className="af-check-label"><input type="checkbox" checked={form.subjects.allSubjects} onChange={() => setSubject('allSubjects')} /> All Subjects</label>
              </div>
              <div className="af-field-row">
                <label>Batch Timing</label>
                <input className="af-input" value={form.batchTiming} onChange={e => set('batchTiming', e.target.value)} placeholder="e.g. 7 AM – 9 AM" />
              </div>
              <div className="af-field-row">
                <label>Days</label>
                <input className="af-input" value={form.days} onChange={e => set('days', e.target.value)} placeholder="e.g. Mon,Wed,Fri" />
              </div>
              <div className="af-field-row">
                <label>Admission Date</label>
                <input className="af-input short" type="date" value={form.admissionDate} onChange={e => set('admissionDate', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 3: Fee + Notes ── */}
        <div className="af-two-col">
          <div className="af-section-box">
            <div className="af-section-header yellow">
              <span className="af-sec-icon">💰</span> FEE DETAILS
            </div>
            <div className="af-fields-col">
              <div className="af-field-row">
                <label>Admission Fee</label>
                <span className="af-rupee">₹</span>
                <input className="af-input" type="number" value={form.admissionFee} onChange={e => set('admissionFee', e.target.value)} placeholder="0" />
              </div>
              <div className="af-field-row">
                <label>Monthly Fee</label>
                <span className="af-rupee">₹</span>
                <input className="af-input" type="number" value={form.monthlyFee} onChange={e => set('monthlyFee', e.target.value)} placeholder="0" />
              </div>
              <div className="af-total-row">
                <span>Total Amount Paid</span>
                <div style={{display:'flex', alignItems:'center', gap:'4px'}}>
                  <span className="af-rupee" style={{color:'#1e3a8a'}}>₹</span>
                  <input className="af-input-inline" type="number" value={form.totalPaid} onChange={e => set('totalPaid', e.target.value)} placeholder="0" />
                </div>
              </div>
              <div className="af-field-row mt">
                <label>Payment Mode:</label>
                {['Cash','Online','Other'].map(m => (
                  <label key={m} className="af-radio-label">
                    <input type="radio" name="paymentMode" value={m} checked={form.paymentMode === m} onChange={e => set('paymentMode', e.target.value)} /> {m}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="af-section-box">
            <div className="af-section-header blue">
              <span className="af-sec-icon">✨</span> FACILITIES & NOTES
            </div>
            <div className="af-notes-body">
              <div className="af-note-item"><span className="af-note-icon">✅</span><span>Experienced & Dedicated Faculty</span></div>
              <div className="af-note-item"><span className="af-note-icon">✅</span><span>Concept Based Learning & Weekly Tests</span></div>
              <div className="af-note-item"><span className="af-note-icon">✅</span><span>Personal Attention & Performance Tracking</span></div>
              <div className="af-note-item"><span className="af-note-icon">✅</span><span>Smart Classrooms & Educational Resources</span></div>
            </div>
          </div>
        </div>

        {/* ── SIGNATURES ── */}
        <div className="af-sign-row">
          <div className="af-sign-block"><div className="af-sign-line"></div><span>Student Sign</span></div>
          <div className="af-sign-block"><div className="af-sign-line"></div><span>Guardian Sign</span></div>
          <div className="af-sign-block"><div className="af-sign-line"></div><span>Office Sign</span></div>
        </div>

        </div>
        )}

        {/* ── TEAR HERE ── */}
        {printFilter === 'all' && (
          <div className="af-tear">✂ - - - - - - - - - - - - - - <strong>TEAR HERE</strong> - - - - - - - - - - - - - - ✂</div>
        )}

        {/* ── FEE RECEIPT ── */}
        {(printFilter === 'all' || printFilter === 'receipt') && (
          <div className="af-receipt-content">
            <div className="af-receipt">
          <div className="af-receipt-header">
            <div className="af-logo-block small">
              <img src={logoImg} alt="Bright Steps" className="af-logo small" />
              <div className="af-brand small">
                <h2>BRIGHT STEPS COACHING</h2>
                <div className="af-tagline-bar small">FOUNDATION CLASS</div>
                <p className="af-tagline-text">Build Strong Basics • Think Smart • Learn with Confidence</p>
              </div>
            </div>
            <div className="af-receipt-meta">
              <div className="af-phone small">📞 62873 47004</div>
              <div className="af-free-demo">FREE<br/>DEMO<br/>CLASSES</div>
            </div>
          </div>

          <div className="af-receipt-title">FEE RECEIPT</div>

          <div className="af-receipt-grid">
            <div className="af-field-row">
              <label>Receipt No.</label>
              <input className="af-input short" value={form.receiptNo} onChange={e => set('receiptNo', e.target.value)} placeholder="###" />
            </div>
            <div className="af-field-row">
              <label>Date</label>
              <input className="af-input short" type="date" value={form.receiptDate} onChange={e => set('receiptDate', e.target.value)} />
            </div>
            <div className="af-field-row" style={{flex:'1 1 100%'}}>
              <label>Received from</label>
              <input className="af-input" value={form.receivedFrom || form.studentName} onChange={e => set('receivedFrom', e.target.value)} placeholder="Student / Guardian name" />
            </div>
            <div className="af-field-row" style={{flex:'1 1 100%'}}>
              <label>For</label>
              <label className="af-check-label"><input type="checkbox" checked={form.receiptFor.admissionFee} onChange={() => setReceiptFor('admissionFee')} /> Admission Fee</label>
              <label className="af-check-label"><input type="checkbox" checked={form.receiptFor.monthlyFee} onChange={() => setReceiptFor('monthlyFee')} /> Monthly Fee</label>
              <label className="af-check-label"><input type="checkbox" checked={form.receiptFor.other} onChange={() => setReceiptFor('other')} /> Other</label>
              <input className="af-input short" value={form.receiptOther} onChange={e => set('receiptOther', e.target.value)} placeholder="specify" />
            </div>
            <div className="af-field-row">
              <label>Amount Paid</label>
              <span className="af-rupee">₹</span>
              <input className="af-input" type="number" value={form.amountPaid} onChange={e => set('amountPaid', e.target.value)} placeholder="0" />
            </div>
            <div className="af-field-row">
              <label>Payment Mode:</label>
              {['Cash','Online','Other'].map(m => (
                <label key={m} className="af-radio-label">
                  <input type="radio" name="receiptPaymentMode" value={m} checked={form.receiptPaymentMode === m} onChange={e => set('receiptPaymentMode', e.target.value)} /> {m}
                </label>
              ))}
            </div>
            <div className="af-field-row" style={{flex:'1 1 100%'}}>
              <label>Amount in Words</label>
              <input className="af-input" value={form.amountInWords} onChange={e => set('amountInWords', e.target.value)} placeholder="e.g. Five Hundred Only" />
            </div>
          </div>

          <div className="af-diff-auth">
            <div className="af-diff-section">
              <div className="af-diff-title">WHAT MAKES US DIFFERENT</div>
              <div className="af-diff-icons">
                <div className="af-diff-item"><span>👨‍🏫</span><small>Experienced Faculty</small></div>
                <div className="af-diff-item"><span>📖</span><small>Concept Based Learning</small></div>
                <div className="af-diff-item"><span>📝</span><small>Regular Tests &amp; Evaluation</small></div>
                <div className="af-diff-item"><span>📊</span><small>Progress System</small></div>
                <div className="af-diff-item"><span>🏆</span><small>Better Results</small></div>
              </div>
            </div>
            <div className="af-auth-box" onClick={() => document.getElementById('signInput').click()}>
              <div className="af-auth-line">
                {form.signature && <img src={form.signature} alt="Sign" className="af-sign-preview" />}
              </div>
              <span>Authorized Sign</span>
              <input 
                type="file" 
                id="signInput" 
                hidden 
                accept="image/*" 
                onChange={(e) => handleFileChange(e, 'signature')} 
              />
            </div>
          </div>

          <div className="af-address">
            📍 ADDRESS: MAHARAJA HATA, GALI NO 3, MATH CAFÉ &nbsp;&nbsp;&nbsp;<strong className="af-thanks">Thank You!</strong>
          </div>
          </div>
        </div>
        )}

        {/* ── FINAL SAVE ACTION ── */}
        <div className="af-submit-container no-print">
          {!location.state?.studentData ? (
            <button className="af-save-btn" onClick={handleSaveStudent}>
              ✨ Confirm &amp; Add Student to Database
            </button>
          ) : (
            <div style={{display:'flex', gap:'15px', flexWrap: 'wrap', justifyContent: 'center'}}>
               <button className="af-save-btn" style={{background:'#10b981'}} onClick={handleSaveStudent}>
                💾 Update Student Data
              </button>
               <button className="af-save-btn blue" onClick={() => handlePrint('form')}>
                📄 Print Form
              </button>
              <button className="af-save-btn red" onClick={() => handlePrint('receipt')}>
                🧾 Print Receipt
              </button>
              <button className="af-save-btn" style={{background:'#64748b'}} onClick={() => window.history.back()}>
                🔙 Back to List
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default AdmissionForm
