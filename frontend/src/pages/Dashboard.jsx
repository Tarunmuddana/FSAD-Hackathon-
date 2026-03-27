import { useState, useEffect } from 'react'
import { getMatchesForVolunteer, updateVolunteer, getVolunteer } from '../services/api'
import ScoreRing from '../components/ScoreRing'
import SkillBadge from '../components/SkillBadge'
import Toast from '../components/Toast'
import './Pages.css'

export default function Dashboard({ user, onUpdateUser, onNotify }) {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', skills: '' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!user) return
    setEditForm({ name: user.name, skills: user.skills })
    getMatchesForVolunteer(user.id)
      .then(data => { setMatches(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user])

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  if (!user) {
    return (
      <div className="page">
        <div className="empty-state">Please sign in to view your dashboard.</div>
      </div>
    )
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const updated = await updateVolunteer(user.id, {
        ...user,
        name: editForm.name,
        skills: editForm.skills
      })
      onUpdateUser(updated)
      setEditing(false)
      showToast('Profile updated successfully!')
      onNotify?.('Your profile was updated.', 'info')
    } catch (err) {
      showToast(err.message || 'Failed to save profile', 'error')
    }
    setSaving(false)
  }

  // Refresh user data from backend (picks up hoursLogged changes)
  const refreshProfile = async () => {
    try {
      const fresh = await getVolunteer(user.id)
      onUpdateUser(fresh)
    } catch { /* silent */ }
  }

  useEffect(() => {
    refreshProfile()
  }, [])

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
            {editing ? (
              <div className="edit-fields">
                <input className="form-input edit-input" value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />
                <input className="form-input edit-input" value={editForm.skills}
                  onChange={e => setEditForm(f => ({ ...f, skills: e.target.value }))} placeholder="Skills (comma separated)" />
                <div className="edit-actions">
                  <button className="btn-save" onClick={handleSaveProfile} disabled={saving}>
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button className="btn-cancel" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="profile-name-row">
                  <h2 className="profile-name">{user.name}</h2>
                  <span className="impact-badge">{level}</span>
                </div>
                <p className="profile-email">{user.email}</p>
                <div className="profile-skills">
                  {skills.map(s => <SkillBadge key={s} skill={s} matched />)}
                </div>
                <button className="btn-edit-profile" onClick={() => setEditing(true)}>Edit Profile</button>
              </>
            )}
          </div>
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

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
