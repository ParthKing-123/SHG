export type EmiStatus = "NOT_VERIFIED" | "VERIFIED" | "PAID";

export interface Emi {
  _id: string;
  loanId: string;
  emiAmount: number;
  dueDate: string;
  status: EmiStatus;
}
