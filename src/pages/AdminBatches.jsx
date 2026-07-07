import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import './AdminBatches.css';

const DEFAULT_SUBJECTS = ['Science', 'Math', 'SST', 'English', 'Computer'];

const EMPTY_FORM = {
  name: '', language: 'Hinglish', targetAudience: '', description: '',
  startDate: '', endDate: '', price: '', mrp: '', discount: '',
  tag: 'PREMIUM', features: '', isOnline: true, image: '',
  schedule: [], subject: '', subjects: [], subjectsInfo: [], teacherName: '', teacherQualification: ''
};

const EMPTY_CLASS = { subject: '', teacher: '', date: '', day: 'Monday', time: '' };
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const AdminBatches = () => {
  const [batches, setBatches]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [editId, setEditId]       = useState(null);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState('');
  const [newClass, setNewClass]   = useState(EMPTY_CLASS);
  const [deleteId, setDeleteId]   = useState(null);

  // Active Admin Batch Workspace State
  const [activeWorkspaceBatch, setActiveWorkspaceBatch] = useState(null);
  const [workspaceTab, setWorkspaceTab] = useState('schedule'); // schedule | notes | students
  const [selectedWorkspaceSubject, setSelectedWorkspaceSubject] = useState(null);

  // Workspace Notes state
  const [workspaceNotes, setWorkspaceNotes] = useState([]);
  const [notesLoading, setNotesLoading]     = useState(false);
  const [subjects, setSubjects]             = useState([]);
  const [newNoteForm, setNewNoteForm] = useState({ title: '', subject: '', file: null });
  const [uploadingNote, setUploadingNote]   = useState(false);

  // Workspace Enrolled Students state
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [studentsLoading, setStudentsLoading]   = useState(false);

  // Workspace Syllabus States
  const [chapters, setChapters] = useState([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [lecturesLoading, setLecturesLoading] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newLecture, setNewLecture] = useState({
    title: '', duration: '', status: 'Completed', date: '', youtubeUrl: ''
  });

  useEffect(() => { fetchBatches(); fetchSubjects(); }, []);

  useEffect(() => {
    if (activeWorkspaceBatch) {
      if (workspaceTab === 'notes') {
        fetchWorkspaceNotes();
      } else if (workspaceTab === 'students') {
        fetchWorkspaceStudents();
      } else if (workspaceTab === 'syllabus') {
        fetchWorkspaceChapters();
      }
    }
  }, [activeWorkspaceBatch, workspaceTab]);

  useEffect(() => {
    if (activeWorkspaceBatch && selectedWorkspaceSubject) {
      fetchWorkspaceChapters();
    }
  }, [activeWorkspaceBatch, selectedWorkspaceSubject]);

  useEffect(() => {
    if (activeWorkspaceBatch && selectedWorkspaceSubject && selectedChapterId) {
      fetchWorkspaceLectures(selectedChapterId);
    } else {
      setLectures([]);
    }
  }, [selectedChapterId]);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/batches');
      if (res.ok) setBatches(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchSubjects = async () => {
    try {
      const res = await apiFetch('/subjects');
      if (res.ok) setSubjects(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchWorkspaceNotes = async () => {
    if (!activeWorkspaceBatch) return;
    setNotesLoading(true);
    try {
      const res = await apiFetch(`/materials?batchId=${activeWorkspaceBatch.id}`);
      if (res.ok) {
        setWorkspaceNotes(await res.json());
      }
    } catch(e) { console.error(e); }
    finally { setNotesLoading(false); }
  };

  const fetchWorkspaceStudents = async () => {
    if (!activeWorkspaceBatch) return;
    setStudentsLoading(true);
    try {
      const res = await apiFetch(`/batches/${activeWorkspaceBatch.id}/students`);
      if (res.ok) {
        setEnrolledStudents(await res.json());
      }
    } catch(e) { console.error(e); }
    finally { setStudentsLoading(false); }
  };

  const fetchWorkspaceChapters = async () => {
    if (!activeWorkspaceBatch || !selectedWorkspaceSubject) return;
    setChaptersLoading(true);
    try {
      const res = await apiFetch(`/chapters?batchId=${activeWorkspaceBatch.id}&subject=${selectedWorkspaceSubject}`);
      if (res.ok) {
        const data = await res.json();
        setChapters(data);
        if (data.length > 0) {
          setSelectedChapterId(data[0].id);
        } else {
          setSelectedChapterId(null);
        }
      }
    } catch(e) {
      console.error(e);
    } finally {
      setChaptersLoading(false);
    }
  };

  const fetchWorkspaceLectures = async (chId) => {
    if (!activeWorkspaceBatch || !selectedWorkspaceSubject || !chId) return;
    setLecturesLoading(true);
    try {
      const res = await apiFetch(`/lectures?batchId=${activeWorkspaceBatch.id}&subject=${selectedWorkspaceSubject}&chapterId=${chId}`);
      if (res.ok) {
        setLectures(await res.json());
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLecturesLoading(false);
    }
  };

  const handleAddChapter = async (e) => {
    e.preventDefault();
    if (!newChapterTitle.trim()) return;
    try {
      const res = await apiFetch('/chapters', {
        method: 'POST',
        body: JSON.stringify({
          batchId: activeWorkspaceBatch.id,
          subject: selectedWorkspaceSubject,
          title: newChapterTitle.trim()
        })
      });
      if (res.ok) {
        const created = await res.json();
        setChapters(prev => [...prev, created]);
        setNewChapterTitle('');
        setSelectedChapterId(created.id);
        showToast('✅ Chapter added successfully');
      }
    } catch(e) {
      console.error(e);
      showToast('❌ Failed to add chapter');
    }
  };

  const handleDeleteChapter = async (id) => {
    if (!window.confirm('Delete this chapter and all its lectures?')) return;
    try {
      const res = await apiFetch(`/chapters/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setChapters(prev => prev.filter(c => c.id !== id));
        if (selectedChapterId === id) {
          setSelectedChapterId(null);
        }
        showToast('🗑️ Chapter deleted');
      }
    } catch(e) {
      console.error(e);
      showToast('❌ Failed to delete chapter');
    }
  };

  const handleAddLecture = async (e) => {
    e.preventDefault();
    if (!newLecture.title.trim()) {
      showToast('⚠️ Lecture title is required');
      return;
    }
    if (!selectedChapterId) {
      showToast('⚠️ Please select or create a chapter first');
      return;
    }
    try {
      const payload = {
        batchId: activeWorkspaceBatch.id,
        subject: selectedWorkspaceSubject,
        chapterId: selectedChapterId,
        title: newLecture.title.trim(),
        duration: newLecture.duration.trim() || '1h',
        status: newLecture.status,
        date: newLecture.date || new Date().toISOString().split('T')[0],
        youtubeUrl: newLecture.youtubeUrl.trim()
      };
      const res = await apiFetch('/lectures', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const created = await res.json();
        setLectures(prev => [...prev, created]);
        setNewLecture({ title: '', duration: '', status: 'Completed', date: '', youtubeUrl: '' });
        showToast('✅ Lecture topic added');
      }
    } catch(e) {
      console.error(e);
      showToast('❌ Failed to add lecture');
    }
  };

  const handleDeleteLecture = async (id) => {
    if (!window.confirm('Delete this lecture?')) return;
    try {
      const res = await apiFetch(`/lectures/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLectures(prev => prev.filter(l => l.id !== id));
        showToast('🗑️ Lecture deleted');
      }
    } catch(e) {
      console.error(e);
      showToast('❌ Failed to delete lecture');
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleEdit = (batch) => {
    setForm({
      name: batch.name || '', language: batch.language || 'Hinglish',
      targetAudience: batch.targetAudience || '', description: batch.description || '',
      startDate: batch.startDate || '', endDate: batch.endDate || '',
      price: batch.price || '', mrp: batch.mrp || '', discount: batch.discount || '',
      tag: batch.tag || 'PREMIUM', features: batch.features || '',
      isOnline: batch.isOnline !== false, image: batch.image || '',
      schedule: batch.schedule || [],
      subject: batch.subject || '',
      subjects: batch.subjects || (batch.subject ? [batch.subject] : []),
      subjectsInfo: batch.subjectsInfo || (batch.subjects || (batch.subject ? [batch.subject] : [])).map(sub => ({
        subject: sub,
        teacherName: batch.teacherName || '',
        teacherQualification: batch.teacherQualification || ''
      })),
      teacherName: batch.teacherName || '',
      teacherQualification: batch.teacherQualification || ''
    });
    setEditId(batch.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      const res = await apiFetch(`/batches/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBatches(prev => prev.filter(b => b.id !== id));
        showToast('🗑️ Batch deleted successfully');
      } else showToast('❌ Failed to delete batch');
    } catch (e) { showToast('❌ Network error'); }
    setDeleteId(null);
  };

  const addScheduleClass = () => {
    if (!newClass.subject || !newClass.teacher || !newClass.time) {
      showToast('⚠️ Fill subject, teacher and time'); return;
    }
    setForm(prev => ({ ...prev, schedule: [...prev.schedule, { ...newClass }] }));
    setNewClass(EMPTY_CLASS);
  };

  const removeScheduleClass = (i) => {
    setForm(prev => ({ ...prev, schedule: prev.schedule.filter((_, idx) => idx !== i) }));
  };

  // Add Class Schedule inside active workspace
  const handleDateChange = (val) => {
    if (!val) {
      setNewClass(prev => ({ ...prev, date: '', day: 'Monday' }));
      return;
    }
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const d = new Date(val);
    const dayName = daysOfWeek[d.getDay()];
    setNewClass(prev => ({ ...prev, date: val, day: dayName }));
  };

  const handleAddWorkspaceSchedule = async () => {
    if (!newClass.subject || !newClass.teacher || !newClass.time) {
      showToast('⚠️ Please fill subject, teacher name and timing.');
      return;
    }

    const updatedSchedule = [...(activeWorkspaceBatch.schedule || []), { ...newClass }];
    const updatedBatch = { ...activeWorkspaceBatch, schedule: updatedSchedule };

    try {
      const res = await apiFetch(`/batches/${activeWorkspaceBatch.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedBatch)
      });
      if (res.ok) {
        setActiveWorkspaceBatch(updatedBatch);
        setNewClass(EMPTY_CLASS);
        showToast('📅 Schedule updated successfully!');
        fetchBatches();
      }
    } catch (e) {
      showToast('❌ Failed to update schedule');
    }
  };

  const handleRemoveWorkspaceSchedule = async (idxToRemove) => {
    const updatedSchedule = (activeWorkspaceBatch.schedule || []).filter((_, i) => i !== idxToRemove);
    const updatedBatch = { ...activeWorkspaceBatch, schedule: updatedSchedule };

    try {
      const res = await apiFetch(`/batches/${activeWorkspaceBatch.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedBatch)
      });
      if (res.ok) {
        setActiveWorkspaceBatch(updatedBatch);
        showToast('🗑️ Schedule item removed');
        fetchBatches();
      }
    } catch (e) {
      showToast('❌ Failed to update schedule');
    }
  };

  // Upload study materials from within active workspace
  const handleUploadWorkspaceNote = async (e) => {
    e.preventDefault();
    if (!newNoteForm.title || !newNoteForm.subject || !newNoteForm.file) {
      alert('Please fill all notes fields and pick a document file.');
      return;
    }

    setUploadingNote(true);
    const formData = new FormData();
    formData.append('title', newNoteForm.title);
    formData.append('subject', newNoteForm.subject);
    formData.append('classes', JSON.stringify([activeWorkspaceBatch.name])); // tag to batch name
    formData.append('batchId', activeWorkspaceBatch.id);
    formData.append('file', newNoteForm.file);

    try {
      const res = await apiFetch('/materials', {
        method: 'POST',
        body: formData,
        headers: {} // let fetch manage content boundary
      });
      if (res.ok) {
        showToast('📄 PDF worksheet uploaded to batch!');
        setNewNoteForm({ title: '', subject: '', file: null });
        document.getElementById('workspace-file-upload').value = '';
        fetchWorkspaceNotes();
      } else {
        alert('Worksheet upload failed.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUploadingNote(false);
    }
  };

  const handleDeleteWorkspaceNote = async (noteId) => {
    if (!window.confirm('Delete this worksheet?')) return;
    try {
      const res = await apiFetch(`/materials/${noteId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('🗑️ Worksheet deleted');
        fetchWorkspaceNotes();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { showToast('⚠️ Batch name is required'); return; }

    setSaving(true);
    const payload = {
      ...form,
      subject: form.subjects && form.subjects.length > 0 ? form.subjects[0] : (form.subject || ''),
      price: Number(form.price) || 0,
      mrp: Number(form.mrp) || 0,
      discount: Number(form.discount) || 0,
    };

    try {
      const url    = editId ? `/batches/${editId}` : '/batches';
      const method = editId ? 'PUT' : 'POST';
      const res = await apiFetch(url, { method, body: JSON.stringify(payload) });
      if (res.ok) {
        showToast(editId ? '✅ Batch updated!' : '✅ Batch created!');
        await fetchBatches();
        setShowForm(false);
        setForm(EMPTY_FORM);
        setEditId(null);
      } else {
        const err = await res.json();
        showToast(`❌ ${err.message || 'Failed to save'}`);
      }
    } catch (err) {
      showToast('❌ Network error');
    } finally {
      setSaving(false);
    }
  };

  // ── Render Immersive Batch Classroom Workspace View ──
  if (activeWorkspaceBatch) {
    // 1. Compile all distinct subjects
    const batchSubjects = (activeWorkspaceBatch.subjects && activeWorkspaceBatch.subjects.length > 0)
      ? activeWorkspaceBatch.subjects
      : (activeWorkspaceBatch.subject ? [activeWorkspaceBatch.subject] : ['Science', 'Math', 'SST', 'English', 'Computer']);

    const SUBJECT_ICONS = {
      science: '🔬',
      math: '📐',
      mathematics: '📐',
      sst: '🌍',
      social: '🌍',
      english: '📚',
      computer: '💻',
      physics: '⚛️',
      chemistry: '🧪',
      biology: '🧬'
    };

    if (!selectedWorkspaceSubject) {
      return (
        <div className="ab-root" style={{ padding: '24px 0' }}>
          {toast && <div className="ab-toast">{toast}</div>}
          
          {/* Header Back */}
          <div className="ab-workspace-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setActiveWorkspaceBatch(null)}
                style={{ background: '#f3f4f6', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}
              >
                ←
              </button>
              <div>
                <h1 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#111827' }}>{activeWorkspaceBatch.name} Workspace</h1>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Select a subject to take a class or upload materials</p>
              </div>
            </div>
            <button
              onClick={() => setActiveWorkspaceBatch(null)}
              style={{ padding: '8px 16px', background: '#374151', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
            >
              All Batches
            </button>
          </div>

          {/* Subjects hub list */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1f2937', marginBottom: '18px' }}>Select Subject Classroom Management</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
              {batchSubjects.map(sub => {
                const icon = SUBJECT_ICONS[sub.toLowerCase()] || '📘';
                return (
                  <div
                    key={sub}
                    onClick={() => {
                      setSelectedWorkspaceSubject(sub);
                      const matchedTeacher = (activeWorkspaceBatch.subjectsInfo || []).find(info => info.subject === sub);
                      const teacherName = matchedTeacher ? matchedTeacher.teacherName : '';
                      setNewClass(prev => ({ ...prev, subject: sub, teacher: teacherName })); // pre-fill subject & teacher!
                      setNewNoteForm(prev => ({ ...prev, subject: sub })); // pre-fill upload subject!
                    }}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '20px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      background: '#f9fafb',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.borderColor = '#5b4fcf';
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.background = '#f9fafb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <span style={{ fontSize: '40px' }}>{icon}</span>
                    <div>
                      <strong style={{ display: 'block', fontSize: '15px', color: '#111827' }}>{sub}</strong>
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>Scheduler & Notes</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // Subject Filters
    const filteredSchedule = (activeWorkspaceBatch.schedule || []).filter(cls =>
      !cls.subject || cls.subject.toLowerCase() === selectedWorkspaceSubject.toLowerCase()
    );

    const filteredNotes = workspaceNotes.filter(note =>
      !note.subject || note.subject.toLowerCase() === selectedWorkspaceSubject.toLowerCase()
    );

    return (
      <div className="ab-root" style={{ padding: '24px 0' }}>
        {toast && <div className="ab-toast">{toast}</div>}

        {/* Header Back navigation */}
        <div className="ab-workspace-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setSelectedWorkspaceSubject(null)}
              style={{ background: '#f3f4f6', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}
            >
              ←
            </button>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#111827' }}>{activeWorkspaceBatch.name} Workspace</h1>
              <p style={{ fontSize: '12px', color: '#5b4fcf', margin: 0, fontWeight: '700' }}>Active Subject: {selectedWorkspaceSubject}</p>
            </div>
          </div>
          <button
            onClick={() => { setSelectedWorkspaceSubject(null); setActiveWorkspaceBatch(null); }}
            style={{ padding: '8px 16px', background: '#374151', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
          >
            Exit Workspace
          </button>
        </div>

        {/* Tab Selection */}
        <div className="ab-workspace-tabs">
          {[
            { id: 'schedule', label: '📅 Class Schedule Slots' },
            { id: 'syllabus', label: '📖 Dynamic Syllabus & Lectures' },
            { id: 'notes', label: '📄 Batch PDF notes & materials' },
            { id: 'students', label: '🎓 Enrolled Students List' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setWorkspaceTab(tab.id)}
              style={{
                border: 'none',
                background: workspaceTab === tab.id ? '#5b4fcf' : 'transparent',
                color: workspaceTab === tab.id ? '#ffffff' : '#6b7280',
                padding: '10px 20px',
                borderRadius: '50px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px' }}>
          
          {workspaceTab === 'schedule' && (
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#1f2937', marginBottom: '16px' }}>Manage Live Classes Schedule</h2>
              
              {/* Existing Schedule Slots */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {filteredSchedule.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>No schedule slots added yet for this subject. Use the scheduler block below to add classes.</p>
                ) : (
                  filteredSchedule.map((cls, i) => {
                    const originalIdx = (activeWorkspaceBatch.schedule || []).findIndex(x => x === cls);
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', padding: '12px 18px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                        <div>
                          <strong style={{ fontSize: '14px', color: '#111827' }}>{cls.subject}</strong>
                          <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '12px' }}>by {cls.teacher}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#5b4fcf' }}>{cls.date ? `${cls.date} (${cls.day})` : cls.day} &bull; {cls.time}</span>
                          <button
                            onClick={() => handleRemoveWorkspaceSchedule(originalIdx)}
                            style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer' }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add Schedule row */}
              <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700' }}>Schedule a Class Slot</h4>
                <div className="ab-schedule-grid" style={{ gap: '12px', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600' }}>Subject</label>
                    <input type="text" value={selectedWorkspaceSubject} readOnly style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', background: '#f3f4f6', cursor: 'not-allowed', color: '#6b7280' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600' }}>Teacher Name</label>
                    <input type="text" placeholder="Teacher Name" value={newClass.teacher} onChange={e => setNewClass({...newClass, teacher: e.target.value})} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600' }}>Class Date</label>
                    <input type="date" value={newClass.date || ''} onChange={e => handleDateChange(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600' }}>Time Timing</label>
                    <input type="text" placeholder="e.g. 10:00 AM" value={newClass.time} onChange={e => setNewClass({...newClass, time: e.target.value})} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }} />
                  </div>
                  <button type="button" onClick={handleAddWorkspaceSchedule} style={{ background: '#5b4fcf', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                    + Schedule
                  </button>
                </div>
              </div>
            </div>
          )}

          {workspaceTab === 'syllabus' && (
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#1f2937', marginBottom: '16px' }}>Manage Course Chapters & Lectures ({selectedWorkspaceSubject})</h2>
              
              <div className="ab-syllabus-grid" style={{ gap: '24px', alignItems: 'start' }}>
                
                {/* Left Column: Chapters Sidebar */}
                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#4b5563', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.2px' }}>Course Chapters</h3>
                  
                  {/* Add Chapter Form */}
                  <form onSubmit={handleAddChapter} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <input
                      type="text"
                      placeholder="e.g. Chapter 01..."
                      value={newChapterTitle}
                      onChange={e => setNewChapterTitle(e.target.value)}
                      style={{ flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px' }}
                      required
                    />
                    <button type="submit" style={{ background: '#5b4fcf', color: '#fff', border: 'none', padding: '0 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                      + Add
                    </button>
                  </form>

                  {/* Chapters List */}
                  {chaptersLoading ? (
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>Loading chapters...</p>
                  ) : chapters.length === 0 ? (
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>No chapters created yet.</p>
                  ) : (
                    <div className="ab-chapters-list-wrap" style={{ gap: '6px' }}>
                      {chapters.map(c => {
                        const isSelected = selectedChapterId === c.id;
                        return (
                          <div
                            key={c.id}
                            className="ab-chapter-item"
                            onClick={() => setSelectedChapterId(c.id)}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '10px 12px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              background: isSelected ? '#eff6ff' : 'transparent',
                              border: isSelected ? '1.5px solid #3b82f6' : '1px solid transparent',
                              transition: 'all 0.15s'
                            }}
                          >
                            <span style={{ fontSize: '13px', fontWeight: isSelected ? '700' : '500', color: isSelected ? '#1e40af' : '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }} title={c.title}>
                              {c.title}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleDeleteChapter(c.id); }}
                              style={{ border: 'none', background: 'transparent', color: '#ef4444', fontSize: '14px', cursor: 'pointer', opacity: isSelected ? 1 : 0.4 }}
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right Column: Selected Chapter's Lectures */}
                <div>
                  {selectedChapterId ? (
                    <div>
                      {/* Add Lecture Form */}
                      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                        <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: '800', color: '#1f2937' }}>Add Lecture / Topic to Selected Chapter</h4>
                        
                        <form onSubmit={handleAddLecture} className="ab-lecture-grid" style={{ gap: '12px', alignItems: 'flex-end' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Lecture Title</label>
                            <input
                              type="text"
                              placeholder="e.g. Lec 01: Basics"
                              value={newLecture.title}
                              onChange={e => setNewLecture(prev => ({ ...prev, title: e.target.value }))}
                              style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                              required
                            />
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Duration</label>
                            <input
                              type="text"
                              placeholder="e.g. 1h 30m"
                              value={newLecture.duration}
                              onChange={e => setNewLecture(prev => ({ ...prev, duration: e.target.value }))}
                              style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                            />
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Status</label>
                            <select
                              value={newLecture.status}
                              onChange={e => setNewLecture(prev => ({ ...prev, status: e.target.value }))}
                              style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                            >
                              <option value="Completed">Completed</option>
                              <option value="Live Now">Live Now</option>
                              <option value="Upcoming">Upcoming</option>
                            </select>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Youtube Lecture Link</label>
                            <input
                              type="url"
                              placeholder="e.g. https://youtube.com/watch?v=..."
                              value={newLecture.youtubeUrl}
                              onChange={e => setNewLecture(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                              style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                            />
                          </div>

                          <button type="submit" style={{ background: '#5b4fcf', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                            + Add Topic
                          </button>
                        </form>
                      </div>

                      {/* Lectures List */}
                      <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#374151', marginBottom: '12px' }}>Topic Lectures in Chapter</h4>
                      {lecturesLoading ? (
                        <p style={{ fontSize: '13px', color: '#6b7280' }}>Loading lectures...</p>
                      ) : lectures.length === 0 ? (
                        <p style={{ fontSize: '13px', color: '#6b7280' }}>No topics added to this chapter yet. Use the form above to add lectures.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {lectures.map((lec) => (
                            <div key={lec.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                              <div>
                                <strong style={{ fontSize: '14px', color: '#111827', display: 'block' }}>{lec.title}</strong>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                                  <span style={{ fontSize: '11px', color: '#6b7280' }}>Duration: {lec.duration}</span>
                                  {lec.youtubeUrl && (
                                    <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '600' }}>🎬 Youtube Video Linked</span>
                                  )}
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  background: lec.status === 'Live Now' ? '#fee2e2' : lec.status === 'Upcoming' ? '#eff6ff' : '#f3f4f6',
                                  color: lec.status === 'Live Now' ? '#dc2626' : lec.status === 'Upcoming' ? '#2563eb' : '#4b5563'
                                }}>
                                  {lec.status}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLecture(lec.id)}
                                  style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer' }}
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                      <p style={{ color: '#6b7280', fontSize: '14px' }}>Select or create a chapter on the left to start adding lectures.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {workspaceTab === 'notes' && (
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#1f2937', marginBottom: '16px' }}>Upload & Manage PDF Reference Materials</h2>

              {/* Upload form block */}
              <form onSubmit={handleUploadWorkspaceNote} style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>Upload New PDF Worksheet / Notes</h4>
                <div className="ab-note-grid" style={{ gap: '12px', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600' }}>Title</label>
                    <input type="text" placeholder="e.g. Vector DPP 01" value={newNoteForm.title} onChange={e => setNewNoteForm({...newNoteForm, title: e.target.value})} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }} required />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600' }}>Subject</label>
                    <input type="text" value={selectedWorkspaceSubject} readOnly style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', background: '#f3f4f6', cursor: 'not-allowed', color: '#6b7280' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600' }}>Pick Document</label>
                    <input id="workspace-file-upload" type="file" onChange={e => setNewNoteForm({...newNoteForm, file: e.target.files[0]})} style={{ fontSize: '12px' }} required />
                  </div>
                  <button type="submit" disabled={uploadingNote} style={{ background: '#5b4fcf', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                    {uploadingNote ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </form>

              {/* Materials list */}
              {notesLoading ? (
                <p>Loading files...</p>
              ) : filteredNotes.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#6b7280' }}>No worksheets uploaded yet for this subject.</p>
              ) : (
                <div className="ab-batch-table-wrap">
                  <table className="ab-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Subject</th>
                        <th>Format</th>
                        <th>Created At</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNotes.map(note => (
                        <tr key={note.id}>
                          <td><strong>{note.title}</strong></td>
                          <td><span className="ab-tag">{note.subject}</span></td>
                          <td style={{ fontSize: '12px' }}>{note.originalName?.split('.').pop().toUpperCase() || 'PDF'}</td>
                          <td style={{ fontSize: '12px' }}>{new Date(note.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button
                              onClick={() => handleDeleteWorkspaceNote(note.id)}
                              style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {workspaceTab === 'students' && (
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#1f2937', marginBottom: '16px' }}>Enrolled Students Roster</h2>
              
              {studentsLoading ? (
                <p>Loading roster...</p>
              ) : enrolledStudents.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#6b7280' }}>No students enrolled in this batch yet.</p>
              ) : (
                <div className="ab-batch-table-wrap">
                  <table className="ab-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Login ID</th>
                        <th>Email</th>
                        <th>Class Grade</th>
                        <th>Registration Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrolledStudents.map(student => (
                        <tr key={student.id}>
                          <td><strong>{student.studentName}</strong></td>
                          <td>{student.loginId}</td>
                          <td>{student.email || '—'}</td>
                          <td>Grade {student.classGrade}</td>
                          <td>{student.registrationDate || new Date(student.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    );
  }

  return (
    <div className="ab-root">
      {toast && <div className="ab-toast">{toast}</div>}

      {/* Header */}
      <div className="ab-header">
        <div>
          <h1 className="ab-title">Batch Management</h1>
          <p className="ab-subtitle">Create and manage batches for students</p>
        </div>
        <button className="ab-create-btn" onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Batch
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="ab-form-card">
          <div className="ab-form-header">
            <h2>{editId ? 'Edit Batch' : 'Create New Batch'}</h2>
            <button className="ab-form-close" onClick={() => { setShowForm(false); setEditId(null); }}>✕</button>
          </div>
          <form onSubmit={handleSubmit} className="ab-form">
            {/* Row 1 */}
            <div className="ab-form-row">
              <div className="ab-field">
                <label>Batch Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. NEET Foundation 2027" required />
              </div>
              <div className="ab-field">
                <label>Language</label>
                <select value={form.language} onChange={e => setForm({...form, language: e.target.value})}>
                  <option>Hinglish</option>
                  <option>Hindi</option>
                  <option>English</option>
                </select>
              </div>
              <div className="ab-field">
                <label>Tag</label>
                <select value={form.tag} onChange={e => setForm({...form, tag: e.target.value})}>
                  <option>PREMIUM</option>
                  <option>STANDARD</option>
                  <option>INFINITY</option>
                  <option>BASIC</option>
                </select>
              </div>
            </div>

            {/* Row 2 */}
            <div className="ab-form-row">
              <div className="ab-field">
                <label>Target Audience</label>
                <input type="text" value={form.targetAudience} onChange={e => setForm({...form, targetAudience: e.target.value})} placeholder="e.g. For Class XI-XII Students" />
              </div>
              <div className="ab-field">
                <label>Features</label>
                <input type="text" value={form.features} onChange={e => setForm({...form, features: e.target.value})} placeholder="e.g. Study Material Included" />
              </div>
            </div>

            {/* Instructor & Subject Details Row */}
            <div className="ab-form-row" style={{ display: 'block', gridColumn: 'span 3' }}>
              <div className="ab-field" style={{ width: '100%', marginBottom: '16px' }}>
                <label style={{ fontWeight: '750', marginBottom: '8px', display: 'block' }}>Batch Subjects * (Select all subjects taught in this batch)</label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', background: '#f9fafb', padding: '12px 18px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                  {(subjects.length > 0 ? subjects.map(s => s.name) : DEFAULT_SUBJECTS).map(sub => {
                    const isChecked = (form.subjects || []).includes(sub);
                    return (
                      <label key={sub} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: isChecked ? '#eff6ff' : '#fff', padding: '6px 12px', borderRadius: '50px', border: isChecked ? '1.5px solid #5b4fcf' : '1px solid #d1d5db', transition: 'all 0.15s' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const updatedSubjects = isChecked
                              ? (form.subjects || []).filter(s => s !== sub)
                              : [...(form.subjects || []), sub];
                              
                            const updatedInfo = isChecked
                              ? (form.subjectsInfo || []).filter(info => info.subject !== sub)
                              : [...(form.subjectsInfo || []), { subject: sub, teacherName: '', teacherQualification: '' }];
                              
                            setForm(prev => ({ ...prev, subjects: updatedSubjects, subjectsInfo: updatedInfo }));
                          }}
                          style={{ display: 'none' }}
                        />
                        <span>{sub}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Subject-Specific Teacher Assignments */}
              {(form.subjects || []).length > 0 && (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ fontWeight: '750', fontSize: '13px', color: '#475569' }}>Assign Subject Instructors & Qualifications</label>
                  {form.subjects.map((sub) => {
                    const idx = (form.subjectsInfo || []).findIndex(info => info.subject === sub);
                    const info = (form.subjectsInfo || [])[idx] || { subject: sub, teacherName: '', teacherQualification: '' };
                    return (
                      <div key={sub} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 3fr', gap: '16px', alignItems: 'center', background: '#f8fafc', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>{sub} Instructor</span>
                        <input
                          type="text"
                          placeholder="Teacher Name (e.g. Mr. R. Sharma)"
                          value={info.teacherName || ''}
                          onChange={e => {
                            const newInfoList = [...(form.subjectsInfo || [])];
                            if (idx === -1) {
                              newInfoList.push({ subject: sub, teacherName: e.target.value, teacherQualification: '' });
                            } else {
                              newInfoList[idx] = { ...info, teacherName: e.target.value };
                            }
                            setForm(prev => ({ ...prev, subjectsInfo: newInfoList }));
                          }}
                          style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit' }}
                        />
                        <input
                          type="text"
                          placeholder="Qualifications (e.g. B.Tech IIT, 6+ Yrs Exp)"
                          value={info.teacherQualification || ''}
                          onChange={e => {
                            const newInfoList = [...(form.subjectsInfo || [])];
                            if (idx === -1) {
                              newInfoList.push({ subject: sub, teacherName: '', teacherQualification: e.target.value });
                            } else {
                              newInfoList[idx] = { ...info, teacherQualification: e.target.value };
                            }
                            setForm(prev => ({ ...prev, subjectsInfo: newInfoList }));
                          }}
                          style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit' }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="ab-field">
              <label>Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} placeholder="Brief description of the batch..." />
            </div>

            {/* Row 3 - Dates */}
            <div className="ab-form-row">
              <div className="ab-field">
                <label>Start Date</label>
                <input type="text" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} placeholder="e.g. 1 Jul, 2026" />
              </div>
              <div className="ab-field">
                <label>End Date</label>
                <input type="text" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} placeholder="e.g. 30 Jun, 2027" />
              </div>
            </div>

            {/* Row 4 - Pricing */}
            <div className="ab-form-row">
              <div className="ab-field">
                <label>Price (₹)</label>
                <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="4900" min="0" />
              </div>
              <div className="ab-field">
                <label>MRP (₹)</label>
                <input type="number" value={form.mrp} onChange={e => setForm({...form, mrp: e.target.value})} placeholder="5500" min="0" />
              </div>
              <div className="ab-field">
                <label>Discount (%)</label>
                <input type="number" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} placeholder="11" min="0" max="100" />
              </div>
            </div>

            {/* Image URL */}
            <div className="ab-field">
              <label>Thumbnail Image URL (optional)</label>
              <input type="url" value={form.image} onChange={e => setForm({...form, image: e.target.value})} placeholder="https://..." />
            </div>

            {/* Online toggle */}
            <div className="ab-toggle-row">
              <label className="ab-toggle-label">
                <div className={`ab-toggle ${form.isOnline ? 'on' : ''}`} onClick={() => setForm({...form, isOnline: !form.isOnline})} />
                Online Batch
              </label>
            </div>

            {/* ── Schedule Builder ── */}
            <div className="ab-schedule-section">
              <h3>Class Schedule</h3>
              {form.schedule.length > 0 && (
                <div className="ab-schedule-list">
                  {form.schedule.map((cls, i) => (
                    <div key={i} className="ab-schedule-item">
                      <span className="ab-schedule-subj">{cls.subject}</span>
                      <span>{cls.teacher}</span>
                      <span>{cls.date ? `${cls.date} (${cls.day})` : cls.day}</span>
                      <span>{cls.time}</span>
                      <button type="button" onClick={() => removeScheduleClass(i)} className="ab-rm-btn">✕</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="ab-add-class-row">
                <select value={newClass.subject} onChange={e => setNewClass({...newClass, subject: e.target.value})}>
                  <option value="">Select subject...</option>
                  {subjects.length > 0 ? (
                    subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)
                  ) : (
                    DEFAULT_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)
                  )}
                </select>
                <input type="text" placeholder="Teacher" value={newClass.teacher} onChange={e => setNewClass({...newClass, teacher: e.target.value})} />
                 <input type="date" value={newClass.date || ''} onChange={e => handleDateChange(e.target.value)} />
                <input type="text" placeholder="Time (e.g. 10:00 AM)" value={newClass.time} onChange={e => setNewClass({...newClass, time: e.target.value})} />
                <button type="button" onClick={addScheduleClass} className="ab-add-btn">+ Add</button>
              </div>
            </div>

            {/* Submit */}
            <div className="ab-form-actions">
              <button type="button" className="ab-cancel-btn" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
              <button type="submit" className="ab-save-btn" disabled={saving}>
                {saving ? 'Saving…' : editId ? 'Update Batch' : 'Create Batch'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Batch List */}
      {loading ? (
        <div className="ab-loading">Loading batches…</div>
      ) : batches.length === 0 ? (
        <div className="ab-empty">
          <span>📦</span>
          <p>No batches created yet. Click <strong>Create Batch</strong> to get started.</p>
        </div>
      ) : (
        <div className="ab-batch-table-wrap">
          <table className="ab-table">
            <thead>
              <tr>
                <th>Batch Name</th>
                <th>Language</th>
                <th>Audience</th>
                <th>Dates</th>
                <th>Price</th>
                <th>Classes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map(b => (
                <tr key={b.id}>
                  <td>
                    <div className="ab-name-cell">
                      <strong>{b.name}</strong>
                      {b.tag && <span className="ab-tag">{b.tag}</span>}
                    </div>
                  </td>
                  <td>{b.language || '—'}</td>
                  <td style={{ fontSize: 12, color: '#6b7280' }}>{b.targetAudience || '—'}</td>
                  <td style={{ fontSize: 12, whiteSpace:'nowrap' }}>{b.startDate || '?'} → {b.endDate || '?'}</td>
                  <td>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>₹{Number(b.price || 0).toLocaleString('en-IN')}</div>
                    {b.discount ? <div style={{ fontSize: 11, color:'#22c55e' }}>{b.discount}% OFF</div> : null}
                  </td>
                  <td>
                    <span className="ab-cls-count">{(b.schedule || []).length} classes/wk</span>
                  </td>
                  <td>
                    <div className="ab-action-btns">
                      <button className="ab-edit-btn" style={{ background: '#e0e7ff', color: '#4f46e5' }} onClick={() => { setActiveWorkspaceBatch(b); setWorkspaceTab('schedule'); }}>
                        Workspace
                      </button>
                      <button className="ab-edit-btn" onClick={() => handleEdit(b)}>Edit</button>
                      {deleteId === b.id ? (
                        <>
                          <button className="ab-confirm-del" onClick={() => handleDelete(b.id)}>Confirm</button>
                          <button className="ab-cancel-del" onClick={() => setDeleteId(null)}>Cancel</button>
                        </>
                      ) : (
                        <button className="ab-del-btn" onClick={() => setDeleteId(b.id)}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBatches;
