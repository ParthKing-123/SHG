import * as XLSX from "xlsx";

export function generateExcelReport(
  summary: any,
  loans: any[],
  fileName = "financial-report.xlsx"
) {
  const summarySheet = XLSX.utils.json_to_sheet([summary]);
  const loansSheet = XLSX.utils.json_to_sheet(loans);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
  XLSX.utils.book_append_sheet(workbook, loansSheet, "Loans");

  XLSX.writeFile(workbook, fileName);
}
