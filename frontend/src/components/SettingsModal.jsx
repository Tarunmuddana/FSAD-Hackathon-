import { useState, useEffect } from 'react'
import { updateVolunteer } from '../services/api'
import SkillTagInput from './SkillTagInput'
import Toast from './Toast'
import './SettingsModal.css'

export default function SettingsModal({ user, onUpdateUser, onClose, onNotify }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  })
  const [skills, setSkills] = useState([])
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!user) return
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
    })
    setSkills((user.skills || '').split(',').map(s => s.trim()).filter(Boolean))
  }, [user])

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { showToast('Name is required', 'error'); return }
    setSaving(true)
    try {
      const updated = await updateVolunteer(user.id, {
        ...user,
        name: form.name,
        phone: form.phone,
        address: form.address,
        skills: skills.join(', ')
      })
      onUpdateUser(updated)
      showToast('Profile saved!')
      onNotify?.('Your profile was updated.', 'info')
      setTimeout(() => onClose(), 800)
    } catch (err) {
      showToast(err.message || 'Failed to save', 'error')
    }
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-modal scale-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Profile Settings
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Avatar preview */}
          <div className="settings-avatar-section">
            <div className="settings-avatar">{(form.name || 'U').charAt(0).toUpperCase()}</div>
            <div className="settings-avatar-info">
              <span className="settings-avatar-name">{form.name || 'Your Name'}</span>
              <span className="settings-avatar-email">{form.email}</span>
            </div>
          </div>

          <div className="settings-form">
            <div className="settings-section">
              <h3 className="settings-section-title">Personal Info</h3>
              <div className="settings-row">
                <div className="input-group">
                  <label className="input-label">Full Name *</label>
                  <input className="form-input" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />
                </div>
                <div className="input-group">
                  <label className="input-label">Email</label>
                  <input className="form-input" value={form.email} disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                  <span className="input-hint">Email cannot be changed</span>
                </div>
              </div>
              <div className="settings-row">
                <div className="input-group">
                  <label className="input-label">Phone</label>
                  <input className="form-input" value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="e.g., 555-0123" />
                </div>
                <div className="input-group">
                  <label className="input-label">Address</label>
                  <input className="form-input" value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="e.g., 123 Main St, Springfield" />
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h3 className="settings-section-title">Skills</h3>
              <p className="settings-section-hint">Add your skills to get matched with relevant events. Press Enter or comma to add.</p>
              <SkillTagInput skills={skills} onChange={setSkills} />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  )
}
