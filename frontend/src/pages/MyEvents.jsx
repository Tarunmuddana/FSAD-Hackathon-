import { useState, useEffect } from 'react';
import { getEvents, getMyRegistrations, unregisterFromEvent } from '../services/api';

const STATUS_COLOR = {
  UPCOMING:  { bg: 'rgba(37,99,235,0.1)',  color: '#2563eb', label: 'Upcoming' },
  COMPLETED: { bg: 'rgba(5,150,105,0.1)',  color: '#059669', label: 'Completed' },
  CANCELLED: { bg: 'rgba(220,38,38,0.1)',  color: '#dc2626', label: 'Cancelled' },
};

export default function MyEvents({ user }) {
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getEvents(),
      getMyRegistrations(user.id)
    ])
    .then(([events, registrations]) => {
      const regEventIds = new Set(registrations.map(r => r.eventId));
      const myEvents = events.filter(e => regEventIds.has(e.id));
      setAllEvents(myEvents);
    })
    .catch(() => setAllEvents([]))
    .finally(() => setLoading(false));
  }, [user]);

  const handleUnregister = async (eventId) => {
    if (!user) return;
    try {
      await unregisterFromEvent(user.id, eventId);
      setAllEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (err) {
      console.error(err);
      alert('Failed to unregister: ' + err.message);
    }
  };

  const upcomingCount = allEvents.filter(e => e.status === 'UPCOMING').length;
  const completedCount = allEvents.filter(e => e.status === 'COMPLETED').length;
  const totalHours = allEvents.reduce((acc, e) => acc + (e.duration || 0), 0);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="feed-hero" style={{ textAlign: 'left', paddingBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, marginBottom: '0.5rem' }}>
          My Events
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Track all the events you have registered for.
        </p>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Registered', value: allEvents.length, icon: '📋' },
          { label: 'Upcoming', value: upcomingCount, icon: '📅' },
          { label: 'Hours Committed', value: totalHours + 'h', icon: '⏱' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Event List */}
      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem' }}>Loading your events…</div>
      ) : allEvents.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.4 }}>📋</div>
          <p>You haven't registered for any events yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {allEvents.map((event, i) => {
            const s = STATUS_COLOR[event.status] ?? STATUS_COLOR.UPCOMING;
            return (
              <div key={event.id}
                className="event-card animate-fadeUp"
                style={{ animationDelay: `${i * 0.05}s`, flexDirection: 'row', alignItems: 'center', gap: '1.25rem', padding: '1.25rem 1.5rem' }}
              >
                {/* Date block */}
                <div style={{ minWidth: 52, textAlign: 'center', flexShrink: 0, borderRight: '1px solid var(--border-subtle)', paddingRight: '1.25rem' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
                    {event.duration ? event.duration : '—'}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>hrs</div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{event.title}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gold)', marginBottom: '0.4rem' }}>
                    {event.date && event.time ? `Scheduled: ${event.date} at ${event.time}` : 'Schedule TBD'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{event.description?.slice(0, 80)}{event.description?.length > 80 ? '…' : ''}</div>
                </div>

                {/* Volunteers */}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{event.currentVolunteers}/{event.requiredVolunteers}</div>
                  <div>volunteers</div>
                </div>

                {/* Status badge & Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end', flexShrink: 0 }}>
                  <span style={{ padding: '0.3rem 0.85rem', borderRadius: 999, background: s.bg, color: s.color, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {s.label}
                  </span>
                  {event.status === 'UPCOMING' && (
                    <button 
                      onClick={() => handleUnregister(event.id)}
                      style={{ 
                        background: 'transparent', 
                        border: '1px solid #ef4444', 
                        color: '#ef4444', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        cursor: 'pointer', 
                        padding: '0.35rem 1rem',
                        borderRadius: 999,
                        marginTop: '0.2rem',
                        transition: 'all 0.2s ease-in-out'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#ef4444';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#ef4444';
                      }}
                    >
                      Unregister
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
