// import { useEffect, useState } from "react";
// import {
//   collection,
//   onSnapshot,
//   query,
//   where,
//   doc,
//   updateDoc,
//   getDoc,
//   orderBy,
// } from "firebase/firestore";
// import { db } from "./firebase";
// import { useAuth } from "../AuthContext";
// import CashVerificationPanel from "./CashVerificationPanel";

// export default function TransactionsView() {
//   const { shgId } = useAuth();
//   const [transactions, setTransactions] = useState<any[]>([]);

//   // 🔥 REALTIME FETCH
//   useEffect(() => {
//     if (!shgId) return;

//     const q = query(
//       collection(db, "transactions"),
//       where("shgId", "==", shgId),
//       orderBy("createdAt", "desc")
//     );

//     const unsub = onSnapshot(q, async (snap) => {
//       const list = await Promise.all(
//         snap.docs.map(async (docSnap) => {
//           const data = docSnap.data();

//           // 🔥 fetch member name
//           let memberName = "Unknown";
//           if (data.memberId) {
//             try {
//               const memberSnap = await getDoc(
//                 doc(db, "ShgGroups", shgId, "members", data.memberId)
//               );
//               if (memberSnap.exists()) {
//                 memberName = memberSnap.data().name;
//               }
//             } catch {}
//           }

//           return {
//             id: docSnap.id,
//             ...data,
//             memberName,
//           };
//         })
//       );

//       setTransactions(list);
//     });

//     return () => unsub();
//   }, [shgId]);

//   return (
//     <div className="space-y-4">
//       <h2 className="text-2xl font-semibold">Transactions</h2>

//       {transactions.length === 0 ? (
//         <p>No transactions yet</p>
//       ) : (
//         transactions.map((tx) => (
//           <div key={tx.id} className="border p-4 rounded-lg">
//             <p><b>Member:</b> {tx.memberName}</p>
//             <p><b>Amount:</b> ₹{tx.amount}</p>
//             <p><b>Mode:</b> {tx.mode}</p>
//             <p>
//               <b>Status:</b>{" "}
//               <span
//                 className={
//                   tx.status === "VERIFIED"
//                     ? "text-green-600"
//                     : "text-orange-600"
//                 }
//               >
//                 {tx.status}
//               </span>
//             </p>

//             {/* 🔥 CASH VERIFICATION */}
//             {tx.mode === "CASH" && tx.status === "PENDING" && (
//               <CashVerificationPanel
//                 phone={tx.phone}
//                 emiId={tx.emiId}
//                 loanId={tx.loanId}
//                 emiAmount={tx.amount}
//                 monthIndex={tx.monthIndex}
//                 // markEmiPaid={async () => {
//                 //   await updateDoc(doc(db, "transactions", tx.id), {
//                 //     status: "VERIFIED",
//                 //   });
//                 // }}
//                 markEmiPaid={async () => {
//   try {
//     // 🔥 1. UPDATE TRANSACTION STATUS
//     await updateDoc(doc(db, "transactions", tx.id), {
//       status: "VERIFIED",
//     });

//     // 🔥 2. UPDATE LOAN DATA
//     if (!shgId) return;

//     const loanRef = doc(db, "ShgGroups", shgId, "loans", tx.loanId);
//     const loanSnap = await getDoc(loanRef);

//     if (!loanSnap.exists()) return;

//     const loanData = loanSnap.data();

//     const totalPaid = (loanData.totalPaid || 0) + tx.amount;

//     const totalLoanAmount =
//       (loanData.amount || 0) + (loanData.interest || 0);

//     const remaining = totalLoanAmount - totalPaid;

//     const repaymentProgress =
//       (totalPaid / totalLoanAmount) * 100;

//     await updateDoc(loanRef, {
//       totalPaid,
//       remaining,
//       repaymentProgress,
//     });
//   } catch (err) {
//     console.error(err);
//   }
// }}
//               />
//             )}
//           </div>
//         ))
//       )}
//     </div>
//   );
// }
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Eye, Clock, IndianRupee, Calendar, FileText } from "lucide-react";

