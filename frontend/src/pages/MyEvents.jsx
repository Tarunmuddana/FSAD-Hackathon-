import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyEvents, unregisterFromEvent } from '../services/api'
import Toast from '../components/Toast'
import './Pages.css'

export default function MyEvents({ user }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    getMyEvents(user.id)
      .then(data => { setEvents(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user])

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleUnregister = async (eventId) => {
    if (!confirm("Are you sure you want to unregister from this event?")) return
    try {
      await unregisterFromEvent(user.id, eventId)
      setEvents(prev => prev.filter(e => e.id !== eventId))
      showToast("Successfully unregistered from the event.")
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  if (!user) {
    return (
      <div className="page">
        <div className="empty-state">Please sign in to see your events.</div>
      </div>
    )
  }

  const upcoming = events.filter(e => e.status !== 'COMPLETED')
  const completed = events.filter(e => e.status === 'COMPLETED')

  return (
    <div className="page">
      <header className="page-header fade-up">
        <div>
          <h1 className="page-title">My Events</h1>
          <p className="page-subtitle">Events you've signed up for</p>
        </div>
      </header>

      {loading ? (
        <div className="loading-state">Loading your events…</div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>You haven't signed up for any events yet.</p>
          <p className="empty-hint">Head over to <strong>Discover</strong> to find events that match your skills!</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="section fade-up">
              <h2 className="section-title">Upcoming ({upcoming.length})</h2>
              <div className="my-events-list">
                {upcoming.map(event => (
                  <div key={event.id} className="my-event-card">
                    <div className="my-event-status-dot upcoming" />
                    <div className="my-event-body">
                      <h3 className="my-event-title">{event.title}</h3>
                      <div className="my-event-details">
                        <span>{event.requiredSkill || 'Open to all'}</span>
                        {event.location && <span>📍 {event.location}</span>}
                        {event.eventDate && <span>📅 {event.eventDate}</span>}
                        {event.eventTime && <span>🕐 {event.eventTime}</span>}
                        <span>⏱ {event.duration}h</span>
                      </div>
                      {event.description && <p className="my-event-desc">{event.description}</p>}
                    </div>
                    <div className="my-event-actions">
                      <button className="btn-event-chat" onClick={() => navigate('/chat')} title="Open group chat">
                        💬 Chat
                      </button>
                      <button className="btn-action delete" onClick={() => handleUnregister(event.id)}>
                        Unregister
                      </button>
                      <div className="my-event-badge upcoming">Upcoming</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section className="section fade-up fade-up-delay-1">
              <h2 className="section-title">Completed ({completed.length})</h2>
              <div className="my-events-list">
                {completed.map(event => (
                  <div key={event.id} className="my-event-card completed">
                    <div className="my-event-status-dot completed" />
                    <div className="my-event-body">
                      <h3 className="my-event-title">{event.title}</h3>
                      <div className="my-event-details">
                        <span>{event.requiredSkill || 'Open to all'}</span>
                        {event.location && <span>📍 {event.location}</span>}
                        <span>⏱ {event.duration}h earned</span>
                      </div>
                    </div>
                    <div className="my-event-badge completed">✓ Completed</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
