import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoImg from '../assets/logo.png'
import './AllStudents.css'
import { apiFetch } from '../api'

const AllStudents = () => {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [classFilter, setClassFilter] = useState('All')
    const [viewModalData, setViewModalData] = useState(null)
    const [selectedMonth, setSelectedMonth] = useState(0)
    const navigate = useNavigate()

    const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await apiFetch('/students');
            if (response.ok) {
                const data = await response.json();
                setStudents(data);
            }
        } catch (error) {
            console.error("Error fetching students: ", error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [])

    const handleDelete = async (id) => {
        if(window.confirm("Are you sure you want to delete this student record?")) {
            try {
                const response = await apiFetch(`/students/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    setStudents(students.filter(s => s.id !== id));
                }
            } catch (error) {
                console.error("Error deleting student: ", error);
                alert(error.message);
            }
        }
    }

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.studentName.toLowerCase().includes(search.toLowerCase()) || 
                             s.fatherName.toLowerCase().includes(search.toLowerCase()) ||
                             (s.mobile && s.mobile.includes(search))
        const matchesClass = classFilter === 'All' || s.classGrade === classFilter
        return matchesSearch && matchesClass
    })

    return (
        <div className="as-wrapper">
            {/* ── HEADER ── */}
            <header className="as-header">
                <div className="as-header-left">
                    <div className="as-title-block">
                        <h1>Student Directory</h1>
                        <p>Manage and track all enrolled students</p>
                    </div>
                </div>
                <div className="as-header-right">
                    <img src={logoImg} alt="Bright Steps" className="as-logo" />
                </div>
            </header>

            {/* ── CONTROLS ── */}
            <div className="as-controls">
                <div className="as-search-box">
                    <span className="as-search-icon">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Search by name, father's name or mobile..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="as-filter-box">
                    <label>Filter Class:</label>
                    <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
                        <option value="All">All Classes</option>
                        {['II','III','IV','V','VI','VII','VIII','IX','X'].map(c => (
                            <option key={c} value={c}>Class {c}</option>
                        ))}
                    </select>
                </div>
                <div className="as-stats-pill">
                    Total: <strong>{filteredStudents.length}</strong>
                </div>
            </div>

            {/* ── TABLE AREA ── */}
            <div className="as-table-container">
                <table className="as-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Father's Name</th>
                            <th>Class</th>
                            <th>Mobile</th>
                            <th>Reg. Date</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="as-no-data">
                                    <div className="as-empty-state">
                                        <div className="as-spinner"></div>
                                        <p>Fetching student records...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredStudents.length > 0 ? (
                            filteredStudents.map(s => (
                                <tr key={s.id}>
                                    <td>
                                        <div className="as-student-info">
                                            {s.photo ? (
                                                <img src={s.photo} alt={s.studentName} className="as-avatar-img" />
                                            ) : (
                                                <div className="as-avatar">{s.studentName.charAt(0)}</div>
                                            )}
                                            <span className="as-name-text">{s.studentName}</span>
                                        </div>
                                    </td>
                                    <td>{s.fatherName}</td>
                                    <td><span className={`as-class-badge c-${s.classGrade}`}>{s.classGrade}</span></td>
                                    <td>{s.mobile || '---'}</td>
                                    <td>{s.registrationDate}</td>
                                    <td className="text-right">
                                        <div className="as-action-btns">
                                            <button 
                                                className="as-btn view"
                                                onClick={() => { setViewModalData(s); setSelectedMonth(0); }}
                                            >
                                                View
                                            </button>
                                            <button className="as-btn delete" onClick={() => handleDelete(s.id)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="as-no-data">
                                    <div className="as-empty-state">
                                        <span>📂</span>
                                        <p>No students found matching your criteria</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── VIEW MODAL ── */}
            {viewModalData && (
                <div className="as-modal-overlay" onClick={() => setViewModalData(null)}>
                    <div className="as-modal" onClick={e => e.stopPropagation()}>
                        <div className="as-modal-header">
                            <h2>{viewModalData.studentName}</h2>
                            <button className="as-modal-close" onClick={() => setViewModalData(null)}>✕</button>
                        </div>
                        
                        <div className="as-modal-body">
                            <div className="as-modal-section">
                                <h3>Admission Form</h3>
                                <button 
                                    className="as-modal-btn blue" 
                                    onClick={() => navigate('/admission', { state: { studentData: viewModalData, mode: 'form' } })}
                                >
                                    📄 View / Print Form
                                </button>
                            </div>

                            <div className="as-modal-divider"></div>

                            <div className="as-modal-section">
                                <h3>Fee Receipt</h3>
                                <div className="as-month-selector">
                                    <label>Select Month:</label>
                                    <select 
                                        value={selectedMonth} 
                                        onChange={e => setSelectedMonth(Number(e.target.value))}
                                    >
                                        {months.map((m, idx) => (
                                            <option key={idx} value={idx}>{m}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="as-receipt-result">
                                    {viewModalData.paidMonths && viewModalData.paidMonths.includes(selectedMonth) ? (
                                        <div className="as-receipt-success">
                                            <p>✅ Fee Paid for {months[selectedMonth]}</p>
                                            <button 
                                                className="as-modal-btn green"
                                                onClick={() => {
                                                    const receiptData = {
                                                        ...viewModalData,
                                                        receiptFor: { admissionFee: false, monthlyFee: true, other: false },
                                                        amountPaid: viewModalData.monthlyFee,
                                                        receiptDate: new Date().toISOString().split('T')[0],
                                                        receiptOther: months[selectedMonth] + ' Fee'
                                                    };
                                                    navigate('/admission', { state: { studentData: receiptData, mode: 'receipt' } });
                                                }}
                                            >
                                                🧾 Download / Print Receipt
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="as-receipt-notfound">
                                            <span className="sad-emoji">😔</span>
                                            <p>Fee Not Paid for {months[selectedMonth]}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AllStudents
