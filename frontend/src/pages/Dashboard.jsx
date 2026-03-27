import { useState, useEffect } from 'react';
import { getCurrentVolunteer, getEvents } from '../services/api';
import { calculateMatch } from '../utils/matchUtils';
import EventCard from '../components/EventCard';
import SkillBadge from '../components/SkillBadge';

export default function Dashboard() {
  const [volunteer, setVolunteer] = useState(null);
  const [matchedEvents, setMatchedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const user = await getCurrentVolunteer();
        setVolunteer(user);
        
        const allEvents = await getEvents();
        // "My Matched Events" = anything >= 50%
        const matches = allEvents
          .map(evt => ({ ...evt, matchData: calculateMatch(user.skills, evt.requiredSkill) }))
          .filter(evt => evt.matchData.matchPercentage >= 50)
          .sort((a, b) => b.matchData.matchPercentage - a.matchData.matchPercentage);
          
        setMatchedEvents(matches);
      } catch (err) {
        console.error("Dashboard error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="page-container">Loading profile...</div>;
  if (!volunteer) return <div className="page-container">Please log in.</div>;

  const userSkills = volunteer.skills ? volunteer.skills.split(',').map(s => s.trim()) : [];

  return (
    <div className="page-container">
      <h1 className="page-title">My Dashboard</h1>
      
      <div className="dashboard-layout">
        {/* Profile Sidebar */}
        <aside className="profile-card">
          <h2>{volunteer.name}</h2>
          
          <div className="profile-stat-box">
            <div className="profile-stat-value">{volunteer.hoursLogged}</div>
            <div className="profile-stat-label">Hours Volunteered</div>
          </div>

          <div className="profile-skills">
            <h3 style={{ width: '100%', fontSize: '1rem', color: 'var(--text-muted)' }}>My Skills</h3>
            {userSkills.map(skill => (
              <SkillBadge key={skill} skill={skill} status="neutral" />
            ))}
          </div>
        </aside>

        {/* Top Matches */}
        <main>
          <h2 style={{ marginBottom: '1.5rem' }}>Top Event Matches</h2>
          <div className="events-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {matchedEvents.length > 0 ? (
              matchedEvents.map(evt => (
                <EventCard key={evt.id} event={evt} matchData={evt.matchData} />
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No matches found right now.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
