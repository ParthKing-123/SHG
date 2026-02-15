import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Calendar, Clock, IndianRupee } from "lucide-react";

interface RemindersCardProps {
  nextPaymentDate: string;
  nextPaymentAmount: number;
  nextMeetingDate: string;
  nextMeetingLocation: string;
}

export function RemindersCard({
  nextPaymentDate,
  nextPaymentAmount,
  nextMeetingDate,
  nextMeetingLocation
}: RemindersCardProps) {
  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <Clock className="w-5 h-5" />
          Quick Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Next Payment Due */}
        <div className="flex gap-3 p-3 bg-white rounded-lg border border-orange-100">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <IndianRupee className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-600">Next Payment Due</div>
            <div className="text-orange-900">{nextPaymentDate}</div>
            <div className="text-orange-700">₹{nextPaymentAmount.toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Next Meeting */}
        <div className="flex gap-3 p-3 bg-white rounded-lg border border-orange-100">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-teal-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-600">Next Meeting</div>
            <div className="text-gray-900">{nextMeetingDate}</div>
            <div className="text-gray-600 text-sm">{nextMeetingLocation}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
