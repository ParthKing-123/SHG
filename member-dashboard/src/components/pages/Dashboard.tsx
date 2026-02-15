import { TrustScoreGauge } from "../TrustScoreGauge";
import { FinancialBalanceCard } from "../FinancialBalanceCard";
import { TransactionFeed } from "../TransactionFeed";
import { RemindersCard } from "../RemindersCard";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TrendingUp, Users, Sparkles } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, query, updateDoc, where } from "firebase/firestore";
interface DashboardProps {
  memberData: any;
}
import { AuthContext, useAuth } from "../AuthContext";
import { collection, getDocs } from "firebase/firestore";
import { Chatbot } from "../ChatBot";
export function Dashboard({ memberData }: DashboardProps) {
  const [totalContributed, setTotalContributed] = useState(0);
  const [totalGroupSavings, setTotalGroupSavings] = useState(0);
  const [loanBalance, setLoanBalance] = useState(0);
  const [attendancePresent, setAttendancePresent] = useState(0);
const [totalMeetings, setTotalMeetings] = useState(0);
const [attendanceScore, setAttendanceScore] = useState(0);
  const [totalMonthlyRounds, setTotalMonthlyRounds] = useState(0);
const [paidMonthlyRounds, setPaidMonthlyRounds] = useState(0);
const [monthlyRoundScore, setMonthlyRoundScore] = useState(0);
const [loanDisciplineScore, setLoanDisciplineScore] = useState(0);
const [loanResponsibilityScore, setLoanResponsibilityScore] = useState(0);
const [loanRepaymentScore, setLoanRepaymentScore] = useState(0);
const [totalTrustScore, setTotalTrustScore] = useState(0);

  const { shgId, uid} = useAuth();
   useEffect(() => {
  if (!shgId || !uid) return;

  const fetchTotalContributed = async () => {
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

    setTotalGroupSavings(total);
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
        where("status", "==", "APPROVED")
      )
    );

    loansSnap.forEach((doc) => {
      total += Number(doc.data().remainingAmount || 0);
    });

    setLoanBalance(total);
  };

  fetchLoanBalance();
}, [shgId, uid]);
useEffect(() => {
  if (!shgId || !uid) return;

  const fetchAttendancePresent = async () => {
    const memberRef = doc(db, "ShgGroups", shgId, "members", uid);
    const snap = await getDoc(memberRef);

    if (snap.exists()) {
      setAttendancePresent(snap.data().attendancePresent || 0);
    }
  };

  fetchAttendancePresent();
}, [shgId, uid]);

