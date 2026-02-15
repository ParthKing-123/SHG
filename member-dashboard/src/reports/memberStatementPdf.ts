import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { MemberTransaction } from "../services/memberTransactionService";

export function generateMemberStatementPDF(
  transactions: MemberTransaction[],
  memberName: string
) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(16);
  doc.text("Transaction Statement", 14, 20);

  doc.setFontSize(11);
  doc.text(`Member: ${memberName}`, 14, 28);
  doc.text(`Generated on: ${new Date().toLocaleString("en-IN")}`, 14, 34);

  // Table
  autoTable(doc, {
    startY: 42,
    head: [[
      "Date",
      "Type",
      "Category",
      "Amount (₹)",
      "Status"
    ]],
    body: transactions.map(t => [
      t.date,
      t.type,
      t.category,
      `₹${t.amount.toLocaleString("en-IN")}`,
      t.status
    ]),
    styles: {
      fontSize: 10,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [20, 184, 166] // teal
    }
  });

  doc.save("transaction-statement.pdf");
}
