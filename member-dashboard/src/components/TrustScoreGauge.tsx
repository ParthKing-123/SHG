import { Progress } from "./ui/progress";

interface TrustScoreGaugeProps {
  score: number;
  financialScore: number;
  timelinessScore: number;
  attendanceScore: number;
}

export function TrustScoreGauge({
  score,
  financialScore,
  timelinessScore,
  attendanceScore
}: TrustScoreGaugeProps) {
  // Calculate percentage for the circular gauge
  const percentage = (score / 100) * 100;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-lg border border-gray-200">
      <div className="text-center">
        <h2 className="text-gray-600 mb-2">Your Trust Score</h2>
      </div>
      
      {/* Circular Score Gauge */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="128"
            cy="128"
            r="90"
            stroke="#e5e7eb"
            strokeWidth="16"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="128"
            cy="128"
            r="90"
            stroke="#14b8a6"
            strokeWidth="16"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-7xl text-teal-600">{score}</div>
            <div className="text-gray-500">out of 100</div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="w-full max-w-md space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Financial Repayment</span>
            <span className="text-gray-900">{financialScore}/40</span>
          </div>
          <Progress value={(financialScore / 40) * 100} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Monthly Rounds</span>
            <span className="text-gray-900">{timelinessScore}/40</span>
          </div>
          <Progress value={(timelinessScore / 40) * 100} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Meeting Attendance</span>
            <span className="text-gray-900">{attendanceScore}/20</span>
          </div>
          <Progress value={(attendanceScore / 20) * 100} className="h-2" />
        </div>
      </div>

      <p className="text-center text-sm text-gray-500 max-w-md">
        Your Trust Score is your personal credit passport. Keep it strong by making timely payments and attending meetings.
      </p>
    </div>
  );
}
