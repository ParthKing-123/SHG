export function buildLoanPortfolioSummary(loans: any[]) {
  const totalLoans = loans.length;
  const activeLoans = loans.filter(l => l.status === "ACTIVE").length;
  const closedLoans = loans.filter(l => l.status === "CLOSED").length;

  return {
    totalLoans,
    activeLoans,
    closedLoans,
  };
}
