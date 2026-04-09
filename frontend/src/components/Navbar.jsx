import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const DEMO_NOTIFICATIONS = [
  { id: 1, text: 'Community Cleanup sent you a message.', time: '2m ago', read: false },
  { id: 2, text: 'Your registration for Tech Workshop is confirmed!', time: '1h ago', read: false },
  { id: 3, text: 'New event matching your skills: Food Drive.', time: '3h ago', read: true },
];

export default function Navbar({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState(DEMO_NOTIFICATIONS);

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  useEffect(() => {
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [isDark]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close notifications when route changes
  useEffect(() => { setShowNotifs(false); }, [location.pathname]);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const unreadCount = notifs.filter(n => !n.read).length;

  const handleLogout = () => {
    onLogout?.();
    navigate('/login');
  };

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));

  const NAV_LINKS = [
    { to: '/',           label: 'Discover'   },
    { to: '/dashboard',  label: 'Dashboard'  },
    { to: '/my-events',  label: 'My Events'  },
    { to: '/organize',   label: 'Organize'   },
    { to: '/messages',   label: 'Messages'   },
  ];

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <Link to="/" className="navbar-brand">
        <div className="navbar-brand-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="14" height="14" rx="4" fill="currentColor" fillOpacity="0.8"/>
            <rect x="8" y="8" width="14" height="14" rx="4" fill="white" fillOpacity="0.9"/>
          </svg>
        </div>
        Service Matchmaker
      </Link>

      <div className="nav-links">
        {NAV_LINKS.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`nav-link${location.pathname === to ? ' active' : ''}`}
          >
            {label}
            {label === 'Messages' && unreadCount > 0 && (
              <span style={{
                marginLeft: '0.3rem', background: 'var(--primary)', color: 'white',
                borderRadius: '999px', fontSize: '0.58rem', fontWeight: 800,
                padding: '0.1rem 0.38rem', verticalAlign: 'middle',
              }}>
                {unreadCount}
              </span>
            )}
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
        {/* Theme toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="btn btn-sm btn-ghost"
          style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title={isDark ? "Light Mode" : "Dark Mode"}
        >
          {isDark ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>

        {/* Notification bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifs(v => !v)}
            className="btn btn-sm btn-ghost"
            style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
            title="Notifications"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '4px', right: '4px',
                width: '8px', height: '8px', background: '#ef4444',
                borderRadius: '50%', border: '1.5px solid var(--bg-card)',
              }} />
            )}
          </button>

          {/* Notification dropdown */}
          {showNotifs && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              width: 320, background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              zIndex: 200, overflow: 'hidden',
            }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                {unreadCount > 0 && <button onClick={markAllRead} style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Mark all read</button>}
              </div>
              {notifs.map(n => (
                <div key={n.id} style={{
                  padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                  background: n.read ? 'transparent' : 'rgba(37,99,235,0.05)',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.read ? 'var(--border)' : 'var(--primary)', marginTop: '0.35rem', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.83rem', color: 'var(--text-main)', lineHeight: 1.45 }}>{n.text}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User profile link */}
        <Link to="/profile" className="nav-user-badge" title="Go to Profile">
          <div className="nav-avatar">{initials}</div>
          <span>{user?.name ?? 'Guest'}</span>
        </Link>
      </div>
    </nav>
  );
}
