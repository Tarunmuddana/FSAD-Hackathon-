export const calculateMatch = (userSkills, requiredSkills) => {
  if (!userSkills || !requiredSkills) return { matchPercentage: 0 };

  const userSkillArr = userSkills.split(',').map(s => s.trim().toLowerCase());
  const reqSkillArr = requiredSkills.split(',').map(s => s.trim().toLowerCase());
  
  if (reqSkillArr.length === 0) return { matchPercentage: 100 };
  
  let matchCount = 0;
  reqSkillArr.forEach(req => {
    // Check if the user has this skill (exact or partial match)
    if (userSkillArr.some(uSkill => uSkill.includes(req) || req.includes(uSkill))) {
      matchCount++;
    }
  });

  const matchPercentage = Math.round((matchCount / reqSkillArr.length) * 100);

  return { 
    matchPercentage: Math.min(matchPercentage, 100),
    matchedSkills: matchCount,
    totalRequired: reqSkillArr.length
  };
};

export const getCssVariableFromScore = (score) => {
  if (score >= 80) return 'var(--success, #10b981)';
  if (score >= 40) return 'var(--warning, #f59e0b)';
  return 'var(--danger, #ef4444)';
};
