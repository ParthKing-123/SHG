import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db } from "../firebase";

import { getAuth } from "firebase/auth";

interface CreateLoanInput {
  shgId: string;
  memberId: string;
  principalAmount: number;
  interestRate: number;   // monthly %
  tenureMonths: number;
}

export async function createLoan({
  shgId,
  memberId,
  principalAmount,
  interestRate,
  tenureMonths
}: CreateLoanInput) {

  const auth = getAuth();
  const adminId = auth.currentUser?.uid;

  if (!adminId) {
    throw new Error("Not authenticated");
  }

  // 🔢 Calculate loan values
  const totalInterest =
    principalAmount * (interestRate / 100) * tenureMonths;

  const totalPayable = principalAmount + totalInterest;
  const emiAmount = Math.ceil(totalPayable / tenureMonths);

  // 📅 Generate due dates
  const startDate = new Date();
  const dueDates: Timestamp[] = [];

  for (let i = 1; i <= tenureMonths; i++) {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + i);
    dueDates.push(Timestamp.fromDate(d));
  }

  // 💾 Create loan
  const loanRef = await addDoc(
    collection(db, "ShgGroups", shgId, "loans"),
    {
      memberId,
      adminId,

      principalAmount,
      interestRate,
      tenureMonths,

      totalPayable,
      emiAmount,

      paidAmount: 0,
      remainingAmount: totalPayable,

      startDate: Timestamp.fromDate(startDate),
      dueDates,

      status: "ACTIVE",
      createdAt: serverTimestamp()
    }
  );

  // 🔄 Update member
  await updateDoc(
    doc(db, "ShgGroups", shgId, "members", memberId),
    {
      activeLoanId: loanRef.id,
      status: "UNDER_LOAN"
    }
  );

  return loanRef.id;
}
