import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generatePDFReport(summary: any, loans: any[]) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(16);
  doc.text("Financial Report", 14, 15);

  // Summary table
  autoTable(doc, {
    startY: 25,
    head: [["Metric", "Value"]],
    body: [
      ["Total Loans", summary.totalLoans],
      ["Active Loans", summary.activeLoans],
      ["Total Principal", summary.totalPrincipal],
      ["Total Paid", summary.totalPaid],
      ["Outstanding Amount", summary.totalOutstanding],
      ["Repayment Rate (%)", summary.repaymentRate],
      ["Overdue EMIs", summary.overdueEmis],
    ],
  });

  // 🔥 SAFELY CALCULATE NEXT START POSITION
  const finalY =
    (doc as any).autoTable?.previous?.finalY || 60;

  // Loans table
  autoTable(doc, {
    startY: finalY + 10,
    head: [[
      "Loan ID",
      "Member",
      "Principal",
      "Paid",
      "Outstanding",
      "EMIs Paid",
      "Overdue",
      "Status",
    ]],
    body: loans.map((l) => [
      l.loanId,
      l.memberId,
      l.principal,
      l.paidAmount,
      l.remainingAmount,
      `${l.paidEmis}/${l.totalEmis}`,
      l.overdueEmis,
      l.status,
    ]),
  });

  doc.save("financial-report.pdf");
}
