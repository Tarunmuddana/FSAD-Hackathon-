import { useState, useEffect, useCallback } from 'react';
import { getEvents, createEvent } from '../services/api';

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="toast-container">
      <div className="toast success">
        <span>✅</span>
        <span>{msg}</span>
        <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
      </div>
    </div>
  );
}

const EMPTY = { title: '', description: '', requiredSkill: '', requiredVolunteers: '', duration: '' };

export default function AdminPanel() {
  const [events, setEvents]     = useState([]);
  const [form, setForm]         = useState(EMPTY);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSub]    = useState(false);
  const [toast, setToast]       = useState('');

  useEffect(() => {
    getEvents()
      .then(data => setEvents([...data].reverse()))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.requiredVolunteers) return;
    setSub(true);
    try {
      const created = await createEvent({
        ...form,
        requiredVolunteers: parseInt(form.requiredVolunteers, 10),
        duration: parseInt(form.duration, 10) || 0,
      });
      setEvents(prev => [created, ...prev]);
      setForm(EMPTY);
      setToast(`Event "${created.title}" created successfully!`);
    } finally {
      setSub(false);
    }
  };

  const dismissToast = useCallback(() => setToast(''), []);

  return (
    <div className="page-container admin-layout animate-fadeIn">
      {toast && <Toast msg={toast} onClose={dismissToast} />}

      <div className="page-header">
        <h1 className="page-title">Admin Panel</h1>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {events.length} event{events.length !== 1 ? 's' : ''} total
        </div>
      </div>

      {/* ── Create Form ── */}
      <div className="admin-form-card animate-fadeUp">
        <h2>➕ Create New Event</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label>Event Title *</label>
            <input name="title" className="form-control" placeholder="e.g. Beach Cleanup"
              value={form.title} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Required Volunteers *</label>
            <input name="requiredVolunteers" type="number" min="1"
              className="form-control" placeholder="10"
              value={form.requiredVolunteers} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Required Skills (comma-separated)</label>
            <input name="requiredSkill" className="form-control"
              placeholder="e.g. React, Python, Teamwork"
              value={form.requiredSkill} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Duration (hours)</label>
            <input name="duration" type="number" min="1"
              className="form-control" placeholder="4"
              value={form.duration} onChange={handleChange} />
          </div>

          <div className="form-group full-width">
            <label>Description</label>
            <textarea name="description" className="form-control" rows="3"
              placeholder="Describe what volunteers will do…"
              value={form.description} onChange={handleChange} />
          </div>

          <div className="form-group full-width">
            <button type="submit" className="btn btn-primary" disabled={submitting}
              style={{ width: 'fit-content' }}>
              {submitting ? '⏳ Creating…' : '✦ Create Event'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Event Table ── */}
      <div className="admin-table-wrap animate-fadeUp" style={{ animationDelay: '0.1s' }}>
        <div className="admin-table-header">
          <h2>All Events</h2>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>⏳ Loading…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Required Skills</th>
                  <th>Duration</th>
                  <th>Volunteers</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>No events yet.</td></tr>
                ) : events.map(ev => (
                  <tr key={ev.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{ev.id}</td>
                    <td style={{ fontWeight: 600 }}>{ev.title}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{ev.requiredSkill || '—'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{ev.duration ? `${ev.duration}h` : '—'}</td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{ev.currentVolunteers}</span>
                      <span style={{ color: 'var(--text-muted)' }}> / {ev.requiredVolunteers}</span>
                    </td>
                    <td>
                      <span className={`event-status-badge ${(ev.status ?? 'UPCOMING').toLowerCase()}`} style={{ display: 'inline-flex', marginBottom: '4px' }}>
                        {ev.status ?? 'UPCOMING'}
                      </span>
                      {ev.status === 'UPCOMING' && (
                        <button 
                          className="btn btn-sm btn-ghost" 
                          style={{ display: 'block', fontSize: '0.7rem', padding: '0.2rem 0.5rem', marginTop: '0.2rem' }}
                          onClick={async () => {
                            try {
                              const msg = await completeEvent(ev.id);
                              setToast(msg);
                              setEvents(events.map(e => e.id === ev.id ? { ...e, status: 'COMPLETED' } : e));
                            } catch (err) { alert(err.message); }
                          }}
                        >
                          Mark Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
