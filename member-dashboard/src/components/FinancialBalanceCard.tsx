import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TrendingUp, Wallet } from "lucide-react";

interface FinancialBalanceCardProps {
  totalSavings: number;
  loanBalance: number;
}

export function FinancialBalanceCard({ totalSavings, loanBalance }: FinancialBalanceCardProps) {
  return (
    <div className="space-y-4">
      {/* Total Savings Card */}
      <Card className="border-l-4 border-l-teal-500">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-teal-600" />
            <CardTitle className="text-gray-600">Total Savings</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl text-teal-700">₹{totalSavings.toLocaleString('en-IN')}</div>
          <p className="text-sm text-gray-500 mt-2">Your accumulated savings with the group</p>
        </CardContent>
      </Card>

      {/* Loan Balance Card */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-gray-600">Outstanding Loan</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl text-blue-700">₹{loanBalance.toLocaleString('en-IN')}</div>
          <p className="text-sm text-gray-500 mt-2">
            {loanBalance > 0 ? "Amount remaining to be repaid" : "No active loans"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
