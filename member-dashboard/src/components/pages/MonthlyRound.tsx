import { useEffect, useState } from "react";
import { collection, onSnapshot, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { getContract, getReadContract, decodeRepaymentTx } from "./blockchain";
import { ethers } from "ethers";
interface Round {
  id: string;
  roundName: string;
  amount: number;
}

export function MonthlyRound() {
  const { shgId, uid } = useAuth();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [selectedRound, setSelectedRound] = useState<Round | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // example – replace with actual name if you have it in AuthContext
  const [userName, setMemberName] = useState("");
  const [loanId, setLoanId] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [successPay, setPay] = useState(0);

  const [repayments, setRepayments] = useState<any[]>([]);

  const [txHash, setTxHash] = useState("");          // latest tx hash
  const [inputTxHash, setInputTxHash] = useState(""); // verification input
  const [verifiedData, setVerifiedData] = useState<any>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [paidRounds, setPaidRounds] = useState<Record<string, boolean>>({});

  const [selectedLoan, setSelectedLoan] = useState<any>(null);

  // 🔹 Fetch monthly rounds
  useEffect(() => {
    if (!shgId) return;

    const unsub = onSnapshot(
      collection(db, "ShgGroups", shgId, "monthlyRounds"),
      (snap) => {
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Round[];

        setRounds(data);
      }
    );

    return () => unsub();
  }, [shgId]);
  useEffect(() => {
    if (!shgId || !uid) return;

    const unsub = onSnapshot(
      doc(db, "ShgGroups", shgId, "members", uid),
      (snap) => {
        if (snap.exists()) {
          setMemberName(snap.data().name);
        }
      }
    );

    return () => unsub();
  }, [shgId, uid]);
  useEffect(() => {
    if (!shgId || !uid) return;

    const unsub = onSnapshot(
      collection(db, "ShgGroups", shgId, "monthlyRounds"),
      async (snap) => {
        const paidMap: Record<string, boolean> = {};

        await Promise.all(
          snap.docs.map(async (roundDoc) => {
            const contribRef = doc(
              db,
              "ShgGroups",
              shgId,
              "monthlyRounds",
              roundDoc.id,
              "contributions",
              uid
            );

            const unsubInner = onSnapshot(contribRef, (cSnap) => {
              if (cSnap.exists()) {
                paidMap[roundDoc.id] = true;
                setPaidRounds((prev) => ({
                  ...prev,
                  [roundDoc.id]: true,
                }));
              }
            });

            return unsubInner;
          })
        );
      }
    );

    return () => unsub();
  }, [shgId, uid]);

  useEffect(() => {
    console.log("Ethereum at load:", window.ethereum);
    loadRepayments();
  }, []);
  const forceConnectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not installed");
      return false;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      alert("No account selected");
      return false;
    }

    console.log("Connected:", accounts[0]);
    return true;
  };

  const loadRepayments = async () => {
    try {
      const contract = await getReadContract();
      const total = await contract.totalRepayments();
      const count = Number(total);

      const data = [];

      for (let i = 0; i < count; i++) {
        const r = await contract.getRepayment(i);
        data.push({
          payer: r.payer,
          loanId: r.loanId.toString(),
          amount: ethers.formatEther(r.amount),
          time: new Date(Number(r.timestamp) * 1000).toLocaleString(),
        });
      }

      setRepayments(data);
    } catch (err) {
      console.error("❌ loadRepayments failed:", err);
    }
  };

  const payEMI = async () => {
    try {
      setStatus("Waiting for wallet...");
      const contract = await getContract();

      const tx = await contract.payEMI(
        Number(loanId),
        { value: ethers.parseEther(amount) }
      );

      setTxHash(tx.hash);
      await tx.wait();

      setStatus("✅ EMI recorded on blockchain");
      return true;
    } catch (err: any) {
      setStatus("❌ " + err.message);
      return false;
    }
  };

  // 🔹 Pay contribution
  const payContribution = async (round: Round) => {
    if (!uid || !shgId) return;

    await setDoc(
      doc(
        db,
        "ShgGroups",
        shgId,
        "monthlyRounds",
        round.id,
        "contributions",
        uid
      ),
      {
        amountPaid: round.amount,
        paidAt: serverTimestamp(),
      }
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Monthly Round
        </h1>
        <p className="text-gray-600">
          View monthly savings rounds
        </p>
      </div>

      {rounds.length === 0 ? (
        <p className="text-gray-500">No rounds available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rounds.map((round) => {
            const isPaid = paidRounds[round.id]; // ✅ HERE

            return (
              <Card
                key={round.id}
                className="border border-gray-200 shadow-sm"
              >
                <CardHeader>
                  <CardTitle className="capitalize">
                    {round.roundName}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="text-lg font-semibold text-teal-600">
                    ₹{round.amount.toLocaleString("en-IN")}
                  </div>

                  <Button
                    className={`w-full ${isPaid
                        ? "bg-green-600 hover:bg-green-600 cursor-not-allowed"
                        : ""
                      }`}
                    disabled={isPaid}
                    onClick={() => {
                      if (isPaid) return;
                      setSelectedRound(round);
                      setIsOpen(true);
                    }}
                  >
                    {isPaid ? "✅ Paid" : `Pay ₹${round.amount}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

      )}
      {isOpen && selectedRound && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md rounded-2xl shadow-xl border border-gray-200">

            {/* Header */}
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold text-center">
                Confirm Contribution
              </CardTitle>
              <p className="text-sm text-center text-gray-500">
                Please verify your payment details
              </p>
            </CardHeader>

            {/* Content */}
            <CardContent className="space-y-6 px-6 pb-6">

              {/* Info Box */}
              <div className="space-y-3 rounded-xl bg-gray-50 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name</span>
                  <span className="font-medium">{userName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">User ID</span>
                  <span className="font-medium text-xs">{uid}</span>
                </div>

                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-semibold text-teal-600 text-lg">
                    ₹{selectedRound.amount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  className="w-full rounded-xl"
                  disabled={isPaying}
                  onClick={async () => {

                    if (isPaying) return; // 🛑 double-click guard
                    setLoanId("1"); // or a real loanId
                    setAmount((selectedRound.amount / 3000).toString());
                    setIsPaying(true);

                    try {
                      const connected = await forceConnectWallet();
                      if (!connected) return;

                      const success = await payEMI();

                      if (success) {
                        await payContribution(selectedRound);
                        setIsOpen(false); // ✅ close ONLY after success
                      }
                    } finally {
                      setIsPaying(false);
                    }
                  }}
                >
                  {isPaying ? "Processing..." : "Confirm Pay"}
                </Button>

              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


