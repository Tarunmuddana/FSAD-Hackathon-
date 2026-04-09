import { useState } from 'react';

const DEMO_CONVERSATIONS = [
  {
    id: 1, name: 'Community Cleanup Team', role: 'Event Organizer', unread: 2, avatar: 'CC',
    messages: [
      { from: 'them', text: 'Hi! Thanks for registering for our cleanup event.', time: '10:14 AM' },
      { from: 'them', text: 'Just a reminder—please bring gloves and a water bottle 🙂', time: '10:15 AM' },
    ],
  },
  {
    id: 2, name: 'Tech Workshop Admin', role: 'Organizer', unread: 0, avatar: 'TW',
    messages: [
      { from: 'them', text: 'Your registration for the Tech Skills Workshop is confirmed!', time: 'Yesterday' },
      { from: 'me', text: 'Thank you! Looking forward to it.', time: 'Yesterday' },
    ],
  },
  {
    id: 3, name: 'Food Drive Coordinator', role: 'Coordinator', unread: 1, avatar: 'FD',
    messages: [
      { from: 'them', text: 'We noticed your skills in logistics — would you like a team lead role?', time: 'Mon' },
    ],
  },
];

export default function Messages() {
  const [conversations, setConversations] = useState(DEMO_CONVERSATIONS);
  const [activeId, setActiveId] = useState(1);
  const [input, setInput] = useState('');

  const active = conversations.find(c => c.id === activeId);

  const selectConv = (id) => {
    setActiveId(id);
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setConversations(prev => prev.map(c => c.id === activeId
      ? { ...c, messages: [...c.messages, { from: 'me', text: input.trim(), time: 'Now' }] }
      : c
    ));
    setInput('');
  };

  return (
    <div className="page-container" style={{ paddingTop: '1rem' }}>
      <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, marginBottom: '1.5rem' }}>Messages</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1rem', height: 'calc(100vh - 200px)', minHeight: 480 }}>

        {/* Sidebar */}
        <div className="event-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            INBOX
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {conversations.map(c => (
              <div key={c.id}
                onClick={() => selectConv(c.id)}
                style={{
                  padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', gap: '0.75rem',
                  alignItems: 'center', borderBottom: '1px solid var(--border-subtle)',
                  background: c.id === activeId ? 'var(--bg-glass-hover)' : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', background: 'var(--primary)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem',
                  fontWeight: 800, flexShrink: 0,
                }}>
                  {c.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{c.role}</div>
                </div>
                {c.unread > 0 && (
                  <div style={{ background: 'var(--primary)', color: 'white', borderRadius: '999px', fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.45rem' }}>
                    {c.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat panel */}
        <div className="event-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800 }}>
              {active?.avatar}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{active?.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{active?.role}</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {active?.messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '70%', padding: '0.65rem 1rem', borderRadius: m.from === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: m.from === 'me' ? 'var(--primary)' : 'var(--bg-glass-hover)',
                  color: m.from === 'me' ? 'white' : 'var(--text-main)',
                  fontSize: '0.875rem', lineHeight: 1.5,
                }}>
                  <div>{m.text}</div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.65, marginTop: '0.25rem', textAlign: 'right' }}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '0.75rem' }}>
            <input
              value={input} onChange={e => setInput(e.target.value)}
              placeholder="Type a message…"
              className="login-form-input" style={{ flex: 1, padding: '0.65rem 1rem', borderRadius: '999px' }}
            />
            <button type="submit" className="btn btn-primary" style={{ borderRadius: '999px', padding: '0.65rem 1.25rem' }}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
