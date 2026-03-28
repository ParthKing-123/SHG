import {
  collection,
  doc,
  getDoc,
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
    const contribRef = doc(db, "ShgGroups", shgId, "monthlyRounds", round.id, "contributions", memberId);
    const docSnap = await getDoc(contribRef);

    if (docSnap.exists()) {
      const d = docSnap.data();
      if (!d.paidAt) continue;

      const dateObj = typeof d.paidAt.toDate === "function" 
        ? d.paidAt.toDate() 
        : new Date(d.paidAt.seconds ? d.paidAt.seconds * 1000 : d.paidAt);

      transactions.push({
        date: dateObj.toLocaleString("en-IN"),
        type: "Monthly Contribution",
        category: "Savings",
        amount: d.amountPaid || 0,
        status: "Verified",
      });
    }
  }

  /* =========================
     LOAN EMI PAYMENTS
  ========================== */
  const loansSnap = await getDocs(
    query(
      collection(db, "ShgGroups", shgId, "loans"),
      where("memberId", "==", memberId)
    )
  );

  loansSnap.forEach((loanDoc) => {
    const loan = loanDoc.data();

    loan.dueDates?.forEach((due: any) => {
      if (due.paid === true && due.paidAt) {
        let dateObj;
        if (typeof due.paidAt.toDate === "function") {
          dateObj = due.paidAt.toDate();
        } else if (due.paidAt.seconds) {
          dateObj = new Date(due.paidAt.seconds * 1000);
        } else {
          dateObj = new Date(due.paidAt);
        }

        transactions.push({
          date: dateObj.toLocaleString("en-IN"),
          type: "Loan EMI Payment",
          category: "Loan",
          amount: loan.emiAmount || loan.emi || 0,
          status: "Verified",
        });
      }
    });
  });

  return transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}