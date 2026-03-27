import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import DiscoveryFeed from './pages/DiscoveryFeed'
import Dashboard from './pages/Dashboard'
import AdminPanel from './pages/AdminPanel'
import ManageCandidates from './pages/ManageCandidates'
import MyEvents from './pages/MyEvents'
import Chat from './pages/Chat'
import Login from './pages/Login'

export default function App() {
  const [user, setUser] = useState(null)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('currentUser')
    if (saved) setUser(JSON.parse(saved))
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('currentUser', JSON.stringify(userData))
    addNotification('Welcome back! Ready to make an impact.', 'success')
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('currentUser')
  }

  const handleUpdateUser = (updated) => {
    setUser(updated)
    localStorage.setItem('currentUser', JSON.stringify(updated))
  }

  const addNotification = (message, type = 'info') => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type, read: false }])
  }

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login onLogin={handleLogin} />} />
      </Routes>
    )
  }

  return (
    <>
      <Navbar
        user={user}
        onLogout={handleLogout}
        notifications={notifications}
        onClearNotification={clearNotification}
        onMarkAllRead={markAllRead}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/discover" replace />} />
        <Route path="/discover" element={<DiscoveryFeed user={user} onNotify={addNotification} />} />
        <Route path="/dashboard" element={<Dashboard user={user} onUpdateUser={handleUpdateUser} onNotify={addNotification} />} />
        <Route path="/organize" element={<AdminPanel user={user} onNotify={addNotification} />} />
        <Route path="/manage-candidates" element={<ManageCandidates user={user} onNotify={addNotification} />} />
        <Route path="/my-events" element={<MyEvents user={user} />} />
        <Route path="/chat" element={<Chat user={user} />} />
        <Route path="*" element={<Navigate to="/discover" replace />} />
      </Routes>
    </>
  )
}
