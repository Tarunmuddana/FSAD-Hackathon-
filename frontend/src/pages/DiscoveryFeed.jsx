import { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';
import SearchBar from '../components/SearchBar';
import { getEvents, getProfile, registerForEvent, getMyRegistrations, unregisterFromEvent } from '../services/api';
import { calculateMatch } from '../utils/matchUtils';

export default function DiscoveryFeed({ user }) {
  const [events, setEvents]         = useState([]);
  const [volunteer, setVolunteer]   = useState(null);
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('all'); // 'all' | 'high' | 'mid' | 'low'
  const [hideRegistered, setHideRegistered] = useState(false);
  
  // Advanced Filters
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'this_week' | 'this_month'
  const [durationFilter, setDurationFilter] = useState('all'); // 'all' | 'short' | 'medium' | 'long'
  const [skillFilter, setSkillFilter] = useState('all');

  const [myRegs, setMyRegs]         = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    if (!user) return;
    Promise.all([getEvents(), getProfile(user.id), getMyRegistrations(user.id)])
      .then(([evs, profile, regs]) => { setEvents(evs); setVolunteer(profile); setMyRegs(regs); })
      .finally(() => setLoading(false));
  }, [user]);

  const processed = events
    .map(ev => {
      // Replicate the fake date logic from EventCard for accurate filtering
      const d = new Date();
      d.setDate(d.getDate() + (ev.id * 2));
      return { 
        ...ev, 
        computedDate: ev.date || d.toISOString().split('T')[0],
        matchData: calculateMatch(volunteer?.skills, ev.requiredSkill) 
      };
    })
    .filter(ev => {
      // 1. Text Search
      const q = search.toLowerCase();
      const textMatch = !q ||
        ev.title.toLowerCase().includes(q) ||
        (ev.requiredSkill && ev.requiredSkill.toLowerCase().includes(q));
      
      // 2. Score Match
      const scoreMatch =
        filter === 'all' ? true :
        filter === 'high' ? ev.matchData.matchPercentage >= 80 :
        filter === 'mid'  ? ev.matchData.matchPercentage >= 50 && ev.matchData.matchPercentage < 80 :
        ev.matchData.matchPercentage < 50;

      // 3. Hide Registered Toggle
      const isBooked = myRegs.some(r => r.eventId === ev.id && r.status !== 'REJECTED');
      const toggleMatch = hideRegistered ? !isBooked : true;

      // 4. Date Proximity Filter
      let dateMatch = true;
      if (dateFilter !== 'all') {
        const evDate = new Date(ev.computedDate);
        const today = new Date();
        const diffDays = (evDate - today) / (1000 * 60 * 60 * 24);
        if (dateFilter === 'this_week') dateMatch = diffDays <= 7;
        else if (dateFilter === 'this_month') dateMatch = diffDays <= 30;
      }

      // 5. Duration Bracket Filter
      let durationMatch = true;
      if (durationFilter !== 'all' && ev.duration) {
        if (durationFilter === 'short') durationMatch = ev.duration < 4;
        else if (durationFilter === 'medium') durationMatch = ev.duration >= 4 && ev.duration <= 8;
        else if (durationFilter === 'long') durationMatch = ev.duration > 8;
      }

      // 6. Specific Skill Filter
      let skillMatch = true;
      if (skillFilter !== 'all') {
        skillMatch = ev.requiredSkill && ev.requiredSkill.toLowerCase().includes(skillFilter.toLowerCase());
      }

      return textMatch && scoreMatch && toggleMatch && dateMatch && durationMatch && skillMatch;
    })
    .sort((a, b) => b.matchData.matchPercentage - a.matchData.matchPercentage);

  const ALL_SKILLS = Array.from(new Set(events.flatMap(e => e.requiredSkill?.split(',').map(s => s.trim()) || []))).filter(Boolean).sort();

  const FILTERS = [
    { key: 'all',  label: '✦ All'       },
    { key: 'high', label: '🟢 High ≥80%' },
    { key: 'mid',  label: '🟡 Mid 50–79%'},
    { key: 'low',  label: '🔴 Low <50%'  },
  ];

  return (
    <div className="page-container">
      {/* Hero banner */}
      <div className="feed-hero animate-fadeIn">
        <h1>
          Discover Events <span className="gradient-text">Matched</span> for You
        </h1>
        <p>
          Every card shows your personal compatibility score — green means you're a great fit!
        </p>
      </div>

      {/* Search */}
      <SearchBar value={search} onChange={setSearch} />

      {/* Filter Segmented Control & Toggle */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        
        {/* Match Segmented Control */}
        <div style={{ display: 'flex', gap: '0.2rem', background: 'var(--bg-glass)', padding: '0.3rem', borderRadius: '14px', border: '1px solid var(--border-subtle)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setVisibleCount(6); }}
              style={{
                background: filter === f.key ? 'var(--primary)' : 'transparent',
                color: filter === f.key ? '#ffffff' : 'var(--text-main)',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: filter === f.key ? 700 : 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                opacity: filter === f.key ? 1 : 0.7
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Hide Registered Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-glass)', padding: '0.6rem 1rem', borderRadius: '14px', border: '1px solid var(--border-subtle)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: hideRegistered ? 1 : 0.7 }}>
            <input 
              type="checkbox" 
              checked={hideRegistered}
              onChange={(e) => setHideRegistered(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            Hide Registered
          </label>
        </div>
      </div>

      {/* Advanced Filters Toggle & Panel */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button 
          className="btn btn-ghost btn-sm" 
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ fontSize: '0.8rem', opacity: 0.8, background: showAdvanced ? 'var(--bg-glass-hover)' : 'transparent' }}
        >
          {showAdvanced ? 'Hide Advanced Filters ▲' : 'Show Advanced Filters ▼'}
        </button>
        
        {showAdvanced && (
          <div className="animate-fadeUp" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'var(--bg-glass)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginTop: '1rem', textAlign: 'left' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date Frame</label>
              <select className="form-control" value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ padding: '0.6rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                <option value="all">Any Time</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration Category</label>
              <select className="form-control" value={durationFilter} onChange={e => setDurationFilter(e.target.value)} style={{ padding: '0.6rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                <option value="all">Any Duration</option>
                <option value="short">Short (&lt; 4 hours)</option>
                <option value="medium">Medium (4 - 8 hours)</option>
                <option value="long">Long (8+ hours)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Required Skill</label>
              <select className="form-control" value={skillFilter} onChange={e => setSkillFilter(e.target.value)} style={{ padding: '0.6rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                <option value="all">Any Skill</option>
                {ALL_SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="events-empty">
          <div className="events-empty-icon">⏳</div>
          <p>Loading events…</p>
        </div>
      ) : processed.length === 0 ? (
        <div className="events-empty">
          <div className="events-empty-icon">🔍</div>
          <p>No events found. Try adjusting your search or filter.</p>
        </div>
      ) : (
        <>
          <div className="events-grid">
            {processed.slice(0, visibleCount).map((ev, i) => (
              <EventCard
                key={ev.id}
                event={ev}
                matchData={ev.matchData}
                delay={Math.min(i * 0.06, 0.4)}
                initialRegistered={myRegs.some(r => r.eventId === ev.id)}
                onRegister={volunteer ? (eventId) => registerForEvent(volunteer.id, eventId) : undefined}
                onUnregister={volunteer ? (eventId) => unregisterFromEvent(volunteer.id, eventId) : undefined}
              />
            ))}
          </div>
          {visibleCount < processed.length && (
            <div style={{ textAlign: 'center', marginTop: '3rem', marginBottom: '1rem' }}>
              <button 
                className="btn btn-ghost" 
                onClick={() => setVisibleCount(v => v + 6)}
                style={{ padding: '0.6rem 2rem', fontSize: '0.9rem', border: '2px solid var(--border-subtle)' }}
              >
                Load More Events ↓
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
