/**
 * CareerMatch Skill-Matching Algorithm
 * Transparent, explainable skill matching logic.
 * 
 * Formula:
 * Match percentage = (Matched Required Skills / Total Required Skills) * 100
 */

const normalizeSkill = (skill) => {
  return String(skill || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9#+.]/g, '');
};

const calculateJobMatch = (candidateSkills = [], requiredSkills = [], niceToHaveSkills = []) => {
  if (!requiredSkills || requiredSkills.length === 0) {
    return {
      matchPercentage: 100,
      matchingSkills: candidateSkills,
      missingSkills: [],
      matchedNiceToHave: [],
    };
  }

  const candidateNormalizedMap = new Map();
  candidateSkills.forEach((s) => {
    if (s) candidateNormalizedMap.set(normalizeSkill(s), s);
  });

  const matchingSkills = [];
  const missingSkills = [];

  requiredSkills.forEach((reqSkill) => {
    const normReq = normalizeSkill(reqSkill);
    if (candidateNormalizedMap.has(normReq)) {
      matchingSkills.push(reqSkill);
    } else {
      // Check partial inclusion if candidate skill contains req or vice-versa (e.g. react.js -> react)
      let foundPartial = false;
      for (const [normCand, originalCand] of candidateNormalizedMap.entries()) {
        if (normCand.includes(normReq) || normReq.includes(normCand)) {
          matchingSkills.push(reqSkill);
          foundPartial = true;
          break;
        }
      }
      if (!foundPartial) {
        missingSkills.push(reqSkill);
      }
    }
  });

  const matchedNiceToHave = [];
  if (niceToHaveSkills && niceToHaveSkills.length > 0) {
    niceToHaveSkills.forEach((niceSkill) => {
      const normNice = normalizeSkill(niceSkill);
      if (candidateNormalizedMap.has(normNice)) {
        matchedNiceToHave.push(niceSkill);
      }
    });
  }

  const matchPercentage = Math.round((matchingSkills.length / requiredSkills.length) * 100);

  return {
    matchPercentage: Math.min(100, Math.max(0, matchPercentage)),
    matchingSkills,
    missingSkills,
    matchedNiceToHave,
    totalRequired: requiredSkills.length,
    totalMatched: matchingSkills.length,
  };
};

module.exports = { calculateJobMatch, normalizeSkill };
