import React, { useState, useEffect } from 'react';
import './AdminMaterials.css';

const AdminMaterials = () => {
    const [materials, setMaterials] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const [form, setForm] = useState({
        title: '',
        subject: '',
        classes: [],
        file: null
    });

    const classOptions = ['II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('user_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [matRes, subRes] = await Promise.all([
                fetch('https://big-steps.onrender.com/api/materials', { headers }),
                fetch('https://big-steps.onrender.com/api/subjects', { headers })
            ]);

            if (matRes.ok) setMaterials(await matRes.json());
            if (subRes.ok) setSubjects(await subRes.json());
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClassToggle = (c) => {
        setForm(prev => {
            const isSelected = prev.classes.includes(c);
            if (isSelected) {
                return { ...prev, classes: prev.classes.filter(cls => cls !== c) };
            } else {
                return { ...prev, classes: [...prev.classes, c] };
            }
        });
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!form.title || !form.subject || form.classes.length === 0 || !form.file) {
            alert("Please fill all fields and select a file.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('subject', form.subject);
        formData.append('classes', JSON.stringify(form.classes));
        formData.append('file', form.file);

        try {
            const token = localStorage.getItem('user_token');
            const res = await fetch('https://big-steps.onrender.com/api/materials', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                const newMat = await res.json();
                setMaterials([newMat, ...materials]);
                setForm({ title: '', subject: '', classes: [], file: null });
                // Reset file input
                document.getElementById('file-upload').value = '';
                alert("Material uploaded successfully!");
            } else {
                const err = await res.json();
                alert("Upload failed: " + err.message);
            }
        } catch (error) {
            console.error("Upload error", error);
            alert("An error occurred during upload.");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this material?")) return;
        try {
            const token = localStorage.getItem('user_token');
            const res = await fetch(`https://big-steps.onrender.com/api/materials/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setMaterials(materials.filter(m => m.id !== id));
            }
        } catch (error) {
            console.error("Delete error", error);
        }
    };

    return (
        <div className="am-container">
            <div className="db-header">
                <div className="db-header-left">
                    <h1>Study Materials</h1>
                    <p>Upload PDFs and assign them to specific subjects and classes</p>
                </div>
            </div>

            <div className="am-content">
                <div className="am-upload-card">
                    <h3>Upload New Material</h3>
                    <form onSubmit={handleUpload} className="am-form">
                        <div className="am-field">
                            <label>Title</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Chapter 1 Notes" 
                                value={form.title}
                                onChange={e => setForm({...form, title: e.target.value})}
                            />
                        </div>

                        <div className="am-field">
                            <label>Subject</label>
                            <select 
                                value={form.subject}
                                onChange={e => setForm({...form, subject: e.target.value})}
                            >
                                <option value="">Select a subject...</option>
                                {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                            </select>
                        </div>

                        <div className="am-field">
                            <label>Applicable Classes</label>
                            <div className="am-classes-grid">
                                {classOptions.map(c => (
                                    <label key={c} className={`am-class-chip ${form.classes.includes(c) ? 'active' : ''}`}>
                                        <input 
                                            type="checkbox" 
                                            checked={form.classes.includes(c)}
                                            onChange={() => handleClassToggle(c)}
                                            hidden
                                        />
                                        Class {c}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="am-field">
                            <label>File (PDF)</label>
                            <div className="am-file-drop">
                                <input 
                                    id="file-upload"
                                    type="file" 
                                    accept=".pdf"
                                    onChange={e => setForm({...form, file: e.target.files[0]})}
                                />
                            </div>
                        </div>

                        <button type="submit" className="am-submit-btn" disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Upload Material'}
                        </button>
                    </form>
                </div>

                <div className="am-list-card">
                    <h3>Uploaded Materials</h3>
                    {loading ? (
                        <p>Loading...</p>
                    ) : materials.length > 0 ? (
                        <div className="am-materials-list">
                            {materials.map(m => (
                                <div key={m.id} className="am-material-item">
                                    <div className="am-mat-icon">📄</div>
                                    <div className="am-mat-info">
                                        <h4>{m.title}</h4>
                                        <div className="am-mat-meta">
                                            <span className="badge subject">{m.subject}</span>
                                            <span className="badge classes">Classes: {m.classes.join(', ')}</span>
                                        </div>
                                    </div>
                                    <div className="am-mat-actions">
                                        <a href={`https://big-steps.onrender.com${m.fileUrl}`} target="_blank" rel="noreferrer" className="am-btn-view">View</a>
                                        <button onClick={() => handleDelete(m.id)} className="am-btn-delete">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="am-empty">No materials uploaded yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMaterials;
