import { useState, useEffect } from 'react';
import { getEvents, createEvent, updateEvent, deleteEvent, getApplicantsForEvent, updateApplicantStatus } from '../services/api';

function ManageCandidates({ event, onBack }) {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    getApplicantsForEvent(event.id).then(data => {
      setApplicants(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [event.id]);

  const handleStatusChange = async (volId, newStatus) => {
    try {
      await updateApplicantStatus(event.id, volId, newStatus);
      setApplicants(prev => prev.map(a => a.volunteer.id === volId ? { ...a, status: newStatus } : a));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const filtered = filter === 'ALL' ? applicants : applicants.filter(a => a.status === filter);

  return (
    <div className="manage-candidates-view animate-fadeUp">
      <button onClick={onBack} className="btn btn-ghost" style={{ marginBottom: '1.5rem', padding: '0.4rem 0.8rem' }}>
        ← Back to Events
      </button>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Applicants: {event.title}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Review and manage volunteers who applied for this event.</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.4rem 1rem', borderRadius: 999, fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer',
              background: filter === f ? 'var(--primary)' : 'var(--bg-glass)',
              color: filter === f ? 'white' : 'var(--text-muted)'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading applicants...</div>
      ) : applicants.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
          No volunteers have applied for this event yet.
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No applicants match the filter "{filter}".</div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filtered.map(app => (
            <div key={app.volunteer.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '1rem', padding: '1.25rem 1.5rem'
            }}>
              {/* Left Info */}
              <div style={{ flex: 1, minWidth: '250px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem'
                  }}>
                    {app.volunteer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>{app.volunteer.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{app.volunteer.email}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                  {app.volunteer.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                    <span key={s} style={{ background: 'var(--bg-glass)', color: 'var(--text-muted)', padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.7rem' }}>{s}</span>
                  ))}
                  <span style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#3b82f6', padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600 }}>
                    ⏱ {app.volunteer.hoursLogged}h total
                  </span>
                </div>
              </div>

              {/* Middle Score */}
              <div style={{ textAlign: 'center', padding: '0 2rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: app.matchScore >= 75 ? '#16a34a' : app.matchScore >= 40 ? 'var(--gold)' : '#ef4444' }}>
                  {app.matchScore}%
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Match</div>
              </div>

              {/* Right Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', minWidth: '180px', justifyContent: 'flex-end', alignItems: 'center' }}>
                {app.status === 'PENDING' ? (
                  <>
                    <button 
                      onClick={() => handleStatusChange(app.volunteer.id, 'REJECTED')}
                      style={{ padding: '0.5rem 1rem', borderRadius: 999, border: '1px solid rgba(239, 68, 68, 0.3)', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                    >✕ Reject</button>
                    <button 
                      onClick={() => handleStatusChange(app.volunteer.id, 'APPROVED')}
                      style={{ padding: '0.5rem 1rem', borderRadius: 999, border: 'none', background: '#16a34a', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                    >✓ Approve</button>
                  </>
                ) : (
                  <span style={{
                    padding: '0.4rem 1rem', borderRadius: 999, fontSize: '0.8rem', fontWeight: 700,
                    background: app.status === 'APPROVED' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: app.status === 'APPROVED' ? '#16a34a' : '#ef4444',
                    display: 'flex', alignItems: 'center', gap: '0.3rem'
                  }}>
                    {app.status === 'APPROVED' ? '✓ Approved' : '✕ Rejected'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Organize({ user }) {
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const defaultForm = { title: '', description: '', requiredSkill: '', requiredVolunteers: 5, duration: 2 };
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    // Only fetch events created by this user
    getEvents().then(allEvs => {
      setEvents(allEvs.filter(e => e.organizerId === user.id || !e.organizerId)); 
    }).catch(() => setEvents([]));
  }, [user.id]);

  if (activeEvent) {
    return <ManageCandidates event={activeEvent} onBack={() => setActiveEvent(null)} />;
  }

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        // Update existing
        const updated = await updateEvent(editingId, { ...form, requiredVolunteers: Number(form.requiredVolunteers), duration: Number(form.duration) });
        setEvents(prev => prev.map(ev => ev.id === editingId ? updated : ev));
      } else {
        // Create new
        const created = await createEvent({ 
          ...form, 
          requiredVolunteers: Number(form.requiredVolunteers), 
          duration: Number(form.duration),
          organizerId: user.id
        });
        setEvents(prev => [created, ...prev]);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(defaultForm);
    } catch (err) {
      alert(err.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (ev) => {
    setEditingId(ev.id);
    setForm({
      title: ev.title,
      description: ev.description || '',
      requiredSkill: ev.requiredSkill || '',
      requiredVolunteers: ev.requiredVolunteers,
      duration: ev.duration
    });
    setShowForm(true);
    // gently scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      alert("Failed to delete event");
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(defaultForm);
  };

  const totalVolunteers = events.reduce((acc, e) => acc + e.currentVolunteers, 0);
  const activeEvents = events.filter(e => e.status === 'UPCOMING').length;

  return (
    <div className="page-container animate-fadeUp">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, marginBottom: '0.4rem' }}>Organize</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Create and manage your volunteer events.</p>
        </div>
        <button className="btn btn-primary" onClick={showForm ? cancelForm : () => setShowForm(true)}>
          {showForm ? '✕ Cancel' : '+ Create Event'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Events', value: events.length },
          { label: 'Active Events', value: activeEvents },
          { label: 'Total Volunteers', value: totalVolunteers },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="admin-form-card" style={{ marginBottom: '2rem', animation: 'fadeUp 0.3s ease' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
            {editingId ? 'Edit Event' : 'New Event'}
          </h2>
          <form onSubmit={handleCreateOrUpdate}>
            <div className="form-grid" style={{ marginBottom: '1rem' }}>
              <div className="form-group">
                <label>Event Title</label>
                <input className="form-control" name="title" placeholder="e.g. Beach Cleanup Drive" value={form.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Required Skill</label>
                <input className="form-control" name="requiredSkill" placeholder="e.g. Java, Leadership" value={form.requiredSkill} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Volunteers Needed</label>
                <input className="form-control" type="number" name="requiredVolunteers" min={1} value={form.requiredVolunteers} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Duration (hours)</label>
                <input className="form-control" type="number" name="duration" min={1} value={form.duration} onChange={handleChange} required />
              </div>
              <div className="form-group full-width">
                <label>Description</label>
                <textarea className="form-control" name="description" placeholder="Brief description of the event…" value={form.description} onChange={handleChange} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-start' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving…' : editingId ? 'Update Event' : 'Create Event'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-ghost" onClick={cancelForm}>Cancel</button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Events Table */}
      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h2>Your Events</h2>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Skills</th>
              <th>Volunteers</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>No events yet. Create one above!</td></tr>
            ) : events.map(ev => {
              const fill = Math.round((ev.currentVolunteers / ev.requiredVolunteers) * 100);
              return (
                <tr key={ev.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{ev.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{ev.description?.slice(0, 60)}…</div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ev.requiredSkill || '—'}</td>
                  <td>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{ev.currentVolunteers}/{ev.requiredVolunteers}</div>
                    <div style={{ width: '80px', height: 4, background: 'var(--border)', borderRadius: 999, marginTop: '0.3rem', overflow: 'hidden' }}>
                      <div style={{ width: `${fill}%`, height: '100%', background: 'var(--primary)', borderRadius: 999 }} />
                    </div>
                  </td>
                  <td>
                    <span style={{
                      padding: '0.25rem 0.65rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700,
                      background: ev.status === 'UPCOMING' ? 'rgba(37,99,235,0.1)' : 'rgba(5,150,105,0.1)',
                      color: ev.status === 'UPCOMING' ? 'var(--primary)' : '#059669',
                    }}>{ev.status}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => startEdit(ev)}
                        className="btn btn-ghost"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(ev.id, ev.title)}
                        className="btn btn-ghost"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: '#ef4444' }}
                      >
                        Delete
                      </button>
                      <button 
                        onClick={() => setActiveEvent(ev)}
                        className="btn" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--primary)', border: 'none', color: 'white' }}
                      >
                        Manage Candidates
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
