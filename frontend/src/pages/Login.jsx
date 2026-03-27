import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser, registerUser } from '../services/api'
import './Pages.css'

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', skills: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!form.email || !form.password) {
      setError('Email and password are required.')
      return
    }
    if (isRegister && !form.name) {
      setError('Please enter your name.')
      return
    }
    if (form.password.length < 4) {
      setError('Password must be at least 4 characters.')
      return
    }

    setLoading(true)
    try {
      let user
      if (isRegister) {
        user = await registerUser({
          name: form.name,
          email: form.email,
          password: form.password,
          skills: form.skills || '',
          hoursLogged: 0
        })
      } else {
        user = await loginUser({ email: form.email, password: form.password })
      }
      onLogin(user)
      navigate('/discover')
    } catch (err) {
      setError(err.message || 'Something went wrong. Is the backend running on port 8080?')
    }
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-hero">
        <div className="hero-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        <div className="hero-content fade-up">
          <div className="hero-brand">
            <span className="hero-icon">◆</span>
            <h1 className="hero-title">Service Matchmaker</h1>
          </div>
          <p className="hero-tagline">
            Connect with your community.<br />
            Find events that match your skills.<br />
            Track your volunteer impact.
          </p>
          <div className="hero-features">
            <div className="hero-feat">✦ Smart Skill Matching</div>
            <div className="hero-feat">✦ Impact Tracking</div>
            <div className="hero-feat">✦ Event Discovery</div>
          </div>
        </div>
      </div>

      <div className="login-form-section">
        <div className="login-card scale-in">
          <h2 className="login-title">{isRegister ? 'Create your account' : 'Welcome back'}</h2>
          <p className="login-subtitle">{isRegister ? 'Join the volunteer community today' : 'Sign in to continue to your dashboard'}</p>

          <form onSubmit={handleSubmit} className="login-form">
            {isRegister && (
              <div className="input-group fade-up">
                <label className="input-label">Full Name *</label>
                <input className="form-input" placeholder="John Doe" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
            )}
            <div className="input-group fade-up fade-up-delay-1">
              <label className="input-label">Email *</label>
              <input className="form-input" placeholder="you@example.com" type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="input-group fade-up fade-up-delay-2">
              <label className="input-label">Password *</label>
              <input className="form-input" placeholder="Min 4 characters" type="password" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            {isRegister && (
              <div className="input-group fade-up fade-up-delay-3">
                <label className="input-label">Your Skills</label>
                <input className="form-input" placeholder="e.g., React, Java, Python" value={form.skills}
                  onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} />
                <span className="input-hint">Comma-separated. We'll match you with relevant events.</span>
              </div>
            )}

            {error && <p className="login-error">⚠ {error}</p>}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <span className="btn-spinner">●●●</span>
              ) : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="login-divider"><span>or</span></div>

          <p className="login-toggle">
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <button className="toggle-link" onClick={() => { setIsRegister(!isRegister); setError(''); setForm({ name: '', email: '', password: '', skills: '' }) }}>
              {isRegister ? 'Sign in instead' : 'Create one for free'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
