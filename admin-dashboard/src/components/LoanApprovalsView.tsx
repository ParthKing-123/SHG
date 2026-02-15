import { useEffect, useState } from "react";
import { collection, getDocs, query, where, updateDoc, doc, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "../AuthContext";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface Loan {
  id: string;
  memberId: string;
  principalAmount: number;
  tenureMonths: number;
  interestRate: number;
  emiAmount: number;
  totalPayable: number;
  status: string;
  purpose?: string;
}

export function LoanApprovalsView() {
  const { shgId } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shgId) return;

    const fetchPendingLoans = async () => {
      try {
        const loansRef = collection(db, "ShgGroups", shgId, "loans");

       
        const q = query(
  collection(db, "ShgGroups", shgId, "loans"),
  orderBy("createdAt", "desc")
);


        const snapshot = await getDocs(q);

        const data: Loan[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Loan, "id">),
        }));

        setLoans(data);
      } catch (err) {
        console.error("Error fetching loan approvals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingLoans();
  }, [shgId]);

 const approveLoan = async (loanId: string) => {
  await updateDoc(
    doc(db, "ShgGroups", shgId!, "loans", loanId),
    { status: "APPROVED" }
  );

  setLoans(prev =>
    prev.map(loan =>
      loan.id === loanId
        ? { ...loan, status: "APPROVED" }
        : loan
    )
  );
};


  const rejectLoan = async (loanId: string) => {
  await updateDoc(
    doc(db, "ShgGroups", shgId!, "loans", loanId),
    { status: "REJECTED" }
  );

  setLoans(prev =>
    prev.map(loan =>
      loan.id === loanId
        ? { ...loan, status: "REJECTED" }
        : loan
    )
  );
};


  if (loading) return <p>Loading loan approvals...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Loan Approvals</h1>

      {loans.length === 0 && (
        <p className="text-gray-500">No pending loan requests.</p>
      )}

      {loans.map((loan) => (
        <div
          key={loan.id}
          className="border rounded-lg p-4 flex justify-between items-center"
        >
          <div>
            <p><b>Member ID:</b> {loan.memberId}</p>
            <p><b>Amount:</b> ₹{loan.principalAmount}</p>
            <p><b>Tenure:</b> {loan.tenureMonths} months</p>
            <p><b>EMI:</b> ₹{loan.emiAmount}</p>
            <p><b>Purpose:</b> {loan.purpose ?? "—"}</p>
          </div>

          <div className="flex gap-2 items-center">
  {/* Status badge */}
  <Badge variant="outline">{loan.status}</Badge>

  {/* Actions only for pending loans */}
  {loan.status === "PENDING" && (
    <>
      <Button onClick={() => approveLoan(loan.id)}>
        Approve
      </Button>

      <Button
        variant="destructive"
        onClick={() => rejectLoan(loan.id)}
      >
        Reject
      </Button>
    </>
  )}

  {/* Approved state */}
  {loan.status === "APPROVED" && (
    <span className="text-green-600 text-sm font-medium">
      Approved
    </span>
  )}

  {/* Rejected state */}
  {loan.status === "REJECTED" && (
    <span className="text-red-600 text-sm font-medium">
      Rejected
    </span>
  )}
</div>

        </div>
      ))}
    </div>
  );
}
