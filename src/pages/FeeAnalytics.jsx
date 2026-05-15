import React, { useEffect, useState } from 'react';
import './FeeAnalytics.css';

import { useNavigate } from 'react-router-dom';

// Academic year typically starts from April in India
const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

const FeeAnalytics = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [receiptModalData, setReceiptModalData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('user_token');
            const res = await fetch('https://srv-d7e8e6navr4c73ehnmqg.onrender.com/api/students', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setStudents(data);
        } catch (error) {
            console.error("Error fetching students", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleMonth = async (student, monthIndex) => {
        const isCurrentlyPaid = student.paidMonths && student.paidMonths.includes(monthIndex);
        
        // If already paid, clicking it again will just show the receipt options, NOT unmark it.
        if (isCurrentlyPaid) {
            setReceiptModalData({ student, month: months[monthIndex] });
            return;
        }

        // If not paid, mark as paid
        const updatedPaidMonths = student.paidMonths ? [...student.paidMonths] : [];
        updatedPaidMonths.push(monthIndex);

        // Optimistic UI update
        const updatedStudents = students.map(s => 
            s.id === student.id ? { ...s, paidMonths: updatedPaidMonths } : s
        );
        setStudents(updatedStudents);

        try {
            const token = localStorage.getItem('user_token');
            await fetch(`https://srv-d7e8e6navr4c73ehnmqg.onrender.com/api/students/${student.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...student, paidMonths: updatedPaidMonths })
            });
            // Show receipt modal for the newly paid month
            setReceiptModalData({ student, month: months[monthIndex] });
        } catch (error) {
            console.error("Failed to update paid months", error);
            fetchStudents(); // Revert on failure
        }
    };

    const sendWhatsApp = () => {
        if (!receiptModalData) return;
        const { student, month } = receiptModalData;
        const phone = student.guardianMobile || student.mobile;
        const message = `*FEE RECEIPT*\n\nDear ${student.studentName} / Guardian,\n\nThis is to confirm the receipt of your monthly fee of *₹${student.monthlyFee || 0}* for the month of *${month}*.\n\nThank you!\n*Bright Steps Coaching*`;
        
        if (phone) {
            window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`, '_blank');
        } else {
            alert("No mobile number found for this student.");
        }
    };

    const sendEmail = () => {
        if (!receiptModalData) return;
        const { student, month } = receiptModalData;
        const email = student.email;
        const subject = `Fee Receipt - ${month} - Bright Steps Coaching`;
        const body = `Dear ${student.studentName} / Guardian,\n\nThis is to confirm the receipt of your monthly fee of ₹${student.monthlyFee || 0} for the month of ${month}.\n\nThank you!\nBright Steps Coaching`;
        
        if (email) {
            window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
        } else {
            alert("No email address found for this student.");
        }
    };

    const generatePDFReceipt = () => {
        if (!receiptModalData) return;
        const { student, month } = receiptModalData;
        
        // Prepare student data for the AdmissionForm receipt print mode
        const receiptData = {
            ...student,
            receiptFor: { admissionFee: false, monthlyFee: true, other: false },
            amountPaid: student.monthlyFee,
            receiptDate: new Date().toISOString().split('T')[0],
            receiptOther: month + ' Fee'
        };

        navigate('/admission', { state: { studentData: receiptData, mode: 'receipt' } });
    };

    if (loading) return <div style={{padding: '50px', textAlign: 'center', fontSize: '1.2rem', color: '#1e3a8a'}}>Loading Analytics...</div>;

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '25px'}}>
            <div className="db-header">
                <div className="db-header-left">
                    <h1>Fee Analytics</h1>
                    <p>Track monthly fee payments for all students</p>
                </div>
            </div>

            <div className="db-content-area" style={{overflowX: 'auto'}}>
                <table className="fa-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Class</th>
                            <th>Fee</th>
                            {months.map(m => <th key={m}>{m}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id}>
                                <td>
                                    <strong>{student.studentName}</strong><br/>
                                    <small style={{color: '#64748b'}}>{student.loginId || 'No ID'}</small>
                                </td>
                                <td>{student.classGrade || 'N/A'}</td>
                                <td>₹{student.monthlyFee || 0}</td>
                                {months.map((m, index) => {
                                    const isPaid = student.paidMonths && student.paidMonths.includes(index);
                                    return (
                                        <td key={index}>
                                            <button 
                                                className={`fa-month-pill ${isPaid ? 'paid' : 'due'}`}
                                                onClick={() => toggleMonth(student, index)}
                                                title={isPaid ? 'Mark as Due' : 'Mark as Paid'}
                                            >
                                                {isPaid ? '✓' : '✗'}
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        {students.length === 0 && (
                            <tr>
                                <td colSpan={15} style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                                    No students found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Receipt Action Modal */}
            {receiptModalData && (
                <div className="fa-modal-overlay">
                    <div className="fa-modal">
                        <div className="fa-modal-icon">✅</div>
                        <h2>Fee Marked as Paid!</h2>
                        <p><strong>{receiptModalData.student.studentName}</strong> has paid the fee for <strong>{receiptModalData.month}</strong>.</p>
                        <p style={{marginBottom: '20px', color: '#64748b'}}>Would you like to send or print the receipt?</p>
                        
                        <div className="fa-modal-actions">
                            <button className="fa-btn whatsapp" onClick={sendWhatsApp}>
                                📱 Send on WhatsApp
                            </button>
                            <button className="fa-btn email" onClick={sendEmail}>
                                📧 Send via Email
                            </button>
                            <button className="fa-btn print" onClick={generatePDFReceipt}>
                                📄 Print/View Receipt
                            </button>
                        </div>
                        
                        <button className="fa-btn-close" onClick={() => setReceiptModalData(null)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeeAnalytics;
