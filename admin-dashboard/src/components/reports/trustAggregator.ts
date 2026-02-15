export function buildTrustAnalyticsSummary(scores: any[]) {
  if (!scores.length) {
    return {
      averageScore: 0,
      highTrustMembers: 0,
    };
  }

  const avg =
    scores.reduce((sum, s) => sum + (s.score || 0), 0) / scores.length;

  return {
    averageScore: Math.round(avg),
    highTrustMembers: scores.filter(s => s.score >= 80).length,
  };
}
