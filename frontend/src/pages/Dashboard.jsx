import { useState, useEffect } from 'react'
import { getMatchesForVolunteer, getVolunteer } from '../services/api'
import ScoreRing from '../components/ScoreRing'
import SkillBadge from '../components/SkillBadge'
import SettingsModal from '../components/SettingsModal'
import './Pages.css'

export default function Dashboard({ user, onUpdateUser, onNotify }) {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    if (!user) return
    getMatchesForVolunteer(user.id)
      .then(data => { setMatches(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user])

  // Refresh user data from backend (picks up hoursLogged changes etc)
  useEffect(() => {
    if (!user) return
    getVolunteer(user.id).then(onUpdateUser).catch(() => {})
  }, [])

  if (!user) {
    return (
      <div className="page">
        <div className="empty-state">Please sign in to view your dashboard.</div>
      </div>
    )
  }

  const skills = (user.skills || '').split(',').map(s => s.trim()).filter(Boolean)
  const topMatches = matches.filter(m => m.compatibilityScore >= 80)
  const level = user.hoursLogged >= 50 ? '🏆 Champion' : user.hoursLogged >= 20 ? '⭐ Rising Star' : '🌱 Newcomer'

  return (
    <div className="page">
      <header className="page-header fade-up">
        <div>
          <h1 className="page-title">My Dashboard</h1>
          <p className="page-subtitle">Your volunteer profile and impact tracker</p>
        </div>
      </header>

      {/* Profile Card */}
      <div className="profile-card fade-up">
        <div className="profile-top">
          <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div className="profile-info">
            <div className="profile-name-row">
              <h2 className="profile-name">{user.name}</h2>
              <span className="impact-badge">{level}</span>
            </div>
            <p className="profile-email">{user.email}</p>
            {user.phone && <p className="profile-detail">📞 {user.phone}</p>}
            {user.address && <p className="profile-detail">📍 {user.address}</p>}
            <div className="profile-skills">
              {skills.map(s => <SkillBadge key={s} skill={s} matched />)}
              {skills.length === 0 && <span className="profile-no-skills">No skills added yet</span>}
            </div>
          </div>
          <button className="btn-settings" onClick={() => setShowSettings(true)} title="Edit Profile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>
        <div className="profile-stats">
          <div className="stat">
            <span className="stat-value">{user.hoursLogged}</span>
            <span className="stat-label">Hours Served</span>
          </div>
          <div className="stat">
            <span className="stat-value">{topMatches.length}</span>
            <span className="stat-label">Top Matches</span>
          </div>
          <div className="stat">
            <span className="stat-value">{skills.length}</span>
            <span className="stat-label">Skills</span>
          </div>
        </div>
      </div>

      {/* Matched Events */}
      <section className="section fade-up fade-up-delay-2">
        <h2 className="section-title">Your Best Matches</h2>
        {loading ? (
          <div className="loading-state">Loading…</div>
        ) : topMatches.length === 0 ? (
          <div className="empty-state">No high-compatibility events right now.</div>
        ) : (
          <div className="match-list">
            {topMatches.map(m => (
              <div key={m.event.id} className="match-row">
                <ScoreRing score={m.compatibilityScore} size={42} />
                <div className="match-info">
                  <span className="match-title">{m.event.title}</span>
                  <span className="match-skill">
                    {m.event.requiredSkill || 'Open to all'} · {m.event.duration}h
                    {m.event.location && ` · 📍 ${m.event.location}`}
                    {m.event.eventDate && ` · 📅 ${m.event.eventDate}`}
                  </span>
                </div>
                <span className="match-score-badge">{m.compatibilityScore}%</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {showSettings && (
        <SettingsModal
          user={user}
          onUpdateUser={onUpdateUser}
          onClose={() => setShowSettings(false)}
          onNotify={onNotify}
        />
      )}
    </div>
  )
}
