const WEIGHTS = {
  skillMatch: 0.4,
  communication: 0.2,
  salaryFit: 0.2,
  availabilityFit: 0.2,
};

const calculateWeightedScore = (scoreBreakdown = {}) => {
  const safeScores = {
    skillMatch: Number(scoreBreakdown.skillMatch) || 0,
    communication: Number(scoreBreakdown.communication) || 0,
    salaryFit: Number(scoreBreakdown.salaryFit) || 0,
    availabilityFit: Number(scoreBreakdown.availabilityFit) || 0,
  };

  const weighted =
    safeScores.skillMatch * WEIGHTS.skillMatch +
    safeScores.communication * WEIGHTS.communication +
    safeScores.salaryFit * WEIGHTS.salaryFit +
    safeScores.availabilityFit * WEIGHTS.availabilityFit;

  return Number((weighted * 10).toFixed(2));
};

export { calculateWeightedScore };
