export default function SkillBadge({ skill, status = 'neutral' }) {
  // status can be 'matched', 'missing', or 'neutral'
  const className = `skill-badge ${status}`;
  return (
    <span className={className}>
      {skill}
    </span>
  );
}
