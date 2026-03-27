import { useState, useEffect } from 'react'
import './Toast.css'

export default function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, 3500)
    return () => clearTimeout(timer)
  }, [onClose])

  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'

  return (
    <div className={`toast toast-${type} ${visible ? 'toast-enter' : 'toast-exit'}`}>
      <span className="toast-icon">{icon}</span>
      <span className="toast-msg">{message}</span>
    </div>
  )
}
