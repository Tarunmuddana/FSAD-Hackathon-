export default function SkillBadge({ skill, status = 'neutral' }) {
  return (
    <span className={`skill-badge ${status}`}>
      {status === 'matched' && <span style={{ marginRight: '3px', fontSize: '0.65rem' }}>✓</span>}
      {skill}
    </span>
  );
}
