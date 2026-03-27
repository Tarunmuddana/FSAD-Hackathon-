import { useState, useRef } from 'react'
import './SkillTagInput.css'

export default function SkillTagInput({ skills = [], onChange }) {
  const [input, setInput] = useState('')
  const inputRef = useRef(null)

  const addSkill = (raw) => {
    const skill = raw.trim()
    if (!skill) return
    if (skills.some(s => s.toLowerCase() === skill.toLowerCase())) return
    onChange([...skills, skill])
    setInput('')
  }

  const removeSkill = (idx) => {
    onChange(skills.filter((_, i) => i !== idx))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill(input)
    }
    if (e.key === 'Backspace' && !input && skills.length > 0) {
      removeSkill(skills.length - 1)
    }
  }

  return (
    <div className="skill-tag-input" onClick={() => inputRef.current?.focus()}>
      <div className="skill-tags-wrap">
        {skills.map((skill, i) => (
          <span key={i} className="skill-tag" title={`Click × to remove "${skill}"`}>
            {skill}
            <button className="skill-tag-remove" onClick={(e) => { e.stopPropagation(); removeSkill(i) }} aria-label={`Remove ${skill}`}>
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          className="skill-tag-field"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addSkill(input)}
          placeholder={skills.length === 0 ? 'Type a skill and press Enter…' : 'Add more…'}
        />
      </div>
    </div>
  )
}
