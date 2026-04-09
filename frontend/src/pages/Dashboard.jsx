import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getProfile, getEvents, getVolunteers, registerForEvent, getMyRegistrations, unregisterFromEvent } from '../services/api';
import { calculateMatch } from '../utils/matchUtils';
import EventCard from '../components/EventCard';
import SkillBadge from '../components/SkillBadge';

export default function Dashboard({ user }) {
  const [volunteer, setVolunteer]       = useState(null);
  const [matchedEvents, setMatched]     = useState([]);
  const [enrolledEvents, setEnrolledEvents] = useState([]);
  const [myRegs, setMyRegs]             = useState([]);
  const [loading, setLoading]           = useState(true);

  const fetchData = () => {
    if (!user) return;
    setLoading(true);
    Promise.all([getProfile(user.id), getEvents(), getVolunteers(), getMyRegistrations(user.id)])
      .then(([profile, evs, vols, regs]) => {
        setVolunteer(profile);
        setMyRegs(regs);
        
        // Match calculation
        const matches = evs
          .map(ev => ({ ...ev, matchData: calculateMatch(profile?.skills, ev.requiredSkill) }))
          .filter(ev => ev.matchData.matchPercentage >= 50)
          .sort((a, b) => b.matchData.matchPercentage - a.matchData.matchPercentage);
        setMatched(matches);

        // Enrolled events calculation
        const enrolled = regs.map(r => {
          const matchingEvent = evs.find(e => e.id === r.eventId);
          return matchingEvent ? { ...matchingEvent, regStatus: r.status } : null;
        }).filter(Boolean);
        setEnrolledEvents(enrolled);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return (
    <div className="page-container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
      <p style={{ color: 'var(--text-muted)' }}>Loading your dashboard…</p>
    </div>
  );

  const userSkills = volunteer?.skills
    ? volunteer.skills.split(',').map(s => s.trim())
    : [];

  const avgScore = matchedEvents.length
    ? Math.round(matchedEvents.reduce((s, e) => s + e.matchData.matchPercentage, 0) / matchedEvents.length)
    : 0;

  return (
    <motion.div 
      className="page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <h1 className="page-title">My Dashboard</h1>
        <button onClick={fetchData} className="btn btn-sm btn-ghost">🔄 Refresh</button>
      </div>

      <div className="dashboard-layout">
        {/* ── Profile Sidebar ── */}
        <aside className="profile-card animate-fadeUp">
          <div className="profile-avatar">
            {volunteer?.name ? volunteer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'}
          </div>
          <div className="profile-name">{volunteer?.name}</div>
          <div className="profile-role">Volunteer</div>

          <div className="profile-divider" />

          <div className="profile-stats-grid">
            <div className="stat-card">
              <div className="stat-value">{volunteer?.hoursLogged ?? 0}</div>
              <div className="stat-label">Hours</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{matchedEvents.length}</div>
              <div className="stat-label">Matches</div>
            </div>
            <div className="stat-card" style={{ gridColumn: '1/-1' }}>
              <div className="stat-value">{avgScore}%</div>
              <div className="stat-label">Avg Match Score</div>
            </div>
          </div>

          <div className="profile-divider" />

          <div className="profile-skill-title">My Skills</div>
          <div className="profile-skill-list">
            {userSkills.map(sk => (
              <SkillBadge key={sk} skill={sk} status="neutral" />
            ))}
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          
          {/* Top Matches Section */}
          <section>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
              Top Event Matches
            </h2>
            <div className="events-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))' }}>
              {matchedEvents.length > 0 ? (
                matchedEvents.map((ev, i) => (
                  <EventCard 
                    key={ev.id} 
                    event={ev} 
                    matchData={ev.matchData} 
                    delay={i * 0.07} 
                    initialRegistered={myRegs.some(r => r.eventId === ev.id)}
                    onRegister={volunteer ? (eventId) => registerForEvent(volunteer.id, eventId) : undefined}
                    onUnregister={volunteer ? (eventId) => unregisterFromEvent(volunteer.id, eventId) : undefined}
                  />
                ))
              ) : (
                <div style={{ color: 'var(--text-muted)', padding: '3rem 0' }}>
                  No high-compatibility events right now. Check back soon!
                </div>
              )}
            </div>
          </section>

          {/* My Enrolled Events Section */}
          <section>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
              📋 My Enrolled Events
            </h2>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.02)', 
              border: '1px solid rgba(255, 255, 255, 0.05)', 
              borderRadius: 'var(--radius-lg)', 
              padding: '1.5rem',
              backdropFilter: 'blur(10px)'
            }}>
              {enrolledEvents.length > 0 ? enrolledEvents.map((ev, index) => (
                <motion.div 
                  key={ev.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '1rem',
                    marginBottom: index === enrolledEvents.length - 1 ? 0 : '0.75rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 'var(--radius-md)',
                    gap: '1rem'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                      {ev.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      🕒 {ev.duration} hours expected
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ 
                      padding: '0.3rem 0.8rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700,
                      background: ev.regStatus === 'APPROVED' ? 'rgba(22, 163, 74, 0.15)' : ev.regStatus === 'PENDING' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: ev.regStatus === 'APPROVED' ? '#16a34a' : ev.regStatus === 'PENDING' ? '#f59e0b' : '#ef4444'
                    }}>
                      {ev.regStatus}
                    </span>
                  </div>
                </motion.div>
              )) : (
                <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  You haven't signed up for any events yet. Check out your matches above!
                </div>
              )}
            </div>
          </section>

        </main>
      </div>
    </motion.div>
  );
}
