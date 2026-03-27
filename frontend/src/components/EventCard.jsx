import SkillBadge from './SkillBadge';
import ScoreRing from './ScoreRing';

export default function EventCard({ event, matchData }) {
  const { matchPercentage, matchedSkills, missingSkills } = matchData || {};

  return (
    <div className="event-card">
      <div className="event-card-header">
        <div>
          <h3 className="event-title">{event.title}</h3>
          <div className="event-meta">
            <span>{event.currentVolunteers} / {event.requiredVolunteers} Volunteers Registered</span>
          </div>
        </div>
        {matchData && (
          <ScoreRing score={matchPercentage} />
        )}
      </div>
      
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        {event.description}
      </p>

      <div className="event-skills">
        {matchData ? (
          <>
            {matchedSkills?.map(s => <SkillBadge key={`match-${s}`} skill={s} status="matched" />)}
            {missingSkills?.map(s => <SkillBadge key={`miss-${s}`} skill={s} status="missing" />)}
          </>
        ) : (
          event.requiredSkill?.split(',').map(s => {
            const skill = s.trim();
            if (!skill) return null;
            return <SkillBadge key={skill} skill={skill} />;
          })
        )}
      </div>

      <button className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
        Register Now
      </button>
    </div>
  );
}
