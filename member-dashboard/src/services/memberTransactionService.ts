import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../components/firebase";



export interface MemberTransaction {
  date: string;
  type: string;
  category: "Savings" | "Loan";
  amount: number;
  status: "Verified" | "Pending";
}


export async function fetchMemberTransactions(
  shgId: string,
  memberId: string
): Promise<MemberTransaction[]> {

  const transactions: MemberTransaction[] = [];

  /* =========================
     MONTHLY CONTRIBUTIONS
  ========================== */
  const roundsSnap = await getDocs(
    collection(db, "ShgGroups", shgId, "monthlyRounds")
  );

  for (const round of roundsSnap.docs) {
    const contribSnap = await getDocs(
      query(
        collection(
          db,
          "ShgGroups",
          shgId,
          "monthlyRounds",
          round.id,
          "contributions"
        ),
        where("memberId", "==", memberId)
      )
    );

    contribSnap.forEach((doc) => {
      const d = doc.data();
      transactions.push({
        date: d.paidAt.toDate().toLocaleString("en-IN"),
        type: "Monthly Contribution",
        category: "Savings",
        amount: d.amountPaid,
        status: "Verified",
      });
    });
  }

  /* =========================
     LOAN EMI PAYMENTS
  ========================== */
  const loansSnap = await getDocs(
    collection(db, "ShgGroups", shgId, "loans")
  );

  loansSnap.forEach((loanDoc) => {
    const loan = loanDoc.data();

    loan.dueDates?.forEach((due: any) => {
      if (due.paid === true) {
        transactions.push({
          date: due.date.toDate().toLocaleString("en-IN"),
          type: "Loan EMI Payment",
          category: "Loan",
          amount: loan.emiAmount,
          status: "Verified",
        });
      }
    });
  });

  return transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}