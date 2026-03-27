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

  const handleRegister = async (eventId) => {
    if (!user) { showToast('Please sign in to register for events.', 'error'); return }
    try {
      await registerForEvent(user.id, eventId)
      showToast('You\'re registered! See you there 🎉')
      onNotify?.('You registered for a new event!', 'success')
      // Refresh data to update volunteer counts
      await loadData()
    } catch (err) {
      showToast(err.message || 'Registration failed.', 'error')
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
              onRegister={handleRegister}
            />
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