useEffect(() => {
  if (!shgId) return;

  const fetchTotalMeetings = async () => {
    const meetingsSnap = await getDocs(
      collection(db, "ShgGroups", shgId, "meetings")
    );

    setTotalMeetings(meetingsSnap.size);
  };

  fetchTotalMeetings();
}, [shgId]);
useEffect(() => {
  if (totalMeetings === 0) {
    setAttendanceScore(0);
    return;
  }

  const score = (attendancePresent / totalMeetings) * 20;
  setAttendanceScore(Number(score.toFixed(1)));
}, [attendancePresent, totalMeetings]);
useEffect(() => {
  if (!shgId || !uid) return;

  const fetchMonthlyRoundsScore = async () => {
    let total = 0;
    let paid = 0;

    const roundsSnap = await getDocs(
      collection(db, "ShgGroups", shgId, "monthlyRounds")
    );

    total = roundsSnap.size;

    for (const roundDoc of roundsSnap.docs) {
      const contribRef = doc(
        db,
        "ShgGroups",
        shgId,
        "monthlyRounds",
        roundDoc.id,
        "contributions",
        uid
      );

      const contribSnap = await getDoc(contribRef);

      if (contribSnap.exists()) {
        paid++;
      }
    }

    setTotalMonthlyRounds(total);
    setPaidMonthlyRounds(paid);
  };

  fetchMonthlyRoundsScore();
}, [shgId, uid]);
useEffect(() => {
  if (totalMonthlyRounds === 0) {
    setMonthlyRoundScore(0);
    return;
  }

  const score = (paidMonthlyRounds / totalMonthlyRounds) * 40;
  setMonthlyRoundScore(Number(score.toFixed(1)));
}, [paidMonthlyRounds, totalMonthlyRounds]);
useEffect(() => {
  if (!shgId || !uid) return;

  const calculateLoanTrustScore = async () => {
    let totalLoanAmount = 0;
    let totalRemainingAmount = 0;

    let totalLoans = 0;
    let completedLoans = 0;

    let totalEmis = 0;
    let onTimeEmis = 0;

    let groupMaxLoan = 0;

    // 🔹 Fetch all loans of group (for max loan)
    const allLoansSnap = await getDocs(
      collection(db, "ShgGroups", shgId, "loans")
    );

    allLoansSnap.forEach((doc) => {
      const loan = doc.data();
      groupMaxLoan = Math.max(groupMaxLoan, loan.principalAmount || 0);
    });

    // 🔹 Fetch current user's loans
    allLoansSnap.forEach((doc) => {
      const loan = doc.data();

      if (loan.memberId !== uid) return;

      totalLoans++;
      totalLoanAmount += loan.principalAmount || 0;
      totalRemainingAmount += loan.remainingAmount || 0;

      if (loan.remainingAmount === 0) {
        completedLoans++;
      }

      // EMI discipline
      if (loan.dueDates) {
        loan.dueDates.forEach((d: any) => {
          totalEmis++;
          if (d.paid && d.paidAt && d.date) {
            if (d.paidAt.toDate() <= d.date.toDate()) {
              onTimeEmis++;
            }
          }
        });
      }
    });

    // 🔹 DISCIPLINE SCORE (25)
    const emiScore =
      totalEmis === 0 ? 0 : (onTimeEmis / totalEmis) * 15;

    const completionScore =
      totalLoans === 0 ? 0 : (completedLoans / totalLoans) * 10;

    const disciplineScore = emiScore + completionScore;

    // 🔹 RESPONSIBILITY SCORE (15)
    let responsibilityScore = 0;

    if (groupMaxLoan > 0 && totalLoanAmount > 0) {
      responsibilityScore =
        (Math.log10(totalLoanAmount + 1) /
          Math.log10(groupMaxLoan + 1)) * 15;
    }

    // 🔹 FINAL SCORE
    const finalScore = Math.min(
      40,
      Math.max(0, disciplineScore + responsibilityScore)
    );

    setLoanDisciplineScore(Number(disciplineScore.toFixed(1)));
    setLoanResponsibilityScore(Number(responsibilityScore.toFixed(1)));
    setLoanRepaymentScore(Number(finalScore.toFixed(1)));
  };

  calculateLoanTrustScore();
}, [shgId, uid]);
useEffect(() => {
  const total =
    loanRepaymentScore +
    monthlyRoundScore +
    attendanceScore;

  setTotalTrustScore(Number(total.toFixed(1)));
}, [loanRepaymentScore, monthlyRoundScore, attendanceScore]);
useEffect(() => {
  if (!shgId || !uid) return;
  if (isNaN(totalTrustScore)) return;

  const updateTrustScore = async () => {
    try {
      const memberRef = doc(db, "ShgGroups", shgId, "members", uid);
      await updateDoc(memberRef, {
        trustScore: Number(totalTrustScore.toFixed(1)),
      });
    } catch (err) {
      console.error("Failed to update trustScore:", err);
    }
  };

  updateTrustScore();
}, [shgId, uid, totalTrustScore]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      {/* Quick Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="text-2xl text-gray-900">{memberData.memberSince}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Contribution</p>
                <p className="text-2xl text-gray-900">₹{totalContributed.toLocaleString("en-IN")}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Group Rank</p>
                <p className="text-2xl text-gray-900">3rd of {memberData.groupStats.totalMembers}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Section: Trust Score and Financial Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trust Score - Takes 2 columns */}
        <div className="lg:col-span-2">
          <TrustScoreGauge
            score={memberData.trustScore.total}
            financialScore={loanRepaymentScore}
            timelinessScore={monthlyRoundScore}
            attendanceScore={attendanceScore}
          />
        </div>

        {/* Financial Balances - Takes 1 column */}
        <div>
          <FinancialBalanceCard
            totalSavings={Number(totalGroupSavings)}
            loanBalance={Number(loanBalance)}
          />
        </div>
      </div>

      {/* Trust Score History Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Trust Score Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={memberData.trustScore.history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#14b8a6" 
                strokeWidth={3}
                dot={{ fill: '#14b8a6', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bottom Section: Transaction Feed and Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transaction Feed - Takes 2 columns */}
        <div className="lg:col-span-2">
          <TransactionFeed transactions={memberData.transactions.slice(0, 10)} />
        </div>

        {/* Reminders - Takes 1 column */}
        <div>
          <RemindersCard
            nextPaymentDate={memberData.reminders.nextPaymentDate}
            nextPaymentAmount={memberData.reminders.nextPaymentAmount}
            nextMeetingDate={memberData.reminders.nextMeetingDate}
            nextMeetingLocation={memberData.reminders.nextMeetingLocation}
          />
        </div>
      </div>


    </div>
    
  );
  
}