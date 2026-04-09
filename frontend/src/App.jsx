import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import DiscoveryFeed from './pages/DiscoveryFeed';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import MyEvents from './pages/MyEvents';
import Messages from './pages/Messages';
import Organize from './pages/Organize';
import Login from './pages/Login';
import Profile from './pages/Profile';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("currentUser")) || null; }
    catch { return null; }
  });

  const handleLogin  = (userData) => {
    localStorage.setItem("currentUser", JSON.stringify(userData));
    setUser(userData);
  };
  const handleLogout = () => { localStorage.removeItem("currentUser"); setUser(null); };

  return (
    <Router>
      <div className="app-container">
        {user && <Navbar user={user} onLogout={handleLogout} />}

        <main className="main-content">
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} />

            <Route path="/"          element={user ? <DiscoveryFeed user={user} /> : <Navigate to="/login" replace />} />
            <Route path="/dashboard" element={user ? <Dashboard user={user} />   : <Navigate to="/login" replace />} />
            <Route path="/my-events" element={user ? <MyEvents user={user} />    : <Navigate to="/login" replace />} />
            <Route path="/messages"  element={user ? <Messages user={user} />    : <Navigate to="/login" replace />} />
            <Route path="/organize"  element={user ? <Organize user={user} />    : <Navigate to="/login" replace />} />
            <Route path="/admin"     element={user ? <AdminPanel user={user} />  : <Navigate to="/login" replace />} />
            <Route path="/profile"   element={user ? <Profile user={user} onUpdateUser={handleLogin} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />

            <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
