import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Download, Search, Filter, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { useEffect} from "react";
import { query, where } from "firebase/firestore";
import { fetchMemberTransactions } from "../../services/memberTransactionService";
import { generateMemberStatementPDF } from "../../reports/memberStatementPdf";
import { getContract, getReadContract, decodeRepaymentTx } from "./blockchain";
import { ethers } from "ethers";

interface Transaction {
  id: string;
  date: string;
  type: string;
  amount: number;
  status: "verified" | "pending";
  category: string;
}

interface MyLedgerProps {
  transactions: Transaction[];
  financials: any;
}
interface BlockchainRepayment {
  payer: string;
  loanId: string;
  amount: string;
  time: string;
}

  

export function MyLedger({ transactions, financials }: MyLedgerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
const { shgId, uid } = useAuth();
const [totalSavingsPaid, setTotalSavingsPaid] = useState(0);
    const [totalRepaymentsPaid, setTotalRepaymentsPaid] = useState(0);
const [totalContributed, setTotalContributed] = useState(0);
const [totalSavings, setTotalSavings] = useState(0);
const [loanBalance, setLoanBalance] = useState(0);
const [ledgerTransactions, setLedgerTransactions] = useState<Transaction[]>([]);
const [a,setA] = useState<Transaction[]>([]);
const [b,setB] = useState<Transaction[]>([]);
const [blockchainRepayments, setBlockchainRepayments] =
useState<BlockchainRepayment[]>([]);

if (!uid) return null;
  
 

  const fetchMonthlyRoundTransactions = async (): Promise<Transaction[]> => {
  const txns: Transaction[] = [];

  const roundsSnap = await getDocs(
    collection(db, "ShgGroups", shgId!, "monthlyRounds")
  );

  for (const roundDoc of roundsSnap.docs) {
    const contribRef = doc(
      db,
      "ShgGroups",
      shgId!,
      "monthlyRounds",
      roundDoc.id,
      "contributions",
      uid!
    );

    const contribSnap = await getDoc(contribRef);

    if (!contribSnap.exists()) continue;

    const data = contribSnap.data();
    const ts = resolveTimestamp(data);

  

    // 🔥 SKIP invalid / legacy entries safely
    if (!ts) {
      console.warn("Skipping contribution without timestamp:", data);
      continue;
    }

    txns.push({
      id: `round-${roundDoc.id}`,
      date: new Date(ts).toLocaleString("en-IN"),
      type: "Monthly Contribution",
      category: "Savings",
      amount: data.amountPaid ?? 0,
      status: "verified",
    });
  }

  return txns;
};

const resolveTimestamp = (data: any): number | null => {
  if (data.timestamp?.toMillis) return data.timestamp.toMillis();
  if (data.createdAt?.toMillis) return data.createdAt.toMillis();
  if (data.paidAt?.toMillis) return data.paidAt.toMillis();
  return null;
};

const loadRepayments = async (): Promise<BlockchainRepayment[]> => {
  try {
    const contract = await getReadContract();
    const total = await contract.totalRepayments();
    const count = Number(total);

    const data: BlockchainRepayment[] = [];

    for (let i = 0; i < count; i++) {
      const r = await contract.getRepayment(i);

      data.push({
        payer: r.payer,
        loanId: r.loanId.toString(),
        amount: ethers.formatEther(r.amount),
        time: new Date(Number(r.timestamp) * 1000).toLocaleString("en-IN"),
      });
    }

    return data;
  } catch (err) {
    console.error("❌ loadRepayments failed:", err);
    return [];
  }
};

const handleExportStatement = async () => {
  try {
    if (!uid || !shgId) {
      toast.error("Member not loaded");
      return;
    }

    const transactions = await fetchMemberTransactions(shgId!, uid!);

    if (!transactions.length) {
      toast.error("No transactions to export");
      return;
    }

    generateMemberStatementPDF(
      transactions,
      uid
    );

    toast.success("Statement exported successfully");
  } catch (err) {
    console.error(err);
    toast.error("Failed to export statement");
  }
};



const fetchEmiTransactions = async (): Promise<Transaction[]> => {
  const txns: Transaction[] = [];

  const loansSnap = await getDocs(
    query(
      collection(db, "ShgGroups", shgId!, "loans"),
      where("memberId", "==", uid)
    )
  );



  loansSnap.forEach((loanDoc) => {
    const loan = loanDoc.data();

    if (!["APPROVED", "COMPLETED"].includes(loan.status)) return;
    if (!loan.dueDates) return;

    loan.dueDates.forEach((d: any, index: number) => {
      if (d.paid && d.paidAt) {
        txns.push({
          id: `emi-${loanDoc.id}-${index}`,
          date: d.paidAt.toDate().toLocaleString("en-IN"),
          type: "Loan EMI Payment",
          category: "Loan",
          amount: loan.emiAmount,
          status: "verified",
        });
      }
    });
  });

  return txns;
};



  // Filter transactions
  const filteredTransactions = ledgerTransactions.filter(transaction => {

    const matchesSearch = transaction.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || transaction.category === filterCategory;
    const matchesStatus = filterStatus === "all" || transaction.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate monthly breakdown
  const monthlyData = [
    { month: "May", savings: 2000, repayments: 4000 },
    { month: "Jun", savings: 2000, repayments: 4000 },
    { month: "Jul", savings: 2000, repayments: 4000 },
    { month: "Aug", savings: 2000, repayments: 4000 },
    { month: "Sep", savings: 2000, repayments: 4000 },
    { month: "Oct", savings: 2000, repayments: 4000 },
  ];

  //const total = totalSavingsPaid + totalRepaymentsPaid;
  const total = (totalSavingsPaid || 0) + (totalRepaymentsPaid || 0);
  

const pieData =
  total > 0
    ? [
        {
          name: "Monthly Savings",
          value: Number(((a.length * 100) / ledgerTransactions.length).toFixed(2)),
          color: "#14b8a6",
        },
        {
          name: "Loan Repayments",
          value: Number(((b.length * 100) / ledgerTransactions.length).toFixed(2)),
          color: "#3b82f6",
        },
      ]
    : [];


  // Category breakdown
  // const categoryData = [
  //   { name: "Savings", value: 24000, color: "#14b8a6" },
  //   { name: "Loan Repayments", value: 8000, color: "#3b82f6" },
  //   { name: "Interest Earned", value: 2100, color: "#10b981" },
  // ];

  const handleExport = () => {
    toast.success("Statement exported successfully!");
  };

  useEffect(() => {
  if (!shgId || !uid) return;

  const fetchTotalContributed = async () => {
    let total = 0;

    const roundsSnap = await getDocs(
      collection(db, "ShgGroups", shgId, "monthlyRounds")
    );

    for (const roundDoc of roundsSnap.docs) {
      const contribRef = collection(
        db,
        "ShgGroups",
        shgId,
        "monthlyRounds",
        roundDoc.id,
        "contributions"
      );

      const contribSnap = await getDocs(contribRef);

      contribSnap.forEach((c) => {
        if (c.id === uid) {
          total += c.data().amountPaid || 0;
        }
      });
    }

    setTotalContributed(total);
  };

  fetchTotalContributed();
}, [shgId, uid]);

useEffect(() => {
  if (!shgId) return;

  const fetchTotalSavings = async () => {
    let total = 0;

    const roundsSnap = await getDocs(
      collection(db, "ShgGroups", shgId, "monthlyRounds")
    );

    for (const roundDoc of roundsSnap.docs) {
      const contribSnap = await getDocs(
        collection(
          db,
          "ShgGroups",
          shgId,
          "monthlyRounds",
          roundDoc.id,
          "contributions"
        )
      );

      contribSnap.forEach((c) => {
        total += c.data().amountPaid || 0;
      });
    }

    setTotalSavings(total);
  };

  fetchTotalSavings();
}, [shgId]);

useEffect(() => {
  if (!shgId || !uid) return;

  const fetchLoanBalance = async () => {
    let total = 0;

    const loansSnap = await getDocs(
      query(
        collection(db, "ShgGroups", shgId, "loans"),
        where("memberId", "==", uid),
        where("status", "==", "APPROVED") // confirm exact value
      )
    );

    loansSnap.forEach((doc) => {
      const remaining = doc.data().remainingAmount; // confirm field name
      total += Number(remaining || 0);
    });

    setLoanBalance(total);
  };

  fetchLoanBalance();
}, [shgId, uid]);

useEffect(() => {
  if (!shgId || !uid) return;

  const loadLedgerTransactions = async () => {
    try {
      const [monthlyTxns, emiTxns] = await Promise.all([
        fetchMonthlyRoundTransactions(),
        fetchEmiTransactions(),
      ]);

      const merged = [...monthlyTxns, ...emiTxns];

      // 🔥 Sort by latest first
      merged.sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setA(monthlyTxns);
      setB(emiTxns);
      setLedgerTransactions(merged);
    } catch (err) {
      console.error("Failed to load ledger transactions", err);
    }
  };

  loadLedgerTransactions();
}, [shgId, uid]);

useEffect(() => {
  if (!shgId || !uid) return;

  const loadChainTxns = async () => {
    try {
      const repayments = await loadRepayments(); // EXISTING FUNCTION
      setBlockchainRepayments(repayments);
    } catch (e) {
      console.error("Failed to load blockchain repayments", e);
    }
  };

  loadChainTxns();
}, [shgId, uid]);


useEffect(() => {
  if (!shgId || !uid) return;

  const fetchLedgerStats = async () => {
    let savings = 0;
    let repayments = 0;

    // Monthly round payments
    const roundsSnap = await getDocs(
      collection(db, "ShgGroups", shgId, "monthlyRounds")
    );

    for (const round of roundsSnap.docs) {
      const contribRef = doc(
        db,
        "ShgGroups",
        shgId,
        "monthlyRounds",
        round.id,
        "contributions",
        uid
      );

      const contribSnap = await getDoc(contribRef);
      if (contribSnap.exists()) {
        savings += contribSnap.data().amountPaid || 0;
      }
    }

    // Loan repayments
    const loansSnap = await getDocs(
      collection(db, "ShgGroups", shgId, "loans")
    );

    for (const loan of loansSnap.docs) {
      if (loan.data().memberId !== uid) continue;

      const repaySnap = await getDocs(
        collection(
          db,
          "ShgGroups",
          shgId,
          "loans",
          loan.id,
          "repayments"
        )
      );

      repaySnap.forEach((r) => {
        repayments += r.data().amount || 0;
      });
    }

    setTotalSavingsPaid(savings);
    setTotalRepaymentsPaid(repayments);
  };

  fetchLedgerStats();
}, [shgId, uid]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Total Contributed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-gray-900"> ₹{totalContributed.toLocaleString("en-IN")} </p>
          </CardContent>
        </Card>

                <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">
                Total Group Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl text-teal-600">
                ₹{totalSavings.toLocaleString("en-IN")}
              </p>
            </CardContent>
          </Card>

<Card>
  <CardHeader className="pb-3">
    <CardTitle className="text-sm text-gray-600">
      Loan Balance
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-2xl text-blue-600">
      ₹{loanBalance.toLocaleString("en-IN")}
    </p>
  </CardContent>
</Card>

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Activity</CardTitle>
            <CardDescription>Your savings and repayments over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="savings" fill="#14b8a6" name="Savings" />
                <Bar dataKey="repayments" fill="#3b82f6" name="Repayments" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Breakdown</CardTitle>
            <CardDescription>Distribution of your contributions</CardDescription>
          </CardHeader>
          <CardContent>
           <ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={pieData}
      dataKey="value"
      nameKey="name"
      cx="50%"
      cy="50%"
      outerRadius={100}
      label={({ name, value }) => `${name}: ${value}%`}
    >
      {pieData.map((entry, index) => (
        <Cell key={index} fill={entry.color} />
      ))}
    </Pie>
    <Tooltip formatter={(v) => `${v}%`} />
  </PieChart>
</ResponsiveContainer>

          </CardContent>
        </Card>
      </div>

      {/* Transaction Table with Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Complete record of all your transactions</CardDescription>
            </div>
           <Button onClick={handleExportStatement}>
  Export Statement
</Button>

          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Savings">Savings</SelectItem>
                <SelectItem value="Loan">Loan Repayment</SelectItem>
                <SelectItem value="Attendance">Attendance</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Date Range
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.type}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.amount > 0 ? `₹${transaction.amount.toLocaleString('en-IN')}` : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={transaction.status === "verified" ? "default" : "secondary"}
                        className={
                          transaction.status === "verified" 
                            ? "bg-green-100 text-green-800 hover:bg-green-100" 
                            : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        }
                      >
                        {transaction.status === "verified" ? "Verified" : "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Blockchain Repayments */}
<Card className="mt-6">
  <CardHeader>
    <CardTitle>Blockchain Repayments</CardTitle>
    <CardDescription>
      Immutable on-chain loan repayment records
    </CardDescription>
  </CardHeader>

  <CardContent>
    {blockchainRepayments.length === 0 ? (
      <p className="text-center text-gray-500 py-6">
        No blockchain repayments found
      </p>
    ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Payer</TableHead>
            <TableHead>Loan ID</TableHead>
            <TableHead className="text-right">Amount (ETH)</TableHead>
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {blockchainRepayments.map((r, index) => (
            <TableRow key={index}>
              <TableCell>{r.time}</TableCell>

              <TableCell className="font-mono text-xs">
                {r.payer.slice(0, 10)}...
              </TableCell>

              <TableCell>{r.loanId}</TableCell>

              <TableCell className="text-right">
                {r.amount}
              </TableCell>

              <TableCell className="text-center">
                <Badge className="bg-green-100 text-green-800">
                  Confirmed
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )}
  </CardContent>
</Card>

    </div>
  );
}