export default function TransactionsView() {
  const { shgId } = useAuth();
  //const { t } = useLanguage();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false);
  const [loadingLoan, setLoadingLoan] = useState(false);

  // REALTIME FETCH
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

          // fetch member name
          let memberName = "Unknown";
          if (data.memberId) {
            try {
              const memberSnap = await getDoc(
                doc(db, "ShgGroups", shgId, "members", data.memberId)
              );
              if (memberSnap.exists()) {
                memberName = memberSnap.data().name;
              }
            } catch { }
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

  // Fetch loan details for the View button
  const handleViewLoan = async (loanId: string) => {
    if (!shgId || !loanId) return;

    setLoadingLoan(true);
    setIsLoanDialogOpen(true);

    try {
      const loanRef = doc(db, "ShgGroups", shgId, "loans", loanId);
      const loanSnap = await getDoc(loanRef);

      if (loanSnap.exists()) {
        const data = loanSnap.data();
        setSelectedLoan({ id: loanSnap.id, ...data });
      } else {
        setSelectedLoan(null);
      }
    } catch (err) {
      console.error("Failed to fetch loan:", err);
      setSelectedLoan(null);
    } finally {
      setLoadingLoan(false);
    }
  };

  // Calculate loan progress from dueDates
  const getLoanProgress = (loan: any) => {
    if (!loan?.dueDates || loan.dueDates.length === 0) return 0;
    const paid = loan.dueDates.filter((d: any) => d.paid).length;
    return (paid / loan.dueDates.length) * 100;
  };

  const getNextDueDate = (loan: any) => {
    if (!loan?.dueDates) return "N/A";
    const next = loan.dueDates.find((d: any) => !d.paid);
    if (!next) return "All Paid";
    const date = next.date?.toDate?.() || new Date(next.date);
    return date.toLocaleDateString("en-IN");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Transactions</h2>

      {transactions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                {/* Left: Transaction Info */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-gray-900">
                      {tx.memberName}
                    </p>
                    <Badge
                      className={
                        tx.status === "VERIFIED"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }
                    >
                      {tx.status}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        tx.mode === "ONLINE"
                          ? "border-blue-300 text-blue-700"
                          : "border-gray-300 text-gray-700"
                      }
                    >
                      {tx.mode}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5" />
                      <span className="font-medium text-gray-800">
                        ₹{tx.amount?.toLocaleString("en-IN")}
                      </span>
                    </span>
                    {tx.createdAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {tx.createdAt.toDate?.()
                          ? tx.createdAt.toDate().toLocaleDateString("en-IN")
                          : ""}
                      </span>
                    )}
                    {tx.txHash && tx.mode === "ONLINE" && (
                      <span className="text-xs text-blue-500 truncate max-w-[200px]">
                        Tx: {tx.txHash}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: View Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 ml-4"
                  onClick={() => handleViewLoan(tx.loanId)}
                >
                  <Eye className="w-4 h-4" />
                  View Loan
                </Button>
              </div>

              {/* CASH VERIFICATION */}
              {tx.mode === "CASH" && tx.status === "PENDING" && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <CashVerificationPanel
                    phone={tx.phone}
                    emiId={tx.emiId}
                    loanId={tx.loanId}
                    emiAmount={tx.amount}
                    monthIndex={tx.monthIndex}
                    markEmiPaid={async (loanId: string, emiAmount: number, txHash: string, monthIndex?: number) => {
                      try {
                        if (!shgId) return;

                        const loanRef = doc(db, "ShgGroups", shgId, "loans", loanId);
                        const loanSnap = await getDoc(loanRef);

                        if (!loanSnap.exists()) return;

                        const loanData = loanSnap.data();
                        const dueDates = [...(loanData.dueDates || [])];

                        const currentIndex =
                          monthIndex !== undefined
                            ? monthIndex
                            : dueDates.findIndex((d: any) => !d.paid);

                        if (currentIndex === -1) return;
                        if (dueDates[currentIndex]?.paid) return;

                        dueDates[currentIndex] = {
                          ...dueDates[currentIndex],
                          paid: true,
                          paidAt: new Date(),
                          txHash: txHash || "CASH",
                        };

                        const newPaidAmount = (loanData.paidAmount || 0) + emiAmount;
                        const newRemaining = (loanData.remainingAmount || 0) - emiAmount;
                        const allPaid = dueDates.every((d: any) => d.paid);

                        await updateDoc(loanRef, {
                          dueDates: dueDates,
                          paidAmount: newPaidAmount,
                          remainingAmount: Math.max(newRemaining, 0),
                          status: allPaid ? "COMPLETED" : "APPROVED",
                        });
                      } catch (err) {
                        console.error("markEmiPaid error:", err);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* LOAN DETAILS DIALOG */}
      <Dialog open={isLoanDialogOpen} onOpenChange={setIsLoanDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Loan Details</DialogTitle>
          </DialogHeader>

          {loadingLoan ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : selectedLoan ? (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">
                    {selectedLoan.purpose || "Loan"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Disbursed:{" "}
                    {selectedLoan.startDate?.toDate?.()
                      ? selectedLoan.startDate.toDate().toLocaleDateString("en-IN")
                      : "N/A"}
                  </p>
                </div>
                <Badge
                  className={
                    selectedLoan.status === "COMPLETED"
                      ? "bg-blue-100 text-blue-800"
                      : selectedLoan.status === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : selectedLoan.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {selectedLoan.status}
                </Badge>
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Loan Amount</p>
                  <p className="text-xl font-semibold text-gray-900">
                    ₹{(selectedLoan.principalAmount || 0).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Remaining</p>
                  <p className="text-xl font-semibold text-orange-600">
                    ₹{(selectedLoan.remainingAmount || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Repayment Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Repayment Progress</span>
                  <span className="font-medium text-gray-900">
                    {getLoanProgress(selectedLoan).toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={getLoanProgress(selectedLoan)}
                  className="h-3"
                />
                <p className="text-xs text-gray-500">
                  {selectedLoan.dueDates?.filter((d: any) => d.paid).length || 0} of{" "}
                  {selectedLoan.dueDates?.length || 0} EMIs paid
                </p>
              </div>

              {/* EMI Details */}
              <Card className="bg-blue-50 border-blue-100">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Monthly EMI</span>
                    <span className="text-lg font-semibold text-gray-900">
                      ₹{(selectedLoan.emiAmount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-gray-600">
                      Next Due:{" "}
                      <span className="text-orange-600 font-medium">
                        {getNextDueDate(selectedLoan)}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-blue-100">
                    <span className="text-gray-600">Interest Rate</span>
                    <span className="font-medium">{selectedLoan.interestRate || 12}% p.a.</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tenure</span>
                    <span className="font-medium">{selectedLoan.tenureMonths || 0} months</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Payable</span>
                    <span className="font-medium">
                      ₹{(selectedLoan.totalPayable || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Amount Paid</span>
                    <span className="font-medium text-green-600">
                      ₹{(selectedLoan.paidAmount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              {selectedLoan.description && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                  <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                    {selectedLoan.description}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              Loan not found
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}