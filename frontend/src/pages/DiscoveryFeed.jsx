import { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';
import SearchBar from '../components/SearchBar';
import { getEvents, getCurrentVolunteer } from '../services/api';
import { calculateMatch } from '../utils/matchUtils';

export default function DiscoveryFeed() {
  const [events, setEvents] = useState([]);
  const [volunteer, setVolunteer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsData, user] = await Promise.all([
          getEvents(),
          getCurrentVolunteer()
        ]);
        setEvents(eventsData);
        setVolunteer(user);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="page-container">Loading events...</div>;

  // Filter and calculate matches
  const processedEvents = events
    .map(event => {
      const matchData = calculateMatch(volunteer?.skills, event.requiredSkill);
      return { ...event, matchData };
    })
    .filter(event => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      // Search by title or required skills
      return (
        event.title.toLowerCase().includes(q) ||
        (event.requiredSkill && event.requiredSkill.toLowerCase().includes(q))
      );
    })
    // Sort by match percentage descending
    .sort((a, b) => b.matchData.matchPercentage - a.matchData.matchPercentage);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Discovery Feed</h1>
      </div>
      
      <SearchBar 
        value={searchQuery} 
        onChange={setSearchQuery} 
        placeholder="Search events by skills or keywords..." 
      />

      {processedEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No events found matching "{searchQuery}"
        </div>
      ) : (
        <div className="events-grid">
          {processedEvents.map(evt => (
            <EventCard key={evt.id} event={evt} matchData={evt.matchData} />
          ))}
        </div>
      )}
    </div>
  );
}
