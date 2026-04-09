import { useState } from 'react';
import SkillBadge from './SkillBadge';
import ScoreRing from './ScoreRing';

export default function EventCard({ event, matchData, delay = 0, initialRegistered = false, onRegister, onUnregister }) {
  const { matchPercentage = 0, matchedSkills = [], missingSkills = [] } = matchData || {};
  const [isRegistered, setIsRegistered] = useState(initialRegistered);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (isRegistered || !onRegister) return;
    setIsSubmitting(true);
    try {
      await onRegister(event.id);
      setIsRegistered(true);
      event.currentVolunteers += 1;
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to register');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnregister = async () => {
    if (!isRegistered || !onUnregister) return;
    setIsSubmitting(true);
    try {
      await onUnregister(event.id);
      setIsRegistered(false);
      if (event.currentVolunteers > 0) event.currentVolunteers -= 1;
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to unregister');
    } finally {
      setIsSubmitting(false);
    }
  };

  const spotsLeft = Math.max(0, event.requiredVolunteers - event.currentVolunteers);
  const fill = Math.min(100, Math.round((event.currentVolunteers / event.requiredVolunteers) * 100));
  
  // Determine match text
  let matchText = "Good Match";
  let matchClass = "match-mid";
  if (matchPercentage >= 75) { matchText = "Great Match"; matchClass = "match-high"; }
  else if (matchPercentage < 40) { matchText = "Low Match"; matchClass = "match-low"; }

  // Fake address/date data for UI realism if not in DB
  const fakeAddresses = [
    "Golden Years Care Home, 500 Maple Dr",
    "Tech Hub Coworking, Suite 300",
    "Fire Station #7, 800 Safety Blvd",
    "Community Center, 1200 Oak St",
    "City Hall Annex, Room 4B"
  ];
  const address = fakeAddresses[event.id % fakeAddresses.length];
  
  // Render explicit date/time if provided by mock backend, otherwise fallback to fake data
  const d = new Date();
  d.setDate(d.getDate() + (event.id * 2));
  const dateString = event.date || d.toISOString().split('T')[0];
  const timeString = event.time || `${9 + (event.id % 4)}:00`;

  const isUrgent = spotsLeft > 0 && spotsLeft <= 5; // Fake urgency logic

  return (
    <div className="event-card animate-fadeUp" style={{ animationDelay: `${delay}s` }}>
      {/* Top Badges & Ring */}
      <div className="ec-top-row">
        <div className="ec-badges">
          {isUrgent ? (
            <span className="ec-badge urgent">
              <span className="ec-dot"></span> Urgent
            </span>
          ) : (
            <span className="ec-badge normal">
              <span className="ec-dot" style={{ background: 'var(--text-muted)' }}></span> Open
            </span>
          )}
          {event.duration && (
            <span className="ec-badge duration">{event.duration}h</span>
          )}
        </div>
        {matchData && <ScoreRing score={matchPercentage} size={42} strokeWidth={3} />}
      </div>

      {/* Main Title & Match Level */}
      <div className="ec-title-section">
        <h3 className="ec-title">{event.title}</h3>
        {matchData && <div className={`ec-match-label ${matchClass}`}>{matchText}</div>}
      </div>

      {/* Info Pills */}
      <div className="ec-info-rows">
        <div className="ec-info-pill location">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ef4444' }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          {address}
        </div>
        <div className="ec-info-time-row">
          <div className="ec-info-pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#6366f1' }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {dateString}
          </div>
          <div className="ec-info-pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#64748b' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {timeString}
          </div>
        </div>
      </div>

      {/* Description */}
      {event.description && <p className="ec-desc">{event.description}</p>}

      {/* Skills */}
      <div className="ec-skills">
        {(matchedSkills.length > 0 || missingSkills.length > 0) ? (
          <>
            {matchedSkills.map(s => <span key={`m-${s}`} className="ec-skill-pill matched">{s}</span>)}
            {missingSkills.map(s => <span key={`x-${s}`} className="ec-skill-pill missing">{s}</span>)}
          </>
        ) : event.requiredSkill ? (
          event.requiredSkill.split(',').map(s => s.trim()).filter(Boolean).map(s => (
            <span key={s} className="ec-skill-pill neutral">{s}</span>
          ))
        ) : null}
      </div>

      {/* Footer CTA */}
      <div className="ec-footer">
        <div className="ec-progress-area">
          <div className="ec-progress-bar">
            <div className="ec-progress-fill" style={{ width: `${fill}%` }}></div>
          </div>
          <span className="ec-spots-text">{spotsLeft} spots left</span>
        </div>
        {event.status === 'UPCOMING' && (
          <button 
            className={`ec-btn-signup ${isRegistered ? 'registered' : ''}`} 
            onClick={isRegistered ? handleUnregister : handleRegister}
            disabled={isSubmitting || (!isRegistered && spotsLeft === 0)}
            style={isRegistered ? { backgroundColor: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border)' } : {}}
            title={isRegistered ? "Click to cancel registration" : ""}
          >
            {isSubmitting ? '...' : isRegistered ? 'Unregister' : 'Sign Up'}
          </button>
        )}
      </div>
    </div>
  );
}
