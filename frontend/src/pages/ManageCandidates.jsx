import { useState, useEffect } from 'react'
import { getOrganizedEvents, getApplicants, approveApplicant, rejectApplicant, seedDummyApplicants } from '../services/api'
import ScoreRing from '../components/ScoreRing'
import { getScoreColor, getScoreLabel } from '../utils/matchUtils'
import Toast from '../components/Toast'
import './Pages.css'

export default function ManageCandidates({ user, onNotify }) {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [isSeeding, setIsSeeding] = useState(false)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [nameFilter, setNameFilter] = useState('')
  const [skillFilter, setSkillFilter] = useState('')
  
  // Modals
  const [selectedApplicant, setSelectedApplicant] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const loadApplicants = (eventId) => {
    if (!eventId) {
      setApplicants([])
      return
    }
    
    setLoading(true)
    getApplicants(eventId, {
      status: statusFilter,
      name: nameFilter,
      skill: skillFilter
    })
      .then(data => {
        setApplicants(data)
        setLoading(false)
      })
      .catch(err => {
        showToast(err.message, 'error')
        setLoading(false)
      })
  }

  // 1. Load organized events on mount
  useEffect(() => {
    if (!user) return
    getOrganizedEvents(user.id)
      .then(data => {
        setEvents(data)
        if (data.length > 0) {
          setSelectedEventId(data[0].id)
        }
        setLoading(false)
      })
      .catch(err => {
        showToast(err.message, 'error')
        setLoading(false)
      })
  }, [user])

  // 2. Load applicants when selected event or filters change
  useEffect(() => {
    loadApplicants(selectedEventId)
  }, [selectedEventId, statusFilter, nameFilter, skillFilter])

  // 3. Actions
  const handleApprove = async (regId, e) => {
    if (e) e.stopPropagation() // Prevent opening modal if called from card
    try {
      await approveApplicant(regId)
      showToast('Candidate approved')
      setApplicants(prev => prev.map(a => a.registrationId === regId ? { ...a, status: 'APPROVED' } : a))
      if (selectedApplicant && selectedApplicant.registrationId === regId) {
         setSelectedApplicant(prev => ({...prev, status: 'APPROVED'}))
      }
      onNotify?.('Candidate approved successfully', 'success')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleReject = async (regId, e) => {
    if (e) e.stopPropagation()
    try {
      await rejectApplicant(regId)
      showToast('Candidate rejected')
      setApplicants(prev => prev.map(a => a.registrationId === regId ? { ...a, status: 'REJECTED' } : a))
      if (selectedApplicant && selectedApplicant.registrationId === regId) {
         setSelectedApplicant(prev => ({...prev, status: 'REJECTED'}))
      }
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleClearFilters = () => {
    setStatusFilter('ALL')
    setNameFilter('')
    setSkillFilter('')
  }
  
  const handleSeedData = async () => {
    if (!selectedEventId) return
    setIsSeeding(true)
    try {
      const msg = await seedDummyApplicants(selectedEventId)
      showToast(msg)
      // Refresh applicants and let them know
      loadApplicants(selectedEventId)
      onNotify?.('Test candidates generated!', 'success')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setIsSeeding(false)
    }
  }

  if (loading && events.length === 0) {
    return <div className="page"><div className="loading-state">Loading your events…</div></div>
  }

  return (
    <div className="page">
      <header className="page-header fade-up">
        <div>
          <h1 className="page-title">Manage Candidates</h1>
          <p className="page-subtitle">Review, approve, and manage volunteers for your events</p>
        </div>
      </header>

      {events.length === 0 ? (
        <div className="empty-state fade-up">
          <div className="empty-icon">📝</div>
          You haven't organizing any events yet.
          <div className="empty-hint">Go to the Organize page to create your first event.</div>
        </div>
      ) : (
        <div className="candidates-layout fade-up">
          {/* Controls Sidebar */}
          <div className="candidates-sidebar">
            <div className="filter-group">
              <label className="input-label">Select Event</label>
              <select 
                className="form-input" 
                value={selectedEventId} 
                onChange={e => setSelectedEventId(e.target.value)}
              >
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
            </div>

            <div className="filter-divider" />
            <h3 className="filter-heading">Filters</h3>

            <div className="filter-group">
              <label className="input-label">Status</label>
              <select 
                className="form-input" 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Applicants</option>
                <option value="PENDING">Pending Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="input-label">Search Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. John" 
                value={nameFilter}
                onChange={e => setNameFilter(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label className="input-label">Required Skill</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Python" 
                value={skillFilter}
                onChange={e => setSkillFilter(e.target.value)}
              />
            </div>
            
            {(statusFilter !== 'ALL' || nameFilter || skillFilter) && (
              <button className="btn-action" onClick={handleClearFilters} style={{ marginTop: 'auto' }}>
                Clear Filters
              </button>
            )}

            <div className="filter-divider" style={{ margin: '16px 0 8px' }} />
            <button 
              className="btn-action edit" 
              onClick={handleSeedData} 
              disabled={isSeeding}
              style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', gap: '8px' }}
              title="Add 5 fake volunteers for demonstration"
            >
              {isSeeding ? 'Seeding...' : '🧪 Generate Test Candidates'}
            </button>
          </div>

          {/* Candidates List */}
          <div className="candidates-main">
            <div className="candidates-header">
              <h2>{statusFilter === 'ALL' ? 'All Applicants' : `${statusFilter} Applicants`} ({applicants.length})</h2>
              <span className="event-badge">
                Selected: {events.find(e => e.id.toString() === selectedEventId.toString())?.title}
              </span>
            </div>

            {loading ? (
              <div className="loading-state">Loading applicants…</div>
            ) : applicants.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                No applicants found.
                <div className="empty-hint">Try clearing your filters or selecting a different event.</div>
              </div>
            ) : (
              <div className="candidates-grid">
                {applicants.map(app => (
                  <div key={app.registrationId} className="candidate-card" onClick={() => setSelectedApplicant(app)}>
                    <div className="candidate-card-header">
                      <div className="profile-avatar-small">
                        {app.volunteerName ? app.volunteerName.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="candidate-info">
                        <h3 className="candidate-name">{app.volunteerName}</h3>
                        <span className={`status-badge ${app.status.toLowerCase()}`}>
                          {app.status}
                        </span>
                      </div>
                      <div style={{ marginLeft: 'auto' }}>
                        <ScoreRing score={app.compatibilityScore} size={42} />
                      </div>
                    </div>
                    
                    <div className="candidate-skills">
                      {app.volunteerSkills ? (
                        app.volunteerSkills.split(',').map(s => s.trim()).filter(Boolean).map(skill => (
                          <span key={skill} className="skill-badge">{skill}</span>
                        ))
                      ) : (
                        <span className="profile-no-skills">No skills listed</span>
                      )}
                    </div>
                    
                    <div className="candidate-stats">
                      <span>⭐ {app.volunteerHoursLogged} hours logged</span>
                    </div>

                    <div className="candidate-actions">
                      {app.status !== 'APPROVED' && (
                        <button 
                          className="btn-action complete flex-1" 
                          onClick={(e) => handleApprove(app.registrationId, e)}
                        >
                          ✓ Approve
                        </button>
                      )}
                      {app.status !== 'REJECTED' && (
                        <button 
                          className="btn-action delete flex-1" 
                          onClick={(e) => handleReject(app.registrationId, e)}
                        >
                          ✕ Reject
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Detail Modal */}
      {selectedApplicant && (
        <div className="modal-backdrop" onClick={() => setSelectedApplicant(null)}>
          <div className="modal-content profile-modal fade-up" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedApplicant(null)}>✕</button>
            <div className="profile-top">
              <div className="profile-avatar" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                {selectedApplicant.volunteerName ? selectedApplicant.volunteerName.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="profile-info">
                <div className="profile-name-row">
                  <h2 className="profile-name">{selectedApplicant.volunteerName}</h2>
                  <span className={`status-badge ${selectedApplicant.status.toLowerCase()}`}>
                    {selectedApplicant.status}
                  </span>
                </div>
                <div className="profile-email">✉️ {selectedApplicant.volunteerEmail || 'No email provided'}</div>
                <div className="profile-detail">📱 {selectedApplicant.volunteerPhone || 'No phone provided'}</div>
                <div className="profile-detail">📍 {selectedApplicant.volunteerAddress || 'No location provided'}</div>
              </div>
            </div>
            
            <div className="profile-section-divider" />
            
            {selectedApplicant.applicationNote && (
              <>
                <div className="profile-section" style={{ backgroundColor: 'var(--bg-input)', padding: '16px', borderRadius: 'var(--radius)' }}>
                  <h3>📝 Application Note</h3>
                  <p style={{ marginTop: '8px', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.5' }}>
                    "{selectedApplicant.applicationNote}"
                  </p>
                </div>
                <div className="profile-section-divider" />
              </>
            )}

            <div className="profile-section">
              <h3>Skills & Experience</h3>
              <div className="profile-skills" style={{ marginTop: '12px' }}>
                {selectedApplicant.volunteerSkills ? (
                  selectedApplicant.volunteerSkills.split(',').map(s => s.trim()).filter(Boolean).map(skill => (
                    <span key={skill} className="skill-badge">{skill}</span>
                  ))
                ) : (
                  <span className="profile-no-skills">No skills listed on this profile.</span>
                )}
              </div>
            </div>
            
            <div className="profile-stats" style={{ margin: '24px 0 0' }}>
              <div className="stat">
                <span className="stat-value" style={{ color: getScoreColor(selectedApplicant.compatibilityScore) }}>
                  {selectedApplicant.compatibilityScore}%
                </span>
                <span className="stat-label">{getScoreLabel(selectedApplicant.compatibilityScore)}</span>
              </div>
              <div className="stat">
                <span className="stat-value">{selectedApplicant.volunteerHoursLogged}</span>
                <span className="stat-label">Total Hours Logged</span>
              </div>
              <div className="stat">
                <span className="stat-value">{selectedApplicant.status === 'APPROVED' ? '1' : '0'}</span>
                <span className="stat-label">Events Approved</span>
              </div>
            </div>

            <div className="modal-footer">
               {selectedApplicant.status !== 'APPROVED' && (
                <button 
                  className="btn-create" 
                  onClick={(e) => { handleApprove(selectedApplicant.registrationId, e); setSelectedApplicant(null); }}
                >
                  Approve Candidate
                </button>
              )}
              {selectedApplicant.status !== 'REJECTED' && (
                <button 
                  className="btn-action delete" 
                  style={{ padding: '11px 28px' }}
                  onClick={(e) => { handleReject(selectedApplicant.registrationId, e); setSelectedApplicant(null); }}
                >
                  Reject Candidate
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
