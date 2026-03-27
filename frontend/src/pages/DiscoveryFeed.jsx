import { useState, useEffect } from 'react'
import { getMatchesForVolunteer, getEvents, registerForEvent } from '../services/api'
import EventCard from '../components/EventCard'
import SearchBar from '../components/SearchBar'
import Toast from '../components/Toast'
import './Pages.css'

export default function DiscoveryFeed({ user, onNotify }) {
  const [matches, setMatches] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const loadData = async () => {
    setLoading(true)
    try {
      if (user) {
        const data = await getMatchesForVolunteer(user.id)
        setMatches(data)
      } else {
        const events = await getEvents()
        setMatches(events.map(e => ({ event: e, compatibilityScore: 0 })))
      }
    } catch { /* silent */ }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [user])

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const [registeringEvent, setRegisteringEvent] = useState(null)
  const [appNote, setAppNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRegisterClick = (eventId) => {
    if (!user) { showToast('Please sign in to register for events.', 'error'); return }
    setRegisteringEvent(eventId)
    setAppNote('')
  }

  const submitRegistration = async () => {
    if (!registeringEvent || !user) return
    setIsSubmitting(true)
    try {
      await registerForEvent(user.id, registeringEvent, appNote)
      showToast('You\'re registered! See you there 🎉')
      onNotify?.('You registered for a new event!', 'success')
      setRegisteringEvent(null)
      await loadData()
    } catch (err) {
      showToast(err.message || 'Registration failed.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filtered = matches.filter(m => {
    if (!filter) return true
    const q = filter.toLowerCase()
    const skill = (m.event.requiredSkill || '').toLowerCase()
    const title = (m.event.title || '').toLowerCase()
    const location = (m.event.location || '').toLowerCase()
    return skill.includes(q) || title.includes(q) || location.includes(q)
  })

  return (
    <div className="page">
      <header className="page-header fade-up">
        <div>
          <h1 className="page-title">Discover Events</h1>
          <p className="page-subtitle">Find community service events that match your skills</p>
        </div>
        <SearchBar onSearch={setFilter} />
      </header>

      {loading ? (
        <div className="loading-state">Loading events…</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">No events found. Try a different search.</div>
      ) : (
        <div className="card-grid">
          {filtered.map((m) => (
            <EventCard
              key={m.event.id}
              event={m.event}
              score={m.compatibilityScore}
              userSkills={user?.skills}
              onRegister={handleRegisterClick}
            />
          ))}
        </div>
      )}

      {/* Registration Modal */}
      {registeringEvent && (
        <div className="modal-backdrop" onClick={() => !isSubmitting && setRegisteringEvent(null)}>
          <div className="modal-content fade-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <button className="modal-close" onClick={() => !isSubmitting && setRegisteringEvent(null)}>✕</button>
            <h2 className="form-heading">Complete Registration</h2>
            <p className="form-subheading" style={{ marginBottom: '20px' }}>
              Add an optional note for the event organizer.
            </p>
            <div className="input-group">
              <label className="input-label">Application Note</label>
              <textarea 
                className="form-input form-textarea" 
                rows="4"
                placeholder="Examples: 'I have 3 years of matching experience' or 'I will need to leave 30m early'"
                value={appNote}
                onChange={e => setAppNote(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="modal-footer" style={{ marginTop: '24px' }}>
              <button 
                className="btn-create" 
                onClick={submitRegistration}
                disabled={isSubmitting}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {isSubmitting ? 'Registering...' : 'Confirm Registration'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
