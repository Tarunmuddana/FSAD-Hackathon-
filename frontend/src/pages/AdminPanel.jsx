import { useState, useEffect } from 'react';
import { getEvents, createEvent } from '../services/api';

export default function AdminPanel() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkill, setRequiredSkill] = useState('');
  const [requiredVolunteers, setRequiredVolunteers] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data.reverse());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !requiredVolunteers) return;

    try {
      const newEvent = {
        title,
        description,
        requiredSkill,
        requiredVolunteers: parseInt(requiredVolunteers, 10),
      };
      
      const created = await createEvent(newEvent);
      setEvents([created, ...events]);
      
      // Reset form
      setTitle('');
      setDescription('');
      setRequiredSkill('');
      setRequiredVolunteers('');
    } catch (err) {
      console.error("Error creating event", err);
    }
  };

  if (loading) return <div className="page-container">Loading admin...</div>;

  return (
    <div className="page-container admin-layout">
      <div className="page-header">
        <h1 className="page-title">Admin Panel</h1>
      </div>

      <div className="admin-form-card">
        <h2 style={{ marginBottom: '1.5rem' }}>Create New Event</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label>Event Title *</label>
            <input 
              type="text" 
              className="form-control" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Required Volunteers *</label>
            <input 
              type="number" 
              className="form-control" 
              value={requiredVolunteers} 
              onChange={e => setRequiredVolunteers(e.target.value)} 
              required 
              min="1"
            />
          </div>

          <div className="form-group full-width">
            <label>Required Skills (comma separated)</label>
            <input 
              type="text" 
              className="form-control" 
              value={requiredSkill} 
              onChange={e => setRequiredSkill(e.target.value)} 
              placeholder="e.g. React, Design, Teaching"
            />
          </div>

          <div className="form-group full-width">
            <label>Description</label>
            <textarea 
              className="form-control" 
              rows="3" 
              value={description} 
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group full-width" style={{ marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary">Create Event</button>
          </div>
        </form>
      </div>

      <div>
        <h2 style={{ marginBottom: '1.5rem' }}>Existing Events</h2>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Required Skills</th>
                <th>Volunteers</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr><td colSpan="4" style={{textAlign: 'center', color: 'var(--text-muted)'}}>No events available.</td></tr>
              ) : (
                events.map(evt => (
                  <tr key={evt.id}>
                    <td style={{ fontWeight: '500' }}>{evt.title}</td>
                    <td>{evt.requiredSkill || '—'}</td>
                    <td>{evt.currentVolunteers} / {evt.requiredVolunteers}</td>
                    <td>
                      <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
