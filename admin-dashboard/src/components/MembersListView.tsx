import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Search, Eye, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase"; // adjust path if needed
import { useAuth } from "../AuthContext";

interface Member {
  id: string;
  name: string;
  trustScore: number;
  status?: string;
  activeLoanId?: string | null;

  // TEMP display-safe fields
  totalSavings?: number;
  outstandingLoan?: number;
  attendance?: number;
}

interface MembersListViewProps {
  onSelectMember: (memberId: string) => void;
}

export function MembersListView({ onSelectMember }: MembersListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { shgId } = useAuth();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  if (!shgId) return;

  const fetchMembersWithSavings = async () => {
    try {
      // 1️⃣ Fetch members
      const membersSnap = await getDocs(
        collection(db, "ShgGroups", shgId, "members")
      );

      // 2️⃣ Fetch rounds
      const roundsSnap = await getDocs(
        collection(db, "ShgGroups", shgId, "monthlyRounds")
      );

      // 3️⃣ Build savings map
      const savingsMap: Record<string, number> = {};

      for (const roundDoc of roundsSnap.docs) {
        const contributionsSnap = await getDocs(
          collection(
            db,
            "ShgGroups",
            shgId,
            "monthlyRounds",
            roundDoc.id,
            "contributions"
          )
        );

        contributionsSnap.forEach((contribDoc) => {
          const data = contribDoc.data();
          const memberId = contribDoc.id;

          savingsMap[memberId] =
            (savingsMap[memberId] || 0) + (data.amountPaid || 0);
        });
      }

      // 4️⃣ Attach savings to members
      const list: Member[] = membersSnap.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          name: data.name ?? "Unknown",
          trustScore: data.trustScore ?? 0,
          status: data.status ?? "ACTIVE",
          activeLoanId: data.activeLoanId ?? null,
          totalSavings: savingsMap[doc.id] || 0,
          attendance: data.attendance ?? 0,
        };
      });

      setMembers(list);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchMembersWithSavings();
}, [shgId]);



  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };
  const goodTrustScore = () => {
    let i = 0;
    for (let j = 0; j < members.length; j++) {
      if (members[j].trustScore >= 85) {
        i++;
      }
    }
    return i;
  };
  const getAverageAttendance = () => {
  if (members.length === 0) return 0;

  const total = members.reduce(
    (sum, member) => sum + (member.attendance ?? 0),
    0
  );

  return Math.round(total / members.length);
};

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return "text-green-700 bg-green-100 border-green-200";
    if (score >= 80) return "text-blue-700 bg-blue-100 border-blue-200";
    if (score >= 70) return "text-amber-700 bg-amber-100 border-amber-200";
    return "text-red-700 bg-red-100 border-red-200";
  };

  // Filter and sort members
  let filteredMembers = members.filter((member) => {
    const matchesSearch = member.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || member!.status!.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Sort members
  filteredMembers.sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "trustScore":
        comparison = a.trustScore - b.trustScore;
        break;
      case "savings":
        comparison = a.totalSavings! - b.totalSavings!;
        break;
      case "loan":
        comparison = a.outstandingLoan! - b.outstandingLoan!;
        break;
      case "attendance":
        comparison = a.attendance! - b.attendance!;
        break;
      default:
        comparison = 0;
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
          <h1 className="text-gray-900">Members</h1>
          <p className="text-gray-600">Manage and view all SHG members</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700">
          + Add New Member
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Members</p>
            <p className="text-3xl text-gray-900 mt-1">{members.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">High Performers</p>
            <p className="text-3xl text-green-700 mt-1">{goodTrustScore()}</p>
            <p className="text-xs text-gray-500 mt-1">Score {">"} 85</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Needs Attention</p>
            <p className="text-3xl text-amber-700 mt-1">
              {members.length - goodTrustScore()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Score {"<"} 80</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Avg Attendance</p>
            <p className="text-3xl text-blue-700 mt-1">
              {getAverageAttendance()}%
            </p>
          </CardContent>
</Card>

      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Members</CardTitle>
              <CardDescription>
                Browse and manage member profiles
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>

              {/* Status Filter */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="trustScore">Trust Score</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="loan">Outstanding Loan</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("trustScore")}
                >
                  <div className="flex items-center gap-1">
                    Trust Score
                    {sortBy === "trustScore" && (
                      <span className="text-xs">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer text-right"
                  onClick={() => handleSort("savings")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Total Savings
                    {sortBy === "savings" && (
                      <span className="text-xs">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer text-right"
                  onClick={() => handleSort("loan")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Outstanding Loan
                    {sortBy === "loan" && (
                      <span className="text-xs">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer text-center"
                  onClick={() => handleSort("attendance")}
                >
                  <div className="flex items-center justify-center gap-1">
                    Attendance
                    {sortBy === "attendance" && (
                      <span className="text-xs">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead>Trend</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow
                  key={member.id}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-teal-100 text-teal-700">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">Since {member!.joinedAt}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getTrustScoreColor(member.trustScore)}
                    >
                      {member.trustScore}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-gray-900">
                    ₹{(member.totalSavings ?? 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {member.activeLoanId ? (
                      <span className="text-gray-900">Active</span>
                    ) : (
                      <span className="text-green-600">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={
                      member.attendance! >= 95 
                        ? "text-green-700" 
                        : member.attendance! >= 85 
                        ? "text-blue-700" 
                        : "text-amber-700"
                    }>
                      {member.attendance ?? 0}%
                    </span>
                  </TableCell>
                  <TableCell>
                    {member.trend === "up" && (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    )}
                    {member.trend === "down" && (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    {member.trend === "stable" && (
                      <Minus className="w-4 h-4 text-gray-400" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {member.activeLoanId ? (
                        <Badge className="bg-green-100 text-green-700">
                          Loan Active
                        </Badge>
                      ) : member.trustScore < 60 ? (
                        <Badge className="bg-red-100 text-red-700">
                          Not Eligible
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-blue-600 text-white"
                          onClick={() => handleCreateLoan(member.id)}
                        >
                          Approve Loan
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectMember(member.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No members found matching your criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
