import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "../AuthContext";
import CashVerificationPanel from "./CashVerificationPanel";

export default function TransactionsView() {
  const { shgId } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);

  // 🔥 REALTIME FETCH
  useEffect(() => {
    if (!shgId) return;

    const q = query(
      collection(db, "transactions"),
      where("shgId", "==", shgId),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, async (snap) => {
      const list = await Promise.all(
        snap.docs.map(async (docSnap) => {
          const data = docSnap.data();

          // 🔥 fetch member name
          let memberName = "Unknown";
          if (data.memberId) {
            try {
              const memberSnap = await getDoc(
                doc(db, "ShgGroups", shgId, "members", data.memberId)
              );
              if (memberSnap.exists()) {
                memberName = memberSnap.data().name;
              }
            } catch {}
          }

          return {
            id: docSnap.id,
            ...data,
            memberName,
          };
        })
      );

      setTransactions(list);
    });

    return () => unsub();
  }, [shgId]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Transactions</h2>

      {transactions.length === 0 ? (
        <p>No transactions yet</p>
      ) : (
        transactions.map((tx) => (
          <div key={tx.id} className="border p-4 rounded-lg">
            <p><b>Member:</b> {tx.memberName}</p>
            <p><b>Amount:</b> ₹{tx.amount}</p>
            <p><b>Mode:</b> {tx.mode}</p>
            <p>
              <b>Status:</b>{" "}
              <span
                className={
                  tx.status === "VERIFIED"
                    ? "text-green-600"
                    : "text-orange-600"
                }
              >
                {tx.status}
              </span>
            </p>

            {/* 🔥 CASH VERIFICATION */}
            {tx.mode === "CASH" && tx.status === "PENDING" && (
              <CashVerificationPanel
                phone={tx.phone}
                emiId={tx.emiId}
                loanId={tx.loanId}
                emiAmount={tx.amount}
                monthIndex={tx.monthIndex}
                // markEmiPaid={async () => {
                //   await updateDoc(doc(db, "transactions", tx.id), {
                //     status: "VERIFIED",
                //   });
                // }}
                markEmiPaid={async () => {
  try {
    // 🔥 1. UPDATE TRANSACTION STATUS
    await updateDoc(doc(db, "transactions", tx.id), {
      status: "VERIFIED",
    });

    // 🔥 2. UPDATE LOAN DATA
    if (!shgId) return;

    const loanRef = doc(db, "ShgGroups", shgId, "loans", tx.loanId);
    const loanSnap = await getDoc(loanRef);

    if (!loanSnap.exists()) return;

    const loanData = loanSnap.data();

    const totalPaid = (loanData.totalPaid || 0) + tx.amount;

    const totalLoanAmount =
      (loanData.amount || 0) + (loanData.interest || 0);

    const remaining = totalLoanAmount - totalPaid;

    const repaymentProgress =
      (totalPaid / totalLoanAmount) * 100;

    await updateDoc(loanRef, {
      totalPaid,
      remaining,
      repaymentProgress,
    });
  } catch (err) {
    console.error(err);
  }
}}
              />
            )}
          </div>
        ))
      )}
    </div>
  );
}