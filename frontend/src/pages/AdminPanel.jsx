import { useState, useEffect } from 'react'
import { getEvents, createEvent, deleteEvent, completeEvent } from '../services/api'
import Toast from '../components/Toast'
import './Pages.css'

export default function AdminPanel({ user, onNotify }) {
  const [events, setEvents] = useState([])
  const [form, setForm] = useState({ title: '', description: '', location: '', eventDate: '', eventTime: '', requiredSkill: '', requiredVolunteers: '', duration: '' })
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    getEvents()
      .then(data => { setEvents(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title) return
    try {
      const newEvent = await createEvent({
        title: form.title,
        description: form.description || null,
        location: form.location || null,
        eventDate: form.eventDate || null,
        eventTime: form.eventTime || null,
        requiredSkill: form.requiredSkill,
        requiredVolunteers: parseInt(form.requiredVolunteers) || 10,
        duration: parseFloat(form.duration) || 4,
        currentVolunteers: 0,
        status: "UPCOMING"
      })
      setEvents(prev => [newEvent, ...prev])
      setForm({ title: '', description: '', location: '', eventDate: '', eventTime: '', requiredSkill: '', requiredVolunteers: '', duration: '' })
      showToast('Event created successfully!')
      onNotify?.('New event "' + newEvent.title + '" has been created!', 'success')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleComplete = async (eventId) => {
    try {
      await completeEvent(eventId)
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: 'COMPLETED' } : e))
      showToast('Event marked as completed! Volunteer hours have been updated.')
      onNotify?.('An event was completed — volunteer hours updated!', 'success')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleDelete = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    try {
      await deleteEvent(eventId)
      setEvents(prev => prev.filter(e => e.id !== eventId))
      showToast('Event deleted.')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const upcoming = events.filter(e => e.status !== 'COMPLETED')
  const completed = events.filter(e => e.status === 'COMPLETED')

  return (
    <div className="page">
      <header className="page-header fade-up">
        <div>
          <h1 className="page-title">Organize Events</h1>
          <p className="page-subtitle">Create and manage community service events</p>
        </div>
      </header>

      {/* Create Event Form */}
      <div className="admin-form-card fade-up">
        <div className="form-header">
          <div className="form-header-icon">🎯</div>
          <div>
            <h2 className="form-heading">Create a new event</h2>
            <p className="form-subheading">Fill in the details. Volunteers will be matched automatically based on their skills.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="input-group">
            <label className="input-label">Event Name *</label>
            <input className="form-input" placeholder="e.g., Beach Cleanup Drive" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>

          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea className="form-input form-textarea"
              placeholder="What will volunteers be doing? Any important details?"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
          </div>

          <div className="form-row">
            <div className="input-group">
              <label className="input-label">Location</label>
              <input className="form-input" placeholder="e.g., Central Park, NYC" value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Required Skill</label>
              <input className="form-input" placeholder="e.g., Python" value={form.requiredSkill}
                onChange={e => setForm(f => ({ ...f, requiredSkill: e.target.value }))} />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label className="input-label">Date</label>
              <input className="form-input" type="date" value={form.eventDate}
                onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Time</label>
              <input className="form-input" type="time" value={form.eventTime}
                onChange={e => setForm(f => ({ ...f, eventTime: e.target.value }))} />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label className="input-label">Volunteers Needed</label>
              <input className="form-input" placeholder="10" type="number" min="1" value={form.requiredVolunteers}
                onChange={e => setForm(f => ({ ...f, requiredVolunteers: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Duration (hours)</label>
              <input className="form-input" placeholder="4" type="number" min="1" value={form.duration}
                onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
            </div>
          </div>

          <button type="submit" className="btn-create">Create Event →</button>
        </form>
      </div>

      {/* Upcoming Events */}
      <section className="section fade-up fade-up-delay-1">
        <h2 className="section-title">Upcoming Events ({upcoming.length})</h2>
        {loading ? (
          <div className="loading-state">Loading…</div>
        ) : upcoming.length === 0 ? (
          <div className="empty-state">No upcoming events. Create one above!</div>
        ) : (
          <div className="admin-event-list">
            {upcoming.map(event => (
              <div key={event.id} className="admin-event-row">
                <div className="admin-event-info">
                  <span className="admin-event-title">{event.title}</span>
                  <span className="admin-event-meta">
                    {event.requiredSkill || 'Open to all'}
                    {event.location && ` · 📍 ${event.location}`}
                    {event.eventDate && ` · 📅 ${event.eventDate}`}
                    {event.eventTime && ` · 🕐 ${event.eventTime}`}
                    {` · ${event.duration}h`}
                  </span>
                </div>
                <div className="admin-event-actions">
                  <span className="volunteer-count">{event.currentVolunteers}/{event.requiredVolunteers} joined</span>
                  <button className="btn-action complete" onClick={() => handleComplete(event.id)}>✓ Complete</button>
                  <button className="btn-action delete" onClick={() => handleDelete(event.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Completed Events */}
      {completed.length > 0 && (
        <section className="section fade-up fade-up-delay-2">
          <h2 className="section-title">Completed ({completed.length})</h2>
          <div className="admin-event-list">
            {completed.map(event => (
              <div key={event.id} className="admin-event-row completed-row">
                <div className="admin-event-info">
                  <span className="admin-event-title">{event.title}</span>
                  <span className="admin-event-meta">
                    {event.requiredSkill || 'Open to all'} · {event.duration}h
                    {event.location && ` · 📍 ${event.location}`}
                  </span>
                </div>
                <div className="admin-event-actions">
                  <span className="status-badge completed">Completed</span>
                  <button className="btn-action delete" onClick={() => handleDelete(event.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
