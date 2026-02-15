import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { TrustScoreGauge } from "./TrustScoreGauge";
import {
  FileDown,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "../AuthContext";

// Mock transaction data
const transactionHistory = [
  {
    id: 1,
    date: "2025-11-05",
    type: "Savings",
    amount: "₹500",
    validity: "Valid",
    hash: "0x7f3a...",
  },
  {
    id: 2,
    date: "2025-11-01",
    type: "Loan Repayment",
    amount: "₹1,200",
    validity: "Valid",
    hash: "0x9c2b...",
  },
  {
    id: 3,
    date: "2025-10-28",
    type: "Meeting Attendance",
    amount: "-",
    validity: "Valid",
    hash: "0x4e8d...",
  },
  {
    id: 4,
    date: "2025-10-25",
    type: "Savings",
    amount: "₹500",
    validity: "Valid",
    hash: "0x1a5f...",
  },
  {
    id: 5,
    date: "2025-10-20",
    type: "Loan Repayment",
    amount: "₹1,200",
    validity: "Valid",
    hash: "0x6d9c...",
  },
  {
    id: 6,
    date: "2025-10-15",
    type: "Meeting Attendance",
    amount: "-",
    validity: "Valid",
    hash: "0x2f4e...",
  },
  {
    id: 7,
    date: "2025-10-10",
    type: "Savings",
    amount: "₹500",
    validity: "Valid",
    hash: "0x8b3a...",
  },
  {
    id: 8,
    date: "2025-10-05",
    type: "Loan Disbursed",
    amount: "₹15,000",
    validity: "Valid",
    hash: "0x5c7d...",
  },
  {
    id: 9,
    date: "2025-09-30",
    type: "Savings",
    amount: "₹500",
    validity: "Valid",
    hash: "0x3e1b...",
  },
  {
    id: 10,
    date: "2025-09-25",
    type: "Meeting Attendance",
    amount: "-",
    validity: "Valid",
    hash: "0xa4f2...",
  },
];

interface MemberProfileViewProps {
  memberId: string | null;
}

export function MemberProfileView({ memberId }: MemberProfileViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { shgId } = useAuth();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!memberId || !shgId) return;

    const fetchMember = async () => {
      const ref = doc(db, "ShgGroups", shgId, "members", memberId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setMember({ id: snap.id, ...snap.data() });
      }

      setLoading(false);
    };

    fetchMember();
  }, [memberId, shgId]);

  // Trust score breakdown
  const totalTrustScore = member?.trustScore ?? 0;

  // TEMP: derive breakdown from total score
  const trustScore = {
    total: totalTrustScore,
    financialRepayment: Math.round(totalTrustScore * 0.4), // /40
    repaymentTimeliness: Math.round(totalTrustScore * 0.4), // /40
    meetingAttendance: Math.round(totalTrustScore * 0.2), // /20
  };

  // Filter and sort transactions
  let filteredTransactions = transactionHistory.filter((txn) => {
    const matchesSearch =
      txn.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.date.includes(searchQuery) ||
      txn.amount.includes(searchQuery);
    const matchesType = filterType === "all" || txn.type === filterType;
    return matchesSearch && matchesType;
  });

  // Sort transactions
  filteredTransactions.sort((a, b) => {
    let comparison = 0;
    if (sortBy === "date") {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === "type") {
      comparison = a.type.localeCompare(b.type);
    } else if (sortBy === "amount") {
      const amountA =
        a.amount === "-" ? 0 : parseFloat(a.amount.replace(/[₹,]/g, ""));
      const amountB =
        b.amount === "-" ? 0 : parseFloat(b.amount.replace(/[₹,]/g, ""));
      comparison = amountA - amountB;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {loading && <p>Loading profile...</p>}

          {member && (
            <h1 className="text-gray-900">Member Profile: {member.name}</h1>
          )}

          <p className="text-gray-600">
            View detailed member information and trust metrics
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-blue-500 text-blue-700 hover:bg-blue-50"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export as PDF
          </Button>
          <Button
            variant="outline"
            className="border-teal-500 text-teal-700 hover:bg-teal-50"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export as JSON
          </Button>
        </div>
      </div>

      {/* Top Section - Trust Score & Financial Metrics */}
      <div className="grid grid-cols-3 gap-6">
        {/* Trust Score Widget */}
        <Card className="col-span-1 border-teal-100">
          <CardHeader className="bg-gradient-to-br from-teal-50 to-blue-50">
            <CardTitle className="text-teal-900">Trust Score</CardTitle>
            <CardDescription>Composite reliability metric</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <TrustScoreGauge score={trustScore.total} />

            {/* Score Breakdown */}
            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700">Financial Repayment</span>
                  <span className="text-teal-700">
                    {trustScore.financialRepayment}/40
                  </span>
                </div>
                <Progress
                  value={(trustScore.financialRepayment / 40) * 100}
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700">Repayment Timeliness</span>
                  <span className="text-blue-700">
                    {trustScore.repaymentTimeliness}/40
                  </span>
                </div>
                <Progress
                  value={(trustScore.repaymentTimeliness / 40) * 100}
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700">Meeting Attendance</span>
                  <span className="text-green-700">
                    {trustScore.meetingAttendance}/20
                  </span>
                </div>
                <Progress
                  value={(trustScore.meetingAttendance / 20) * 100}
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Financial Metrics */}
        <div className="col-span-2 grid grid-cols-3 gap-4">
          <Card className="border-green-100">
            <CardHeader className="pb-3">
              <CardDescription>Total Lifetime Savings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-green-700">₹18,500</div>
              <p className="text-gray-900">
                {member?.joinedAt
                  ? member.joinedAt.toDate().toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-100">
            <CardHeader className="pb-3">
              <CardDescription>Outstanding Loan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-amber-700">₹8,200</div>
              <p className="text-xs text-gray-500 mt-1">Due: Dec 2025</p>
            </CardContent>
          </Card>

          <Card className="border-blue-100">
            <CardHeader className="pb-3">
              <CardDescription>Loans Taken/Repaid</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-blue-700">3 / 2</div>
              <p className="text-xs text-gray-500 mt-1">Total: ₹45,000</p>
            </CardContent>
          </Card>

          {/* Additional Metrics Row */}
          <Card className="col-span-3 bg-gradient-to-r from-teal-50 to-blue-50 border-teal-100">
            <CardContent className="pt-6">
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Member Since</p>
                  <p className="text-gray-900">
                    {member?.joinedAt
                      ? member.joinedAt.toDate().toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Total Meetings</p>
                  <p className="text-gray-900">42 / 45</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">
                    Avg. Monthly Savings
                  </p>
                  <p className="text-gray-900">₹850</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Repayment Rate</p>
                  <p className="text-gray-900">98.5%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction & Activity History</CardTitle>
              <CardDescription>
                Complete record of all financial transactions and meeting
                attendance
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>

              {/* Filter by Type */}
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Savings">Savings</SelectItem>
                  <SelectItem value="Loan Repayment">Loan Repayment</SelectItem>
                  <SelectItem value="Loan Disbursed">Loan Disbursed</SelectItem>
                  <SelectItem value="Meeting Attendance">
                    Meeting Attendance
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Options */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
              >
                <ArrowUpDown className="w-4 h-4 mr-1" />
                {sortOrder === "asc" ? "Asc" : "Desc"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Chain Validity</TableHead>
                <TableHead>Block Hash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="text-gray-700">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {txn.date}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        txn.type === "Savings"
                          ? "border-green-200 bg-green-50 text-green-700"
                          : txn.type === "Loan Repayment"
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : txn.type === "Loan Disbursed"
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-purple-200 bg-purple-50 text-purple-700"
                      }
                    >
                      {txn.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-gray-900">
                    {txn.amount}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {txn.validity === "Valid" ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-green-700 text-sm">Valid</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-red-700 text-sm">Invalid</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                      {txn.hash}
                    </code>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No transactions found matching your criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
