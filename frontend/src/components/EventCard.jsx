import ScoreRing from './ScoreRing'
import SkillBadge from './SkillBadge'
import { getScoreColor, getScoreLabel } from '../utils/matchUtils'
import './EventCard.css'

export default function EventCard({ event, score, userSkills, onRegister }) {
  const color = getScoreColor(score)
  const label = getScoreLabel(score)
  const eventSkill = event.requiredSkill || ''
  const uSkills = (userSkills || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean)
  const isMatched = eventSkill && uSkills.includes(eventSkill.toLowerCase())
  const spotsLeft = event.requiredVolunteers - event.currentVolunteers
  const isFull = spotsLeft <= 0

  return (
    <div className="event-card fade-up">
      <div className="card-header">
        <div className="card-meta">
          {event.criticalNeed && <span className="badge-critical">● Urgent</span>}
          <span className="card-duration">{event.duration}h</span>
        </div>
        <ScoreRing score={score} size={52} />
      </div>

      <h3 className="card-title">{event.title}</h3>
      <p className="card-score-label" style={{ color }}>{label}</p>

      {/* Event details — location, date, time */}
      <div className="card-details">
        {event.location && <span className="card-detail">📍 {event.location}</span>}
        {event.eventDate && <span className="card-detail">📅 {event.eventDate}</span>}
        {event.eventTime && <span className="card-detail">🕐 {event.eventTime}</span>}
      </div>

      {event.description && <p className="card-description">{event.description}</p>}

      <div className="card-skills">
        {eventSkill ? (
          <SkillBadge skill={eventSkill} matched={isMatched} />
        ) : (
          <SkillBadge skill="Open to all" matched />
        )}
      </div>

      <div className="card-footer">
        <div className="card-spots">
          <div className="spots-bar">
            <div
              className="spots-fill"
              style={{
                width: `${Math.min((event.currentVolunteers / event.requiredVolunteers) * 100, 100)}%`,
                background: isFull ? 'var(--text-muted)' : 'var(--accent)'
              }}
            />
          </div>
          <span className="spots-text">
            {isFull ? 'Full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
          </span>
        </div>
        <button
          className={`btn-register ${isFull ? 'disabled' : ''}`}
          onClick={() => !isFull && onRegister?.(event.id)}
          disabled={isFull}
        >
          {isFull ? 'Full' : 'Sign Up'}
        </button>
      </div>
    </div>
  )
}
