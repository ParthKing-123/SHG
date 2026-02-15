import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Calendar, DollarSign, Users as UsersIcon, CheckCircle2 } from "lucide-react";
import { useAuth } from "../AuthContext";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import {
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

// Mock data
// const mockMembers = [
//   "Sita Devi", "Lakshmi Reddy", "Radha Krishna", "Anjali Sharma", 
//   "Priya Patel", "Meera Gupta", "Kavita Singh", "Sunita Rao"
// ];



export function LogActivityView() {
  const [selectedMember, setSelectedMember] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [transactionDate, setTransactionDate] = useState("2025-11-06");
  const [meetingDate, setMeetingDate] = useState("2025-11-06");
  const [meetingTopic, setMeetingTopic] = useState("");
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const { shgId } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [shgName, setShgName] = useState<string>("");
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  
    interface Member {
      id: string;
       name: string;
      }

  
    useEffect(() => {
      if (!shgId) return;
      const fetchShg = async () => {
            const snap = await getDoc(doc(db, "ShgGroups", shgId));
            if (snap.exists()) {
              setShgName(snap.data().groupName);
            }
          };
      
      fetchShg();
      const fetchMembers = async () => {
        const snap = await getDocs(
          collection(db, "ShgGroups", shgId, "members")
        );

        setMembers(
            snap.docs.map(doc => ({
              id: doc.id,              // UID
              name: doc.data().name,   // Member name
            }))
);
      };

      fetchMembers();
    }, [shgId]);

    useEffect(() => {
  if (!shgId) return;

  const fetchRecentMonthlyPayments = async () => {
    const roundsSnap = await getDocs(
      collection(db, "ShgGroups", shgId, "monthlyRounds")
    );

    let allPayments: any[] = [];

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
        const data = c.data();
        allPayments.push({
          id: c.id,
          memberId: c.id,
          round: roundDoc.id,
          amount: data.amountPaid,
          date: data.paidAt?.toDate(),
        });
      });
    }

    // Sort by latest
    allPayments.sort((a, b) => b.date - a.date);

    // Keep only last 5
    setRecentTransactions(allPayments.slice(0, 5));
  };

  fetchRecentMonthlyPayments();
}, [shgId]);

const getMemberName = (uid: string) => {
  const member = members.find((m: any) => m.id === uid);
  return member ? member.name : "Member";
};


  const handleRecordTransaction = () => {
    // Transaction recording logic
    alert(`Transaction recorded: ${selectedMember} - ${transactionType} - ₹${amount}`);
    setSelectedMember("");
    setAmount("");
    setTransactionType("");
  };

  const handleFinalizeAttendance = async () => {
  if (!shgId) return;

  // 1️⃣ Save meeting summary
  const meetingRef = doc(
    collection(db, "ShgGroups", shgId, "meetings")
  );

  const presentMembers = Object.entries(attendance)
    .filter(([_, isPresent]) => isPresent)
    .map(([name]) => name);

  await setDoc(meetingRef, {
    date: meetingDate,
    topic: meetingTopic,
    totalMembers: members.length,
    presentCount: presentMembers.length,
    createdAt: serverTimestamp(),
  });

  // 2️⃣ Fetch members ONCE
  const membersSnap = await getDocs(
    collection(db, "ShgGroups", shgId, "members")
  );

  // 3️⃣ Update attendance for each member
  for (const docSnap of membersSnap.docs) {
    const data = docSnap.data();
    const name = data.name;

    const present = attendance[name] === true;

    const presentCount =
      (data.attendancePresent ?? 0) + (present ? 1 : 0);
    const totalCount =
      (data.attendanceTotal ?? 0) + 1;

    const percentage = Math.round(
      (presentCount / totalCount) * 100
    );

    await updateDoc(docSnap.ref, {
      attendancePresent: presentCount,
      attendanceTotal: totalCount,
      attendance: percentage, // 🔥 used in Members tab
    });
  }

  alert("Attendance finalized successfully ✅");
};


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">SHG Activity Logging</h1>
          <p className="text-gray-600">Record financial transactions and meeting attendance</p>
        </div>
        <Button variant="outline" className="border-teal-500 text-teal-700 hover:bg-teal-50">
          <UsersIcon className="w-4 h-4 mr-2" />
          {shgName}
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Logging Forms */}
        <div className="col-span-2 space-y-6">
          {/* Financial Entry Card */}
          <Card className="border-teal-100">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-teal-600" />
                <CardTitle className="text-teal-900">Financial Transaction Entry</CardTitle>
              </div>
              <CardDescription>Record savings, loan disbursements, or repayments</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="member">Member Name</Label>
                  <Select value={selectedMember} onValueChange={setSelectedMember}>
                    <SelectTrigger id="member">
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Transaction Type</Label>
                  <Select value={transactionType} onValueChange={setTransactionType}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="repayment">Loan Repayment</SelectItem>
                      <SelectItem value="disbursed">Loan Disbursed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={handleRecordTransaction}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Record Financial Transaction
              </Button>
            </CardContent>
          </Card>

          {/* Meeting Attendance Card */}
          <Card className="border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-blue-900">Meeting Attendance</CardTitle>
              </div>
              <CardDescription>Log member attendance for group meetings</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meetingDate">Meeting Date</Label>
                  <Input
                    id="meetingDate"
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Meeting Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Monthly Review"
                    value={meetingTopic}
                    onChange={(e) => setMeetingTopic(e.target.value)}
                  />
                </div>
              </div>

              {/* Attendance Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member Name</TableHead>
                      <TableHead className="text-right">Present</TableHead>
                      <TableHead className="text-right">Absent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.name}</TableCell>
                        <TableCell className="text-right">
                          <Checkbox
                            checked={attendance[member.id] === true}
                            onCheckedChange={(checked: boolean) =>
                              setAttendance({ ...attendance, [member.id]: checked === true })
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Checkbox
                            checked={attendance[member.id] === false}
                            onCheckedChange={(checked: boolean) =>
                              setAttendance({ ...attendance, [member.id]: checked ? false : true })
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Button 
                onClick={handleFinalizeAttendance}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Finalize Attendance Log
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Recent Activity */}
        <div className="col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Last 5 recorded transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.length === 0 ? (
  <p className="text-sm text-gray-500">No recent payments</p>
) : (
  recentTransactions.map((txn) => (
    <div key={txn.id} className="pb-4 border-b last:border-0">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm text-gray-900">
            {getMemberName(txn.memberId)}
          </p>
          <p className="text-xs text-gray-500">
            Monthly Round Payment
          </p>
        </div>
        <Badge className="bg-green-100 text-green-800">
          Paid
        </Badge>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-teal-700">
          ₹{txn.amount}
        </span>
        <span className="text-gray-500">
          {txn.date?.toLocaleDateString()}
        </span>
      </div>
    </div>
  ))
)}

              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
