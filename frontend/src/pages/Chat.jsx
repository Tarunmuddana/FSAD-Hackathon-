import { useState, useEffect, useRef } from 'react'
import { getMyEvents, getEvents, getEventMessages, sendEventMessage, getPersonalMessages, sendPersonalMessage, getChatPartners, getVolunteers } from '../services/api'
import './Pages.css'

export default function Chat({ user }) {
  const [tab, setTab] = useState('group') // 'group' | 'personal'
  const [events, setEvents] = useState([])
  const [partners, setPartners] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedPartner, setSelectedPartner] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)
  const chatEndRef = useRef(null)

  // Load user's events for group chat
  useEffect(() => {
    if (!user) return
    getMyEvents(user.id).then(setEvents).catch(() => {})
    getChatPartners(user.id).then(setPartners).catch(() => {})
    getVolunteers().then(setAllUsers).catch(() => {})
  }, [user])

  // Load messages when selection changes
  useEffect(() => {
    if (tab === 'group' && selectedEvent) {
      setLoading(true)
      getEventMessages(selectedEvent.id).then(m => { setMessages(m); setLoading(false) })
      const interval = setInterval(() => {
        getEventMessages(selectedEvent.id).then(setMessages)
      }, 5000)
      return () => clearInterval(interval)
    }
    if (tab === 'personal' && selectedPartner) {
      setLoading(true)
      getPersonalMessages(user.id, selectedPartner.id).then(m => { setMessages(m); setLoading(false) })
      const interval = setInterval(() => {
        getPersonalMessages(user.id, selectedPartner.id).then(setMessages)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [tab, selectedEvent, selectedPartner])

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return
    try {
      if (tab === 'group' && selectedEvent) {
        await sendEventMessage(selectedEvent.id, {
          senderId: user.id,
          senderName: user.name,
          content: input
        })
        const updated = await getEventMessages(selectedEvent.id)
        setMessages(updated)
      } else if (tab === 'personal' && selectedPartner) {
        await sendPersonalMessage({
          senderId: user.id,
          senderName: user.name,
          recipientId: selectedPartner.id,
          content: input
        })
        const updated = await getPersonalMessages(user.id, selectedPartner.id)
        setMessages(updated)
      }
      setInput('')
    } catch { /* silent */ }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const startNewChat = (u) => {
    setSelectedPartner(u)
    setShowNewChat(false)
    setTab('personal')
  }

  const otherUsers = allUsers.filter(u => u.id !== user.id)

  if (!user) {
    return <div className="page"><div className="empty-state">Please sign in to use messages.</div></div>
  }

  const chatTarget = tab === 'group'
    ? (selectedEvent ? `${selectedEvent.title} — Group Chat` : null)
    : (selectedPartner ? selectedPartner.name : null)

  return (
    <div className="page chat-page">
      <header className="page-header fade-up">
        <div>
          <h1 className="page-title">Messages</h1>
          <p className="page-subtitle">Chat with event groups and other volunteers</p>
        </div>
      </header>

      <div className="chat-container fade-up">
        {/* Sidebar */}
        <div className="chat-sidebar">
          <div className="chat-tabs">
            <button className={`chat-tab ${tab === 'group' ? 'active' : ''}`} onClick={() => { setTab('group'); setMessages([]) }}>
              Event Groups
            </button>
            <button className={`chat-tab ${tab === 'personal' ? 'active' : ''}`} onClick={() => { setTab('personal'); setMessages([]) }}>
              Direct Messages
            </button>
          </div>

          <div className="chat-list">
            {tab === 'group' ? (
              events.length === 0 ? (
                <div className="chat-list-empty">Register for events to join their group chats</div>
              ) : (
                events.map(ev => (
                  <button
                    key={ev.id}
                    className={`chat-list-item ${selectedEvent?.id === ev.id ? 'active' : ''}`}
                    onClick={() => { setSelectedEvent(ev); setMessages([]) }}
                  >
                    <span className="chat-item-icon">👥</span>
                    <div className="chat-item-info">
                      <span className="chat-item-name">{ev.title}</span>
                      <span className="chat-item-meta">{ev.currentVolunteers} members</span>
                    </div>
                  </button>
                ))
              )
            ) : (
              <>
                <button className="new-chat-btn" onClick={() => setShowNewChat(!showNewChat)}>
                  + New Conversation
                </button>
                {showNewChat && (
                  <div className="new-chat-list">
                    {otherUsers.map(u => (
                      <button key={u.id} className="chat-list-item" onClick={() => startNewChat(u)}>
                        <span className="chat-item-avatar">{u.name.charAt(0).toUpperCase()}</span>
                        <div className="chat-item-info">
                          <span className="chat-item-name">{u.name}</span>
                          <span className="chat-item-meta">{u.email}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {partners.map(p => (
                  <button
                    key={p.id}
                    className={`chat-list-item ${selectedPartner?.id === p.id ? 'active' : ''}`}
                    onClick={() => { setSelectedPartner(p); setMessages([]) }}
                  >
                    <span className="chat-item-avatar">{p.name.charAt(0).toUpperCase()}</span>
                    <div className="chat-item-info">
                      <span className="chat-item-name">{p.name}</span>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="chat-window">
          {!chatTarget ? (
            <div className="chat-placeholder">
              <div className="chat-placeholder-icon">💬</div>
              <p>Select a conversation to start chatting</p>
            </div>
          ) : (
            <>
              <div className="chat-window-header">
                <h3>{chatTarget}</h3>
              </div>
              <div className="chat-messages">
                {loading ? (
                  <div className="chat-loading">Loading messages…</div>
                ) : messages.length === 0 ? (
                  <div className="chat-empty">No messages yet. Say hello! 👋</div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`chat-bubble ${msg.senderId === user.id ? 'mine' : 'theirs'}`}>
                      {msg.senderId !== user.id && <span className="bubble-sender">{msg.senderName}</span>}
                      <p className="bubble-text">{msg.content}</p>
                      <span className="bubble-time">
                        {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="chat-input-bar">
                <input
                  className="chat-input"
                  placeholder="Type a message…"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button className="chat-send-btn" onClick={handleSend} disabled={!input.trim()}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
