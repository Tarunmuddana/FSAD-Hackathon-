import './SkillBadge.css'

export default function SkillBadge({ skill, matched = false }) {
  return (
    <span className={`skill-badge ${matched ? 'matched' : ''}`}>
      {skill}
    </span>
  )
}
