interface TrustScoreGaugeProps {
  score: number;
  maxScore?: number;
}

export function TrustScoreGauge({ score, maxScore = 100 }: TrustScoreGaugeProps) {
  const percentage = (score / maxScore) * 100;
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getScoreColor = () => {
    if (percentage >= 80) return "#10b981"; // Green
    if (percentage >= 60) return "#3b82f6"; // Blue
    if (percentage >= 40) return "#f59e0b"; // Amber
    return "#ef4444"; // Red
  };

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg className="w-full h-full transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="96"
          cy="96"
          r="70"
          stroke="#e5e7eb"
          strokeWidth="12"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="96"
          cy="96"
          r="70"
          stroke={getScoreColor()}
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-5xl" style={{ color: getScoreColor() }}>
          {score}
        </div>
        <div className="text-sm text-gray-500">out of {maxScore}</div>
      </div>
    </div>
  );
}
