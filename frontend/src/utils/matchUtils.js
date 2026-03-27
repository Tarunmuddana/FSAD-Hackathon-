/**
 * Calculates compatibility score between a volunteer's skills and an event's required skills.
 * 
 * @param {string} volunteerSkills - Comma separated list of skills (e.g. "Java, React, Python")
 * @param {string} eventRequiredSkills - Comma separated list of required skills (e.g. "React, Figma")
 * @returns {Object} { matchPercentage: number, matchedSkills: string[], missingSkills: string[] }
 */
export const calculateMatch = (volunteerSkills, eventRequiredSkills) => {
  if (!volunteerSkills) volunteerSkills = "";
  if (!eventRequiredSkills) return { matchPercentage: 100, matchedSkills: [], missingSkills: [] };

  const vSkills = volunteerSkills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const eSkills = eventRequiredSkills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

  const matchedSkills = [];
  const missingSkills = [];

  eSkills.forEach(reqSkill => {
    if (vSkills.includes(reqSkill)) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  const totalRequired = eSkills.length;
  // If no skills are required, return 100%
  if (totalRequired === 0) {
    return { matchPercentage: 100, matchedSkills: [], missingSkills: [] };
  }

  const matchPercentage = Math.round((matchedSkills.length / totalRequired) * 100);

  // Capitalize properly for display
  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  
  return {
    matchPercentage,
    matchedSkills: matchedSkills.map(capitalize),
    missingSkills: missingSkills.map(capitalize)
  };
};

export const getColorClassFromScore = (score) => {
  if (score >= 80) return "score-high";
  if (score >= 50) return "score-mid";
  return "score-low";
};

export const getCssVariableFromScore = (score) => {
  if (score >= 80) return "var(--score-high)";
  if (score >= 50) return "var(--score-mid)";
  return "var(--score-low)";
};
