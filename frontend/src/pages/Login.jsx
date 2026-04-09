import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authLogin, authRegister } from '../services/api';

const FEATURES = [
  "Smart skill-based event matching",
  "Real-time compatibility score rings",
  "Gamified hours & impact tracking",
  "Admin dashboard for event management",
  "Instant skill gap analysis per event",
];

export default function Login({ onLogin }) {
  const [tab, setTab]         = useState('signin');
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [skills, setSkills]   = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate              = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  useEffect(() => {
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [isDark]);

  const saveAndNavigate = (user) => {
    // Persist exactly as described in README.md
    localStorage.setItem("currentUser", JSON.stringify(user));
    onLogin(user);
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'signin') {
        const user = await authLogin(email, password);
        saveAndNavigate(user);
      } else {
        const user = await authRegister({ name, email, password, skills });
        saveAndNavigate(user);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    saveAndNavigate({
      id: 1,
      name: 'Demo User',
      email: 'demo@demo.com',
      skills: 'Java, Spring Boot, React',
      hoursLogged: 42.5,
    });
  };

  return (
    <div className="login-root" style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsDark(!isDark)}
        className="btn btn-sm btn-ghost"
        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', padding: '0.5rem', borderRadius: '50%', zIndex: 50, color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {isDark ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        )}
      </button>
      {/* ─── Hero Panel ─── */}
      <div className="login-hero">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />

        <div className="login-hero-content">
          <div className="login-hero-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            Service Matchmaker — Connect &amp; Impact
          </div>

          <h1>
            Find Volunteer{" "}
            <span className="gradient-text">Opportunities</span>{" "}
            That Match Your Skills
          </h1>

          <p>
            Our smart compatibility engine matches your unique skill set
            with events that need you most — making volunteering more
            meaningful and effective.
          </p>

          <ul className="login-feature-list">
            {FEATURES.map((f) => (
              <li key={f} className="login-feature-item">
                <div className="login-feature-dot" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ─── Form Panel ─── */}
      <div className="login-form-panel">
        {/* Mirrored background to match left panel perfectly */}
        <div className="login-form-background">
          <div className="login-orb login-orb-1 mirrored" />
          <div className="login-orb login-orb-2 mirrored" />
          <div className="login-orb login-orb-3 mirrored" />
        </div>

        <div className="login-form-box">
          {/* Mini logo */}
          <div className="login-logo-mini">
            <div className="login-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="14" height="14" rx="4" fill="currentColor" fillOpacity="0.8"/>
                <rect x="8" y="8" width="14" height="14" rx="4" fill="white" fillOpacity="0.9"/>
              </svg>
            </div>
            <span className="login-logo-text">Service Matchmaker</span>
          </div>

          <h2 className="login-form-title">
            {tab === 'signin' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="login-form-subtitle">
            {tab === 'signin'
              ? 'Sign in to access your volunteer dashboard.'
              : 'Join thousands of volunteers making a difference.'}
          </p>

          {/* Tabs */}
          <div className="login-tabs">
            <button className={`login-tab${tab === 'signin' ? ' active' : ''}`} onClick={() => { setTab('signin'); setError(''); }}>
              Sign In
            </button>
            <button className={`login-tab${tab === 'signup' ? ' active' : ''}`} onClick={() => { setTab('signup'); setError(''); }}>
              Sign Up
            </button>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)',
              background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
              color: 'var(--score-low)', fontSize: '0.85rem', marginBottom: '1rem'
            }}>
              ⚠️ {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            {tab === 'signup' && (
              <>
                <div className="login-form-group">
                  <label>Full Name</label>
                  <input type="text" className="login-form-input" placeholder="Your full name"
                    value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="login-form-group">
                  <label>Skills (comma-separated)</label>
                  <input type="text" className="login-form-input" placeholder="e.g. React, Java, Python"
                    value={skills} onChange={e => setSkills(e.target.value)} />
                </div>
              </>
            )}

            <div className="login-form-group">
              <label>Email Address</label>
              <input type="email" className="login-form-input" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className="login-form-group">
              <label>Password</label>
              <input type="password" className="login-form-input" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? '⏳ Please wait…' : tab === 'signin' ? '→ Sign In' : '→ Create Account'}
            </button>
          </form>

          <div className="login-divider">or</div>

          <button className="login-demo-btn" onClick={handleDemo} disabled={loading}>
            🚀 &nbsp;Continue with Demo Account
          </button>

          <p className="login-footer-text">
            {tab === 'signin' ? "Don't have an account? " : "Already have an account? "}
            <button className="login-footer-link" onClick={() => { setTab(tab === 'signin' ? 'signup' : 'signin'); setError(''); }}>
              {tab === 'signin' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
