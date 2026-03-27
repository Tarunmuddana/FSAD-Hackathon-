/**
 * Client-side compatibility matching utilities.
 */

export function computeMatch(volunteerSkills, eventRequiredSkill) {
  const vSkills = (volunteerSkills || "").toLowerCase().split(",").map(s => s.trim()).filter(Boolean);
  const eSkill = (eventRequiredSkill || "").toLowerCase().trim();

  if (!eSkill) {
    return { matchPercentage: 80, matchedSkills: [], missingSkills: [] };
  }

  const matched = vSkills.filter(s => s === eSkill);
  const missing = matched.length > 0 ? [] : [eSkill];

  return {
    matchPercentage: matched.length > 0 ? 100 : (vSkills.length > 0 ? 25 : 0),
    matchedSkills: matched,
    missingSkills: missing
  };
}

export function getScoreColor(score) {
  if (score >= 80) return 'var(--score-high)';
  if (score >= 50) return 'var(--score-mid)';
  return 'var(--score-low)';
}

export function getScoreLabel(score) {
  if (score >= 80) return 'Great Match';
  if (score >= 50) return 'Partial Match';
  return 'Low Match';
}
