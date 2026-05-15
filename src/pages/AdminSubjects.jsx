import React, { useState, useEffect } from 'react';
import './AdminSubjects.css';
import { apiFetch } from '../api';

const AdminSubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [newSubject, setNewSubject] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const res = await apiFetch('/subjects');
            if (res.ok) {
                const data = await res.json();
                setSubjects(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newSubject.trim()) return;

        try {
            const res = await apiFetch('/subjects', {
                method: 'POST',
                body: JSON.stringify({ name: newSubject.trim() })
            });
            if (res.ok) {
                const added = await res.json();
                setSubjects([added, ...subjects]);
                setNewSubject('');
            }
        } catch (error) {
            console.error("Failed to add subject", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this subject?")) return;
        try {
            const res = await apiFetch(`/subjects/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSubjects(subjects.filter(s => s.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete subject", error);
        }
    };

    return (
        <div className="sub-container">
            <div className="db-header">
                <div className="db-header-left">
                    <h1>Manage Subjects</h1>
                    <p>Add and remove subjects offered by the coaching</p>
                </div>
            </div>

            <div className="sub-content">
                <div className="sub-add-card">
                    <h3>Add New Subject</h3>
                    <form onSubmit={handleAdd} className="sub-form">
                        <input 
                            type="text" 
                            placeholder="e.g. Computer Science, English..." 
                            value={newSubject}
                            onChange={(e) => setNewSubject(e.target.value)}
                        />
                        <button type="submit" disabled={!newSubject.trim()}>+ Add Subject</button>
                    </form>
                </div>

                <div className="sub-list-card">
                    <h3>Available Subjects</h3>
                    {loading ? (
                        <div style={{padding: '30px', textAlign: 'center', color: '#64748b'}}>Loading subjects...</div>
                    ) : subjects.length > 0 ? (
                        <ul className="sub-list">
                            {subjects.map(sub => (
                                <li key={sub.id}>
                                    <div className="sub-item-left">
                                        <span className="sub-icon">📚</span>
                                        <span className="sub-name">{sub.name}</span>
                                    </div>
                                    <button onClick={() => handleDelete(sub.id)} className="sub-delete-btn" title="Delete Subject">
                                        🗑️ Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="sub-empty">
                            <span>📝</span>
                            <p>No subjects added yet.<br/>Add your first subject above!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSubjects;
