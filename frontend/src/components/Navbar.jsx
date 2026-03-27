import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-brand">Service Matchmaker</div>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Discovery</Link>
        <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
        <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>Admin</Link>
      </div>
    </nav>
  );
}
