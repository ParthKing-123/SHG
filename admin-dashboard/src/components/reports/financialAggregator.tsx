export function buildFinancialSummary(loans: any[]) {
  let totalPrincipal = 0;
  let totalPaid = 0;
  let totalOutstanding = 0;

  let activeLoans = 0;
  let totalEmis = 0;
  let paidEmis = 0;
  let overdueEmis = 0;

  loans.forEach((loan) => {
    totalPrincipal += loan.principal || 0;
    totalPaid += loan.paidAmount || 0;
    totalOutstanding += loan.remainingAmount || 0;

    if (loan.status === "ACTIVE") {
      activeLoans += 1;
    }

    totalEmis += loan.totalEmis || 0;
    paidEmis += loan.paidEmis || 0;
    overdueEmis += loan.overdueEmis || 0;
  });

  const repaymentRate =
    totalEmis === 0 ? 0 : Math.round((paidEmis / totalEmis) * 100);

  return {
    totalLoans: loans.length,
    activeLoans,
    totalPrincipal,
    totalPaid,
    totalOutstanding,
    totalEmis,
    paidEmis,
    overdueEmis,
    repaymentRate,
  };
}
